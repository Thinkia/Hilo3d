#pragma glslify: import('../method/textureEnvMap.glsl');

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

    struct PBRInfo
    {
        float NdotL;
        float NdotV;
        float NdotH;
        float LdotH;
        float VdotH;
        float roughness;
        float metalness;
        vec3 baseColor;
        vec3 reflectance0;
        vec3 reflectance90;
    };

    const float c_MinRoughness = 0.04;

    // The following equations model the diffuse term of the lighting equation
    // Implementation of diffuse from "Physically-Based Shading at Disney" by Brent Burley
    vec3 disneyDiffuse(PBRInfo pbrInputs) {
        float f90 = 2.*pbrInputs.LdotH*pbrInputs.LdotH*pbrInputs.roughness - 0.5;

        return (pbrInputs.baseColor/HILO_PI)*(1.0+f90*pow((1.0-pbrInputs.NdotL),5.0))*(1.0+f90*pow((1.0-pbrInputs.NdotV),5.0));
    }

    // basic Lambertian diffuse, implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
    vec3 lambertianDiffuse(PBRInfo pbrInputs) {
        return pbrInputs.baseColor / HILO_PI;
    }

    // The following equations model the Fresnel reflectance term of the spec equation (aka F())
    // implementation of fresnel from “An Inexpensive BRDF Model for Physically based Rendering” by Christophe Schlick
    vec3 fresnelSchlick2(PBRInfo pbrInputs) {
        return pbrInputs.reflectance0 + (pbrInputs.reflectance90 - pbrInputs.reflectance0) * pow(clamp(1.0 - pbrInputs.VdotH, 0.0, 1.0), 5.0);
    }

    // Simplified implementation of fresnel from “An Inexpensive BRDF Model for Physically based Rendering” by Christophe Schlick
    vec3 fresnelSchlick(PBRInfo pbrInputs) {
        return pbrInputs.metalness + (vec3(1.0) - pbrInputs.metalness) * pow(1.0 - pbrInputs.VdotH, 5.0);
    }

    // The following equations model the geometric occlusion term of the spec equation  (aka G())
    // Implementation from “A Reflectance Model for Computer Graphics” by Robert Cook and Kenneth Torrance,
    float geometricOcclusionCookTorrance(PBRInfo pbrInputs) {
        return min(min(2.*pbrInputs.NdotV*pbrInputs.NdotH/pbrInputs.VdotH, 2.*pbrInputs.NdotL*pbrInputs.NdotH/pbrInputs.VdotH),1.0);
    }

    // implementation of microfacet occlusion from “An Inexpensive BRDF Model for Physically based Rendering” by Christophe Schlick
    float geometricOcclusionSchlick(PBRInfo pbrInputs) {
        float k = pbrInputs.roughness * 0.79788; // 0.79788 = sqrt(2.0/3.1415);
        // alternately, k can be defined with
        // float k = (pbrInputs.roughness + 1)*(pbrInputs.roughness + 1)/8;

        float l = pbrInputs.LdotH / (pbrInputs.LdotH * (1.0 - k) + k);
        float n = pbrInputs.NdotH / (pbrInputs.NdotH * (1.0 - k) + k);
        return l * n;
    }

    // the following Smith implementations are from “Geometrical Shadowing of a Random Rough Surface” by Bruce G. Smith
    float geometricOcclusionSmith(PBRInfo pbrInputs) {
        float NdotL2 = pbrInputs.NdotL * pbrInputs.NdotL;
        float NdotV2 = pbrInputs.NdotV * pbrInputs.NdotV;
        float v = ( -1. + sqrt ( pbrInputs.roughness * (1. - NdotL2 ) / NdotL2 + 1.)) * 0.5;
        float l = ( -1. + sqrt ( pbrInputs.roughness * (1. - NdotV2 ) / NdotV2 + 1.)) * 0.5;
        return (1. / max((1. + v + l ),0.000001));
    }

    float SmithG1_var2(float NdotV, float r) {
        float tanSquared = (1.0 - NdotV * NdotV) / max((NdotV * NdotV),0.00001);
        return 2.0 / (1.0 + sqrt(1.0 + r * r * tanSquared));
    }

    float SmithG1(float NdotV, float r) {
        return 2.0 * NdotV / (NdotV + sqrt(r*r+(1.0-r*r)*(NdotV*NdotV)));
    }

    float geometricOcclusionSmithGGX(PBRInfo pbrInputs) {
        return SmithG1_var2(pbrInputs.NdotL, pbrInputs.roughness) * SmithG1_var2(pbrInputs.NdotV, pbrInputs.roughness);
    }

    // The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
    // implementation from “Average Irregularity Representation of a Roughened Surface for Ray Reflection” by T. S. Trowbridge, and K. P. Reitz
    float GGX(PBRInfo pbrInputs) {
        float roughnessSq = pbrInputs.roughness*pbrInputs.roughness;
        float f = (pbrInputs.NdotH * roughnessSq - pbrInputs.NdotH) * pbrInputs.NdotH + 1.0;
        return roughnessSq / (HILO_PI * f * f);
    }


    vec3 calculateLo(vec3 N, vec3 V, vec3 L, float metallic, float roughness, vec3 diffuseColor, vec3 R0, vec3 R90) {
        vec3 H = normalize(L + V);
        float NdotL = clamp(dot(N, L), 0.001, 1.0);
        float NdotV = abs(dot(N, V)) + 0.001;
        float NdotH = clamp(dot(N, H), 0.0, 1.0);
        float LdotH = clamp(dot(L, H), 0.0, 1.0);
        float VdotH = clamp(dot(V, H), 0.0, 1.0);
        PBRInfo pbrInputs = PBRInfo(
            NdotL,
            NdotV,
            NdotH,
            LdotH,
            VdotH,
            roughness,
            metallic,
            diffuseColor,
            R0,
            R90
        );
        vec3 F = fresnelSchlick2(pbrInputs);
        float G = geometricOcclusionSmithGGX(pbrInputs);
        float D = GGX(pbrInputs);
        #ifdef HILO_LIGHT_MAP
            vec3 diffuseContrib = vec3(.0, .0, .0);
        #else
            vec3 diffuseContrib = (1.0 - F) * lambertianDiffuse(pbrInputs);
        #endif
        vec3 specContrib = F * G * D / (4.0 * NdotL * NdotV);
        return NdotL * (diffuseContrib + specContrib);
    }
#endif