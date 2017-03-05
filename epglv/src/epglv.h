/*

EPG2VDR Levenshtein Distance UDF for MySQL
Supports UTF-8 throught iconv.

Copyright (C) 2013 Jörg Wendel

*/

#ifndef __EPGLV_H
#define __EPGLV_H

#ifdef STANDARD
# include <string.h>
#else
# include <my_global.h>
# include <my_sys.h>
#endif

#include <mysql.h>
#include <m_ctype.h>
#include <m_string.h>

#include <locale.h>
#include <stdio.h>
#include <string.h>
#include <wchar.h>
#include <stdlib.h>
#include <stdarg.h>
#include <iconv.h>
#include <errno.h>
#include <stdint.h>
#include <assert.h>

#define LENGTH_MAX 1000

#define debug_print(fmt, ...) \
    do { if (DEBUG_MYSQL) fprintf(stderr, "%s():%d> " fmt "\n", \
         __func__, __LINE__, __VA_ARGS__); fflush(stderr); } while (0)

#define print(fmt, ...) \
    do { fprintf(stderr, "%s():%d> " fmt "\n", \
         __func__, __LINE__, __VA_ARGS__); fflush(stderr); } while (0)

#define MIN(a,b) (((a)<(b))?(a):(b))

#endif //  __EPGLV_H

my_bool base_epglv_init(UDF_INIT* init, UDF_ARGS* args, char* message);
void base_epglv_deinit(UDF_INIT* init);
long long base_epglv(UDF_INIT* init, UDF_ARGS* args, char* is_null, 
                     char* error, long long* l1, long long* l2);
