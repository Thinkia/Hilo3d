const Class = require('../core/Class');
const BasicMaterial = require('./BasicMaterial');
const {
    FRONT
} = require('../constants/webgl');

const ShadowMaterial = Class.create({
    Extends: BasicMaterial,
    isShadowMaterial: true,
    className: 'ShadowMaterial',

    cullFace: true,
    cullFaceType: FRONT,

    lightType: 'NONE',
    constructor(params) {
        ShadowMaterial.superclass.constructor.call(this, params);
    }
});

module.exports = ShadowMaterial;