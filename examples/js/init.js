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
    }
};

utils.keys = utils.parseQuery(location.href);