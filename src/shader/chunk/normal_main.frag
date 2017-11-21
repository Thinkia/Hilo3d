#ifdef HILO_HAS_NORMAL_MAP
    vec3 normal = texture2D(u_normalMap, v_texcoord0).rgb * 2.0 - 1.0;
    normal = normalize(v_TBN * normal);
#elif defined(HILO_HAS_NORMAL)
    vec3 normal = normalize(v_normal);
#else
    vec3 normal = vec3(0, 0, 1);
#endif

#if HILO_SIDE == HILO_BACK_SIDE
    normal = -normal;
#endif