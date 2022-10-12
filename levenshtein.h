/*
 * levenshtein.h
 *
 * See the README file for copyright information
 *
 */


#ifndef __LEVENSHTEIN_H
#define __LEVENSHTEIN_H

#include "lib/common.h"

//***************************************************************************
// LV Distance
//***************************************************************************

int lvDistance(const std::string source, const std::string target, int maxPer, int& maxDist);

#endif //  __LEVENSHTEIN_H
