#ifdef HILO_TRANSPARENCY_MAP
    uniform hiloSampler2D u_transparency;
#else
    uniform float u_transparency;
#endif

#ifdef HILO_ALPHA_CUTOFF
    uniform float u_alphaCutoff;
#endif