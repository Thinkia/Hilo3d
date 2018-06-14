#ifdef HILO_GAMMA_INPUT
    vec4 textureEnvMap(sampler2D texture, vec3 position){
        vec2 newPosition = vec2(atan(position.x, position.z) * HILO_INVERSE_PI * 0.5+0.5,  acos(position.y) * HILO_INVERSE_PI);
        return pow(texture2D(texture, newPosition), invertGammaFactor);
    }

    vec4 textureEnvMap(samplerCube texture, vec3 position){
        return pow(textureCube(texture, position), invertGammaFactor);
    }
#else
    vec4 textureEnvMap(sampler2D texture, vec3 position){
        return texture2D(texture, vec2(atan(position.x, position.z) * HILO_INVERSE_PI * 0.5+0.5,  acos(position.y) * HILO_INVERSE_PI));
    }

    vec4 textureEnvMap(samplerCube texture, vec3 position){
        return textureCube(texture, position);
    }
#endif

#pragma glslify: export(textureSphere)