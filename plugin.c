/*
 * plugin.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <dlfcn.h>

#include "epgd.h"

//***************************************************************************
// Class Plugin Loader
//***************************************************************************

PluginLoader::PluginLoader(const char* name, Plugin* p)
{
   fileName = strdup(name);
   plugin = p;    // normally 0, set for testing only
   handle = 0;
}

PluginLoader::~PluginLoader()
{
  delete plugin;

  if (handle)
     dlclose(handle);

  free(fileName);
}

int PluginLoader::load()
{
   const char* error;

   tell(0, "Loading plugin: %s", fileName);

   if (handle) 
   {
      tell(0, "Warning: Attempt to load plugin '%s' twice!", fileName);
      return fail;
   }

   plugin = 0;
   handle = dlopen(fileName, RTLD_NOW);
   error = dlerror();

   if (!error) 
   {
      void *(*creator)(void);

      *(void**)(&creator) = dlsym(handle, "EPGPluginCreator");

      error = dlerror();

      if (!error)
         plugin = (Plugin*)creator();
   }

   if (error)
      tell(0, "Error: %s", error);
   
   return plugin ? success : fail;
}
