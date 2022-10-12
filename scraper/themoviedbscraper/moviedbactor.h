#ifndef __TVSCRAPER_MOVIEDBACTORS_H
#define __TVSCRAPER_MOVIEDBACTORS_H

using namespace std;

// --- cMovieDBActor -------------------------------------------------------------
class cMovieDBActor {
public:
    cMovieDBActor(void) {
        id = 0;
        thumbUrl = "";
        name = "";
        role = "";
        width = 370;
        height = 556;
    };
    int id;
    string thumbUrl;
    int width;
    int height;
    string name;
    string role;
    void Dump(void) {
        cout << "id: " << id << endl;
        cout << "name: " << name << endl;
        cout << "role: " << role << endl;
        cout << "thumbnail: " << thumbUrl << endl;
    };
};

// --- cMovieDBActors -------------------------------------------------------------

class cMovieDbActors {
private:
    string json;
    string actorsBaseUrl;
public:
    cMovieDbActors(string json, string actorsBaseUrl);
    virtual ~cMovieDbActors(void);
    void ParseJSON(vector<cMovieDBActor*> *actors);
};


#endif //__TVSCRAPER_MOVIEDBACTORS_H
