vec4 baseColor = u_baseColor;
#ifdef HILO_BASECOLOR_MAP
    baseColor *= texture2D(u_baseColorMap, v_texcoord0);
#endif

#if defined(HILO_HAS_COLOR)
    baseColor *= v_color;
#endif

color.a = baseColor.a;

#pragma glslify: import('./transparency_main.frag');

#ifdef HILO_HAS_LIGHT
    vec3 viewPos = vec3(0, 0, 0);
    vec3 N = normal;
    vec3 V = normalize(viewPos - v_fragPos);

    #ifdef HILO_OCCLUSION_MAP
        float ao  = texture2D(u_occlusionMap, v_texcoord0).r;
    #else
        float ao = 1.0;
    #endif

    #ifdef HILO_PBR_SPECULAR_GLOSSINESS
        vec3 specular = u_specular.rgb;
        float glossiness = u_glossiness;
        #ifdef HILO_SPECULAR_GLOSSINESS_MAP
            vec4 specularGlossiness = texture2D(u_specularGlossinessMap, v_texcoord0);
            specular = specularGlossiness.rgb * specular;
            glossiness = specularGlossiness.a * glossiness;
        #endif
        float roughness = 1.0 - glossiness;
        float metallic = 0.0;
        vec3 diffuseColor = baseColor.rgb * (1.0 - max(max(specular.r, specular.g), specular.b));
        vec3 specularColor = specular;
    #else
        float metallic = u_metallic;
        float roughness = u_roughness;
        #ifdef HILO_METALLIC_MAP
            metallic = texture2D(u_metallicMap, v_texcoord0).r * u_metallic;
        #endif
        #ifdef HILO_ROUGHNESS_MAP
            roughness  = texture2D(u_roughnessMap, v_texcoord0).r * u_roughness;
        #endif
        #ifdef HILO_METALLIC_ROUGHNESS_MAP
            vec4 metallicRoughnessMap = texture2D(u_metallicRoughnessMap, v_texcoord0);
            #ifdef HILO_OCCLUSION_MAP_IN_METALLIC_ROUGHNESS_MAP
                ao = metallicRoughnessMap.r;
            #endif
            roughness = metallicRoughnessMap.g * u_roughness;
            metallic = metallicRoughnessMap.b * u_metallic;
        #endif
        roughness = clamp(roughness, 0.04, 1.0);
        metallic = clamp(metallic, 0.0, 1.0);
        vec3 f0 = vec3(0.04);
        vec3 diffuseColor = mix(baseColor.rgb * (1.0 - f0), vec3(0., 0., 0.), metallic);
        vec3 specularColor = mix(f0, baseColor.rgb, metallic);
    #endif


    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);
    // For typical incident reflectance range (between 4% to 100%) set the grazing reflectance to 100% for typical fresnel effect.
    // For very low reflectance range on highly diffuse objects (below 4%), incrementally reduce grazing reflecance to 0%.
    float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
    vec3 specularEnvironmentR0 = specularColor.rgb;
    vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;

    vec3 Lo = vec3(0.0);
    #ifdef HILO_DIRECTIONAL_LIGHTS
        for(int i = 0;i < HILO_DIRECTIONAL_LIGHTS;i++){
            vec3 L = normalize(-u_directionalLightsInfo[i]);
            vec3 radiance = u_directionalLightsColor[i];
            float shadow = 1.0;
            #ifdef HILO_DIRECTIONAL_LIGHTS_SMC
                if (i < HILO_DIRECTIONAL_LIGHTS_SMC) {
                    float bias = max(u_directionalLightsShadowBias[i][1] * (1.0 - dot(N, L)), u_directionalLightsShadowBias[i][0]);
                    shadow = getShadow(u_directionalLightsShadowMap[i], u_directionalLightsShadowMapSize[i], bias, v_fragPos, u_directionalLightSpaceMatrix[i]);
                }
            #endif

            Lo += shadow * radiance * calculateLo(N, V, L, metallic, roughness, diffuseColor, specularEnvironmentR0, specularEnvironmentR90);
        }
    #endif

    #ifdef HILO_SPOT_LIGHTS
        for(int i = 0; i < HILO_SPOT_LIGHTS; i++){
            vec3 lightDir = normalize(-u_spotLightsDir[i]);
            vec3 distanceVec = u_spotLightsPos[i] - v_fragPos;

            float theta = dot(normalize(distanceVec), lightDir);
            float epsilon = u_spotLightsCutoffs[i][0] - u_spotLightsCutoffs[i][1];
            float intensity = clamp((theta - u_spotLightsCutoffs[i][1]) / epsilon, 0.0, 1.0);
            float attenuation = getPointAttenuation(distanceVec, u_spotLightsInfo[i]);
            vec3 radiance = intensity * attenuation * u_spotLightsColor[i];

            float shadow = 1.0;
            #ifdef HILO_SPOT_LIGHTS_SMC
                if (i < HILO_SPOT_LIGHTS_SMC) {
                    float bias = max(u_spotLightsShadowBias[i][1] * (1.0 - dot(N, lightDir)), u_spotLightsShadowBias[i][0]);
                    shadow = getShadow(u_spotLightsShadowMap[i], u_spotLightsShadowMapSize[i], bias, v_fragPos, u_spotLightSpaceMatrix[i]);
                }
            #endif
            Lo += shadow * radiance * calculateLo(N, V, lightDir, metallic, roughness, diffuseColor, specularEnvironmentR0, specularEnvironmentR90);
        }
    #endif

    #ifdef HILO_POINT_LIGHTS
        for(int i = 0; i < HILO_POINT_LIGHTS; i++){
            vec3 distanceVec = u_pointLightsPos[i] - v_fragPos;
            vec3 lightDir = normalize(distanceVec);

            float attenuation = getPointAttenuation(distanceVec, u_pointLightsInfo[i]);
            vec3 radiance = attenuation * u_pointLightsColor[i];

            Lo += radiance * calculateLo(N, V, lightDir, metallic, roughness, diffuseColor, specularEnvironmentR0, specularEnvironmentR90);
        }
    #endif

    #ifdef HILO_DIFFUSE_ENV_MAP
        vec3 diffuseLight = textureCube(u_diffuseEnvMap, N).rgb;
        color.rgb += ao * diffuseLight * diffuseColor;
    #endif

    #ifdef HILO_SPECULAR_ENV_MAP
        vec3 R = -normalize(reflect(V, N));
        float NdotV = abs(dot(N, V)) + 0.001;
        vec3 brdf = texture2D(u_brdfLUT, vec2(NdotV, 1.0 - roughness)).rgb;
        #ifdef HILO_USE_TEX_LOD
            float mipCount = 9.0; // resolution of 512x512
            float lod = (roughness * mipCount);
            vec3 specularLight = textureCubeLodEXT(u_specularEnvMap, R, lod).rgb;
        #else
            vec3 specularLight = textureCube(u_specularEnvMap, R).rgb;
        #endif
        color.rgb += ao * specularLight * specularColor * (brdf.x + brdf.y);
    #endif

    #if defined(HILO_AMBIENT_LIGHTS) && !defined(HILO_DIFFUSE_ENV_MAP)
        color.rgb += u_ambientLightsColor * baseColor.rgb * ao;
    #endif

    #ifdef HILO_EMISSION_MAP
        color.rgb += texture2D(u_emission, v_texcoord0).rgb;
    #endif

    color.rgb += Lo;
#else
    color = baseColor;
#endif