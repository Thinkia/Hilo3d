#ifdef HILO_QUANTIZED
    #ifdef HILO_POSITION_QUANTIZED
        pos.xyz = unQuantize(pos.xyz, u_positionDecodeMat);
    #endif
    #if defined(HILO_HAS_TEXCOORD0) && defined(HILO_UV_QUANTIZED)
        uv = unQuantize(uv, u_uvDecodeMat);
    #endif
    #if defined(HILO_HAS_NORMAL) && defined(HILO_NORMAL_QUANTIZED)
        normal = unQuantize(normal, u_normalDecodeMat);
    #endif
#endif