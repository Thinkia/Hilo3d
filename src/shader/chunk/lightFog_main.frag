#ifdef HILO_HAS_LIGHT
    #if HILO_SIDE == HILO_FRONT_AND_BACK_SIDE
        if(dot(-v_fragPos, normal) < 0.0){
            normal = -normal;
        }
    #endif
#endif