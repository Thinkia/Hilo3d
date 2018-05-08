/* eslint camelcase: "off" */

export { default as ALI_amc_mesh_compression } from './AliAMCExtension';

export const WEB3D_quantized_attributes = {
    unQuantizeData(data, decodeMat) {
        if (!decodeMat) {
            return data;
        }

        const matSize = Math.sqrt(decodeMat.length);
        const itemLen = matSize - 1;
        const result = new Float32Array(data.length);
        const tempArr = [];
        data.traverse((d, i) => {
            if (d.toArray) {
                d.toArray(tempArr);
            } else {
                tempArr[0] = d;
            }
            const idx = i * itemLen;
            for (let j = 0; j < matSize; j++) {
                result[idx + j] = 0;
                for (let k = 0; k < matSize; k++) {
                    let v = k === itemLen ? 1 : tempArr[k];
                    result[idx + j] += decodeMat[k * matSize + j] * v;
                }
            }
        });
        data.data = result;
        data.stride = 0;
        data.offset = 0;
        return data;
    },
    parse(quantizeInfo, parser, result, isDecode) {
        let decodeMat = quantizeInfo.decodeMatrix;
        if (isDecode) {
            result = WEB3D_quantized_attributes.unQuantizeData(result, decodeMat);
        } else {
            result.decodeMat = decodeMat;
        }
        return result;
    }
};

export const HILO_animation_clips = {
    parse(animClips, parser, model) {
        if (!model.anim) {
            return model;
        }
        for (let name in animClips) {
            let clip = animClips[name];
            model.anim.addClip(name, clip[0], clip[1]);
        }
        return model;
    }
};
export const ALI_animation_clips = HILO_animation_clips;

export const ALI_bounding_box = {
    parse(bounds, parser, model) {
        bounds.center = bounds.max.map((a, i) => (a + bounds.min[i]) / 2);
        bounds.width = bounds.max[0] - bounds.min[0];
        bounds.height = bounds.max[1] - bounds.min[1];
        bounds.depth = bounds.max[2] - bounds.min[2];
        bounds.size = Math.sqrt(bounds.width ** 2 + bounds.height ** 2 + bounds.depth ** 2);
        model.bounds = bounds;
        return model;
    }
};

export const KHR_materials_pbrSpecularGlossiness = {
    parse(info, parser, material) {
        if (info.diffuseFactor) {
            material.baseColor.fromArray(info.diffuseFactor);
        }
        if (info.diffuseTexture) {
            material.baseColorMap = parser.getTexture(info.diffuseTexture);
        }
        
        if (info.specularFactor) {
            material.specular.fromArray(info.specularFactor);
            material.specular.a = 1;
        }
        if ('glossinessFactor' in info) {
            material.glossiness = info.glossinessFactor;
        }
        if (info.specularGlossinessTexture) {
            material.specularGlossinessMap = parser.getTexture(info.specularGlossinessTexture);
        }
        material.isSpecularGlossiness = true;

        return material;
    }
};