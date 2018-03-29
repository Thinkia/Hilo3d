import Class from '../core/Class';
import math from '../math/math';
import semantic from './semantic';
import log from '../utils/log';

import {
    LEQUAL,
    BACK,
    FRONT,
    FRONT_AND_BACK,
    ZERO,
    ONE,
    FUNC_ADD,
    ONE_MINUS_SRC_ALPHA
} from '../constants/index';

const blankInfo = {
    isBlankInfo: true,
    get() {
        return undefined;
    }
};

/**
 * 材质基类，一般不直接使用
 * @class
 */
const Material = Class.create( /** @lends Material.prototype */ {
    /**
     * @default true
     * @type {boolean}
     */
    isMaterial: true,
    /**
     * @default Material
     * @type {string}
     */
    className: 'Material',
    /**
     * 光照类型
     * @default NONE
     * @type {string}
     */
    lightType: 'NONE',

    /**
     * 是否开启网格模式
     * @default false
     * @type {boolean}
     */
    wireframe: false,

    /**
     * 是否开启深度测试
     * @default true
     * @type {boolean}
     */
    depthTest: true,
    /**
     * 是否开启depthMask
     * @default true
     * @type {boolean}
     */
    depthMask: true,
    /**
     * 深度测试Range
     * @default [0, 1]
     * @type {Array}
     */
    depthRange: [0, 1],
    /**
     * 深度测试方法
     * @default LESS
     * @type {GLenum}
     */
    depthFunc: LEQUAL,

    _cullFace: true,

    /**
     * 法线贴图
     * @default null
     * @type {Texture}
     */
    normalMap: null,

    /**
     * 视差贴图
     * @default null
     * @type {Texture}
     */
    parallaxMap: null,

    /**
     * 法线贴图scale
     * @default null
     * @type {Vector3}
     */
    normalMapScale: null,

    /**
     * 是否忽略透明度
     * @type {Boolean}
     * @default false
     */
    ignoreTranparent: false,

    /**
     * 是否开启 CullFace
     * @default true
     * @type {boolean}
     */
    cullFace: {
        get() {
            return this._cullFace;
        },
        set(value) {
            this._cullFace = value;
            if (value) {
                this.cullFaceType = this._cullFaceType;
            } else {
                this._side = FRONT_AND_BACK;
            }
        }
    },

    _cullFaceType: BACK,
    /**
     * CullFace 类型
     * @default BACK
     * @type {GLenum}
     */
    cullFaceType: {
        get() {
            return this._cullFaceType;
        },
        set(value) {
            this._cullFaceType = value;
            if (this._cullFace) {
                if (value === BACK) {
                    this._side = FRONT;
                } else if (value === FRONT) {
                    this._side = BACK;
                }
            }
        }
    },

    _side: FRONT,
    /**
     * 显示面，可选值 FRONT, BACK, FRONT_AND_BACK
     * @type {GLenum}
     * @default FRONT
     */
    side: {
        get() {
            return this._side;
        },
        set(value) {
            if (this._side !== value) {
                this._side = value;
                if (value === FRONT_AND_BACK) {
                    this._cullFace = false;
                } else {
                    this._cullFace = true;
                    if (value === FRONT) {
                        this._cullFaceType = BACK;
                    } else if (value === BACK) {
                        this._cullFaceType = FRONT;
                    }
                }
            }
        }
    },

    /**
     * 是否开启颜色混合
     * @default false
     * @type {boolean}
     */
    blend: false,
    /**
     * 颜色混合方式
     * @default FUNC_ADD
     * @type {GLenum}
     */
    blendEquation: FUNC_ADD,
    /**
     * 透明度混合方式
     * @default FUNC_ADD
     * @type {GLenum}
     */
    blendEquationAlpha: FUNC_ADD,
    /**
     * 颜色混合来源比例
     * @default ONE
     * @type {GLenum}
     */
    blendSrc: ONE,
    /**
     * 颜色混合目标比例
     * @default ZERO
     * @type {GLenum}
     */
    blendDst: ZERO,
    /**
     * 透明度混合来源比例
     * @default ONE
     * @type {GLenum}
     */
    blendSrcAlpha: ONE,
    /**
     * 透明度混合目标比例
     * @default ONE
     * @type {GLenum}
     */
    blendDstAlpha: ZERO,

    /**
     * 当前是否需要强制更新
     * @default false
     * @type {boolean}
     */
    isDirty: false,

    /**
     * 透明度 0~1
     * @default 1
     * @type {number}
     */
    transparency: 1,

    _transparent: false,
    /**
     * 是否需要透明
     * @default false
     * @type {boolean}
     */
    transparent: {
        get() {
            return this._transparent;
        },
        set(value) {
            if (this._transparent !== value) {
                this._transparent = value;
                if (!value) {
                    this.blend = false;
                    this.depthMask = true;
                } else {
                    this.blend = true;
                    this.blendSrc = ONE;
                    this.blendDst = ONE_MINUS_SRC_ALPHA;
                    this.blendSrcAlpha = ONE;
                    this.blendDstAlpha = ONE_MINUS_SRC_ALPHA;
                    this.depthMask = false;
                }
            }
        }
    },
    /**
     * 透明度剪裁，如果渲染的颜色透明度大于等于这个值的话渲染为完全不透明，否则渲染为完全透明
     * @default 0
     * @type {number}
     */
    alphaCutoff: 0,

    /**
     * 是否使用HDR
     * @default false
     * @type {Boolean}
     */
    useHDR: false,

    /**
     * 曝光度，仅在 useHDR 为 true 时生效
     * @default 1
     * @type {Number}
     */
    exposure: 1,

    /**
     * @constructs
     * @param {object} params 初始化参数，所有params都会复制到实例上
     */
    constructor(params) {
        /**
         * @type {string}
         */
        this.id = math.generateUUID(this.className);
        /**
         * 可以通过指定，semantic来指定值的获取方式，或者自定义get方法
         * @default {}
         * @type {object}
         */
        this.uniforms = {
            u_normalMatrix: 'MODELVIEWINVERSETRANSPOSE',
            u_modelViewMatrix: 'MODELVIEW',
            u_modelViewProjectionMatrix: 'MODELVIEWPROJECTION',

            // light
            u_ambientLightsColor: 'AMBIENTLIGHTSCOLOR',
            u_directionalLightsColor: 'DIRECTIONALLIGHTSCOLOR',
            u_directionalLightsInfo: 'DIRECTIONALLIGHTSINFO',
            u_directionalLightsShadowMap: 'DIRECTIONALLIGHTSSHADOWMAP',
            u_directionalLightsShadowMapSize: 'DIRECTIONALLIGHTSSHADOWMAPSIZE',
            u_directionalLightsShadowBias: 'DIRECTIONALLIGHTSSHADOWBIAS',
            u_directionalLightSpaceMatrix: 'DIRECTIONALLIGHTSPACEMATRIX',
            u_pointLightsPos: 'POINTLIGHTSPOS',
            u_pointLightsColor: 'POINTLIGHTSCOLOR',
            u_pointLightsInfo: 'POINTLIGHTSINFO',
            u_spotLightsPos: 'SPOTLIGHTSPOS',
            u_spotLightsDir: 'SPOTLIGHTSDIR',
            u_spotLightsColor: 'SPOTLIGHTSCOLOR',
            u_spotLightsCutoffs: 'SPOTLIGHTSCUTOFFS',
            u_spotLightsInfo: 'SPOTLIGHTSINFO',
            u_spotLightsShadowMap: 'SPOTLIGHTSSHADOWMAP',
            u_spotLightsShadowMapSize: 'SPOTLIGHTSSHADOWMAPSIZE',
            u_spotLightsShadowBias: 'SPOTLIGHTSSHADOWBIAS',
            u_spotLightSpaceMatrix: 'SPOTLIGHTSPACEMATRIX',
            u_jointMat: 'JOINTMATRIX',
            u_jointMatTexture: 'JOINTMATRIXTEXTURE',
            u_jointMatTextureSize: 'JOINTMATRIXTEXTURESIZE',
            u_fogColor: 'FOGCOLOR',
            u_fogInfo: 'FOGINFO',
            u_alphaCutoff: 'ALPHACUTOFF',
            u_exposure: 'EXPOSURE',

            // Quantization
            u_positionDecodeMat: 'POSITIONDECODEMAT',
            u_normalDecodeMat: 'NORMALDECODEMAT',
            u_uvDecodeMat: 'UVDECODEMAT',
            u_uv1DecodeMat: 'UV1DECODEMAT',

            // morph
            u_morphWeights: 'MORPHWEIGHTS',
            u_normalMapScale: 'NORMALMAPSCALE',
            u_emission: 'EMISSION',
            u_transparency: 'TRANSPARENCY'
        };

        this.addTextureUniforms({
            u_normalMap: 'NORMALMAP',
            u_parallaxMap: 'PARALLAXMAP',
            u_emission: 'EMISSION',
            u_transparency: 'TRANSPARENCY'
        });

        /**
         * 可以通过指定，semantic来指定值的获取方式，或者自定义get方法
         * @default {}
         * @type {object}
         */
        this.attributes = {
            a_position: 'POSITION',
            a_normal: 'NORMAL',
            a_tangent: 'TANGENT',
            a_texcoord0: 'TEXCOORD_0',
            a_texcoord1: 'TEXCOORD_1',
            a_color: 'COLOR_0',
            a_skinIndices: 'SKININDICES',
            a_skinWeights: 'SKINWEIGHTS'
        };

        ['POSITION', 'NORMAL', 'TANGENT'].forEach(name => {
            const camelName = name.slice(0, 1) + name.slice(1).toLowerCase();
            for (let i = 0; i < 8; i++) {
                this.attributes['a_morph' + camelName + i] = 'MORPH' + name + i;
            }
        });

        Object.assign(this, params);
    },
    addTextureUniforms(textureUniforms) {
        const uniforms = {};
        for (const uniformName in textureUniforms) {
            const semanticName = textureUniforms[uniformName];
            uniforms[`${uniformName}.texture`] = semanticName;
            uniforms[`${uniformName}.uv`] = `${semanticName}UV`;
        }
        Object.assign(this.uniforms, uniforms);
    },
    getRenderOption(option = {}) {
        const lightType = this.lightType;
        option[`LIGHT_TYPE_${lightType}`] = 1;
        option.SIDE = this.side;

        const textureOption = this._textureOption.reset(option);

        if (option.HAS_LIGHT) {
            option.HAS_NORMAL = 1;
            textureOption.add(this.normalMap, 'NORMAL_MAP', () => {
                if (this.normalMapScale) {
                    option.NORMAL_MAP_SCALE = 1;
                }
            });
        }

        textureOption.add(this.parallaxMap, 'PARALLAX_MAP');
        textureOption.add(this.emission, 'EMISSION_MAP');
        textureOption.add(this.transparency, 'TRANSPARENCY_MAP');

        if (this.ignoreTranparent) {
            option.IGNORE_TRANSPARENT = 1;
        }

        if (this.alphaCutoff > 0) {
            option.ALPHA_CUTOFF = 1;
        }

        if (this.useHDR) {
            option.USE_HDR = 1;
        }

        textureOption.update();
        return option;
    },
    _textureOption: {
        uvTypes: null,
        option: null,
        reset(option) {
            this.option = option;
            this.uvTypes = {};
            return this;
        },
        add(texture, optionName, callback) {
            if (texture && texture.isTexture) {
                const {
                    uvTypes,
                    option
                } = this;

                const uv = texture.uv || 0;
                uvTypes[uv] = 1;
                option[optionName] = uv;

                if (texture.isCubeTexture) {
                    option[`${optionName}_CUBE`] = 1;
                }

                if (callback) {
                    callback(texture);
                }
            }

            return this;
        },
        update() {
            const supportUV = [0, 1];
            const {
                uvTypes,
                option
            } = this;

            for (const type in uvTypes) {
                if (supportUV.indexOf(Number(type)) !== -1) {
                    option[`HAS_TEXCOORD${type}`] = 1;
                } else {
                    console.warn(`uv_${type} not support!`);
                    option.HAS_TEXCOORD0 = 1;
                }
            }

            return this;
        }
    },

    getInstancedUniforms() {
        let instancedUniforms = this._instancedUniforms;
        if (!this._instancedUniforms) {
            const uniforms = this.uniforms;
            instancedUniforms = this._instancedUniforms = [];
            for (let name in uniforms) {
                const info = this.getUniformInfo(name);
                if (info.isDependMesh && !info.notSupportInstanced) {
                    instancedUniforms.push({
                        name,
                        info
                    });
                }
            }
        }

        return instancedUniforms;
    },
    getUniformData(name, mesh, programInfo) {
        return this.getUniformInfo(name).get(mesh, this, programInfo);
    },
    getAttributeData(name, mesh, programInfo) {
        return this.getAttributeInfo(name).get(mesh, this, programInfo);
    },
    getUniformInfo(name) {
        return this.getInfo('uniforms', name);
    },
    getAttributeInfo(name) {
        return this.getInfo('attributes', name);
    },
    getInfo(dataType, name) {
        const dataDict = this[dataType];
        let info = dataDict[name];
        if (typeof info === 'string') {
            info = semantic[info];
        }

        if (!info || !info.get) {
            log.warnOnce('material.getInfo-' + name, 'Material.getInfo: no this semantic:' + name);
            info = blankInfo;
        }

        return info;
    },
    /**
     * clone 当前Material
     * @return {Material} 返回clone的Material
     */
    clone() {
        const newMaterial = new this.constructor();
        for (let key in this) {
            if (key !== 'id') {
                newMaterial[key] = this[key];
            }
        }
        return newMaterial;
    }
});

export default Material;