/*

EPG2VDR Levenshtein Distance UDF for MySQL
Supports UTF-8 i throught iconv.

Copyright (C) 2013 Jörg Wendel

*/

#include "epglv.h"

//***************************************************************************
// Declarations
//***************************************************************************

struct workspace_t  // structure to allocate memory in init and use it in core functions
{
   char*      str1;          // internal buffer to store 1st string
   char*      str2;          // internal buffer to store 2nd string
   int*       row0;          // round buffer for levenshtein_core function
   int*       row1;          // round buffer for levenshtein_core function
   int*       row2;          // round buffer for levenshtein_core function
   mbstate_t* mbstate;       // buffer for mbsnrtowcs
   iconv_t    ic;            // buffer for iconv
   char       iconv_init;    // flag indicating if iconv has been inited before
};

//***************************************************************************
// Function Declarations
//***************************************************************************

int epglv_core(struct workspace_t *ws,
               const char *str1, int len1,
               const char *str2, int len2,
               int w, int s, int a, int d, int limit);

char* epglv_utf8toiso(const char *str_src, long long *len_src,
                      struct workspace_t * ws, char *str_dst, int limit);

//***************************************************************************
// The Work
//***************************************************************************
//***************************************************************************
// init - check parameters and allocate memory for MySql
//***************************************************************************

my_bool base_epglv_init(UDF_INIT* init, UDF_ARGS* args, char* message)
{
    struct workspace_t *ws;

    // make sure both arguments are ok
    
    if (args->arg_count != 2 || args->arg_type[0] != STRING_RESULT || args->arg_type[1] != STRING_RESULT)
    {
       strncpy(message, "EPGLV() requires arguments (string, string)", 80);
       return 1;
    }

    init->maybe_null = 0;      // EPGLV() will not be returning null

    // attempt to allocate memory in which to calculate distance

    ws = (struct workspace_t*)malloc(sizeof(struct workspace_t));
    ws->mbstate = (mbstate_t*)malloc(sizeof(mbstate_t));
    ws->str1 = (char*)malloc(sizeof(char)*(LENGTH_MAX+2));    // max allocated for UTF-8 complex string
    ws->str2 = (char*)malloc(sizeof(char)*(LENGTH_MAX+2));
    ws->row0 = (int*)malloc(sizeof(int)*(LENGTH_MAX+2));
    ws->row1 = (int*)malloc(sizeof(int)*(LENGTH_MAX+2));
    ws->row2 = (int*)malloc(sizeof(int)*(LENGTH_MAX+2));
    ws->iconv_init = 0;

    if (!ws || !ws->mbstate || !ws->str1 || !ws->str2 || !ws->row0 || !ws->row1 || !ws->row2) 
    {
        free(ws->row2); free(ws->row1); free(ws->row0);
        free(ws->str2); free(ws->str1);
        free(ws->mbstate); free(ws);
        strncpy(message, "EPGLV() failed to allocate memory", 80);
        return 1;
    }

    if (!setlocale(LC_CTYPE, "de_DE.UTF-8")) 
    {
        free(ws->row2); free(ws->row1); free(ws->row0);
        free(ws->str2); free(ws->str1);
        free(ws->mbstate); free(ws);
        strncpy(message, "EPGLV() failed to change locale", 80);
        return 1;
    }

    init->ptr = (char *) ws;
    debug_print("%s", "init successful");

    return 0;
}

//***************************************************************************
// deallocate memory, clean and close
//***************************************************************************

void base_epglv_deinit(UDF_INIT* init)
{
   if (init->ptr) 
   {
      struct workspace_t* ws = (struct workspace_t*)init->ptr;

      if (ws->iconv_init)
         iconv_close(ws->ic);

      free(ws->row2);
      free(ws->row1);
      free(ws->row0);
      free(ws->str2);
      free(ws->str1);
      free(ws->mbstate);
      free(ws);
   }

   debug_print("%s", "bye");
}

//***************************************************************************
// check parameters and allocate memory for MySql
//***************************************************************************

long long base_epglv(UDF_INIT* init, UDF_ARGS* args, char* is_null, char* error, 
                     long long* len1, long long* len2)
{
   const char* str1 = args->args[0];
   const char* str2 = args->args[1];
  
   char* iso_str1 = 0;
   char* iso_str2 = 0;
   struct workspace_t* ws = (struct workspace_t*)init->ptr;  // get a pointer to memory previously allocated

   *error = 0; 
   *len1 = (!str1) ? 0 : args->lengths[0];
   *len2 = (!str2) ? 0 : args->lengths[1];
   long long max = *len1 > *len2 ? *len1 : *len2;

   if (max >= LENGTH_MAX) 
   {
      print("size(%lld) was bigger than %d, aborting", max, LENGTH_MAX);
      return -1;
   }

   if (!*len1 && !*len2)
      return 0;

   if (!*len1 || !*len2)
      return max;

   if ((iso_str1 = epglv_utf8toiso(str1, len1, ws, ws->str1, max)) == 0)
      return -1;

   if ((iso_str2 = epglv_utf8toiso(str2, len2, ws, ws->str2, max)) == 0) 
      return -1;
   
   return epglv_core(
      ws,
      iso_str1, *len1,
      iso_str2, *len2,
      /* swap */         1,
      /* substitution */ 1,
      /* insertion */    1,
      /* deletion */     1,
      /* limit */        max);
}

//***************************************************************************
// core function
//***************************************************************************

int epglv_core(struct workspace_t* ws,
                const char* str1, int len1,
                const char* str2, int len2,
                int w, int s, int a, int d, int limit) 
{
    int* row0 = ws->row0;
    int* row1 = ws->row1;
    int* row2 = ws->row2;
    int i, j;

    for (j = 0; j <= len2; j++)
        row1[j] = j * a;

    for (i = 0; i < len1; i++) 
    {
       int* dummy;
       
       row2[0] = (i + 1) * d;

       for (j = 0; j < len2; j++) 
       {
          // substitution

          row2[j + 1] = row1[j] + s * (str1[i] != str2[j]);

          // swap

          if (i > 0 && j > 0 && 
              str1[i - 1] == str2[j] &&
              str1[i] == str2[j - 1] &&
              row2[j + 1] > row0[j - 1] + w) 
          {
             row2[j + 1] = row0[j - 1] + w;
          }

          // deletion

          if (row2[j + 1] > row1[j + 1] + d) 
             row2[j + 1] = row1[j + 1] + d;
          
          // insertion

          if (row2[j + 1] > row2[j] + a) 
             row2[j + 1] = row2[j] + a;
       }
       
       dummy = row0;
       row0 = row1;
       row1 = row2;
       row2 = dummy;
    }
    
    debug_print("returning(%d)", row1[len2]);

    return row1[len2];
}

//**************************************************************************
// translates an UTF8 string to ISO with some error return codes
//**************************************************************************

char* epglv_utf8toiso(const char* str_src, long long* len_src,
                      struct workspace_t* ws, char* str_dst, int limit) 
{
   mbstate_t* mbstate = ws->mbstate;
   size_t len_mbsnrtowcs, len_ret = LENGTH_MAX, len_min = LENGTH_MAX;
   char* ret = str_dst;
   char* in_s = (char*)str_src;
   
   memset((void*)mbstate, '\0', sizeof(mbstate_t));
   
   if ((len_mbsnrtowcs = mbsnrtowcs(0, &str_src, *len_src, 0, mbstate)) == -1) 
   {
      print("mbsnrtowcs failed, str_src(%s): '%m'", str_src);
      strncpy(str_dst, str_src, len_min);
      str_dst[len_min] = 0; str_dst[len_min + 1] = 0;
      *len_src = len_min;
      return str_dst;
   }
   
   len_min = MIN(len_mbsnrtowcs, limit);
   
   if (len_mbsnrtowcs == *len_src)
   {
      strncpy(str_dst, str_src, len_min);
      str_dst[len_min] = 0; str_dst[len_min + 1] = 0;
      *len_src = len_min;
      return str_dst;
   }
   
   if (!ws->iconv_init)
   {
      if ((ws->ic = iconv_open("ISO8859-15", "UTF-8")) == (iconv_t)-1)
      {
         print("%s", "failed to initialize iconv '%m'");
         return 0;
      }
      
      ws->iconv_init = 1;
   }
   
   if (iconv(ws->ic, &in_s, (size_t*)len_src, &ret, &len_ret) == -1) 
   {
      if (errno != E2BIG)
      {
         print("in_s '%s' at '%s'; len_src (%lld) len_ret (%zu) '%m'", str_src, in_s, *len_src, len_ret);
         strncpy(str_dst, str_src, len_min);
         str_dst[len_min] = 0; str_dst[len_min + 1] = 0;
         *len_src = len_min;
         return str_dst;
      }

      print("inside E2BIG len_mbsnrtowcs(%zu) len_src(%lld)", len_mbsnrtowcs, *len_src);
      len_mbsnrtowcs = len_min;
   }
   
   *len_src = len_min;           // adjust converted length
   str_dst[len_min] = 0; str_dst[len_min + 1] = 0;
   
   iconv(ws->ic, 0, 0, 0, 0);
   
   return str_dst;
}
