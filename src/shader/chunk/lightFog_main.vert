#if defined(HILO_HAS_LIGHT) || defined(HILO_HAS_FOG)
    vec3 fragPos = (u_modelViewMatrix * pos).xyz;

    #ifdef HILO_HAS_LIGHT
        v_fragPos = fragPos;
    #endif

    #ifdef HILO_HAS_FOG
        v_dist = length(fragPos);
    #endif
#endif