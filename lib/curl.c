/*
 * curlfuncs.cpp
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "curl.h"

//***************************************************************************
// Singelton
//***************************************************************************

cCurl curl;

bool cCurl::curlInitialized {false};
cSystemNotification* cCurl::sysNotification {};

//***************************************************************************
// Callbacks
//***************************************************************************

size_t collect_data(void* ptr, size_t size, size_t nmemb, void* data)
{
   size_t actualsize = size * nmemb;

   if (!data)
      return actualsize;

   std::string* buffer = (std::string*)data;
   std::string sTmp;
   sTmp.assign((char*)ptr, actualsize);
   *buffer += sTmp;

   return actualsize;
}

//***************************************************************************
// Object
//***************************************************************************

cCurl::cCurl()
{
}

cCurl::~cCurl()
{
   exit();
}

//***************************************************************************
// Create / Destroy
//***************************************************************************

int cCurl::create()
{
   if (!curlInitialized)
   {
      // call only once per process and *before* any thread is started!

      if (curl_global_init(CURL_GLOBAL_SSL /*CURL_GLOBAL_ALL*/) != 0)
      {
         tell(0, "Error, something went wrong with curl_global_init()");
         return fail;
      }

      curlInitialized = true;
   }

   return done;
}

int cCurl::destroy()
{
   if (curlInitialized)
      curl_global_cleanup();

   curlInitialized = false;

   return done;
}

//***************************************************************************
// Init / Exit
//***************************************************************************

int cCurl::init(const char* httpproxy)
{
   if (!handle)
   {
      if (!(handle = curl_easy_init()))
      {
         tell(0, "Could not create new curl instance");
         return fail;
      }
   }
   else
   {
      curl_easy_reset(handle);
   }

   // Reset Options

   if (!isEmpty(httpproxy))
   {
      curl_easy_setopt(handle, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
      curl_easy_setopt(handle, CURLOPT_PROXY, httpproxy);   // Specify HTTP proxy
   }

   curl_easy_setopt(handle, CURLOPT_HTTPHEADER, 0);
   curl_easy_setopt(handle, CURLOPT_WRITEFUNCTION, collect_data);         // the default to write to string
   curl_easy_setopt(handle, CURLOPT_WRITEDATA, 0);                        //to be set later but prior to calling curl_easy_perform!
   curl_easy_setopt(handle, CURLOPT_FOLLOWLOCATION, yes);
   curl_easy_setopt(handle, CURLOPT_HEADERFUNCTION, 0);                   // Send header to this function
   curl_easy_setopt(handle, CURLOPT_WRITEHEADER, 0);                      // Pass some header details to this struct
   curl_easy_setopt(handle, CURLOPT_MAXFILESIZE, 100*1024*1024);          // Set maximum file size to get (bytes)
   curl_easy_setopt(handle, CURLOPT_NOPROGRESS, 1);                       // No progress meter
   curl_easy_setopt(handle, CURLOPT_NOSIGNAL, 1);                         // No signaling
   curl_easy_setopt(handle, CURLOPT_TIMEOUT, 30);                         // Set timeout
   curl_easy_setopt(handle, CURLOPT_NOBODY, 0);                           //
   curl_easy_setopt(handle, CURLOPT_USERAGENT, CURL_USERAGENT);           // Some servers don't like requests
   curl_easy_setopt(handle, CURLOPT_ACCEPT_ENCODING, "");

   return success;
}

int cCurl::exit()
{
   if (handle)
   {
      clearHeader();
      curl_easy_cleanup(handle);
   }

   handle = 0;

   return done;
}

void cCurl::addHeader(const char* format, ...)
{
   char* buffer {};
   va_list ap;

   va_start(ap, format);
   vasprintf(&buffer, format, ap);
   va_end(ap);

   headerList = curl_slist_append(headerList, buffer);
   free(buffer);
}

//***************************************************************************
// Get Url
//***************************************************************************

int cCurl::get(const char* aUrl, MemoryStruct* data, std::map<std::string,std::string>* parameters)
{
   CURLcode res {CURLE_OK};
   std::string url = aUrl;
   data->clear();
   init();

   // header

   struct curl_slist* headers {};

   if (headerList)
      for (curl_slist* current = headerList; current; current = current->next)
         headers = curl_slist_append(headers, current->data);

   for (curl_slist* current = headers; current; current = current->next)
      tell(eloDebugCurl, "Append header: '%s'", current->data);

   // optional url parameters

   if (parameters && parameters->size())
   {
      url += std::string("?");

      for (const auto& parameter : *parameters)
      {
         char* value = escapeUrl(parameter.second.c_str());
         url += parameter.first + "=" + value + "&";
         curl_free(value);
      }

      url.erase(url.size() - 1);
   }

   // tell(0, "CURL: Requesting '%s'", url.c_str());

   // CURL options

   curl_easy_setopt(handle, CURLOPT_URL, url.c_str());
   curl_easy_setopt(handle, CURLOPT_HTTPHEADER, headers);
   curl_easy_setopt(handle, CURLOPT_HTTPGET, yes);
   curl_easy_setopt(handle, CURLOPT_FAILONERROR, yes);
   curl_easy_setopt(handle, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);      // Send all data to this function
   curl_easy_setopt(handle, CURLOPT_WRITEDATA, (void*)data);                  // Pass our 'data' struct to the callback function
   curl_easy_setopt(handle, CURLOPT_MAXFILESIZE, 10*1024*1024);               // Set maximum size to get (bytes)

   tell(eloDebugCurl, "-> (GET) '%s'", url.c_str());

   if ((res = curl_easy_perform(handle)) != CURLE_OK)
   {
      long httpCode {0};

      curl_easy_getinfo(handle, CURLINFO_RESPONSE_CODE, &httpCode);
      tell(1, "Error: HTTP/GET failed '%s'; http code (%ld) [%s]", curl_easy_strerror(res), httpCode, url.c_str());
      data->clear();
      curl_slist_free_all(headers);

      return fail;
   }

   curl_slist_free_all(headers);
   data->append("\0", 1);

   return success;
}

int cCurl::post(const char* url, const char* jData, std::string& sOutput)
{
   CURLcode res {CURLE_OK};
   const char* method {"POST"};

   sOutput = "";
   init();

   tell(2, "-> (%s) '%s' [%s]", method, url, jData);

   struct curl_slist* headers {};

   if (headerList)
      for (curl_slist* current = headerList; current; current = current->next)
         headers = curl_slist_append(headers, current->data);

   curl_easy_setopt(handle, CURLOPT_URL, url);
   curl_easy_setopt(handle, CURLOPT_HTTPHEADER, headers);
   curl_easy_setopt(handle, CURLOPT_POST, 1);
   curl_easy_setopt(handle, CURLOPT_POSTFIELDS, jData);
   curl_easy_setopt(handle, CURLOPT_WRITEDATA, &sOutput);

   if ((res = curl_easy_perform(handle)) != CURLE_OK)
   {
      long httpCode {0};

      curl_easy_getinfo(handle, CURLINFO_RESPONSE_CODE, &httpCode);
      tell(1, "Error: HTTP/GET failed '%s'; http code (%ld) [%s]", curl_easy_strerror(res), httpCode, url);
      curl_slist_free_all(headers);
      curl_slist_free_all(headers);
      sOutput = "";
      return fail;
   }

   curl_slist_free_all(headers);

   return success;
}

//***************************************************************************
// Get Url
//***************************************************************************

int cCurl::GetUrl(const char* url, std::string* sOutput, const std::string& sReferer)
{
   CURLcode res;

   init();

   curl_easy_setopt(handle, CURLOPT_URL, url);            // Set the URL to get

   if (sReferer != "")
      curl_easy_setopt(handle, CURLOPT_REFERER, sReferer.c_str());

   curl_easy_setopt(handle, CURLOPT_HTTPGET, yes);
   curl_easy_setopt(handle, CURLOPT_FAILONERROR, yes);
   curl_easy_setopt(handle, CURLOPT_WRITEDATA, sOutput);       // Set option to write to string

   tell(5, "Debug: CURL request url '%s' [%s]", url, getBacktrace(3).c_str());

   if ((res = curl_easy_perform(handle)) != CURLE_OK)
   {
      long httpCode {0};

      curl_easy_getinfo(handle, CURLINFO_RESPONSE_CODE, &httpCode);
      tell(1, "Error: Getting URL failed; %s (%d); http code was (%ld) [%s]",
           curl_easy_strerror(res), res, httpCode, url);

      *sOutput = "";

      return 0;
   }

   return 1;
}

int cCurl::GetUrlFile(const char* url, const char* filename, const std::string& sReferer)
{
   int nRet {0};

   init();

   // Point the output to a file

   FILE* fp {};

   if ((fp = fopen(filename, "w")) == NULL)
      return 0;

   curl_easy_setopt(handle, CURLOPT_WRITEDATA, fp);       // Set option to write to file
   curl_easy_setopt(handle, CURLOPT_URL, url);            // Set the URL to get

   if (sReferer != "")
      curl_easy_setopt(handle, CURLOPT_REFERER, sReferer.c_str());

   curl_easy_setopt(handle, CURLOPT_HTTPGET, yes);

   if (curl_easy_perform(handle) == 0)
      nRet = 1;
   else
      nRet = 0;

   curl_easy_setopt(handle, CURLOPT_WRITEDATA, NULL);     // Set option back to default (string)
   fclose(fp);

   return nRet;
}

int cCurl::PostUrl(const char* url, const std::string &sPost, std::string* sOutput, const std::string &sReferer)
{
  init();

  int retval = 1;
  std::string::size_type nStart = 0, nEnd, nPos;
  std::string sTmp, sName, sValue;
  struct curl_httppost *formpost {};
  struct curl_httppost *lastptr {};
  struct curl_slist *headerlist {};

  // Add the POST variables here

  while ((nEnd = sPost.find("##", nStart)) != std::string::npos)
  {
     sTmp = sPost.substr(nStart, nEnd - nStart);

     if ((nPos = sTmp.find("=")) == std::string::npos)
        return 0;

     sName = sTmp.substr(0, nPos);
     sValue = sTmp.substr(nPos+1);
     curl_formadd(&formpost, &lastptr, CURLFORM_COPYNAME, sName.c_str(), CURLFORM_COPYCONTENTS, sValue.c_str(), CURLFORM_END);
     nStart = nEnd + 2;
  }
  sTmp = sPost.substr(nStart);

  if ((nPos = sTmp.find("=")) == std::string::npos)
     return 0;

  sName = sTmp.substr(0, nPos);
  sValue = sTmp.substr(nPos+1);
  curl_formadd(&formpost, &lastptr, CURLFORM_COPYNAME, sName.c_str(), CURLFORM_COPYCONTENTS, sValue.c_str(), CURLFORM_END);

  retval = curl.DoPost(url, sOutput, sReferer, formpost, headerlist);

  curl_formfree(formpost);
  curl_slist_free_all(headerlist);

  return retval;
}

int cCurl::PostRaw(const char* url, const std::string &sPost, std::string* sOutput, const std::string &sReferer)
{
  init();

  int retval;
  struct curl_httppost *formpost {};
  struct curl_slist *headerlist {};

  curl_easy_setopt(handle, CURLOPT_POSTFIELDS, sPost.c_str());
  curl_easy_setopt(handle, CURLOPT_POSTFIELDSIZE, 0); //FIXME: Should this be the size instead, in case this is binary string?

  retval = curl.DoPost(url, sOutput, sReferer, formpost, headerlist);

  curl_formfree(formpost);
  curl_slist_free_all(headerlist);
  return retval;
}

int cCurl::DoPost(const char *url, std::string* sOutput, const std::string &sReferer,
                  struct curl_httppost *formpost, struct curl_slist *headerlist)
{
   headerlist = curl_slist_append(headerlist, "Expect:");

   // Now do the form post
   curl_easy_setopt(handle, CURLOPT_URL, url);
   if (sReferer != "")
      curl_easy_setopt(handle, CURLOPT_REFERER, sReferer.c_str());
   curl_easy_setopt(handle, CURLOPT_HTTPPOST, formpost);

   curl_easy_setopt(handle, CURLOPT_WRITEDATA, sOutput); // Set option to write to string

   if (curl_easy_perform(handle) == 0)
      return 1;

   // We have an error here mate!

   *sOutput = "";

   return 0;
}

int cCurl::SetCookieFile(char *filename)
{
   init();

   if (curl_easy_setopt(handle, CURLOPT_COOKIEFILE, filename) != 0)
      return 0;

   if (curl_easy_setopt(handle, CURLOPT_COOKIEJAR, filename) != 0)
      return 0;

   return 1;
}

char* cCurl::EscapeUrl(const char *url)
{
   init();
   return curl_easy_escape(handle, url , strlen(url));
}

void cCurl::Free(char* str)
{
   curl_free(str);
}

char* cCurl::escapeUrl(const char* url)
{
   return curl_easy_escape(handle, url, strlen(url));
}

void cCurl::free(char* url)
{
   curl_free(url);
}

//***************************************************************************
// Callbacks
//***************************************************************************

size_t cCurl::WriteMemoryCallback(void* ptr, size_t size, size_t nmemb, void* data)
{
   size_t realsize = size * nmemb;
   MemoryStruct* mem = (MemoryStruct*)data;

   if (sysNotification)
      sysNotification->check();

   mem->append((const char*)ptr, realsize);

   return realsize;
}

size_t cCurl::WriteHeaderCallback(char* ptr, size_t size, size_t nmemb, void* data)
{
   size_t realsize = size * nmemb;
   MemoryStruct* mem = (MemoryStruct*)data;
   char* p;

   if (sysNotification)
      sysNotification->check();

   if (ptr)
   {
      // add to Header to map

      std::string header(ptr);
      std::size_t pos = header.find(": ");

      if(pos != std::string::npos)
      {
         std::string name = header.substr(0, pos);
         std::string value = header.substr(pos+2, std::string::npos);
         mem->headers[name] = value;
      }

      // get filename
      {
         // Content-Disposition: attachment; filename="20140103_20140103_de_qy.zip"

         const char* attribute = "Content-disposition: ";

         if ((p = strcasestr((char*)ptr, attribute)))
         {
            if ((p = strcasestr(p, "filename=")))
            {
               p += strlen("filename=");

               tell(4, "found filename at [%s]", p);

               if (*p == '"')
                  p++;

               sprintf(mem->name, "%s", p);

               if ((p = strchr(mem->name, '\n')))
                  *p = 0;

               if ((p = strchr(mem->name, '\r')))
                  *p = 0;

               if ((p = strchr(mem->name, '"')))
                  *p = 0;

               tell(4, "set name to '%s'", mem->name);
            }
         }
      }

      // since some sources update "ETag" an "Last-Modified:" without changing the contents
      //  we have to use "Content-Length:" to check for updates :(
      {
         const char* attribute = "Content-Length: ";

         if ((p = strcasestr((char*)ptr, attribute)))
         {
            sprintf(mem->tag, "%s", p+strlen(attribute));

            if ((p = strchr(mem->tag, '\n')))
               *p = 0;

            if ((p = strchr(mem->tag, '\r')))
               *p = 0;

            if ((p = strchr(mem->tag, '"')))
               *p = 0;
         }
      }
   }

   return realsize;
}

//***************************************************************************
// Download File
//***************************************************************************

int cCurl::downloadFile(const char* url, int& size, MemoryStruct* data, int timeout,
                        const char* userAgent, struct curl_slist* headerlist)
{
   CURLcode res {CURLE_OK};

   size = 0;

   init();

   curl_easy_setopt(handle, CURLOPT_URL, url);                                // Specify URL to get
   curl_easy_setopt(handle, CURLOPT_FOLLOWLOCATION, yes);
   curl_easy_setopt(handle, CURLOPT_UNRESTRICTED_AUTH, yes);                  // continue to send authentication (user+password) when following locations
   curl_easy_setopt(handle, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);      // Send all data to this function
   curl_easy_setopt(handle, CURLOPT_WRITEDATA, (void*)data);                  // Pass our 'data' struct to the callback function
   curl_easy_setopt(handle, CURLOPT_HEADERFUNCTION, WriteHeaderCallback);     // Send header to this function
   curl_easy_setopt(handle, CURLOPT_WRITEHEADER, (void*)data);                // Pass some header details to this struct
   curl_easy_setopt(handle, CURLOPT_MAXFILESIZE, 100*1024*1024);              // Set maximum file size to get (bytes)
   curl_easy_setopt(handle, CURLOPT_NOPROGRESS, 1);                           // No progress meter
   curl_easy_setopt(handle, CURLOPT_NOSIGNAL, 1);                             // No signaling
   curl_easy_setopt(handle, CURLOPT_TIMEOUT, timeout);                        // Set timeout
   curl_easy_setopt(handle, CURLOPT_NOBODY, data->headerOnly ? 1 : 0);        //
   curl_easy_setopt(handle, CURLOPT_USERAGENT, userAgent);                    // Some servers don't like requests without a user-agent field
   //  curl_easy_setopt(handle, CURLOPT_ACCEPT_ENCODING, "gzip");             //
   curl_easy_setopt(handle, CURLOPT_ACCEPT_ENCODING, "");

   if (headerlist)
      curl_easy_setopt(handle, CURLOPT_HTTPHEADER, headerlist);

   // perform http-get

   if ((res = curl_easy_perform(handle)) != CURLE_OK)
   {
      long httpCode {0};

      curl_easy_getinfo(handle, CURLINFO_RESPONSE_CODE, &httpCode);
      tell(1, "Error: Download failed, got %ld bytes; %s (%d); http code was (%ld) [%s]",
           data->size, curl_easy_strerror(res), res, httpCode, url);

      data->clear();
      exit();

      return fail;
   }

   data->append("\0", 1);

   long code;
   curl_easy_getinfo(handle, CURLINFO_HTTP_CODE, &code);

   if (code == 400 || code == 404 || code == 500)
   {
      tell(eloAlways, "Curl: Got http code (%ld)", code);
      data->clear();
      data->statusCode = code;
      exit();
      return fail;
   }

   data->statusCode = code;
   size = data->size;

   return success;
}
