const AMDecompression = require('@ali/amc/AMDecompression');
const GLTFParser = require('./GLTFParser');
const Geometry = require('../geometry/Geometry');
const GeometryData = require('../geometry/GeometryData');

const mockHilo3d = { Geometry, GeometryData };

const AliAMCExtension = {
    _decodeTotalTime: 0,
    init() {
        return AMDecompression.initWASM(AliAMCExtension.wasmURL);
    },
    parse(info, parser) {
        const st = Date.now();
        const bufferView = parser.bufferViews[info.bufferView];
        const data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
        const amcGeometry = AMDecompression.decompressWithWASM(data);
        AliAMCExtension._decodeTotalTime += Date.now() - st;
        return amcGeometry.toHilo3dGeometry(mockHilo3d);
    }
};

GLTFParser.extensionHandlers.ALI_amc_mesh_compression = AliAMCExtension;

module.exports = AliAMCExtension;