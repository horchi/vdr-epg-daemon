
#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <jansson.h>
#include "moviedbactor.h"

#include "../../tools/stringhelpers.h"

using namespace std;

cMovieDbActors::cMovieDbActors(string json, string actorsBaseUrl) {
    this->json = json;
    this->actorsBaseUrl = actorsBaseUrl;
}

cMovieDbActors::~cMovieDbActors() {
}

void cMovieDbActors::ParseJSON(vector<cMovieDBActor*> *actors) {
    cJsonLoader jActors(json.c_str());
    if (!jActors.isObject()) {
        return;
    }
    json_t *cast = jActors.objectByName("cast");
    if(!json_is_array(cast)) {
        return;
    }
    size_t numActors = json_array_size(cast);
    for (size_t i = 0; i < numActors; i++) {
        json_t *jActor = json_array_get(cast, i);
        if (!json_is_object(jActor)) {
            return;
        }
        json_t *jId = json_object_get(jActor, "id");
        json_t *jName = json_object_get(jActor, "name");
        json_t *jRole = json_object_get(jActor, "character");
        json_t *jPath = json_object_get(jActor, "profile_path");
        if (!json_is_integer(jId) || !json_is_string(jName) || !json_is_string(jRole) || !json_is_string(jPath))
            return;
        cMovieDBActor *actor = new cMovieDBActor();
        actor->id = json_integer_value(jId);
        actor->name = json_string_value(jName);
        actor->role = json_string_value(jRole);
        actor->thumbUrl = actorsBaseUrl + json_string_value(jPath);
        actors->push_back(actor);
    }
}
