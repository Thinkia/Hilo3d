(function () {
    var Class = Hilo3d.Class;
    var BasicLoader = Hilo3d.BasicLoader;
    var Geometry = Hilo3d.Geometry;
    var GeometryData = Hilo3d.GeometryData;

    var dracoDecoder = new DracoDecoderModule();
    dracoDecoder.onModuleLoaded = function (module) {
        dracoDecoder = module;
    }

    function getAttribute(wrapper, dracoGeometry, attr, length) {
        // var attrId = wrapper.GetAttributeId(dracoGeometry, attr);
        // if (attrId === -1) {
        //     return;
        // }
        var attribute = wrapper.GetAttribute(dracoGeometry, attr);
        var data = new dracoDecoder.DracoFloat32Array();
        wrapper.GetAttributeFloatForAllPoints(dracoGeometry, attribute, data);
        var result = new Float32Array(length);
        for (var i = 0; i < length; i++) {
            result[i] = data.GetValue(i);
        }
        return result;
    }

    function decode(byteArray, info) {
        var attrs = info.attributes || {};

        var startTime = Date.now();
        // console.time('draco decode');
        // var byteArray = new Uint8Array(data);
        var buffer = new dracoDecoder.DecoderBuffer();
        buffer.Init(byteArray, byteArray.length);
        var wrapper = new dracoDecoder.Decoder();
        var geometryType = wrapper.GetEncodedGeometryType(buffer);
        var dracoGeometry, decodingStatus;
        if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
            dracoGeometry = new dracoDecoder.Mesh();
            decodingStatus = wrapper.DecodeBufferToMesh(buffer, dracoGeometry);
        } else {
            dracoGeometry = new dracoDecoder.PointCloud();
            decodingStatus = wrapper.DecodeBufferToPointCloud(buffer, dracoGeometry);
        }

        var geometry = new Geometry();
        var numFaces = dracoGeometry.num_faces();
        var numPoints = dracoGeometry.num_points();

        var map = {
            POSITION: ['vertices', numPoints * 3, 3],
            NORMAL: ['normals', numPoints * 3, 3],
            TANGENT: ['tangents', numPoints * 4, 4],
            TEXCOORD_0: ['uvs', numPoints * 2, 2],
            JOINTS_0: ['skinIndices', numPoints * 4, 4],
            WEIGHTS_0: ['skinWeights', numPoints * 4, 4],
        };
        for (var key in attrs) {
            var info = map[key];
            var data = getAttribute(wrapper, dracoGeometry, attrs[key], info[1]);
            if (data) {
                geometry[info[0]] = new GeometryData(data, info[2]);
            }
        }

        if (geometry._tangents) {
            if (geometry._tangents.length > geometry.vertices.length) {
                geometry._tangents.stride = 16;
                geometry._tangents.size = 3;
            }
        }

        if (geometry.skinIndices) {
            var x = geometry.skinIndices.data;
            for (var i = x.length - 1; i >= 0; i--) {
                x[i] = Math.round(x[i]);
            }
        }

        var indicesArray;
        if (numPoints > 65535) {
            indicesArray = new Uint32Array(numFaces * 3);
        } else {
            indicesArray = new Uint16Array(numFaces * 3);
        }
        var ia = new dracoDecoder.DracoInt32Array();
        for (var i = 0; i < numFaces; i++) {
            wrapper.GetFaceFromMesh(dracoGeometry, i, ia);
            var idx = i * 3;
            indicesArray[idx] = ia.GetValue(0);
            indicesArray[idx + 1] = ia.GetValue(1);
            indicesArray[idx + 2] = ia.GetValue(2);
        }
        geometry.indices = new GeometryData(indicesArray, 1);

        dracoDecoder.destroy(ia);
        dracoDecoder.destroy(dracoGeometry);
        dracoDecoder.destroy(wrapper);
        dracoDecoder.destroy(buffer);
        // console.timeEnd('draco decode');
        console.log('dracoDecoder time:', Date.now() - startTime);
        return geometry;
    }


    var DracoLoader = Class.create({
        Extends: BasicLoader,
        Statics: {
            decode: decode
        },
        constructor: function () {
            DracoLoader.superclass.constructor.call(this);
        },
        load: function (params) {
            return this.loadRes(params.src, 'buffer')
                .then(function (data) {
                    return decode(data);
                }).catch(function (err) {
                    console.warn('load draco failed', err);
                    throw err;
                });
        }
    });

    Hilo3d.DracoLoader = DracoLoader;
    Hilo3d.LoadQueue.addLoader('drc', DracoLoader);

    window.totalTime = 0;
    Hilo3d.GLTFParser.extensionHandlers.KHR_draco_mesh_compression = function (info, parser) {
        var startTime = Date.now();
        var bufferView = parser.bufferViews[info.bufferView];
        var uintArray = new Uint8Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);

        var geometry = decode(uintArray, info);
        totalTime += Date.now() - startTime;
        return geometry;
    }
})();