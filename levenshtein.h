/*
 * levenshtein.h
 *
 * See the README file for copyright information
 *
 */

#pragma once

#include "lib/common.h"

int lvDistance(const std::string& source, const std::string& target, int maxPer, int& maxDist);
