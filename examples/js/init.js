var camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 100,
    near: 0.1,
    z: 3
});

var stage = new Hilo3d.Stage({
    container: document.getElementById('container'),
    camera: camera,
    clearColor: new Hilo3d.Color(0.4, 0.4, 0.4),
    width: innerWidth,
    height: innerHeight
});

var renderer = stage.renderer;
var gl;

var directionLight = new Hilo3d.DirectionalLight({
    color:new Hilo3d.Color(1, 1, 1),
    direction:new Hilo3d.Vector3(0, -1, 0)
}).addTo(stage);

var ambientLight = new Hilo3d.AmbientLight({
    color:new Hilo3d.Color(1, 1, 1),
    amount: .5
}).addTo(stage);

var ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.addTick(Hilo3d.Tween);
ticker.addTick(Hilo3d.Animation);
var stats = new Stats(ticker, stage.renderer.renderInfo);
var orbitControls = new OrbitControls(stage, {
    isLockMove:true,
    isLockZ:true
});

setTimeout(function(){
    ticker.start(true);
    gl = renderer.gl;
}, 10);

console.log('Hilo3d.version: ' + Hilo3d.version);

var utils = {
    keys:{},
    parseQuery(url) {
        const reg = /([^?#&=]+)=([^#&]*)/g;
        const params = {};
        let result;
        while ((result = reg.exec(url))) {
            params[result[1]] = decodeURIComponent(result[2]);
        }
        return params;
    },
    buildUrl(url = '', params = {}) {
        const originParams = this.parseQuery(url);
        const newParams = Object.assign(originParams, params);
        const qs = Object.keys(newParams).map(key => `${key}=${encodeURIComponent(newParams[key])}`).join('&');
        return url.replace(/(\?.*)?$/,  `?${qs}`);
    },
    loadEnvMap(callback){
        var loadQueue = new Hilo3d.LoadQueue([{
            type: 'CubeTexture',
            images: [
                '//gw.alicdn.com/tfs/TB1i.dWr9cqBKNjSZFgXXX_kXXa-128-128.jpg',
                '//gw.alicdn.com/tfs/TB1ozYarJcnBKNjSZR0XXcFqFXa-128-128.jpg',
                '//gw.alicdn.com/tfs/TB11Nc_rRsmBKNjSZFFXXcT9VXa-128-128.jpg',
                '//gw.alicdn.com/tfs/TB13ldPr_mWBKNjSZFBXXXxUFXa-128-128.jpg',
                '//gw.alicdn.com/tfs/TB1RmQ6rTqWBKNjSZFAXXanSpXa-128-128.jpg',
                '//gw.alicdn.com/tfs/TB13j8frYZnBKNjSZFKXXcGOVXa-128-128.jpg'
            ]
        }, {
            type: 'CubeTexture',
            right: '//gw.alicdn.com/tfs/TB1EJJYr9cqBKNjSZFgXXX_kXXa-1024-1024.jpg',
            left: '//gw.alicdn.com/tfs/TB1xXKFrSYTBKNjSZKbXXXJ8pXa-1024-1024.jpg',
            top: '//gw.alicdn.com/tfs/TB1U7Fmr7UmBKNjSZFOXXab2XXa-1024-1024.jpg',
            bottom: '//gw.alicdn.com/tfs/TB1zJRdr8jTBKNjSZFDXXbVgVXa-1024-1024.jpg',
            front: '//gw.alicdn.com/tfs/TB1SkFLrQZmBKNjSZPiXXXFNVXa-1024-1024.jpg',
            back: '//gw.alicdn.com/tfs/TB1z9F2h4tnkeRjSZSgXXXAuXXa-1024-1024.jpg',
            magFilter: Hilo3d.constants.LINEAR,
            minFilter: Hilo3d.constants.LINEAR_MIPMAP_LINEAR
        },{
            src: '//gw.alicdn.com/tfs/TB1.K0CrYZnBKNjSZFhXXc.oXXa-256-256.png',
            wrapS: Hilo3d.constants.CLAMP_TO_EDGE,
            wrapT: Hilo3d.constants.CLAMP_TO_EDGE,
            type:'Texture'
        }]).start().on('complete', function(){
            var result = loadQueue.getAllContent();
            
            callback({
                diffuseEnvMap: result[0],
                specularEnvMap: result[1],
                brdfLUT: result[2],
            });
        });
    }
};

utils.keys = utils.parseQuery(location.href);