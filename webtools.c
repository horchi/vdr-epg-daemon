/*
 * webtools.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "httpd.h"

//***************************************************************************
// Load from FS
//***************************************************************************

int cWebTools::loadFromFs(MemoryStruct* data, const char* filename, const char* subPath)
{
   char* path = 0;
   char* infile = 0;
   int status;

   asprintf(&path, "%s/%s", EpgdConfig.httpPath, subPath);
   chkDir(path);

   asprintf(&infile, "%s/%s", path, filename);
   status = loadFromFile(infile, data);
   free(infile);
   free(path);

   return status;
}

//***************************************************************************
// Get Modification Time Of File
//***************************************************************************

time_t cWebTools::getModTimeOf(const char* filename, const char* subPath)
{
   char* path = 0;
   char* file = 0;
   time_t t;

   asprintf(&path, "%s/%s", EpgdConfig.httpPath, subPath);
   chkDir(path);

   asprintf(&file, "%s/%s", path, filename);

   t = fileModTime(file);
   
   free(file);
   free(path);

   return t;
}

//***************************************************************************
// Get Integer Parameter
//***************************************************************************

int cWebTools::getIntParameter(MHD_Connection* tcp, const char* name, int def)
{
   const char* arg = MHD_lookup_connection_value(tcp, MHD_GET_ARGUMENT_KIND, name);

   return arg ? atoi(arg) : def;
}

//***************************************************************************
// Get String Parameter
//***************************************************************************

const char* cWebTools::getStrParameter(MHD_Connection* tcp, const char* name, const char* def)
{
   const char* arg = MHD_lookup_connection_value(tcp, MHD_GET_ARGUMENT_KIND, name);

   return arg ? arg : def;
}

//***************************************************************************
// Get Header Information
//***************************************************************************

const char* cWebTools::getStrHeader(MHD_Connection* tcp, const char* name, const char* def)
{
   const char* arg = MHD_lookup_connection_value(tcp, MHD_HEADER_KIND, name);

   return arg ? arg : def;
}
//***************************************************************************
// Get Time Header
//***************************************************************************

time_t cWebTools::getTimeHeader(MHD_Connection* tcp, const char* name, const char* def)
{
   time_t t = 0;
   struct tm tm;
   const char* str = getStrHeader(tcp, name, "");

   // Example: 'Mon, 31 Mar 2014 11:05:01 GMT'

   if (!isEmpty(str))
   {
      memset(&tm, 0, sizeof(tm));

      strptime(str, "%a, %d %b %Y %H:%M:%S", &tm);
      t = mktime(&tm);

      if (strstr(str, "GMT") || strstr(str, "UTC"))
         t += tmeSecondsPerHour;
   }
   
   return t;
}

//***************************************************************************
// Create HTTP Response
//***************************************************************************

MHD_Response* cWebTools::createHttpResponse(MemoryStruct* data)
{
   void* memory = data->isZipped() ? data->zmemory : data->memory;
   int size = data->isZipped() ? data->zsize : data->size;

#if MHD_VERSION >= 0x00090000
   return MHD_create_response_from_buffer(size, memory, MHD_RESPMEM_MUST_COPY); // MHD_RESPMEM_PERSISTENT)
#else
   return MHD_create_response_from_data(size, memory, no, yes);
#endif
}

//***************************************************************************
// Add HTTP Header Item
//***************************************************************************

int cWebTools::addHeaderItem(MHD_Response* response, const char* name, const char* value)
{
   return MHD_add_response_header(response, name, value);
}
