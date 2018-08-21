/**
 * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
 * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
 * ported from https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/loaders/KTXLoader.js
 */
import Class from '../core/Class';
import BasicLoader from './BasicLoader';
import Loader from './Loader';
import Texture from '../texture/Texture';
import extensions from '../renderer/extensions';

/**
 * @class
 * @private
 */
const KhronosTextureContainer = Class.create(/** @lends KhronosTextureContainer.prototype */{
    Statics: {
        HEADER_LEN: 12 + (13 * 4), // identifier + header elements (not including key value meta-data pairs)
        // load types
        COMPRESSED_2D: 0, // uses a gl.compressedTexImage2D()
        COMPRESSED_3D: 1, // uses a gl.compressedTexImage3D()
        TEX_2D: 2, // uses a gl.texImage2D()
        TEX_3D: 3, // uses a gl.texImage3D()

    },
    isKhronosTextureContainer: true,
    className: 'KhronosTextureContainer',
    /**
     * @param {ArrayBuffer} arrayBuffer- contents of the KTX container file
     * @param {number} facesExpected- should be either 1 or 6, based whether a cube texture or or
     */
    constructor(arrayBuffer, facesExpected) {
        this.arrayBuffer = arrayBuffer;

        // Test that it is a ktx formatted file, based on the first 12 bytes, character representation is:
        // '´', 'K', 'T', 'X', ' ', '1', '1', 'ª', '\r', '\n', '\x1A', '\n'
        // 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
        const identifier = new Uint8Array(this.arrayBuffer, 0, 12);
        if (identifier[0] !== 0xAB ||
            identifier[1] !== 0x4B ||
            identifier[2] !== 0x54 ||
            identifier[3] !== 0x58 ||
            identifier[4] !== 0x20 ||
            identifier[5] !== 0x31 ||
            identifier[6] !== 0x31 ||
            identifier[7] !== 0xBB ||
            identifier[8] !== 0x0D ||
            identifier[9] !== 0x0A ||
            identifier[10] !== 0x1A ||
            identifier[11] !== 0x0A) {

            console.error('texture missing KTX identifier');
            return;

        }

        // load the reset of the header in native 32 bit int
        const header = new Int32Array(this.arrayBuffer, 12, 13);
        // determine of the remaining header values are recorded in the opposite endianness & require conversion
        const oppositeEndianess = header[0] === 0x01020304;
        // read all the header elements in order they exist in the file, without modification (sans endainness)
        this.glType = oppositeEndianess ? this.switchEndainness(header[1]) : header[1]; // must be 0 for compressed textures
        this.glTypeSize = oppositeEndianess ? this.switchEndainness(header[2]) : header[2]; // must be 1 for compressed textures
        this.glFormat = oppositeEndianess ? this.switchEndainness(header[3]) : header[3]; // must be 0 for compressed textures
        this.glInternalFormat = oppositeEndianess ? this.switchEndainness(header[4]) : header[4]; // the value of arg passed to gl.compressedTexImage2D(,,x,,,,)
        this.glBaseInternalFormat = oppositeEndianess ? this.switchEndainness(header[5]) : header[5]; // specify GL_RGB, GL_RGBA, GL_ALPHA, etc (un-compressed only)
        this.pixelWidth = oppositeEndianess ? this.switchEndainness(header[6]) : header[6]; // level 0 value of arg passed to gl.compressedTexImage2D(,,,x,,,)
        this.pixelHeight = oppositeEndianess ? this.switchEndainness(header[7]) : header[7]; // level 0 value of arg passed to gl.compressedTexImage2D(,,,,x,,)
        this.pixelDepth = oppositeEndianess ? this.switchEndainness(header[8]) : header[8]; // level 0 value of arg passed to gl.compressedTexImage3D(,,,,,x,,)
        this.numberOfArrayElements = oppositeEndianess ? this.switchEndainness(header[9]) : header[9]; // used for texture arrays
        this.numberOfFaces = oppositeEndianess ? this.switchEndainness(header[10]) : header[10]; // used for cubemap textures, should either be 1 or 6
        this.numberOfMipmapLevels = oppositeEndianess ? this.switchEndainness(header[11]) : header[11]; // number of levels; disregard possibility of 0 for compressed textures
        this.bytesOfKeyValueData = oppositeEndianess ? this.switchEndainness(header[12]) : header[12]; // the amount of space after the header for meta-data

        // Make sure we have a compressed type.  Not only reduces work, but probably better to let dev know they are not compressing.
        if (this.glType !== 0) {

            console.warn('only compressed formats currently supported');
            return;

        } 

        // value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
        this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);

        
        if (this.pixelHeight === 0 || this.pixelDepth !== 0) {

            console.warn('only 2D textures currently supported');
            return;

        }
        if (this.numberOfArrayElements !== 0) {

            console.warn('texture arrays not currently supported');
            return;

        }
        if (this.numberOfFaces !== facesExpected) {

            console.warn('number of faces expected' + facesExpected + ', but found ' + this.numberOfFaces);
            return;

        }
        // we now have a completely validated file, so could use existence of loadType as success
        // would need to make this more elaborate & adjust checks above to support more than one load type
        this.loadType = KhronosTextureContainer.COMPRESSED_2D;
    },
    // not as fast hardware based, but will probably never need to use
    switchEndainness(val) {

        return ((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF);

    },

    // return mipmaps for THREE.js
    mipmaps(loadMipmaps) {

        let mipmaps = [];

        // initialize width & height for level 1
        let dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
        let width = this.pixelWidth;
        let height = this.pixelHeight;
        let mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;

        for (let level = 0; level < mipmapCount; level++) {

            let imageSize = new Int32Array(this.arrayBuffer, dataOffset, 1)[0]; // size per face, since not supporting array cubemaps
            for (let face = 0; face < this.numberOfFaces; face++) {

                let byteArray = new Uint8Array(this.arrayBuffer, dataOffset + 4, imageSize);

                mipmaps.push({
                    data: byteArray,
                    width,
                    height
                });

                dataOffset += imageSize + 4; // size of the image + 4 for the imageSize field
                dataOffset += 3 - ((imageSize + 3) % 4); // add padding for odd sized image

            }
            width = Math.max(1.0, width * 0.5);
            height = Math.max(1.0, height * 0.5);

        }

        return mipmaps;
    }
});

/**
 * @class
 */
const KTXLoader = Class.create(/** @lends KTXLoader.prototype */{
    Extends: BasicLoader,
    Statics: {
        astc: 'WEBGL_compressed_texture_astc',
        etc: 'WEBGL_compressed_texture_etc',
        etc1: 'WEBGL_compressed_texture_etc1',
        pvrtc: 'WEBGL_compressed_texture_pvrtc',
        s3tc: 'WEBGL_compressed_texture_s3tc'
    },
    /**
     * @type {boolean}
     * @default true
     */
    isKTXLoader: true,
    /**
     * 类名
     * @type {string}
     * @default KTXLoader
     */
    className: 'KTXLoader',
    constructor() {
        extensions.use(KTXLoader.astc);
        extensions.use(KTXLoader.atc);
        extensions.use(KTXLoader.etc);
        extensions.use(KTXLoader.etc1);
        extensions.use(KTXLoader.pvrtc);
        extensions.use(KTXLoader.s3tc);
        extensions.use(KTXLoader.s3tc_srgb);
        KTXLoader.superclass.constructor.call(this);
    },
    /**
     * load
     * @param  {Object} params
     * @param  {Boolean} [params.loadMipmaps=false]
     */
    load(params) {
        return this.loadRes(params.src, 'buffer')
            .then((buffer) => {
                const ktx = new KhronosTextureContainer(buffer, 1);
                const data = {
                    mipmaps: ktx.mipmaps(params.loadMipmaps),
                    width: ktx.pixelWidth,
                    height: ktx.pixelHeight,
                    format: ktx.glInternalFormat,
                    isCubemap: ktx.numberOfFaces === 6,
                    mipmapCount: ktx.numberOfMipmapLevels
                };

                return new Texture({
                    compressed: true,
                    internalFormat: data.format,
                    image: data.mipmaps[0].data,
                    width: data.mipmaps[0].width,
                    height: data.mipmaps[0].height
                });
            });
    }
});

Loader.addLoader('ktx', KTXLoader);

export default KTXLoader;