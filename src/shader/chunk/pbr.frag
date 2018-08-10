#pragma glslify: import('../method/textureEnvMap.glsl');
#pragma glslify: import('../method/encoding.glsl');

uniform vec4 u_baseColor;
#ifdef HILO_BASE_COLOR_MAP
    uniform hiloSampler2D u_baseColorMap;
#endif

#ifdef HILO_HAS_LIGHT
    uniform float u_metallic;
    #ifdef HILO_METALLIC_MAP
        uniform hiloSampler2D u_metallicMap;
    #endif
        uniform float u_roughness;
    #ifdef HILO_ROUGHNESS_MAP
        uniform hiloSampler2D u_roughnessMap;
    #endif
    #ifdef HILO_METALLIC_ROUGHNESS_MAP
        uniform hiloSampler2D u_metallicRoughnessMap;
    #endif
    #ifdef HILO_OCCLUSION_MAP
        uniform hiloSampler2D u_occlusionMap;
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
        uniform hiloSampler2D u_emission;
    #endif

    #ifdef HILO_PBR_SPECULAR_GLOSSINESS
        uniform vec4 u_specular;
        uniform float u_glossiness;
        #ifdef HILO_SPECULAR_GLOSSINESS_MAP
            uniform hiloSampler2D u_specularGlossinessMap;
        #endif
    #endif

    #ifdef HILO_LIGHT_MAP
        uniform hiloSampler2D u_lightMap;
    #endif


    // PBR Based on https://github.com/KhronosGroup/glTF-WebGL-PBR

    // Encapsulate the various inputs used by the various functions in the shading equation
    // We store values in this struct to simplify the integration of alternative implementations
    // of the shading terms, outlined in the Readme.MD Appendix.
    struct PBRInfo
    {
        float NdotL;                  // cos angle between normal and light direction
        float NdotV;                  // cos angle between normal and view direction
        float NdotH;                  // cos angle between normal and half vector
        float LdotH;                  // cos angle between light direction and half vector
        float VdotH;                  // cos angle between view direction and half vector
        float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)
        float metalness;              // metallic value at the surface
        vec3 reflectance0;            // full reflectance color (normal incidence angle)
        vec3 reflectance90;           // reflectance color at grazing angle
        float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])
        vec3 diffuseColor;            // color contribution from diffuse lighting
        vec3 specularColor;           // color contribution from specular lighting
        float ao;                      // ao
    };

    // Basic Lambertian diffuse
    // Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
    // See also [1], Equation 1
    vec3 diffuse(PBRInfo pbrInputs) {
        return pbrInputs.diffuseColor * HILO_INVERSE_PI;
    }

    // The following equation models the Fresnel reflectance term of the spec equation (aka F())
    // Implementation of fresnel from [4], Equation 15
    vec3 specularReflection(PBRInfo pbrInputs) {
        return pbrInputs.reflectance0 + (pbrInputs.reflectance90 - pbrInputs.reflectance0) * pow(clamp(1.0 - pbrInputs.VdotH, 0.0, 1.0), 5.0);
    }

    // This calculates the specular geometric attenuation (aka G()),
    // where rougher material will reflect less light back to the viewer.
    // This implementation is based on [1] Equation 4, and we adopt their modifications to
    // alphaRoughness as input as originally proposed in [2].
    float geometricOcclusion(PBRInfo pbrInputs) {
        float NdotL = pbrInputs.NdotL;
        float NdotV = pbrInputs.NdotV;
        float r = pbrInputs.alphaRoughness;

        float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
        float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
        return attenuationL * attenuationV;
    }

    // The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
    // Implementation from "Average Irregularity Representation of a Roughened Surface for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
    // Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.
    float microfacetDistribution(PBRInfo pbrInputs) {
        float roughnessSq = pbrInputs.alphaRoughness * pbrInputs.alphaRoughness;
        float f = (pbrInputs.NdotH * roughnessSq - pbrInputs.NdotH) * pbrInputs.NdotH + 1.0;
        return roughnessSq * HILO_INVERSE_PI / (f * f);
    }

    vec3 getIBLContribution(PBRInfo pbrInputs, vec3 N, vec3 V) {
        vec3 color = vec3(.0, .0, .0);
        #ifdef HILO_DIFFUSE_ENV_MAP
            vec3 diffuseLight = textureEnvMap(u_diffuseEnvMap, N).rgb;
            color.rgb += diffuseLight * pbrInputs.diffuseColor * pbrInputs.ao;
        #endif

        #ifdef HILO_SPECULAR_ENV_MAP
            vec3 R = -normalize(reflect(V, N));
            float NdotV = pbrInputs.NdotV;
            vec3 brdf = texture2D(u_brdfLUT, vec2(NdotV, 1.0 - pbrInputs.perceptualRoughness)).rgb;
            #ifdef HILO_USE_SHADER_TEXTURE_LOD
                float mipCount = 10.0; // resolution of 1024*1024
                float lod = pbrInputs.perceptualRoughness * mipCount;
                vec3 specularLight = textureEnvMapLod(u_specularEnvMap, R, lod).rgb;
            #else
                vec3 specularLight = textureEnvMap(u_specularEnvMap, R).rgb;
            #endif
            color.rgb += specularLight * (pbrInputs.specularColor * brdf.x + brdf.y);
        #endif
        return color;
    }

    vec3 calculateLo(PBRInfo pbrInputs, vec3 N, vec3 V, vec3 L) {
        vec3 H = normalize(L + V);
        pbrInputs.NdotL = clamp(dot(N, L), 0.001, 1.0);
        pbrInputs.NdotH = clamp(dot(N, H), 0.0, 1.0);
        pbrInputs.LdotH = clamp(dot(L, H), 0.0, 1.0);
        pbrInputs.VdotH = clamp(dot(V, H), 0.0, 1.0);
        // Calculate the shading terms for the microfacet specular shading model
        vec3 F = specularReflection(pbrInputs);
        float G = geometricOcclusion(pbrInputs);
        float D = microfacetDistribution(pbrInputs);

        vec3 diffuseContrib;

        #ifdef HILO_LIGHT_MAP
            diffuseContrib = vec3(0.0);
        #else
            diffuseContrib = (1.0 - F) * diffuse(pbrInputs);
        #endif
        vec3 specContrib = F * G * D / (4.0 * pbrInputs.NdotL * pbrInputs.NdotV);
        // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
        return pbrInputs.NdotL * (diffuseContrib + specContrib);
    }
#endif