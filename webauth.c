/*
 * webauth.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

// https://gnunet.org/svn/libmicrohttpd/doc/examples/tlsauthentication.c

#include "httpd.h"

//***************************************************************************
// String 2 Base 64
//***************************************************************************

char* string2base64(const char* message)
{
   const char *lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
   unsigned long l;
   uint i;
   char* tmp;
   size_t length = strlen(message);

   tmp = (char*)malloc(length * 2);

   if (!tmp)
      return tmp;

   tmp[0] = 0;

   for (i = 0; i < length; i += 3)
   {
      l = (((unsigned long) message[i]) << 16)
         | (((i + 1) < length) ? (((unsigned long) message[i + 1]) << 8) : 0)
         | (((i + 2) < length) ? ((unsigned long) message[i + 2]) : 0);

      strncat (tmp, &lookup[(l >> 18) & 0x3F], 1);
      strncat (tmp, &lookup[(l >> 12) & 0x3F], 1);

      if (i + 1 < length)
         strncat(tmp, &lookup[(l >> 6) & 0x3F], 1);
      if (i + 2 < length)
         strncat(tmp, &lookup[l & 0x3F], 1);
   }

   if (length % 3)
      strncat(tmp, "===", 3 - length % 3);

   return tmp;
}

//***************************************************************************
// Ask For Authentication
//***************************************************************************

int cEpgHttpd::askForAuthentication(struct MHD_Connection* connection, const char* realm)
{
   int status;
   struct MHD_Response* response;
   char* headervalue = 0;

   response = MHD_create_response_from_buffer(0, 0, MHD_RESPMEM_PERSISTENT);

   if (!response)
      return MHD_NO;

   asprintf(&headervalue, "Basic realm=\"%s\"", realm);
   status = MHD_add_response_header(response, "WWW-Authenticate", headervalue);
   free(headervalue);

   if (!status)
   {
      MHD_destroy_response(response);
      return MHD_NO;
   }

   status = MHD_queue_response(connection, MHD_HTTP_UNAUTHORIZED, response);

   MHD_destroy_response(response);

   return status;
}

//***************************************************************************
// Is Authenticated
//***************************************************************************

int cEpgHttpd::isAuthenticated(struct MHD_Connection* connection,
                               const char* username, const char* password)
{
   const char *headervalue;
   char *expected64, *expected;
   const char *strbase = "Basic ";
   int authenticated;

   headervalue = MHD_lookup_connection_value(connection, MHD_HEADER_KIND, "Authorization");

   if (!headervalue)
      return 0;

   if (strncmp(headervalue, strbase, strlen(strbase)) != 0)
      return 0;

   expected = (char*)malloc(strlen(username) + 1 + strlen(password) + 1);

   if (!expected)
      return 0;

   strcpy(expected, username);
   strcat(expected, ":");
   strcat(expected, password);

   expected64 = string2base64(expected);
   free(expected);

   if (!expected64)
      return 0;

   authenticated = (strcmp(headervalue + strlen(strbase), expected64) == 0);
   free(expected64);

   return authenticated;
}
