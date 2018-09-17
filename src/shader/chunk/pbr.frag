#pragma glslify: import('../method/textureEnvMap.glsl');
#pragma glslify: import('../method/encoding.glsl');

uniform vec4 u_baseColor;
#ifdef HILO_BASE_COLOR_MAP
    uniform HILO_SAMPLER_2D u_baseColorMap;
#endif

#ifdef HILO_HAS_LIGHT
    uniform float u_metallic;
    #ifdef HILO_METALLIC_MAP
        uniform HILO_SAMPLER_2D u_metallicMap;
    #endif
        uniform float u_roughness;
    #ifdef HILO_ROUGHNESS_MAP
        uniform HILO_SAMPLER_2D u_roughnessMap;
    #endif
    #ifdef HILO_METALLIC_ROUGHNESS_MAP
        uniform HILO_SAMPLER_2D u_metallicRoughnessMap;
    #endif
    #ifdef HILO_OCCLUSION_MAP
        uniform HILO_SAMPLER_2D u_occlusionMap;
    #endif

    #ifdef HILO_OCCLUSION_STRENGTH
        uniform float u_occlusionStrength;
    #endif

    #ifdef HILO_DIFFUSE_ENV_MAP
        #ifdef HILO_DIFFUSE_ENV_MAP_CUBE
            uniform samplerCube u_diffuseEnvMap;
        #else
            uniform sampler2D u_diffuseEnvMap;
        #endif
    #endif
    #ifdef HILO_SPECULAR_ENV_MAP
        uniform sampler2D u_brdfLUT;
        #ifdef HILO_SPECULAR_ENV_MAP_CUBE
            uniform samplerCube u_specularEnvMap;
        #else
            uniform sampler2D u_specularEnvMap;
        #endif
    #endif

    #ifdef HILO_EMISSION_MAP
        uniform HILO_SAMPLER_2D u_emission;
    #endif

    #ifdef HILO_PBR_SPECULAR_GLOSSINESS
        uniform vec4 u_specular;
        uniform float u_glossiness;
        #ifdef HILO_SPECULAR_GLOSSINESS_MAP
            uniform HILO_SAMPLER_2D u_specularGlossinessMap;
        #endif
    #endif

    #ifdef HILO_LIGHT_MAP
        uniform HILO_SAMPLER_2D u_lightMap;
    #endif


    // PBR Based on https://github.com/KhronosGroup/glTF-WebGL-PBR

    // Basic Lambertian diffuse
    // Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
    // See also [1], Equation 1
    vec3 diffuse(vec3 diffuseColor) {
        return diffuseColor * HILO_INVERSE_PI;
    }

    // The following equation models the Fresnel reflectance term of the spec equation (aka F())
    // Implementation of fresnel from [4], Equation 15
    vec3 specularReflection(vec3 reflectance0, vec3 reflectance90, float VdotH) {
        return reflectance0 + (reflectance90 - reflectance0) * pow(clamp(1.0 - VdotH, 0.0, 1.0), 5.0);
    }

    // This calculates the specular geometric attenuation (aka G()),
    // where rougher material will reflect less light back to the viewer.
    // This implementation is based on [1] Equation 4, and we adopt their modifications to
    // alphaRoughness as input as originally proposed in [2].
    float geometricOcclusion(float NdotL, float NdotV, float alphaRoughness) {
        float r = alphaRoughness * alphaRoughness;

        float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r + (1.0 - r) * (NdotL * NdotL)));
        float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r + (1.0 - r) * (NdotV * NdotV)));
        return attenuationL * attenuationV;
    }

    // The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
    // Implementation from "Average Irregularity Representation of a Roughened Surface for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
    // Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.
    float microfacetDistribution(float alphaRoughness, float NdotH) {
        float roughnessSq = alphaRoughness * alphaRoughness;
        float f = (NdotH * roughnessSq - NdotH) * NdotH + 1.0;
        return roughnessSq * HILO_INVERSE_PI / (f * f);
    }

    vec3 getIBLContribution(vec3 N, vec3 V, vec3 diffuseColor, vec3 specularColor, float ao, float NdotV, float perceptualRoughness) {
        vec3 color = vec3(.0, .0, .0);
        #ifdef HILO_DIFFUSE_ENV_MAP
            vec3 diffuseLight = textureEnvMap(u_diffuseEnvMap, N).rgb;
            color.rgb += diffuseLight * diffuseColor * ao;
        #endif

        #ifdef HILO_SPECULAR_ENV_MAP
            vec3 R = -normalize(reflect(V, N));
            vec3 brdf = texture2D(u_brdfLUT, vec2(NdotV, 1.0 - perceptualRoughness)).rgb;
            #ifdef HILO_USE_SHADER_TEXTURE_LOD
                float mipCount = 10.0; // resolution of 1024*1024
                float lod = perceptualRoughness * mipCount;
                vec3 specularLight = textureEnvMapLod(u_specularEnvMap, R, lod).rgb;
            #else
                vec3 specularLight = textureEnvMap(u_specularEnvMap, R).rgb;
            #endif
            color.rgb += specularLight * (specularColor * brdf.x + brdf.y);
        #endif
        return color;
    }

    vec3 calculateLo(vec3 N, vec3 V, vec3 L, vec3 reflectance0, vec3 reflectance90, float alphaRoughness, vec3 diffuseColor, float NdotV) {
        vec3 H = normalize(L + V);
        float NdotL = clamp(dot(N, L), 0.001, 1.0);
        float NdotH = clamp(dot(N, H), 0.0, 1.0);
        float LdotH = clamp(dot(L, H), 0.0, 1.0);
        float VdotH = clamp(dot(V, H), 0.0, 1.0);
        // Calculate the shading terms for the microfacet specular shading model
        vec3 F = specularReflection(reflectance0, reflectance90, VdotH);
        float G = geometricOcclusion(NdotL, NdotV, alphaRoughness);
        float D = microfacetDistribution(alphaRoughness, NdotH);

        vec3 diffuseContrib;

        #ifdef HILO_LIGHT_MAP
            diffuseContrib = vec3(0.0);
        #else
            diffuseContrib = (1.0 - F) * diffuse(diffuseColor);
        #endif
        vec3 specContrib = F * G * D / (4.0 * NdotL * NdotV);
        // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
        return NdotL * (diffuseContrib + specContrib);
    }
#endif