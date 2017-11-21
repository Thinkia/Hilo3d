#ifdef HILO_HAS_FOG
    float fogFactor = (u_fogInfo.y - v_dist)/(u_fogInfo.y - u_fogInfo.x);
    if(fogFactor < 0.0){
        fogFactor = 0.0;
    }
    else if(fogFactor > 1.0){
        fogFactor = 1.0;
    }
    color = fogFactor * color + (1.0 - fogFactor) * u_fogColor;
#endif