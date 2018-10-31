/* eslint camelcase: "off" */
import PointLight from '../light/PointLight';
import DirectionalLight from '../light/DirectionalLight';
import SpotLight from '../light/SpotLight';
import Color from '../math/Color';
import math from '../math/math';

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
    parse(quantizeInfo, parser, result, options) {
        let decodeMat = quantizeInfo.decodeMatrix;
        if (options.isDecode) {
            result = WEB3D_quantized_attributes.unQuantizeData(result, decodeMat);
        } else {
            result.decodeMat = decodeMat;
        }
        return result;
    }
};

export const HILO_animation_clips = {
    parse(animClips, parser, model) {
        if (!model.anim || parser.isMultiAnim) {
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

export const KHR_lights_punctual = {
    parse(info, parser, node, options) {
        if (options.isGlobalExtension) {
            return;
        }

        if (!parser.isUseExtension(parser.json, 'KHR_lights_punctual') || !parser.json.extensions.KHR_lights_punctual.lights) {
            return;
        }

        const lightInfo = parser.json.extensions.KHR_lights_punctual.lights[info.light];

        if (!lightInfo) {
            return;
        }

        let light;
        const color = new Color(1, 1, 1, 1);
        if (lightInfo.color) {
            color.r = lightInfo.color[0];
            color.g = lightInfo.color[1];
            color.b = lightInfo.color[2];
        }

        const amount = lightInfo.intensity !== undefined ? lightInfo.intensity : 1;
        const name = lightInfo.name || '';

        // spot light
        const spotInfo = lightInfo.spot || {};
        const cutoff = spotInfo.innerConeAngle !== undefined ? math.radToDeg(spotInfo.innerConeAngle) : 0;
        const outerCutoff = spotInfo.outerConeAngle !== undefined ? math.radToDeg(spotInfo.outerConeAngle) : 45;
        const range = lightInfo.range || 0;
        switch (lightInfo.type) {
            case 'directional':
                light = new DirectionalLight({
                    color,
                    amount,
                    name,
                    range
                });
                light.direction.set(0, 0, -1);
                break;
            case 'point':
                light = new PointLight({
                    color,
                    amount,
                    name,
                    range
                });
                break;
            case 'spot':
                light = new SpotLight({
                    color,
                    amount,
                    name,
                    range,
                    cutoff,
                    outerCutoff
                });
                light.direction.set(0, 0, -1);
                break;
            default:
                return;
        }

        if (light) {
            node.addChild(light);
            parser.lights.push(light);
        }
    }
};
