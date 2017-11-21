#ifdef HILO_HAS_LIGHT
    #ifdef HILO_HAS_SPECULAR
        uniform float u_shininess;
        #ifdef HILO_SPECULAR_MAP
            uniform sampler2D u_specular;
        #else
            uniform vec4 u_specular;
        #endif
    #endif
    #ifdef HILO_EMISSION_MAP
        uniform sampler2D u_emission;
    #else
        uniform vec4 u_emission;
    #endif
    #ifdef HILO_AMBIENT_MAP
        uniform sampler2D u_ambient;
    #endif
    #ifdef HILO_SKYBOX_MAP
        uniform samplerCube u_skyboxMap;
        uniform mat4 u_skyboxMatrix;
        uniform float u_reflectivity;
        uniform float u_refractRatio;
        uniform float u_refractivity;
    #endif
#endif