#if defined(HILO_DIFFUSE_MAP)
    uniform hiloSampler2D u_diffuse;
#elif defined(HILO_DIFFUSE_CUBE_MAP)
    uniform samplerCube u_diffuse;
#else
    uniform vec4 u_diffuse;
#endif