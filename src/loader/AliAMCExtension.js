const AMDecompression = require('@ali/amc/AMDecompression');
const GLTFParser = require('./GLTFParser');
const Geometry = require('../geometry/Geometry');
const GeometryData = require('../geometry/GeometryData');

const mockHilo3d = { Geometry, GeometryData };

const AliAMCExtension = {
    init() {
        return AMDecompression.initWASM('//ossgw.alicdn.com/tmall-c3/tmx/14e48042eddab1646fc6513636c4fa07.wasm');
    },
    parse(info, parser) {
        const bufferView = parser.bufferViews[info.bufferView];
        const amcGeometry = AMDecompression.decompressWithWASM(new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength));
        return amcGeometry.toHilo3dGeometry(mockHilo3d);
    }
};

GLTFParser.extensionHandlers.ALI_amc_mesh_compression = AliAMCExtension;

module.exports = AliAMCExtension;