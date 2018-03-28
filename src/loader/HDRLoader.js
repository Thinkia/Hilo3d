import parseHDR from 'parse-hdr';
import Class from '../core/Class';
import BasicLoader from './BasicLoader';
import Texture from '../texture/Texture';

import {
    RGBA,
    NEAREST,
    CLAMP_TO_EDGE,
    FLOAT
} from '../constants/index';

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

export default HDRLoader;