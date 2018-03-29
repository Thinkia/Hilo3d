#ifdef HILO_HAS_TEXCOORD0
    attribute vec2 a_texcoord0;
    varying vec2 v_texcoord0;
#endif

#ifdef HILO_HAS_TEXCOORD1
    attribute vec2 a_texcoord1;
    varying vec2 v_texcoord1;
#endif

#ifdef HILO_DIFFUSE_CUBE_MAP
    varying vec3 v_position;
#endif