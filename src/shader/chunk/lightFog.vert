#if defined(HILO_HAS_LIGHT) || defined(HILO_HAS_FOG)
    uniform mat4 u_modelViewMatrix;
    #ifdef HILO_HAS_FOG
        varying float v_dist;
    #endif

    #ifdef HILO_HAS_LIGHT
        varying vec3 v_fragPos;
    #endif
#endif