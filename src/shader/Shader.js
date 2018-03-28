import Class from '../core/Class';
import math from '../math/math';
import Cache from '../utils/Cache';
import capabilities from '../renderer/capabilities';
import basicFragCode from './basic.frag';
import basicVertCode from './basic.vert';
import geometryFragCode from './geometry.frag';
import pbrFragCode from './pbr.frag';

const cache = new Cache();

/**
 * Shader类
 * @class
 */
const Shader = Class.create( /** @lends Shader.prototype */ {
    /**
     * @default true
     * @type {boolean}
     */
    isShader: true,
    /**
     * @default Shader
     * @type {string}
     */
    className: 'Shader',
    /**
     * vs 顶点代码
     * @default ''·
     * @type {String}
     */
    vs: '',
    /**
     * vs 片段代码
     * @default ''
     * @type {String}
     */
    fs: '',

    Statics: /** @lends Shader */ {
        /**
         * 内部的所有shader块字符串，可以用来拼接glsl代码
         * @type {Object}
         */
        shaders: {
            'diffuse.frag': require('./chunk/diffuse.frag'),
            'diffuse_main.frag': require('./chunk/diffuse_main.frag'),
            'fog.frag': require('./chunk/fog.frag'),
            'fog_main.frag': require('./chunk/fog_main.frag'),
            'joint.vert': require('./chunk/joint.vert'),
            'joint_main.vert': require('./chunk/joint_main.vert'),
            'light.frag': require('./chunk/light.frag'),
            'lightFog.vert': require('./chunk/lightFog.vert'),
            'lightFog_main.vert': require('./chunk/lightFog_main.vert'),
            'phong.frag': require('./chunk/phong.frag'),
            'phong_main.frag': require('./chunk/phong_main.frag'),
            'normal.vert': require('./chunk/normal.vert'),
            'normal_main.vert': require('./chunk/normal_main.vert'),
            'precision.vert': require('./chunk/precision.vert'),
            'precision.frag': require('./chunk/precision.frag'),
            'transparency.frag': require('./chunk/transparency.frag'),
            'transparency_main.frag': require('./chunk/transparency_main.frag'),
            'unQuantize.vert': require('./chunk/unQuantize.vert'),
            'unQuantize_main.vert': require('./chunk/unQuantize_main.vert'),
            'uv.vert': require('./chunk/uv.vert'),
            'uv_main.vert': require('./chunk/uv_main.vert'),

            'getDiffuse.glsl': require('./method/getDiffuse.glsl'),
            'getPointAttenuation.glsl': require('./method/getPointAttenuation.glsl'),
            'getShadow.glsl': require('./method/getShadow.glsl'),
            'getSpecular.glsl': require('./method/getSpecular.glsl'),

            'screen.vert': require('./screen.vert'),
            'screen.frag': require('./screen.frag'),
        },

        /**
         * 初始化
         * @param  {WebGLRenderer} renderer
         */
        init(renderer) {
            this.renderer = renderer;
            this.commonHeader = this._getCommonHeader(this.renderer);
        },

        /**
         * 缓存
         * @readOnly
         * @type {Cache}
         */
        cache: {
            get() {
                return cache;
            }
        },

        /**
         * 重置
         */
        reset(gl) { // eslint-disable-line no-unused-vars
            cache.removeAll();
        },
        /**
         * 获取header缓存的key
         * @param {Mesh} mesh mesh
         * @param {Material} material 材质
         * @param {LightManager} lightManager lightManager
         * @param {Fog} fog fog
         * @return {string}
         */
        getHeaderKey(mesh, material, lightManager, fog) {
            let headerKey = 'header_' + material.id + '_' + lightManager.lightInfo.uid;
            if (mesh.isSkinedMesh) {
                headerKey += '_joint' + mesh.jointNames.length;
            }
            if (fog) {
                headerKey += '_fog';
            }
            if (mesh.geometry.isMorphGeometry) {
                headerKey += '_' + mesh.geometry.id;
            }
            return headerKey;
        },
        /**
         * 获取header
         * @param {Mesh} mesh
         * @param {Material} material
         * @param {LightManager} lightManager
         * @param {Fog} fog
         * @return {String}
         */
        getHeader(mesh, material, lightManager, fog) {
            const headerKey = this.getHeaderKey(mesh, material, lightManager, fog);
            let header = cache.get(headerKey);
            if (!header || material.isDirty) {
                const headers = {};
                const lightType = material.lightType;
                if (lightType && lightType !== 'NONE') {
                    lightManager.getRenderOption(headers);
                }
                material.getRenderOption(headers);
                mesh.getRenderOption(headers);

                if (fog) {
                    headers.HAS_FOG = 1;
                }

                if (headers.HAS_NORMAL && headers.NORMAL_MAP) {
                    headers.HAS_TANGENT = 1;
                }

                header = Object.keys(headers).map(name => {
                    return `#define HILO_${name} ${headers[name]}`;
                }).join('\n') + '\n';

                cache.add(headerKey, header);
            }
            return header;
        },
        _getCommonHeader(renderer) {
            const vertexPrecision = capabilities.getMaxPrecision(capabilities.MAX_VERTEX_PRECISION, renderer.vertexPrecision);
            const fragmentPrecision = capabilities.getMaxPrecision(capabilities.MAX_FRAGMENT_PRECISION, renderer.fragmentPrecision);
            const precision = capabilities.getMaxPrecision(vertexPrecision, fragmentPrecision);
            return `
#define HILO_MAX_PRECISION ${precision}
#define HILO_MAX_VERTEX_PRECISION ${vertexPrecision}
#define HILO_MAX_FRAGMENT_PRECISION ${fragmentPrecision}
`;
        },
        /**
         * 获取 shader
         * @param {Mesh} mesh
         * @param {Material} material      
         * @param {Boolean} isUseInstance 
         * @param {LightManager} lightManager  
         * @param {Fog} fog
         * @return {Shader}
         */
        getShader(mesh, material, isUseInstance, lightManager, fog) {
            const header = this.getHeader(mesh, material, lightManager, fog);

            if (material.isBasicMaterial || material.isPBRMaterial) {
                return this.getBasicShader(material, isUseInstance, header);
            }
            if (material.isShaderMaterial) {
                return this.getCustomShader(material.vs, material.fs, header, material.id);
            }
            return null;
        },
        /**
         * 获取基础 shader
         * @param  {Material}  material
         * @param  {Boolean} isUseInstance
         * @param  {LightManager}  lightManager
         * @param  {Fog}  fog
         * @return {Shader}
         */
        getBasicShader(material, isUseInstance, header) {
            let instancedUniforms = [];
            if (isUseInstance) {
                instancedUniforms = material.getInstancedUniforms().map(x => x.name);
            }
            instancedUniforms = instancedUniforms.join('|');
            const key = material.className + ':' + instancedUniforms + ':' + header;

            let shader = cache.get(key);
            if (!shader) {
                let fs = '';
                let vs = basicVertCode;

                if (material.isBasicMaterial) {
                    if (material.isGeometryMaterial) {
                        fs += geometryFragCode;
                    } else {
                        fs += basicFragCode;
                    }
                } else if (material.isPBRMaterial) {
                    fs += pbrFragCode;
                }

                if (instancedUniforms) {
                    const instancedUniformsReg = new RegExp(`^\\s*uniform\\s+(\\w+)\\s+(${instancedUniforms});`, 'gm');
                    vs = vs.replace(instancedUniformsReg, 'attribute $1 $2;');
                }

                shader = this.getCustomShader(vs, fs, header, key);
            }
            return shader;
        },
        /**
         * 获取自定义shader
         * @param  {String} vs 顶点代码       
         * @param  {String} fs 片段代码     
         * @param  {String} [cacheKey] 如果有，会以此值缓存 shader
         * @return {Shader}
         */
        getCustomShader(vs, fs, header, cacheKey) {
            let shader = cache.get(cacheKey);
            const commonHeader = this.commonHeader;
            if (!shader) {
                shader = new Shader({
                    vs: commonHeader + header + vs,
                    fs: commonHeader + header + fs
                });

                if (cacheKey) {
                    cache.add(cacheKey, shader);
                }
            }

            return shader;
        }
    },

    /**
     * @constructs
     * @param  {Object} params 初始化参数，所有params都会复制到实例上
     */
    constructor(params) {
        this.id = math.generateUUID(this.className);
        Object.assign(this, params);
    }
});

export default Shader;