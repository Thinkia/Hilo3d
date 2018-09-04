var dropElem = document.body;
var inputContainerElem = document.querySelector('#inputContainer')
var inputElem = document.querySelector('#input');
var stageContainerElem = document.querySelector('#stageContainer');
var dropCtrl = new SimpleDropzone(dropElem, inputElem);

document.querySelector('#uploadIcon').onclick = function(){
    var event = document.createEvent('MouseEvents');//FF的处理 
　　　　 event.initEvent('click', false, false);  
　　　　 inputElem.dispatchEvent(event); 
};

var glTFUrl, glTFOriginUrl, resDict, files;
var glTFLoader = new Hilo3d.GLTFLoader();
var basicLoader = new Hilo3d.BasicLoader();
var preHandlerResURI = function(uri, key, originData){
    if (originData && originData.uri) {
        var newUri = resDict[Hilo3d.util.getRelativePath(glTFOriginUrl, originData.uri)];
        if (newUri) {
            return newUri;
        }
    }

    return uri;
};

var camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 100,
    near: 0.1,
    z: 3
});

var stage = new Hilo3d.Stage({
    container: stageContainer,
    camera: camera,
    clearColor: new Hilo3d.Color(0.4, 0.4, 0.4),
    width: innerWidth,
    height: innerHeight
});

var ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.addTick(Hilo3d.Tween);
ticker.addTick(Hilo3d.Animation);
ticker.start();

var orbitControls = new OrbitControls(stage, {
    isLockMove:true,
    isLockZ:true
});

var parseUrl = function(url) {
    url = url.replace(/\\/g, '/');
    if (url[0] !== '.' && url[0] !== '/') {
        url = '/' + url;
    }

    return url;
};

dropCtrl.on('drop', function(e){
    stageContainerElem.style.display = 'block';
    inputContainerElem.style.display = 'none';
    files = e.files;
    resDict = {};
    glTFUrl = undefined;
    glTFOriginUrl = undefined;
    Hilo3d.BasicLoader.cache.clear();
    stage.destroy();

    files.forEach(function(value, key, map) {
        var ext = Hilo3d.util.getExtension(key);
        if (ext === 'gltf' || ext === 'glb') {
            glTFOriginUrl = parseUrl(key);
            glTFUrl = URL.createObjectURL(value);
        }
    });

    if (glTFUrl) {

        files.forEach(function(value, key, map) {
            var ext = Hilo3d.util.getExtension(key);
            if (ext !== 'gltf' || ext !== 'glb') {
                let originUrl = parseUrl(key);
                resDict[originUrl] = URL.createObjectURL(value);
            }
        });

        glTFLoader.load({
            src: glTFUrl,
            isUnQuantizeInShader:false,
            preHandlerImageURI: preHandlerResURI,
            preHandlerBufferURI: preHandlerResURI
        }).then( function(model) {
            window.model = model;
            stage.addChild(model.node);
            var bounds = model.node.getBounds();
            const scale = 1.5/Math.max(bounds.width, bounds.height, bounds.depth);
            model.node.setPosition(-bounds.x * scale, -bounds.y * scale, -bounds.z * scale);
            model.node.setScale(scale);

            utils.loadEnvMap(function(data) {
                model.materials.forEach(function(material) {
                    material.brdfLUT = data.brdfLUT;
                    material.diffuseEnvMap = data.diffuseEnvMap;
                    material.specularEnvMap = data.specularEnvMap;
                    material.isDirty = true;
                });

                var skyBox = new Hilo3d.Mesh({
                    geometry: new Hilo3d.BoxGeometry(),
                    material: new Hilo3d.BasicMaterial({
                        lightType: 'NONE',
                        side: Hilo3d.constants.BACK,
                        diffuse: data.specularEnvMap
                    })
                }).addTo(stage);
                skyBox.setScale(20);

                var directionLight = new Hilo3d.DirectionalLight({
                    color:new Hilo3d.Color(1, 1, 1),
                    direction:new Hilo3d.Vector3(0, -1, 0)
                }).addTo(stage);
            });
        });
    }
});