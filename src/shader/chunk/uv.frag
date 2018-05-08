#ifdef HILO_HAS_TEXCOORD0
    varying vec2 v_texcoord0;
#endif

#ifdef HILO_HAS_TEXCOORD1
    varying vec2 v_texcoord1;
#endif

#ifdef HILO_GAMMA_INPUT
    vec4 invertGammaFactor = vec4(1.0/u_gammaFactor);
#endif

#if defined(HILO_HAS_TEXCOORD0) || defined(HILO_HAS_TEXCOORD1)
    #if defined(HILO_HAS_TEXCOORD0) && defined(HILO_HAS_TEXCOORD1)
        #define HILO_TEXTURE_2D(hiloSampler2D)  hiloTexture2D(hiloSampler2D.texture, hiloSampler2D.uv)
        
        struct hiloSampler2D{
            sampler2D texture;
            int uv; 
        };
        
        #ifdef HILO_GAMMA_INPUT
            vec4 hiloTexture2D(sampler2D texture, int uv){
                vec4 color;
                if(uv == 0){
                    color = texture2D(texture, v_texcoord0);
                }
                else{
                    color = texture2D(texture, v_texcoord1);
                }
                return pow(color, invertGammaFactor);
            }
        #else
            vec4 hiloTexture2D(sampler2D texture, int uv){
                if(uv == 0){
                    return texture2D(texture, v_texcoord0);
                }
                else{
                    return texture2D(texture, v_texcoord1);
                }
            }
        #endif
    #else
        #ifdef HILO_HAS_TEXCOORD1
            #define HILO_V_TEXCOORD v_texcoord1
        #else
            #define HILO_V_TEXCOORD v_texcoord0
        #endif
        #define HILO_TEXTURE_2D(hiloSampler2D)  hiloTexture2D(hiloSampler2D.texture)

        struct hiloSampler2D{
            sampler2D texture;
        };

        #ifdef HILO_GAMMA_INPUT
            vec4 hiloTexture2D(sampler2D texture){
                return pow(texture2D(texture, HILO_V_TEXCOORD), invertGammaFactor);
            }
        #else
            vec4 hiloTexture2D(sampler2D texture){
                return texture2D(texture, HILO_V_TEXCOORD);
            }
        #endif
    #endif
#endif


#ifdef HILO_DIFFUSE_CUBE_MAP
    varying vec3 v_position;
#endif