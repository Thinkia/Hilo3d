vec4 textureEnvMap(sampler2D texture, vec3 position){   
    return texture2D(texture, vec2(atan(position.x, position.z) * HILO_INVERSE_PI * 0.5+0.5,  acos(position.y) * HILO_INVERSE_PI));
}

vec4 textureEnvMap(samplerCube texture, vec3 position){   
    return textureCube(texture, position);
}

#pragma glslify: export(textureSphere)