#ifdef HILO_HAS_NORMAL
    varying vec3 v_normal;
    #ifdef HILO_HAS_NORMAL_MAP
        uniform sampler2D u_normalMap;
        varying mat3 v_TBN;
    #endif
#endif