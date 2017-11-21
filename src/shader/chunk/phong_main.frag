#ifdef HILO_HAS_LIGHT
    vec3 lightDiffuse = vec3(0, 0, 0);
    vec3 lightAmbient = vec3(0, 0, 0);
    vec3 viewPos = vec3(0, 0, 0);

    #ifdef HILO_AMBIENT_MAP
        lightAmbient = texture2D(u_ambient, v_texcoord0).rgb;
    #else
        lightAmbient = diffuse.rgb;
    #endif

    #ifdef HILO_HAS_SPECULAR
        vec3 lightSpecular = vec3(0, 0, 0);
        #ifdef HILO_SPECULAR_MAP
            vec4 specular = texture2D(u_specular, v_texcoord0);
        #else
            vec4 specular = u_specular;
        #endif
    #endif
    
    #ifdef HILO_EMISSION_MAP
        vec4 emission = texture2D(u_emission, v_texcoord0);
    #else
        vec4 emission = u_emission;
    #endif

    #ifdef HILO_DIRECTIONAL_LIGHTS
        for(int i = 0;i < HILO_DIRECTIONAL_LIGHTS;i++){
            vec3 lightDir = -u_directionalLightsInfo[i];

            float shadow = 1.0;
            #ifdef HILO_DIRECTIONAL_LIGHTS_SMC
                if (i < HILO_DIRECTIONAL_LIGHTS_SMC) {
                    float bias = max(u_directionalLightsShadowBias[i][1] * (1.0 - dot(normal, lightDir)), u_directionalLightsShadowBias[i][0]);
                    shadow = getShadow(u_directionalLightsShadowMap[i], u_directionalLightsShadowMapSize[i], bias, v_fragPos, u_directionalLightSpaceMatrix[i]);
                }
            #endif

            float diff = getDiffuse(normal, lightDir);
            lightDiffuse += diff * u_directionalLightsColor[i] * shadow;

            #ifdef HILO_HAS_SPECULAR
                float spec = getSpecular(viewPos, v_fragPos, lightDir, normal, u_shininess);
                lightSpecular += spec * u_directionalLightsColor[i] * shadow;
            #endif
        }
    #endif

    #ifdef HILO_SPOT_LIGHTS
        for(int i = 0; i < HILO_SPOT_LIGHTS; i++){
            vec3 lightDir = -u_spotLightsDir[i];
            vec3 distanceVec = u_spotLightsPos[i] - v_fragPos;

            float shadow = 1.0;
            #ifdef HILO_SPOT_LIGHTS_SMC
                if (i < HILO_SPOT_LIGHTS_SMC) {
                    float bias = max(u_spotLightsShadowBias[i][1] * (1.0 - dot(normal, lightDir)), u_spotLightsShadowBias[i][0]);
                    shadow = getShadow(u_spotLightsShadowMap[i], u_spotLightsShadowMapSize[i], bias, v_fragPos, u_spotLightSpaceMatrix[i]);
                }
            #endif
            
            float diff = getDiffuse(normal, normalize(distanceVec));
            float theta = dot(normalize(distanceVec), lightDir);
            float epsilon = u_spotLightsCutoffs[i][0] - u_spotLightsCutoffs[i][1];
            float intensity = clamp((theta - u_spotLightsCutoffs[i][1]) / epsilon, 0.0, 1.0);
            float attenuation = getPointAttenuation(distanceVec, u_spotLightsInfo[i]);

            lightDiffuse += intensity * attenuation * shadow * diff * u_spotLightsColor[i];

            #ifdef HILO_HAS_SPECULAR
                float spec = getSpecular(viewPos, v_fragPos, lightDir, normal, u_shininess);
                lightSpecular += intensity * attenuation * shadow * spec * u_spotLightsColor[i];
            #endif
        }
    #endif

    #ifdef HILO_POINT_LIGHTS
        for(int i = 0;i < HILO_POINT_LIGHTS;i++){
            vec3 distanceVec = u_pointLightsPos[i] - v_fragPos;
            vec3 lightDir = normalize(distanceVec);

            float diff = getDiffuse(normal, lightDir);
            float attenuation = getPointAttenuation(distanceVec, u_pointLightsInfo[i]);
            lightDiffuse += diff * attenuation * u_pointLightsColor[i];

            #ifdef HILO_HAS_SPECULAR
                float spec = getSpecular(viewPos, v_fragPos, lightDir, normal, u_shininess);
                lightSpecular += spec * attenuation * u_pointLightsColor[i];
            #endif
        }
    #endif

    #ifdef HILO_AMBIENT_LIGHTS
        color.rgb += u_ambientLightsColor * lightAmbient;
    #endif

    #if defined(HILO_SKYBOX_MAP) && defined(HILO_HAS_SPECULAR)
        vec3 I = normalize(v_fragPos - viewPos);
        if (u_reflectivity > 0.0) {
            vec3 R = reflect(I, normal);
            R = normalize(vec3(u_skyboxMatrix * vec4(R, 1.0)));
            lightSpecular += textureCube(u_skyboxMap, R).rgb * u_reflectivity;
        }
        if (u_refractivity > 0.0) {
            vec3 R = refract(I, normal, u_refractRatio);
            R = normalize(vec3(u_skyboxMatrix * vec4(R, 1.0)));
            lightSpecular += textureCube(u_skyboxMap, R).rgb * u_refractivity;
        }
    #endif

    color.rgb += lightDiffuse * diffuse.rgb;
    #ifdef HILO_HAS_SPECULAR
        color.rgb += lightSpecular * specular.rgb;
    #endif

    color.rgb += emission.rgb;
#else
    color = diffuse;
#endif