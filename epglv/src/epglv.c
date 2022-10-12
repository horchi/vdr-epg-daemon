/*

EPG2VDR Levenshtein Distance UDF for MySQL
Supports UTF-8 throught iconv.

Copyright (C) 2013 Jörg Wendel

*/

#include "epglv.h"

//***************************************************************************
// EPGLV()
//***************************************************************************

my_bool epglv_init(UDF_INIT* init, UDF_ARGS* args, char* message)
{
   return base_epglv_init(init, args, message);
}

void epglv_deinit(UDF_INIT* init)
{
   base_epglv_deinit(init);
}

long long epglv(UDF_INIT* init, UDF_ARGS* args, char* is_null, char* error)
{
   long long len1 = 0, len2 = 0;
   long long diff = base_epglv(init, args, is_null, error, &len1, &len2);

   return diff;
}

//***************************************************************************
// EPGLVR()
//***************************************************************************

my_bool epglvr_init(UDF_INIT* init, UDF_ARGS* args, char* message)
{
   return base_epglv_init(init, args, message);
}

void epglvr_deinit(UDF_INIT* init)
{
   base_epglv_deinit(init);
}

long long epglvr(UDF_INIT* init, UDF_ARGS* args, char* is_null, char* error)
{
   long long len1 = 0, len2 = 0;

   long long diff = base_epglv(init, args, is_null, error, &len1, &len2);

   long long len = len1 < len2 ? len2 : len1;

   return (double)diff / ((double)len / 100.0);
}
