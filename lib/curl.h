/*
 * curlfuncs.h
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#pragma once

#include <curl/curl.h>
#include <curl/easy.h>

#include <string>

#include "common.h"
#include "config.h"
#include "configuration.h"

#define CURL_USERAGENT "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0; Mayukh's libcurl wrapper http://www.mayukhbose.com/)"

//***************************************************************************
// CURL
//***************************************************************************

class cCurl
{
   public:

      cCurl();
      ~cCurl();

      int init(const char* httpproxy = "");
      int exit();

      static int create();
      static int destroy();

      void addHeader(const char* format, ...);
      void clearHeader() { if (headerList) curl_slist_free_all(headerList); headerList = nullptr; }

      int get(const char* aUrl, MemoryStruct* data, std::map<std::string,std::string>* parameters = nullptr);
      int post(const char* url, const char* jData, std::string& sOutput);

      int GetUrl(const char *url, std::string *sOutput, const std::string &sReferer = "");
      int GetUrlFile(const char *url, const char *filename, const std::string &sReferer = "");
      int SetCookieFile(char *filename);
      int PostUrl(const char *url, const std::string &sPost, std::string *sOutput, const std::string &sReferer = "");
      int PostRaw(const char *url, const std::string &sPost, std::string *sOutput, const std::string &sReferer = "");
      int DoPost(const char* url, std::string* sOutput, const std::string& sReferer,
                 curl_mime* multipart, struct curl_slist* headerlist);

      char* EscapeUrl(const char* url);
      void Free(char* str);
      char* escapeUrl(const char* url);
      void free(char* url);

      int downloadFile(const char* url, int& size, MemoryStruct* data, int timeout = 30,
                       const char* userAgent = CURL_USERAGENT, struct curl_slist* headerlist = 0);

      // static stuff

      static void setSystemNotification(cSystemNotification* s) { sysNotification = s; }

   protected:

      CURL* handle {};
      struct curl_slist* headerList {};

      // statics

      static size_t WriteMemoryCallback(void* ptr, size_t size, size_t nmemb, void* data);
      static size_t WriteHeaderCallback(char* ptr, size_t size, size_t nmemb, void* data);

      static cSystemNotification* sysNotification;
      static bool curlInitialized;
};

extern cCurl curl;
