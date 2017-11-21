float getPointAttenuation(vec3 distanceVec, vec3 info){
    float distance = length(distanceVec);
    return 1.0/(info.x + info.y * distance + info.z * distance * distance);
}

#pragma glslify: export(getPointAttenuation)