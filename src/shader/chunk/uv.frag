#ifdef HILO_HAS_TEXCOORD0
    varying vec2 v_texcoord0;
#endif

#ifdef HILO_HAS_TEXCOORD1
    varying vec2 v_texcoord1;
#endif

#if defined(HILO_HAS_TEXCOORD0) && defined(HILO_HAS_TEXCOORD1)
    struct hiloSampler2D{
        sampler2D texture;
        int uv; 
    };
    vec4 hiloTexture2D(hiloSampler2D texture){
        if(texture.uv == 0){
            return texture2D(texture.texture, v_texcoord0);
        }
        else{
            return texture2D(texture.texture, v_texcoord1);
        }
    }
#elif defined(HILO_HAS_TEXCOORD1)
    struct hiloSampler2D{
        sampler2D texture;
    };
    vec4 hiloTexture2D(hiloSampler2D texture){
        return texture2D(texture.texture, v_texcoord1);
    }
#elif defined(HILO_HAS_TEXCOORD0)
    struct hiloSampler2D{
        sampler2D texture;
    };
    vec4 hiloTexture2D(hiloSampler2D texture){
        return texture2D(texture.texture, v_texcoord0);
    }
#endif

#ifdef HILO_DIFFUSE_CUBE_MAP
    varying vec3 v_position;
#endif