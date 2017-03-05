
#ifndef _STRINGHELPERS_H_
#define _STRINGHELPERS_H_

#include <string>
using namespace std;

string str_replace(const string& search, const string& replace, const string& subject);
string str_cut(const string& search, const string& subject);

#include <jansson.h>

class cJsonLoader
{
   public:

      cJsonLoader(const char* name);
      ~cJsonLoader();

      json_t* object()                         { return obj; }
      json_error_t* error()                    { return err; }
      json_t* objectByName(const char* name);
      int isObject();

   protected:

      json_error_t* err;
      json_t* obj;
};

#endif // _STRINGHELPERS_H_
