#ifdef HILO_HAS_COLOR
    varying vec4 v_color;
#endif

#ifdef HILO_USE_HDR
    uniform float u_exposure;
#endif

#if defined (HILO_GAMMA_INPUT ) || defined(HILO_GAMMA_OUTPUT)
    uniform float u_gammaFactor;
#endif