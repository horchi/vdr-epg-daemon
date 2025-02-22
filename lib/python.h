/*
 * python.h
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#pragma once

#include <Python.h>

#include "db.h"

//***************************************************************************
// Class Python GIL Lock
//***************************************************************************

class PythonGilLock
{
   public:

      PythonGilLock() { gstate = PyGILState_Ensure(); }
      ~PythonGilLock() { PyGILState_Release(gstate); }

   private:

      PyGILState_STATE gstate;
};

//***************************************************************************
// Class Python
//***************************************************************************

class Python
{
   public:

      Python(const char* aFile, const char* aFunction);
      ~Python();

      static int initGlobal();
		static void exitGlobal();

      int init(const char* modulePath = 0);
      int exit();

      int execute(cDbTable* eventsDb, int namingmode, const char* tmplExpression);

      const char* getResult() { return result ? result : ""; }

   protected:

      static PyObject* eventTitle(PyObject* self, PyObject* args);
      static PyObject* eventShortText(PyObject* self, PyObject* args);
      static PyObject* eventStartTime(PyObject* self, PyObject* args);
      static PyObject* eventYear(PyObject* self, PyObject* args);
      static PyObject* eventCategory(PyObject* self, PyObject* args);

      static PyObject* episodeName(PyObject* self, PyObject* args);
      static PyObject* episodeShortName(PyObject* self, PyObject* args);
      static PyObject* episodePartName(PyObject* self, PyObject* args);
      static PyObject* extracol1(PyObject* self, PyObject* args);
      static PyObject* extracol2(PyObject* self, PyObject* args);
      static PyObject* extracol3(PyObject* self, PyObject* args);
      static PyObject* episodeSeason(PyObject* self, PyObject* args);
      static PyObject* episodePart(PyObject* self, PyObject* args);
      static PyObject* episodeNumber(PyObject* self, PyObject* args);
      static PyObject* namingMode(PyObject* self, PyObject* args);
      static PyObject* tmplExpression(PyObject* self, PyObject* args);

      void showError();

      // data

      PyObject* pModule {};
      PyObject* pFunc {};

      char* file {};
      char* function {};
      char* result {};

      // static stuff

      static int usages;
      static cDbTable* globalEventsDb;
      static int globalNamingMode;
      static const char* globalTmplExpression;
      static PyMethodDef eventMethods[];

      static PyObject* PyInitEvent() { return PyModule_Create(&Python::moduledef); }
      static PyModuleDef moduledef;
};
