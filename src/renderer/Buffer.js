import Class from '../core/Class';
import Cache from '../utils/Cache';

import {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,
    STATIC_DRAW
} from '../constants/';

const cache = new Cache();
/**
 * 缓冲
 * @class
 */
const Buffer = Class.create( /** @lends Buffer.prototype */ {
    Statics: /** @lends Buffer */ {
        /**
         * 缓存
         * @readOnly
         * @return {Cache}
         */
        cache: {
            get() {
                return cache;
            }
        },
        /**
         * 重置缓存
         */
        reset(gl) { // eslint-disable-line no-unused-vars
            cache.each((buffer) => {
                buffer.destroy();
            });
        },
        /**
         * 生成顶点缓冲
         * @param  {WebGLRenderingContext} gl    
         * @param  {GeometryData} geometryData  
         * @param  {GLenum} [usage = STATIC_DRAW] 
         * @return {Buffer}       
         */
        createVertexBuffer(gl, geometryData, usage = STATIC_DRAW) {
            return this.createBuffer(gl, ARRAY_BUFFER, geometryData, usage);
        },
        createBuffer(gl, target, geometryData, usage) {
            const id = geometryData.bufferViewId;
            let buffer = cache.get(id);
            if (buffer) {
                return buffer;
            }
            buffer = new Buffer(gl, target, geometryData.data, usage);
            cache.add(id, buffer);
            geometryData.glBuffer = buffer;
            return buffer;
        },

        /**
         * 生成索引缓冲
         * @param  {WebGLRenderingContext} gl    
         * @param  {GeometryData} geometryData  
         * @param  {GLenum} [usage = STATIC_DRAW] 
         * @return {Buffer}       
         */
        createIndexBuffer(gl, geometryData, usage = STATIC_DRAW) {
            return this.createBuffer(gl, ELEMENT_ARRAY_BUFFER, geometryData, usage);
        }
    },

    /**
     * @default Buffer
     * @type {String}
     */
    className: 'Buffer',

    /**
     * @default true
     * @type {Boolean}
     */
    isBuffer: true,

    /**
     * @constructs
     * @param  {WebGLRenderingContext} gl     
     * @param  {GLenum} [target = ARRAY_BUFFER] 
     * @param  {TypedArray} data   
     * @param  {GLenum} [usage = STATIC_DRAW]  
     */
    constructor(gl, target = ARRAY_BUFFER, data, usage = STATIC_DRAW) {
        this.gl = gl;
        /**
         * target
         * @type {GLenum}
         */
        this.target = target;

        /**
         * usage
         * @type {GLenum}
         */
        this.usage = usage;

        /**
         * buffer
         * @type {WebGLBuffer}
         */
        this.buffer = gl.createBuffer();

        if (data) {
            this.upload(data);
        }
    },
    /**
     * 绑定
     */
    bind() {
        this.gl.bindBuffer(this.target, this.buffer);
    },
    /**
     * 上传数据
     * @param  {TypedArray} data   
     * @param  {Number} [offset=0] 偏移值
     */
    upload(data, offset = 0) {
        const {
            gl,
            target,
            usage
        } = this;

        this.bind();
        if (!this.data || this.data.byteLength < data.byteLength) {
            gl.bufferData(target, data, usage);
        } else {
            gl.bufferSubData(target, offset, data);
        }
        this.data = data;
    },
    /**
     * 销毁
     */
    destroy() {
        this.gl.deleteBuffer(this.buffer);
        this.data = null;
        cache.removeObject(this);
    }
});

export default Buffer;