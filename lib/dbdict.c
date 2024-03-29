/*
 * dbdict.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "errno.h"

#include "common.h"
#include "dbdict.h"

//***************************************************************************
// Get Token
//***************************************************************************

int getToken(const char*& p, char* token, int size, char delimiter = ' ', char end = ',')
{
   char* dest = token;
   int num = 0;
   int insideStr = no;

   while (*p && (*p == ' ' || *p == delimiter))
      p++;

   if (*p == end || isEmpty(p))
      return fail;

   while (*p && num < size && !((*p == delimiter || *p == end) && !insideStr))
   {
      if (*p == '"')
      {
         insideStr = !insideStr;
         p++;
      }
      else
      {
         *dest++ = *p++;
         num++;
      }
   }

   *dest = 0;

  return success;
}

//***************************************************************************
// cDbService
//***************************************************************************

const char* cDbService::formats[] =
{
   "INT",
   "INT",
   "BIGINT",
   "BIGINT",
   "VARCHAR",
   "TEXT",
   "MEDIUMTEXT",
   "MEDIUMBLOB",
   "FLOAT",
   "DATETIME",

   0
};

const char* cDbService::toString(FieldFormat t)
{
   return formats[t];
}

const char* cDbService::dictFormats[] =
{
   "int",
   "uint",
   "bigint",
   "ubigint",
   "ascii",
   "text",
   "mtext",
   "mlob",
   "float",
   "datetime",

   0
};

cDbService::FieldFormat cDbService::toDictFormat(const char* format)
{
   for (int i = 0; i < ffCount; i++)
      if (strcasecmp(dictFormats[i], format) == 0)
         return (FieldFormat)i;

   return ffUnknown;
}

cDbService::TypeDef cDbService::types[] =
{
   { ftData,    "data" },
   { ftPrimary, "primary" },
   { ftMeta,    "meta" },
   { ftAutoinc, "autoinc" },

   { ftUnknown, "" }
};

int cDbService::toType(const char* theTypes)
{
   const int sizeTokenMax = 100;
   char token[sizeTokenMax+TB];
   const char* p = theTypes;

   int type = ftNo;

   // field can of more than one type -> bitmask

   while (getToken(p, token, sizeTokenMax, '|') == success)
   {
      for (int i = 0; types[i].type != ftUnknown; i++)
      {
         if (strcasecmp(types[i].name, token) == 0)
         {
            type |= types[i].type;
            continue;
         }
      }
   }

   return type;
}

const char* cDbService::toName(FieldType type, char* buf)
{
   *buf = 0;

   // field can of more than one type -> bitmask !!

   for (int i = 0; types[i].type != ftUnknown; i++)
   {
      if (types[i].type & type)
      {
         if (!isEmpty(buf))
            strcat(buf, "|");

         strcat(buf, types[i].name);
         continue;
      }
   }

   return buf;
}

//***************************************************************************
//***************************************************************************
// Class cDbDict
//***************************************************************************

cDbDict dbDict;

//***************************************************************************
// Object
//***************************************************************************

cDbDict::cDbDict()
{
   curTable = 0;
   inside = no;
   path = 0;
   fieldFilter = 0;   // 0 -> filter off use all fields
   fltFromNameFct = 0;
}

cDbDict::~cDbDict()
{
   std::map<std::string, cDbTableDef*>::iterator t;

   while ((t = tables.begin()) != tables.end())
   {
      if (t->second)
         delete t->second;

      tables.erase(t);
   }

   free(path);
}

//***************************************************************************
// Get Table
//***************************************************************************

cDbTableDef* cDbDict::getTable(const char* aName)
{
   std::map<std::string, cDbTableDef*>::iterator t;

   if ((t = tables.find(aName)) != tables.end())
      return t->second;

   return 0;
}

//***************************************************************************
// Init
//***************************************************************************

int cDbDict::init(cDbFieldDef*& field, const char* tname, const char* fname)
{
   cDbTableDef* table = getTable(tname);

   if (table)
      if ((field = table->getField(fname)))
         return success;

   tell("Fatal: Can't init field %s.%s, not found in dictionary", tname, fname);

   return fail;
}

//***************************************************************************
// In
//***************************************************************************

int cDbDict::in(const char* file, int filter)
{
   FILE* f;
   char* line = 0;
   size_t size = 0;

   if (isEmpty(file))
      return fail;

   fieldFilter = filter;
   asprintf(&path, "%s", file);

   f = fopen(path, "r");

   if (!f)
   {
      tell("Error: Can' open file '%s', error was '%s'", path, strerror(errno));
      return fail;
   }

   while (getline(&line, &size, f) > 0)
   {
      char* p = strstr(line, "//");

      if (p) *p = 0;

      allTrim(line);

      if (isEmpty(line))
         continue;

      if (atLine(line) != success)
      {
         tell("Error: Found unexpected definition '%s', aborting", line);
         free(path);
         return fail;
      }
   }

   fclose(f);
   free(line);

   return success;
}

//***************************************************************************
// Forget
//***************************************************************************

void cDbDict::forget()
{
   std::map<std::string, cDbTableDef*>::iterator t;

   while ((t = tables.begin()) != tables.end())
   {
      if (t->second)
         delete t->second;

      tables.erase(t);
   }

   free(path);

   curTable = 0;
   inside = no;
   path = 0;
   fieldFilter = 0;   // 0 -> filter off use all fields
   fltFromNameFct = 0;
}

//***************************************************************************
// Show
//***************************************************************************

void cDbDict::show()
{
   std::map<std::string, cDbTableDef*>::iterator t;

   for (t = tables.begin(); t != tables.end(); t++)
   {
      tell(eloInfo, "-------------------------------------------------------------------------------------------------");
      tell(eloInfo, "Table '%s'", t->first.c_str());
      tell(eloInfo, "-------------------------------------------------------------------------------------------------");
      t->second->show();
   }
}

//***************************************************************************
// At Line
//***************************************************************************

int cDbDict::atLine(const char* line)
{
   int status = success;
   static int prsTable = no;
   static int prsIndex = no;

   const char* p;

   if (strncasecmp(line, "Table ", 6) == 0)
   {
      char tableName[100];

      prsTable = yes;
      curTable = 0;
      p = line + strlen("Table ");
      strcpy(tableName, p);
      allTrim(tableName);

      if (!getTable(tableName))
      {
         curTable = new cDbTableDef(tableName);
         tables[tableName] = curTable;
      }
      else
         tell("Fatal: Table '%s' doubly defined", tableName);
   }
   else if (strncasecmp(line, "Index ", 6) == 0)
   {
      prsIndex = yes;
      p = line + strlen("Table ");
   }

   else if (strchr(line, '{'))
      inside = yes;

   else if (strchr(line, '}'))
   {
      inside = no;
      prsTable = no;
      prsIndex = no;
   }

   else if (inside && prsTable)
      status += parseField(line);

   else if (inside && prsIndex)
      status += parseIndex(line);

   else
      tell(eloWarning, "Info: Ignoring extra line [%s]", line);

   return status;
}

//***************************************************************************
// Parse Filter
//***************************************************************************

int cDbDict::parseFilter(cDbFieldDef* f, const char* value)
{
   const int sizeNameMax {50};
   char name[sizeNameMax+TB] {};
   const char* v = value;

   f->filter = 0;

   while (getToken(v, name, sizeNameMax, '|') == success)
   {
      if (isalpha(*name) && fltFromNameFct)
         f->filter |= fltFromNameFct(name);
      else
         f->filter |= atoi(name);
   }

   return success;
}

//***************************************************************************
// Parse Field
//***************************************************************************

int cDbDict::parseField(const char* line)
{
   const int sizeTokenMax = 100;
   char token[sizeTokenMax+TB];
   const char* p = line;

   cDbFieldDef* f = new cDbFieldDef;
   f->filter = 0xFFFF;

   if (!curTable)
      return fail;

   // first parse fixed part of field definition up to the 'type'

   for (int i = 0; i < dtCount; i++)
   {
      if (getToken(p, token, sizeTokenMax) != success)
      {
         if (i >= dtType)  // all after type is optional (filter, ...)
            break;

         delete f;
         tell("Error: Can't parse line [%s]", line);
         return fail;
      }

      if (i == dtCount-1 && strchr(token, ','))
         *(strchr(token, ',')) = 0;

      switch (i)
      {
         case dtName:        f->name = strdup(token);             break;
         case dtDescription: f->setDescription(token);            break;
         case dtDbName:      f->dbname = strdup(token);           break;
         case dtFormat:      f->format = toDictFormat(token);     break;
         case dtSize:        f->size = atoi(token);               break;
         case dtType:        f->type = toType(token);             break;
      }
   }

   // second ... parse dynamic part of the field definition like filter and default

   while (getToken(p, token, sizeTokenMax) == success)
   {
      char content[sizeTokenMax+TB];

      if (getToken(p, content, sizeTokenMax) != success || isEmpty(content))
      {
         tell("Error: Skipping token '%s' missing content!", token);
         break;
      }

      if (strcasecmp(token, "filter") == 0)
         parseFilter(f, content);

      else if (strcasecmp(token, "default") == 0)
         f->def = strdup(content);

      else
         tell(eloWarning, "Warning: Skipping unexpected token '%s'", token);
   }

   if (!f->isValid())
   {
      tell("Error: Can't parse line [%s], invalid field configuration", line);
      delete f;
      return fail;
   }

   if (f->filterMatch(fieldFilter))
   {
      f->index = curTable->fieldCount();
      curTable->addField(f);
   }
   else
   {
      tell(eloInfo, "Info: Ignoring field '%s' due to filter configiuration", f->getName());
      delete f;
   }

   return success;
}

//***************************************************************************
// Parse Index
//***************************************************************************

int cDbDict::parseIndex(const char* line)
{
   const int sizeTokenMax = 100;
   char token[sizeTokenMax+TB];
   const char* p = line;
   int done = no;

   if (!curTable)
      return fail;

   cDbIndexDef* index = new cDbIndexDef();

   for (int i = 0; !done && i < 20; i++)
   {
      if (getToken(p, token, sizeTokenMax) != success)
      {
         if (i <= idtFields)
         {
            delete index;
            tell("Error: Can't parse line [%s]", line);
            return fail;
         }

         break;
      }

      if (strchr(token, ','))
      {
         done = yes;
         *(strchr(token, ',')) = 0;
      }

      if (i == idtName)
         index->setName(token);
      else if (i == idtDescription)
         index->setDescription(token);
      else if (i >= idtFields && i < idtFields+20)
         index->addField(curTable->getField(token));
   }

   curTable->addIndex(index);

   return success;
}
