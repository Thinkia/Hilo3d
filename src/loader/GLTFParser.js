const Class = require('../core/Class');
const Node = require('../core/Node');
const BasicMaterial = require('../material/BasicMaterial');
const PBRMaterial = require('../material/PBRMaterial');
const Geometry = require('../geometry/Geometry');
const MorphGeometry = require('../geometry/MorphGeometry');
const GeometryData = require('../geometry/GeometryData');
const Mesh = require('../core/Mesh');
const SkinedMesh = require('../core/SkinedMesh');
const LazyTexture = require('../texture/LazyTexture');
const math = require('../math/math');
const Matrix4 = require('../math/Matrix4');
const Color = require('../math/Color');
const util = require('../utils/util');
const AnimationStates = require('../animation/AnimationStates');
const Animation = require('../animation/Animation');
const PerspectiveCamera = require('../camera/PerspectiveCamera');
const {
    BLEND,
    DEPTH_TEST,
    CULL_FACE,
    FRONT,
    BACK,
    FRONT_AND_BACK
} = require('../constants/webgl');

const ComponentTypeMap = {
    5120: [1, Int8Array],
    5121: [1, Uint8Array],
    5122: [2, Int16Array],
    5123: [2, Uint16Array],
    5125: [4, Uint32Array],
    5126: [4, Float32Array]
};

const ComponentNumberMap = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
};

const glTFAttrToGeometry = {
    POSITION: {
        name: 'vertices',
        decodeMatName: 'positionDecodeMat'
    },
    TEXCOORD_0: {
        name: 'uvs',
        decodeMatName: 'uvDecodeMat'
    },
    NORMAL: {
        name: 'normals',
        decodeMatName: 'normalDecodeMat'
    },
    JOINT: {
        name: 'skinIndices'
    },
    JOINTS_0: {
        name: 'skinIndices'
    },
    WEIGHT: {
        name: 'skinWeights'
    },
    WEIGHTS_0: {
        name: 'skinWeights'
    },
    TANGENT: {
        name: 'tangents'
    },
    COLOR_0: {
        name: 'colors'
    }
};

/**
 * @class
 */
const GLTFParser = Class.create( /** @lends GLTFParser.prototype */ {
    Statics: {
        MAGIC: 'glTF'
    },
    isProgressive: false,
    isUnQuantizeInShader: true,
    preHandlerImageURI: null,
    customMaterialCreator: null,
    src: '',
    /**
     * @constructs
     * @param  {ArrayBuffer|String} content 
     * @param  {Object} params 
     */
    constructor(content, params) {
        Object.assign(this, params);
        this.content = content;
    },
    parse() {
        if (this.content instanceof ArrayBuffer) {
            let buffer = this.content;
            let magic = util.convertUint8ArrayToString(new Uint8Array(buffer, 0, 4));
            if (magic === GLTFParser.MAGIC) {
                this.parseBinary(buffer);
            } else {
                let content = util.convertUint8ArrayToString(new Uint8Array(buffer), true);
                this.json = JSON.parse(content);
            }
        } else {
            this.json = JSON.parse(this.content);
        }
        this.glTFVersion = parseFloat(this.json.asset.version);
        if (this.glTFVersion >= 2) {
            this.isGLTF2 = true;
        }
        console.log('glTFVersion', this.glTFVersion);

        this.parseExtensionUsed();
    },
    parseExtensionUsed() {
        this.extensionsUsed = {};
        util.each(this.json.extensionsUsed, name => {
            this.extensionsUsed[name] = true;
        });

        if (!this.extensionsUsed.WEB3D_quantized_attributes) {
            // this glTF model havn't use quantize!
            this.isUnQuantizeInShader = false;
        }
    },
    parseBinary(buffer) {
        this.isBinary = true;
        const infoDataView = new DataView(buffer);
        const version = infoDataView.getUint32(4, true);
        const totalLength = infoDataView.getUint32(8, true);
        let content;
        console.log('parseBinary', version, totalLength);
        let start = 12;
        if (version < 2) {
            const contentLength = infoDataView.getUint32(start, true);
            content = new Uint8Array(buffer, 20, contentLength);
            content = util.convertUint8ArrayToString(content, true);
            this.json = JSON.parse(content);
            this.binaryBody = buffer.slice(20 + contentLength);
        } else if (version === 2) {
            while (start < totalLength) {
                let chunkLength = infoDataView.getUint32(start, true);
                let chunkType = infoDataView.getUint32(start + 4, true);
                if (chunkType === 0x4E4F534A) {
                    // JSON...
                    content = new Uint8Array(buffer, start + 8, chunkLength);
                    content = util.convertUint8ArrayToString(content, true);
                    this.json = JSON.parse(content);
                } else if (chunkType === 0x004E4942) {
                    // binary
                    this.binaryBody = buffer.slice(start + 8, start + 8 + chunkLength);
                }
                start += 8 + chunkLength;
            }
        } else {
            throw new Error(`Dont support glTF version ${version}`);
        }
    },
    loadResources(loader) {
        if (this.isBinary) {
            return this.loadBuffers(loader).then(() => {
                return this.loadTextures(loader);
            });
        }
        return Promise.all([
            this.loadBuffers(loader),
            this.loadTextures(loader)
        ]);
    },
    loadBuffers(loader) {
        this.buffers = {};

        if (this.isBinary) {
            if (this.isGLTF2) {
                this.buffers[0] = this.binaryBody;
            } else {
                this.buffers.binary_glTF = this.binaryBody;
            }
            this.parseBufferViews();
            return Promise.resolve();
        }

        return Promise.all(Object.keys(this.json.buffers).map(key => {
            let uri = util.getRelativePath(this.src, this.json.buffers[key].uri);
            return loader.loadRes(uri, 'buffer')
                .then(buffer => {
                    this.buffers[key] = buffer;
                });
        })).then(() => {
            this.parseBufferViews();
        });
    },
    getImageUri(imageName) {
        const imgData = this.json.images[imageName];
        let uri = imgData.uri;
        if (imgData.extensions && imgData.extensions.KHR_binary_glTF) {
            const binaryInfo = imgData.extensions.KHR_binary_glTF;
            const bufferView = this.bufferViews[binaryInfo.bufferView];
            const data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
            return util.getBlobUrl(binaryInfo.mimeType, data);
        } else if (!uri && ('bufferView' in imgData)) {
            const bufferView = this.bufferViews[imgData.bufferView];
            const data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
            return util.getBlobUrl(imgData.mimeType, data);
        }

        return uri;
    },
    getUsedTextureNameMap() {
        const map = {};
        util.each(this.json.materials, material => {
            let values = material;
            let isKMC = false;
            if (material.extensions && material.extensions.KHR_materials_common) {
                isKMC = true;
                values = material.extensions.KHR_materials_common.values;
            }
            if (this.isGLTF2 && !isKMC) {
                // glTF 2.0
                if (values.normalTexture) {
                    map[values.normalTexture.index] = true;
                }
                if (values.occlusionTexture) {
                    map[values.occlusionTexture.index] = true;
                }
                if (values.emissiveTexture) {
                    map[values.emissiveTexture.index] = true;
                }
                if (values.transparencyTexture) {
                    map[values.transparencyTexture.index] = true;
                }
                if (values.extensions && values.extensions.KHR_materials_pbrSpecularGlossiness) {
                    const subValues = values.extensions.KHR_materials_pbrSpecularGlossiness;
                    if (subValues.diffuseTexture) {
                        map[subValues.diffuseTexture.index] = true;
                    }
                    if (subValues.specularGlossinessTexture) {
                        map[subValues.specularGlossinessTexture.index] = true;
                    }
                } else if (values.pbrMetallicRoughness) {
                    const subValues = values.pbrMetallicRoughness;
                    if (subValues.baseColorTexture) {
                        map[subValues.baseColorTexture.index] = true;
                    }
                    if (subValues.metallicRoughnessTexture) {
                        map[subValues.metallicRoughnessTexture.index] = true;
                    }
                }
            } else {
                // glTF 1.0
                if (!isKMC) {
                    values = material.values;
                }
                [
                    'diffuse',
                    'specular',
                    'emission',
                    'ambient',
                    'transparency',
                    'normalMap'
                ].forEach(name => {
                    let value = values[name];
                    if (value instanceof Object && 'index' in value) {
                        value = value.index;
                    }
                    if (util.isStrOrNumber(value) && this.json.textures[value]) {
                        map[value] = true;
                    }
                });
            }
        });
        return map;
    },
    loadTextures() {
        this.textures = {};

        if (!this.json.textures) {
            return Promise.resolve();
        }

        const usedTextures = this.getUsedTextureNameMap();

        return Promise.all(Object.keys(this.json.textures).filter(textureName => {
            return usedTextures[textureName];
        }).map(textureName => {
            let textureData = this.json.textures[textureName];
            let uri = this.getImageUri(textureData.source);
            uri = util.getRelativePath(this.src, uri);

            if (this.preHandlerImageURI) {
                uri = this.preHandlerImageURI(uri, textureName);
            }

            const texture = new LazyTexture(textureData);
            texture.autoLoad = this.isProgressive;
            texture.crossOrigin = true;
            texture.src = uri;
            texture.name = textureData.name || textureName;
            if (this.json.samplers) {
                Object.assign(texture, this.json.samplers[textureData.sampler]);
            }
            this.textures[textureName] = texture;

            if (!this.isProgressive) {
                return texture.load();
            }
            return Promise.resolve();
        }));
    },
    parseBufferViews() {
        this.bufferViews = {};
        util.each(this.json.bufferViews, (data, name) => {
            const buffer = this.buffers[data.buffer];
            const byteOffset = data.byteOffset || 0;
            const byteLength = data.byteLength;
            this.bufferViews[name] = {
                id: math.generateUUID('bufferView'),
                byteOffset,
                byteLength,
                buffer,
                byteStride: data.byteStride
            };
        });

        if (!this.isBinary) {
            delete this.buffers;
        }
    },
    getColorOrTexture(value) {
        if (Array.isArray(value)) {
            return new Color(value[0], value[1], value[2]);
        } else if (value instanceof Object && 'index' in value) {
            value = value.index;
        }
        return this.textures[value];
    },
    createPBRMaterial(materialData) {
        const material = new PBRMaterial();
        let values = materialData;
        if (values.alphaMode === 'BLEND') {
            material.transparent = true;
        } else if (values.alphaMode === 'MASK') {
            if ('alphaCutoff' in values) {
                material.alphaCutoff = values.alphaCutoff;
            } else {
                material.alphaCutoff = 0.5;
            }
        }
        if (!values.doubleSided) {
            material.side = FRONT;
        } else {
            material.side = FRONT_AND_BACK;
        }
        if (values.normalTexture) {
            material.normalMap = this.textures[values.normalTexture.index];
        }
        if (values.occlusionTexture) {
            material.ao = this.textures[values.occlusionTexture.index];
        }
        if (values.emissiveTexture) {
            material.emission = this.textures[values.emissiveTexture.index];
        }
        if (values.transparencyTexture) {
            material.transparency = this.textures[values.transparencyTexture.index];
        }
        if (values.extensions && values.extensions.KHR_materials_pbrSpecularGlossiness) {
            const subValues = values.extensions.KHR_materials_pbrSpecularGlossiness;
            if (subValues.diffuseFactor) {
                material.baseColor.fromArray(subValues.diffuseFactor);
            }
            if (subValues.diffuseTexture) {
                material.baseColorMap = this.textures[subValues.diffuseTexture.index];
            }
            if (subValues.specularFactor) {
                material.specular.fromArray(subValues.specularFactor);
                material.specular.a = 1;
            }
            if ('glossinessFactor' in subValues) {
                material.glossiness = subValues.glossinessFactor;
            }
            if (subValues.specularGlossinessTexture) {
                material.specularGlossinessMap = this.textures[subValues.specularGlossinessTexture.index];
            }
            material.isSpecularGlossiness = true;
        } else if (values.pbrMetallicRoughness) {
            const subValues = values.pbrMetallicRoughness;
            if (subValues.baseColorFactor) {
                material.baseColor.fromArray(subValues.baseColorFactor);
            }
            if (subValues.baseColorTexture) {
                material.baseColorMap = this.textures[subValues.baseColorTexture.index];
            }
            if (subValues.metallicRoughnessTexture) {
                material.metallicRoughness = this.textures[subValues.metallicRoughnessTexture.index];
                if (material.ao === material.metallicRoughness) {
                    material.ao = 1;
                    material.aoInMetallicRoughness = true;
                }
            }
            if ('roughnessFactor' in subValues) {
                material.roughness = subValues.roughnessFactor;
            }
            if ('metallicFactor' in subValues) {
                material.metallic = subValues.metallicFactor;
            }
        }
        return material;
    },
    createKMCMaterial(materialData, kmc) {
        const material = new BasicMaterial();
        let values;
        if (kmc) {
            values = kmc.values;
            material.lightType = kmc.technique;
        } else {
            values = materialData.values;
        }
        // glTF 1.0 or KMC
        material.diffuse = this.getColorOrTexture(values.diffuse) || material.diffuse;
        material.specular = this.getColorOrTexture(values.specular) || material.specular;
        material.emission = this.getColorOrTexture(values.emission) || material.emission;
        material.ambient = this.getColorOrTexture(values.ambient) || material.ambient;

        if (values.normalMap) {
            material.normalMap = this.getColorOrTexture(values.normalMap);
        }

        if (typeof values.transparency === 'number') {
            material.transparency = values.transparency;
            if (material.transparency < 1) {
                material.transparent = true;
            }
        } else if (typeof values.transparency === 'string') {
            material.transparency = this.getColorOrTexture(values.transparency);
            material.transparent = true;
        }

        if (values.transparent === true) {
            material.transparent = true;
        }

        if ('shininess' in values) {
            material.shininess = values.shininess;
        }
        return material;
    },
    parseMaterials() {
        this.materials = {};
        util.each(this.json.materials, (materialData, name) => {
            if (this.customMaterialCreator) {
                this.materials[name] = this.customMaterialCreator(name, materialData, this.json);
                return;
            }

            let kmc = null;
            if (materialData.extensions && materialData.extensions.KHR_materials_common) {
                kmc = materialData.extensions.KHR_materials_common;
            }

            let material;
            if (this.isGLTF2 && !kmc) {
                material = this.createPBRMaterial(materialData);
            } else {
                material = this.createKMCMaterial(materialData, kmc);
            }

            material.name = materialData.name || name;
            this.materials[name] = material;

            this.parseTechnique(materialData, material);
        });
    },
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
    sparseAccessorHandler(data, sparse) {
        if (!sparse) {
            return data;
        }
        const count = sparse.count;
        // if dont create a new TpyedArray here, it will change the origin data in buffer
        let TypedArray = data.data.constructor;
        const newArray = new TypedArray(data.realLength);
        newArray.set(data.data);
        data.data = newArray;
        // values
        let buffer = this.bufferViews[sparse.values.bufferView];
        const values = new TypedArray(buffer.buffer, buffer.byteOffset + sparse.values.byteOffset, count * data.size);
        // indices
        TypedArray = ComponentTypeMap[sparse.indices.componentType][1];
        buffer = this.bufferViews[sparse.indices.bufferView];
        const indices = new TypedArray(buffer.buffer, buffer.byteOffset + sparse.indices.byteOffset, count);
        // change it
        for (let i = 0; i < count; i++) {
            util.copyArrayData(newArray, values, indices[i] * data.size, i * data.size, data.size);
        }
        return data;
    },
    getAccessorData(name, isDecode) {
        let accessor = this.json.accessors[name];
        if (accessor.data) {
            return accessor.data;
        }
        let [, TypedArray] = ComponentTypeMap[accessor.componentType];
        let number = ComponentNumberMap[accessor.type];
        let bufferView = this.bufferViews[accessor.bufferView];
        let count = accessor.count * number;
        let result;
        if (bufferView.byteStride && bufferView.byteStride > number * TypedArray.BYTES_PER_ELEMENT) {
            if (!bufferView.array) {
                bufferView.array = new TypedArray(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT);
            }
            result = new GeometryData(bufferView.array, number, {
                offset: accessor.byteOffset || 0,
                stride: bufferView.byteStride,
                bufferViewId: bufferView.id
            });
        } else {
            let offset = (accessor.byteOffset || 0) + bufferView.byteOffset;
            let array;
            if (offset % TypedArray.BYTES_PER_ELEMENT) {
                let buffer = bufferView.buffer.slice(offset, offset + count * TypedArray.BYTES_PER_ELEMENT);
                array = new TypedArray(buffer);
            } else {
                array = new TypedArray(bufferView.buffer, offset, count);
            }
            result = new GeometryData(array, number);
        }

        if (accessor.sparse) {
            result = this.sparseAccessorHandler(result, accessor.sparse);
        }

        if (accessor.extensions && accessor.extensions.WEB3D_quantized_attributes) {
            let decodeMat = accessor.extensions.WEB3D_quantized_attributes.decodeMatrix;
            if (isDecode) {
                result = this.unQuantizeData(result, decodeMat);
            } else {
                result.decodeMat = decodeMat;
            }
        }
        accessor.data = result;
        if (accessor.normalized) {
            result.normalized = true;
        }
        return result;
    },
    getArrayByAccessor(name, isDecode) {
        let accessor = this.json.accessors[name];
        if (accessor.array) {
            return accessor.array;
        }
        let data = this.getAccessorData(name, isDecode);
        if (!data.stride && !data.offset && data.size === 1) {
            return data.data;
        }

        const result = [];
        data.traverse(d => {
            result.push(d.toArray ? d.toArray() : d);
        });
        accessor.array = result;
        return result;
    },
    parseTechnique(materialData, material) {
        let technique = null;
        if (this.json.techniques) {
            technique = this.json.techniques[materialData.technique];
        }
        if (!technique) {
            return;
        }
        if (!technique.states) {
            return;
        }

        technique.states.enable.forEach(flag => {
            switch (flag) {
                case BLEND:
                    material.blend = true;
                    break;
                case DEPTH_TEST:
                    material.depthTest = true;
                    break;
                case CULL_FACE:
                    material.cullFace = true;
                    break;
                default:
                    break;
            }
        });

        util.each(technique.states.functions, (value, fnName) => {
            switch (fnName) {
                case 'blendEquationSeparate':
                    {
                        material.blendEquation = value[0];
                        material.blendEquationAlpha = value[1];
                        break;
                    }
                case 'blendFuncSeparate':
                    {
                        material.blendSrc = value[0];
                        material.blendDst = value[1];
                        material.blendSrcAlpha = value[2];
                        material.blendDstAlpha = value[3];
                        break;
                    }
                case 'depthMask':
                    {
                        material.depthMask = value[0];
                        break;
                    }
                case 'cullFace':
                    {
                        material.cullFaceType = value[0];
                        break;
                    }
                default:
                    material[fnName] = value;
                    break;
            }
        });

        if (material.cullFace) {
            material.side = material.cullFaceType === FRONT ? BACK : FRONT;
        } else {
            material.side = FRONT_AND_BACK;
        }
    },
    createMorphGeometry(primitive, weights) {
        // MorphGeometry
        const geometry = new MorphGeometry();
        const targets = geometry.targets = {};
        util.each(primitive.targets, target => {
            util.each(target, (accessorName, name) => {
                const geometryName = glTFAttrToGeometry[name].name;
                if (!targets[geometryName]) {
                    targets[geometryName] = [];
                }
                const data = this.getAccessorData(accessorName, true);
                targets[geometryName].push(data);
            });
        });
        if (weights) {
            geometry.weights = weights;
        } else {
            geometry.weights = new Float32Array(primitive.targets.length);
        }
        return geometry;
    },
    handlerGeometry(geometry, primitive) {
        if ('indices' in primitive) {
            geometry.indices = this.getAccessorData(primitive.indices);
        }
        let attr = primitive.attributes;
        for (let name in attr) {
            let info = glTFAttrToGeometry[name];
            if (!info) {
                console.warn(`Unknow attribute named ${name}!`);
                continue;
            }
            let isDecode = !(this.isUnQuantizeInShader && info.decodeMatName);

            geometry[info.name] = this.getAccessorData(attr[name], isDecode);
            if (!isDecode) {
                geometry[info.decodeMatName] = geometry[info.name].decodeMat;
                delete geometry[info.name].decodeMat;
            }
        }

    },
    handlerSkinedMesh(mesh, skin) {
        if (!skin) {
            return;
        }
        const jointCount = (skin.jointNames || skin.joints).length;
        mesh.bindShapeMatrix = new Matrix4();
        if (skin.bindShapeMatrix) {
            mesh.bindShapeMatrix.fromArray(skin.bindShapeMatrix);
        }
        const inverseBindMatrices = this.getArrayByAccessor(skin.inverseBindMatrices, true);
        for (let i = 0; i < jointCount; i++) {
            mesh.inverseBindMatrices.push(new Matrix4().fromArray(inverseBindMatrices[i]));
        }
        mesh.jointNames = skin.jointNames || skin.joints;
        if (this.useInstanced) {
            mesh.useInstanced = true;
        }
    },
    parseMesh(meshName, node, nodeData) {
        let meshData = this.json.meshes[meshName];
        meshData.primitives.forEach(primitive => {
            if (primitive.meshNode) {
                node.addChild(primitive.meshNode.clone());
                return;
            }

            let geometry;
            if (primitive.targets && primitive.targets.length) {
                geometry = this.createMorphGeometry(primitive, meshData.weights);
            } else {
                geometry = new Geometry();
            }
            this.handlerGeometry(geometry, primitive);

            let material = this.materials[primitive.material] || new BasicMaterial();
            const skin = this.json.skins && this.json.skins[nodeData.skin];
            const MeshClass = skin ? SkinedMesh : Mesh;
            const mesh = new MeshClass({
                geometry,
                material,
                name: 'mesh-' + (meshData.name || meshName)
            });

            this.handlerSkinedMesh(mesh, skin);

            primitive.meshNode = mesh;
            node.addChild(mesh);
            this.meshes.push(mesh);
        });
    },
    parseCameras() {
        this.cameras = {};
        const defaultAspect = window.innerWidth / window.innerHeight;
        util.each(this.json.cameras, (cameraData, name) => {
            if (cameraData.type === 'perspective') {
                const camera = new PerspectiveCamera();
                camera.name = cameraData.name || name;
                camera.fov = math.radToDeg(cameraData.perspective.yfov);
                camera.near = cameraData.perspective.znear;
                camera.far = cameraData.perspective.zfar;
                if (cameraData.aspectRatio) {
                    camera.aspect = cameraData.aspectRatio;
                } else {
                    camera.aspect = defaultAspect;
                }
                this.cameras[name] = camera;
            }
        });
    },
    handlerNodeTransform(node, data) {
        if (data.matrix) {
            let matrix = new Matrix4();
            matrix.fromArray(data.matrix);
            node.matrix = matrix;
        } else {
            if (data.rotation) {
                node.quaternion.fromArray(data.rotation);
            }
            if (data.scale) {
                node.setScale(data.scale[0], data.scale[1], data.scale[2]);
            }
            if (data.translation) {
                node.x = data.translation[0];
                node.y = data.translation[1];
                node.z = data.translation[2];
            }
        }
    },
    parseNode(nodeName, parentNode) {
        let node;
        let data = this.json.nodes[nodeName];
        if (data.camera && this.cameras[data.camera]) {
            node = this.cameras[data.camera];
        } else {
            node = new Node({
                name: this.isGLTF2 ? (data.name || nodeName) : nodeName
            });
        }
        this.handlerNodeTransform(node, data);

        if (data.jointName) {
            node.jointName = data.jointName;
            this.jointMap[node.jointName] = node;
        } else if (this.isGLTF2) {
            node.jointName = nodeName;
            this.jointMap[nodeName] = node;
        }

        if (data.meshes) {
            data.meshes.forEach(meshName => this.parseMesh(meshName, node, data));
        } else if ('mesh' in data) {
            this.parseMesh(data.mesh, node, data);
        }

        if (data.children) {
            data.children.forEach(name => this.parseNode(name, node));
        }

        parentNode.addChild(node);
    },
    parseAnimations() {
        if (!this.json.animations) {
            return null;
        }
        const animStatesList = [];
        for (let name in this.json.animations) {
            let info = this.json.animations[name];
            info.channels.forEach(channel => {
                let path = channel.target.path;
                let nodeId = channel.target.id;
                if (this.isGLTF2) {
                    nodeId = channel.target.node;
                    if (this.json.nodes[nodeId].name) {
                        nodeId = this.json.nodes[nodeId].name;
                    }
                }

                const sampler = info.samplers[channel.sampler];
                const inputAccessName = this.isGLTF2 ? sampler.input : info.parameters[sampler.input];
                const outputAccessName = this.isGLTF2 ? sampler.output : info.parameters[path];
                const keyTime = this.getArrayByAccessor(inputAccessName, true);
                let states = this.getArrayByAccessor(outputAccessName, true);
                if (path === 'rotation') {
                    path = 'quaternion';
                }
                const animStates = new AnimationStates({
                    interpolationTpye: sampler.interpolation,
                    nodeName: nodeId,
                    keyTime,
                    states,
                    type: AnimationStates.getType(path)
                });
                animStatesList.push(animStates);
            });
        }
        if (!animStatesList.length) {
            return null;
        }
        const anim = new Animation({
            rootNode: this.node,
            animStatesList
        });

        this.parseAnimationClipsExtension(anim);

        return anim;
    },
    parseAnimationClipsExtension(anim) {
        const extensions = this.json.extensions;
        const animationClips = extensions && extensions.HILO_animation_clips;
        if (!animationClips) {
            return;
        }
        for (let name in animationClips) {
            let clip = animationClips[name];
            anim.addClip(name, clip[0], clip[1]);
        }
    },
    parseScene() {
        this.parseMaterials();
        this.jointMap = {};
        this.meshes = [];

        this.node = new Node({
            needCallChildUpdate: false
        });

        this.parseCameras();

        const scene = this.json.scenes[this.getDefaultSceneName()];
        if (!scene) {
            console.warn('GLTFParser:no scene!');
            return {
                node: this.node,
                meshes: [],
                cameras: [],
                lights: [],
                textures: [],
                materials: []
            };
        }

        const nodes = scene.nodes;
        nodes.forEach(node => this.parseNode(node, this.node));

        this.node.resetSkinedMeshRootNode();

        const anim = this.parseAnimations();
        if (anim) {
            this.node.setAnim(anim);
            anim.play();
        }

        return {
            node: this.node,
            meshes: this.meshes,
            anim,
            cameras: Object.values(this.cameras),
            lights: [],
            textures: Object.values(this.textures),
            materials: Object.values(this.materials)
        };
    },
    getDefaultSceneName() {
        if (this.defaultScene !== undefined) {
            return this.defaultScene;
        }

        if (this.json.scenes) {
            return Object.keys(this.json.scenes)[0];
        }

        return null;
    }
});

module.exports = GLTFParser;