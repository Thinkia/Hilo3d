#ifdef HILO_HAS_NORMAL
    varying vec3 v_normal;
    #ifdef HILO_NORMAL_MAP
        uniform sampler2D u_normalMap;
        varying mat3 v_TBN;
        
        #ifdef HILO_NORMAL_MAP_SCALE
        uniform vec3 u_normalMapScale;
        #endif
    #endif
#endif