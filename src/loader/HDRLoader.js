const Class = require('../core/Class');
const BasicLoader = require('./BasicLoader');
const Texture = require('../texture/Texture');
const parseHDR = require('parse-hdr');

const {
    RGBA,
    NEAREST,
    CLAMP_TO_EDGE,
    FLOAT
} = require('../constants/index');

const HDRLoader = Class.create({
    Extends: BasicLoader,
    /**
     * @default true
     * @type {boolean}
     */
    isHDRLoader: true,
    /**
     * @default HDRLoader
     * @type {string}
     */
    className: 'HDRLoader',
    constructor() {
        HDRLoader.superclass.constructor.call(this);
    },
    load(params) {
        return this.loadRes(params.src, 'buffer')
            .then((buffer) => {
                try {
                    const img = parseHDR(buffer);
                    const shape = img.shape;
                    const pixels = img.data;

                    return new Texture({
                        width: shape[0],
                        height: shape[1],
                        flipY: true,
                        image: pixels,
                        type: FLOAT,
                        magFilter: NEAREST,
                        minFilter: NEAREST,
                        wrapS: CLAMP_TO_EDGE,
                        wrapT: CLAMP_TO_EDGE,
                        internalFormat: RGBA,
                        format: RGBA
                    });
                } catch (e) {
                    console.warn('HDRLoader:parse error => ', e);
                }
                return null;
            });
    }
});

module.exports = HDRLoader;