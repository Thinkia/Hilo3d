import AMDecompression from '@ali/amc/AMDecompression';
import Geometry from '../geometry/Geometry';
import GeometryData from '../geometry/GeometryData';

const mockHilo3d = {
    Geometry,
    GeometryData
};

const AliAMCExtension = {
    _decodeTotalTime: 0,
    wasmURL: '',
    workerURL: '',
    useWASM: true,
    useWebWorker: true,
    useAuto: true,
    init() {
        if (AliAMCExtension.useAuto) {
            return AMDecompression.initWASM(AliAMCExtension.wasmURL);
        }

        if (AliAMCExtension.useWebWorker) {
            return AMDecompression.initWorker(AliAMCExtension.workerURL);
        }

        if (AliAMCExtension.useWASM) {
            return AMDecompression.initWASM(AliAMCExtension.wasmURL);
        }
        return Promise.resolve();
    },
    parse(info, parser, result, primitive) {
        const st = Date.now();
        const bufferView = parser.bufferViews[info.bufferView];
        const {
            wasmURL,
            workerURL,
            useAuto,
            useWASM,
            useWebWorker
        } = AliAMCExtension;

        let amcGeometry;
        const data = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);

        function done(amcGeometry) {
            AliAMCExtension._decodeTotalTime += Date.now() - st;
            return amcGeometry.toHilo3dGeometry(mockHilo3d, primitive._geometry);
        }

        if (useAuto) {
            return AMDecompression.decompress(data, wasmURL, workerURL).then(done);
        }

        if (useWebWorker) {
            return AMDecompression.decompressWithWorker(data, useWASM, wasmURL, workerURL).then(done);
        }

        if (useWASM) {
            amcGeometry = AMDecompression.decompressWithWASM(data, wasmURL);
        } else {
            amcGeometry = AMDecompression.decompressWithJS(data);
        }
        return done(amcGeometry);
    }
};

export default AliAMCExtension;
