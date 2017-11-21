float transparency = 1.0;
#ifdef HILO_TRANSPARENCY_MAP
    transparency = texture2D(u_transparency, v_texcoord0).r;
#else
    transparency = u_transparency;
#endif
color.a *= transparency;
#ifdef HILO_ALPHA_CUTOFF
    if (color.a < u_alphaCutoff) {
        discard;
    } else {
        color.a = 1.0;
    }
#endif