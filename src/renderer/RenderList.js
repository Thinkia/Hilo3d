import Class from '../core/Class';
import Vector3 from '../math/Vector3';
import {
    insertToSortedArray
} from '../utils/util';

const tempVector3 = new Vector3();

/**
 * 渲染列表
 * @class
 */
const RenderList = Class.create( /** @lends RenderList.prototype */ {
    /**
     * @default RenderList
     * @type {String}
     */
    className: 'RenderList',

    /**
     * @default true
     * @type {Boolean}
     */
    isRenderList: true,

    /**
     * @constructs
     */
    constructor() {
        /**
         * 不透明物体字典
         * @type {Object}
         */
        this.dict = {};

        /**
         * 透明物体列表
         * @type {Array}
         */
        this.transparentList = [];
    },
    /**
     * 重置列表
     */
    reset() {
        this.dict = {};
        this.transparentList.length = 0;
    },
    /**
     * 遍历列表执行回调
     * @param  {RenderList~traverseCallback} callback(meshes)
     */
    traverse(callback) {
        const dict = this.dict;
        for (let id in dict) {
            callback(dict[id]);
        }

        this.transparentList.forEach((mesh) => {
            callback([mesh]);
        });
    },
    /**
     * 增加 mesh
     * @param {Mesh} mesh
     * @param {Camera} camera
     */
    addMesh(mesh, camera) {
        const material = mesh.material;
        const geometry = mesh.geometry;

        if (material && geometry) {
            if (mesh.frustumTest && !camera.isMeshVisible(mesh)) {
                return;
            }
            const id = material.id + '_' + geometry.id;
            mesh.instanceId = id;
            if (material.transparent) {
                mesh.worldMatrix.getTranslation(tempVector3);
                tempVector3.transformMat4(camera.viewProjectionMatrix);
                mesh._sortRenderZ = tempVector3.z;
                insertToSortedArray(this.transparentList, mesh, (a, b) => {
                    return b._sortRenderZ - a._sortRenderZ;
                });
            } else {
                const arr = this.dict[id] = this.dict[id] || [];
                arr.push(mesh);
            }
        } else {
            console.warn('Mesh must have material and geometry', mesh);
        }
    }
});

export default RenderList;

/**
 * @callback RenderList~traverseCallback
 * @param {Mesh[]} mesh
 */