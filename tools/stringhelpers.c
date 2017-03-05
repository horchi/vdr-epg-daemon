
#include "stringhelpers.h"

cJsonLoader::cJsonLoader(const char* name)
{
   err = new json_error_t;
   obj = json_loads(name, 0, err); 

}

cJsonLoader::~cJsonLoader()
{
   if (obj)
      json_decref(obj);

   if (err)
      delete(err);
}

json_t* cJsonLoader::objectByName(const char* name)   
{ 
   return json_object_get(obj, name); 
}

int cJsonLoader::isObject()                           
{ 
   return obj && json_is_object(obj); 
}

//replace all "search" with "replace" in "subject"
string str_replace(const string& search, const string& replace, const string& subject) {
    string str = subject;
    size_t pos = 0;
    while((pos = str.find(search, pos)) != string::npos) {
        str.replace(pos, search.length(), replace);
        pos += replace.length();
    }
    return str;
}
//cut string after first "search"
string str_cut(const string& search, const string& subject) {
    string str = subject;
    string strCutted = "";
    size_t found = str.find_first_of(search);
    if (found != string::npos) {
        strCutted = str.substr(0, found);
        size_t foundSpace = strCutted.find_last_of(" ");
        if ((foundSpace != string::npos) && (foundSpace == (strCutted.size()-1))) {
            strCutted = strCutted.substr(0, strCutted.size()-1);
        }
    }
    return strCutted;
}
