/*
 * levenshtein.c
 *
 * See the README file for copyright information
 *
 */

#include <string>
#include <algorithm>
#include <vector>

#include "common.h"

//***************************************************************************
// lvDistance
//***************************************************************************

int lvDistance(const std::string& source, const std::string& target, int maxPer, int& maxDist)
{
   // Step 1

   const int n = source.length();
   const int m = target.length();

   if (!n)
      return m;

   if (!m)
      return n;

   if (maxPer != na)
   {
      maxDist = ((double)n) / 100.0 * ((double)maxPer);

      if (abs(n-m) > maxDist)
         return maxDist+1;
   }

   typedef std::vector<std::vector<int>> Tmatrix;
   Tmatrix matrix(n+1);

   // Size the vectors in the 2.nd dimension. Unfortunately C++ doesn't
   // allow for allocation on declaration of 2.nd dimension of vec of vec

   for (int i = 0; i <= n; i++)
      matrix[i].resize(m+1);

   // Step 2

   for (int i = 0; i <= n; i++)
      matrix[i][0] = i;

   for (int j = 0; j <= m; j++)
      matrix[0][j] = j;

   // Step 3

   for (int i = 1; i <= n; i++)
   {
      const char s_i = source[i-1];

      // Step 4

      for (int j = 1; j <= m; j++)
      {
         const char t_j = target[j-1];

         // Step 5

         int cost;

         if (s_i == t_j)
            cost = 0;
         else
            cost = 1;

         // Step 6

         const int above = matrix[i-1][j];
         const int left = matrix[i][j-1];
         const int diag = matrix[i-1][j-1];
         int cell = std::min(above + 1, std::min(left + 1, diag + cost));

         // Step 6A: Cover transposition, in addition to deletion,
         // insertion and substitution. This step is taken from:
         // Berghel, Hal ; Roach, David : "An Extension of Ukkonen's
         // Enhanced Dynamic Programming ASM Algorithm"
         // (http://www.acm.org/~hlb/publications/asm/asm.html)

         if (i > 2 && j > 2)
         {
            int trans = matrix[i-2][j-2]+1;

            if (source[i-2] != t_j) trans++;
            if (s_i != target[j-2]) trans++;
            if (cell > trans) cell = trans;
         }

         matrix[i][j] = cell;
      }
   }

   // Step 7

   return matrix[n][m];
}
