#ifndef __FUZZY_H__
#define __FUZZY_H__

#include <string>

size_t letter_distance(char letter1, char letter2); 
size_t word_distance(const std::string& word1, const std::string& word2);
size_t sentence_distance(const std::string& sentence1, const std::string& sentence2);

#endif
