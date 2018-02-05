/* eslint no-unused-vars: "off" */
const DataTexture = require('../texture/DataTexture');
const Vector3 = require('../math/Vector3');
const Matrix3 = require('../math/Matrix3');
const Matrix4 = require('../math/Matrix4');

const tempVector3 = new Vector3();
const tempMatrix3 = new Matrix3();
const tempMatrix4 = new Matrix4();
const tempFloat32Array = new Float32Array([0.5, 0.5, 0.5, 1]);
const blankInfo = {
    get() {
        return undefined;
    }
};

let camera;
let gl;
let lightManager;
let state;
let fog;

/**
 * 语义
 * @namespace semantic
 * @type {Object}
 */
const semantic = {
    /**
     * @type {State}
     */
    state: null,

    /**
     * @type {Camera}
     */
    camera: null,

    /**
     * @type {LightManager}
     */
    lightManager: null,

    /**
     * @type {Fog}
     */
    fog: null,

    /**
     * @type {WebGLRenderingContext}
     */
    gl: null,

    /**
     * 初始化
     * @param  {State} _state        
     * @param  {Camera} _camera       
     * @param  {LightManager} _lightManager 
     * @param  {Fog} _fog          
     */
    init(_state, _camera, _lightManager, _fog) {
        state = this.state = _state;
        camera = this.camera = _camera;
        lightManager = this.lightManager = _lightManager;
        fog = this.fog = _fog;
        gl = this.gl = state.gl;
    },

    /**
     * 设置相机
     * @param {Camera} _camera
     */
    setCamera(_camera) {
        camera = this.camera = _camera;
    },

    handlerColorOrTexture(value, textureIndex) {
        if (value && value.isTexture) {
            let texture = value.getGLTexture(state);
            state.activeTexture(gl.TEXTURE0 + textureIndex);
            state.bindTexture(value.target, texture);
            return textureIndex;
        }
        if (value && value.isColor) {
            value.toArray(tempFloat32Array);
        } else {
            tempFloat32Array[0] = tempFloat32Array[1] = tempFloat32Array[2] = 0.5;
        }
        return tempFloat32Array;
    },

    // attributes
    
    /**
     * @type {semanticObject}
     */
    POSITION: {
        get(mesh, material, programInfo) {
            return mesh.geometry.vertices;
        }
    },

    /**
     * @type {semanticObject}
     */
    NORMAL: {
        get(mesh, material, programInfo) {
            return mesh.geometry.normals;
        }
    },

    /**
     * @type {semanticObject}
     */
    TANGENT: {
        get(mesh, material, programInfo) {
            if (!mesh.material.normalMap || !mesh.material.normalMap.isTexture) {
                return undefined;
            }
            return mesh.geometry.tangents;
        }
    },

    /**
     * @type {semanticObject}
     */
    TEXCOORD_0: {
        get(mesh, material, programInfo) {
            if (!mesh.geometry.uvs) {
                return undefined;
            }
            return mesh.geometry.uvs;
        }
    },

    /**
     * @type {semanticObject}
     */
    COLOR_0: {
        get(mesh, material, programInfo) {
            if (!mesh.geometry.colors) {
                return undefined;
            }
            return mesh.geometry.colors;
        }
    },

    /**
     * @type {semanticObject}
     */
    SKININDICES: {
        get(mesh, material, programInfo) {
            return mesh.geometry.skinIndices;
        }
    },

    /**
     * @type {semanticObject}
     */
    SKINWEIGHTS: {
        get(mesh, material, programInfo) {
            return mesh.geometry.skinWeights;
        }
    },

    // uniforms
    
    /**
     * @type {semanticObject}
     */
    LOCAL: {
        get(mesh, material, programInfo) {
            return mesh.matrix.elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    MODEL: {
        get(mesh, material, programInfo) {
            return mesh.worldMatrix.elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    VIEW: {
        get(mesh, material, programInfo) {
            return camera.viewMatrix.elements;
        }
    },

    /**
     * @type {semanticObject}
     */
    PROJECTION: {
        get(mesh, material, programInfo) {
            return camera.projectionMatrix.elements;
        }
    },

     /**
     * @type {semanticObject}
     */
    VIEWPROJECTION: {
        get(mesh, material, programInfo) {
            return camera.viewProjectionMatrix.elements;
        }
    },

    /**
     * @type {semanticObject}
     */
    MODELVIEW: {
        get(mesh, material, programInfo) {
            return camera.getModelViewMatrix(mesh, tempMatrix4).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    MODELVIEWPROJECTION: {
        get(mesh, material, programInfo) {
            return camera.getModelProjectionMatrix(mesh, tempMatrix4).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    MODELINVERSE: {
        get(mesh, material, programInfo) {
            return tempMatrix4.invert(mesh.worldMatrix).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    VIEWINVERSE: {
        get(mesh, material, programInfo) {
            return camera.worldMatrix.elements;
        }
    },

    /**
     * @type {semanticObject}
     */
    PROJECTIONINVERSE: {
        get(mesh, material, programInfo) {
            return tempMatrix4.invert(camera.projectionMatrix).elements;
        }
    },

    /**
     * @type {semanticObject}
     */
    MODELVIEWINVERSE: {
        get(mesh, material, programInfo) {
            return tempMatrix4.invert(camera.getModelViewMatrix(mesh, tempMatrix4)).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    MODELVIEWPROJECTIONINVERSE: {
        get(mesh, material, programInfo) {
            return tempMatrix4.invert(camera.getModelProjectionMatrix(mesh, tempMatrix4)).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    MODELINVERSETRANSPOSE: {
        get(mesh, material, programInfo) {
            return tempMatrix3.normalFromMat4(mesh.worldMatrix).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    MODELVIEWINVERSETRANSPOSE: {
        get(mesh, material, programInfo) {
            return tempMatrix3.normalFromMat4(camera.getModelViewMatrix(mesh, tempMatrix4)).elements;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    VIEWPORT: {
        get(mesh, material, programInfo) {
            console.warn('no this semantic:', name);
        }
    },

    /**
     * @type {semanticObject}
     */
    JOINTMATRIX: {
        get(mesh, material, programInfo) {
            if (mesh.isSkinedMesh) {
                return mesh.getJointMat();
            }
            console.warn('Current mesh is not SkinedMesh!', mesh.id);
            return undefined;
        },
        isDependMesh: true,
        notSupportInstanced: true
    },

    /**
     * @type {semanticObject}
     */
    JOINTMATRIXTEXTURE: {
        get(mesh, material, programInfo) {
            if (mesh.isSkinedMesh) {
                mesh.updateJointMatTexture();
                return semantic.handlerColorOrTexture(mesh.jointMatTexture, programInfo.textureIndex);
            }
            console.warn('Current mesh is not SkinedMesh!', mesh.id);
            return undefined;
        },
        isDependMesh: true,
        notSupportInstanced: true
    },

    /**
     * @type {semanticObject}
     */
    JOINTMATRIXTEXTURESIZE: {
        get(mesh, material, programInfo) {
            if (mesh.isSkinedMesh) {
                mesh.initJointMatTexture();
                return [mesh.jointMatTexture.width, mesh.jointMatTexture.height];
            }
            console.warn('Current mesh is not SkinedMesh!', mesh.id);
            return undefined;
        },
        isDependMesh: true,
        notSupportInstanced: true
    },

    /**
     * @type {semanticObject}
     */
    DIFFUSE: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.diffuse, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    SPECULAR: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.specular, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    EMISSION: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.emission, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    AMBIENT: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.ambient, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    NORMALMAP: {
        get(mesh, material, programInfo) {
            if (!material.normalMap || !material.normalMap.isTexture) {
                return undefined;
            }
            return semantic.handlerColorOrTexture(material.normalMap, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    NORMALMAPSCALE: {
        get(mesh, material, programInfo) {
            if (!material.normalMapScale) {
                return undefined;
            }
            return material.normalMapScale.elements;
        }
    },

     /**
     * @type {semanticObject}
     */
    PARALLAXMAP: {
        get(mesh, material, programInfo) {
            if (!material.parallaxMap || !material.parallaxMap.isTexture) {
                return undefined;
            }
            return semantic.handlerColorOrTexture(material.parallaxMap, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    SHININESS: {
        get(mesh, material, programInfo) {
            return material.shininess;
        }
    },

    /**
     * @type {semanticObject}
     */
    TRANSPARENCY: {
        get(mesh, material, programInfo) {
            if ('transparency' in material) {
                if (material.transparency.isTexture) {
                    return semantic.handlerColorOrTexture(material.transparency, programInfo.textureIndex);
                }
                return material.transparency;
            }
            return 1;
        }
    },

    /**
     * @type {semanticObject}
     */
    SKYBOXMAP: {
        get(mesh, material, programInfo) {
            if (material.skyboxMap && material.skyboxMap.isTexture) {
                return semantic.handlerColorOrTexture(material.skyboxMap, programInfo.textureIndex);
            }
            return undefined;
        }
    },

    /**
     * @type {semanticObject}
     */
    SKYBOXMATRIX: {
        get(mesh, material, programInfo) {
            if (material.skyboxMap && material.skyboxMatrix) {
                return material.skyboxMatrix.elements;
            }
            tempMatrix4.identity();
            return tempMatrix4.elements;
        }
    },

    /**
     * @type {semanticObject}
     */
    REFLECTIVITY: {
        get(mesh, material, programInfo) {
            return material.reflectivity;
        }
    },

    /**
     * @type {semanticObject}
     */
    REFRACTRATIO: {
        get(mesh, material, programInfo) {
            return material.refractRatio;
        }
    },

    /**
     * @type {semanticObject}
     */
    REFRACTIVITY: {
        get(mesh, material, programInfo) {
            return material.refractivity;
        }
    },

    // light
    
    /**
     * @type {semanticObject}
     */
    AMBIENTLIGHTSCOLOR: {
        get(mesh, material, programInfo) {
            return lightManager.ambientInfo;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIRECTIONALLIGHTSCOLOR: {
        get(mesh, material, programInfo) {
            return lightManager.directionalInfo.colors;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIRECTIONALLIGHTSINFO: {
        get(mesh, material, programInfo) {
            return lightManager.directionalInfo.infos;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIRECTIONALLIGHTSSHADOWMAP: {
        get(mesh, material, programInfo) {
            const result = lightManager.directionalInfo.shadowMap.map((texture, i) => {
                state.activeTexture(gl.TEXTURE0 + programInfo.textureIndex + i);
                state.bindTexture(gl.TEXTURE_2D, texture);
                return programInfo.textureIndex + i;
            });
            return result;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIRECTIONALLIGHTSSHADOWMAPSIZE: {
        get(mesh, material, programInfo) {
            return lightManager.directionalInfo.shadowMapSize;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIRECTIONALLIGHTSSHADOWBIAS: {
        get(mesh, material, programInfo) {
            return lightManager.directionalInfo.shadowBias;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIRECTIONALLIGHTSPACEMATRIX: {
        get(mesh, material, programInfo) {
            return lightManager.directionalInfo.lightSpaceMatrix;
        }
    },

    /**
     * @type {semanticObject}
     */
    POINTLIGHTSPOS: {
        get(mesh, material, programInfo) {
            return lightManager.pointInfo.poses;
        }
    },

    /**
     * @type {semanticObject}
     */
    POINTLIGHTSCOLOR: {
        get(mesh, material, programInfo) {
            return lightManager.pointInfo.colors;
        }
    },

    /**
     * @type {semanticObject}
     */
    POINTLIGHTSINFO: {
        get(mesh, material, programInfo) {
            return lightManager.pointInfo.infos;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSPOS: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.poses;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSDIR: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.dirs;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSCOLOR: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.colors;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSCUTOFFS: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.cutoffs;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSINFO: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.infos;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSSHADOWMAP: {
        get(mesh, material, programInfo) {
            const result = lightManager.spotInfo.shadowMap.map((texture, i) => {
                state.activeTexture(gl.TEXTURE0 + programInfo.textureIndex + i);
                state.bindTexture(gl.TEXTURE_2D, texture);
                return programInfo.textureIndex + i;
            });
            return result;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSSHADOWMAPSIZE: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.shadowMapSize;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSSHADOWBIAS: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.shadowBias;
        }
    },

    /**
     * @type {semanticObject}
     */
    SPOTLIGHTSPACEMATRIX: {
        get(mesh, material, programInfo) {
            return lightManager.spotInfo.lightSpaceMatrix;
        }
    },

    // fog
    
    /**
     * @type {semanticObject}
     */
    FOGCOLOR: {
        get(mesh, material, programInfo) {
            if (fog) {
                return fog.color.elements;
            }
            return undefined;
        }
    },

    /**
     * @type {semanticObject}
     */
    FOGINFO: {
        get(mesh, material, programInfo) {
            if (fog) {
                return fog.getInfo();
            }
            return undefined;
        }
    },

    // unQuantize
    
    /**
     * @type {semanticObject}
     */
    POSITIONDECODEMAT: {
        get(mesh, material, programInfo) {
            return mesh.geometry.positionDecodeMat;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    NORMALDECODEMAT: {
        get(mesh, material, programInfo) {
            return mesh.geometry.normalDecodeMat;
        },
        isDependMesh: true
    },

    /**
     * @type {semanticObject}
     */
    UVDECODEMAT: {
        get(mesh, material, programInfo) {
            return mesh.geometry.uvDecodeMat;
        },
        isDependMesh: true
    },

    // pbr
    
    /**
     * @type {semanticObject}
     */
    BASECOLOR: {
        get(mesh, material, programInfo) {
            return material.baseColor.elements;
        }
    },

    /**
     * @type {semanticObject}
     */
    BASECOLORMAP: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.baseColorMap, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    METALLIC: {
        get(mesh, material, programInfo) {
            return material.metallic;
        }
    },

    /**
     * @type {semanticObject}
     */
    METALLICMAP: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.metallicMap, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    ROUGHNESS: {
        get(mesh, material, programInfo) {
            return material.roughness;
        }
    },

    /**
     * @type {semanticObject}
     */
    ROUGHNESSMAP: {
        get(mesh, material, programInfo) {
            return semantic.handlerColorOrTexture(material.roughnessMap, programInfo.textureIndex);
        }
    },

    /**
     * @type {semanticObject}
     */
    METALLICROUGHNESS: {
        get(mesh, material, programInfo) {
            if (material.metallicRoughness && material.metallicRoughness.isTexture) {
                return semantic.handlerColorOrTexture(material.metallicRoughness, programInfo.textureIndex);
            }
            return undefined;
        }
    },

    /**
     * @type {semanticObject}
     */
    AO: {
        get(mesh, material, programInfo) {
            const ao = material.ao;
            if (ao.isTexture) {
                return semantic.handlerColorOrTexture(ao, programInfo.textureIndex);
            }
            return ao;
        }
    },

    /**
     * @type {semanticObject}
     */
    DIFFUSEENVMAP: {
        get(mesh, material, programInfo) {
            const diffuseEnvMap = material.diffuseEnvMap;
            if (diffuseEnvMap && diffuseEnvMap.isCubeTexture) {
                return semantic.handlerColorOrTexture(diffuseEnvMap, programInfo.textureIndex);
            }
            return undefined;
        }
    },

    /**
     * @type {semanticObject}
     */
    BRDFLUT: {
        get(mesh, material, programInfo) {
            const brdfLUT = material.brdfLUT;
            if (brdfLUT && brdfLUT.isTexture) {
                return semantic.handlerColorOrTexture(brdfLUT, programInfo.textureIndex);
            }
            return undefined;
        }
    },
    
    /**
     * @type {semanticObject}
     */
    SPECULARENVMAP: {
        get(mesh, material, programInfo) {
            const specularEnvMap = material.specularEnvMap;
            if (specularEnvMap && specularEnvMap.isCubeTexture) {
                return semantic.handlerColorOrTexture(specularEnvMap, programInfo.textureIndex);
            }
            return undefined;
        }
    },
    GLOSSINESS: {
        get(mesh, material, programInfo) {
            return material.glossiness;
        }
    },
    SPECULARGLOSSINESSMAP: {
        get(mesh, material, programInfo) {
            const map = material.specularGlossinessMap;
            if (map && map.isTexture) {
                return semantic.handlerColorOrTexture(map, programInfo.textureIndex);
            }
            return undefined;
        }
    },
    ALPHACUTOFF: {
        get(mesh, material, programInfo) {
            return material.alphaCutoff;
        }
    },
    EXPOSURE: {
        get(mesh, material, programInfo) {
            return material.exposure;
        }
    },

    // Morph Animation Uniforms
    MORPHWEIGHTS: {
        isDependMesh: true,
        notSupportInstanced: true,
        get(mesh, material, programInfo) {
            const geometry = mesh.geometry;
            if (!geometry.isMorphGeometry || !geometry.weights) {
                return undefined;
            }
            return geometry.weights;
        }
    }
};


// Morph Animation Attributes
[
    ['POSITION', 'vertices'],
    ['NORMAL', 'normals'],
    ['TANGENT', 'tangents']
].forEach(info => {
    for (let i = 0; i < 8; i++) {
        semantic['MORPH' + info[0] + i] = {
            get: (function(name, i) {
                return function(mesh, material, programInfo) {
                    const geometry = mesh.geometry;
                    if (!geometry.isMorphGeometry || !geometry.targets || !geometry.targets[name]) {
                        return undefined;
                    }
                    let idx = geometry._originalMorphIndices ? geometry._originalMorphIndices[i] : i;
                    const data = geometry.targets[name][idx];
                    const idxCacheKey = `_target_${name}_${i}`;
                    if (geometry[idxCacheKey] !== idx && data) {
                        data.isDirty = true;
                        geometry[idxCacheKey] = idx;
                    }
                    return data;
                };
            }(info[1], i))
        };
    }
});

/**
 * semantic 对象
 * @typedef {object} semanticObject
 * @property {Boolean} isDependMesh 是否依赖 mesh
 * @property {Boolean} notSupportInstanced 是否不支持 instanced
 * @property {Function} get 获取数据方法
 */

module.exports = semantic;