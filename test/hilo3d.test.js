(function(){
const Animation = Hilo3d.Animation;

describe('Animation', () => {
    it('create', () => {
        const animation = new Animation;
        animation.isAnimation.should.be.true();
        animation.className.should.equal('Animation');
    });
});
})();

(function(){
const AnimationStates = Hilo3d.AnimationStates;

describe('AnimationStates', () => {
    it('create', () => {
        const animationStates = new AnimationStates;
        animationStates.isAnimationStates.should.be.true();
        animationStates.className.should.equal('AnimationStates');
    });
});
})();

(function(){
const Camera = Hilo3d.Camera;
const Matrix4 = Hilo3d.Matrix4;
const Frustum = Hilo3d.Frustum;

describe('Camera', () => {
    it('create', () => {
        const camera = new Camera;
        camera.isCamera.should.be.true();
        camera.className.should.equal('Camera');
        camera.viewMatrix.should.instanceof(Matrix4);
        camera.projectionMatrix.should.instanceof(Matrix4);
        camera.viewProjectionMatrix.should.instanceof(Matrix4);
        camera._frustum.should.instanceof(Frustum);
    });
});
})();

(function(){
const OrthographicCamera = Hilo3d.OrthographicCamera;

describe('OrthographicCamera', () => {
    it('create', () => {
        const camera = new OrthographicCamera;
        camera.isOrthographicCamera.should.be.true();
        camera.className.should.equal('OrthographicCamera');
    });
});
})();

(function(){
const PerspectiveCamera = Hilo3d.PerspectiveCamera;

describe('PerspectiveCamera', () => {
    it('create', () => {
        const camera = new PerspectiveCamera;
        camera.isPerspectiveCamera.should.be.true();
        camera.className.should.equal('PerspectiveCamera');
    });
});
})();

(function(){
const webgl = Hilo3d.constants.webgl;
const webglExtensions = Hilo3d.constants.webglExtensions;
const constants = Hilo3d.constants;

describe('constants/index', () => {
    it('webgl[name] === constants[name] ', () => {
        for(var name in webgl){
            webgl[name].should.equal(constants[name]);
        }
    });

    it('webglExtensions[name] === constants[name] ', () => {
        for(var name in webglExtensions){
            webglExtensions[name].should.equal(constants[name]);
        }
    });
});
})();

(function(){
const webgl = Hilo3d.constants.webgl;

describe('constants/webgl', () => {
    it('webgl constants value should equal webgl value', () => {
        const gl = document.createElement('canvas').getContext('webgl');
        for (var name in webgl) {
            if(gl[name] !== undefined){
                webgl[name].should.equal(gl[name]);
            }
        }
    });
});
})();

(function(){
const Class = Hilo3d.Class;

describe('Class', function(){
    var A;
    it('new', function(){
        A = Class.create({
            id:'a',
            getId:function(){
                return this.id;
            }
        });

        var a = new A;
        a.should.instanceOf(A);
        a.id.should.equal('a');
        a.getId().should.equal('a');
    });

    it('Extends', function(){
        var B = Class.create({
            id:'b',
            Extends:A
        });

        var b = new B;
        b.should.instanceOf(A);
        b.should.instanceOf(B);
        B.superclass.should.equal(A.prototype);
        b.id.should.equal('b');
        b.getId().should.equal('b');
    });

    it('Mixes', function(){
        var C = Class.create({
            Mixes:[{
                    mixA:'mixA'
                },{
                    mixB:function(){
                        return 'mixB'
                    }
                }
            ]
        });

        var c = new C;
        c.mixA.should.equal('mixA');
        c.mixB().should.equal('mixB');
    });

    it('Statics', function(){
        var D = Class.create({
            Statics:{
                hello:function(){
                    return 'hello';
                }
            }
        });
        D.hello().should.equal('hello');
    });
});
})();

(function(){
const EventMixin = Hilo3d.EventMixin;

describe('EventMixin', function(){
    let eventTarget;
    beforeEach('init eventTarget', function(){
        eventTarget = Object.assign({}, EventMixin);
    });

    it('on & fire', function(){
        let firedNum = 0;
        eventTarget.on('hello', function(e){
            e.type.should.equal('hello');
            e.detail.should.eql({data:'world'});
            firedNum ++;
        });
        eventTarget.fire('hello', {data:'world'});
        firedNum.should.equal(1);
        eventTarget.fire('hello', {data:'world'});
        firedNum.should.equal(2);
    });

    it('on once', function(){
        let firedNum = 0;
        eventTarget.on('hello', function(e){});
        eventTarget.on('hello', function(e){
            firedNum ++;
        }, true);
        eventTarget.fire('hello');
        firedNum.should.equal(1);
        eventTarget.fire('hello');
        firedNum.should.equal(1);
    });

    it('off', function(){
        let firedNum1, firedNum2;
        const eventListener1 = function(){
            firedNum1++;
        };

        const eventListener2 = function(){
            firedNum2++;
        };

        const reset = function(){
            firedNum1 = firedNum2 = 0;
            eventTarget = Object.assign({}, EventMixin);
            eventTarget.on('hello1', eventListener1);
            eventTarget.on('hello2', eventListener2);
        };

        //off all
        reset();
        eventTarget.off();
        eventTarget.fire('hello1');
        eventTarget.fire('hello2');
        firedNum1.should.equal(0);
        firedNum2.should.equal(0);

        //off type
        reset();
        eventTarget.off('hello1');
        eventTarget.fire('hello1');
        eventTarget.fire('hello2');
        firedNum1.should.equal(0);
        firedNum2.should.equal(1);

        //off listener
        reset();
        eventTarget.on('hello', eventListener1);
        eventTarget.on('hello', eventListener2);
        eventTarget.off('hello', eventListener1);
        eventTarget.fire('hello');
        firedNum1.should.equal(0);
        firedNum2.should.equal(1);
    });

    it('stopImmediatePropagation', function(){
        let isFired = false;

        var eventTargetTemp = Object.assign({}, EventMixin);
        eventTargetTemp.on('hello', function(e){
            isFired = true;
        });

        eventTarget.on('hello', function(e){
            e.stopImmediatePropagation();
            eventTargetTemp.fire(e);
        });

        eventTarget.fire('hello');
        isFired.should.be.false();
    });

});
})();

(function(){
const Fog = Hilo3d.Fog;

describe('Fog', () => {
    it('create', () => {
        const fog = new Fog();
        fog.isFog.should.be.true();
        fog.className.should.be.equal('Fog');
        fog.color.isColor.should.be.true();
        fog.start.should.equal(5);
        fog.end.should.equal(10);
        fog.mode.should.be.equal('LINEAR');
    });

    it('getInfo', () => {
        const fog = new Fog({
            start: 2,
            end: 10,
            density:0.5
        });

        fog.getInfo().should.deepEqual(new Float32Array([fog.start, fog.end]));

        fog.mode = 'EXP';
        fog.getInfo().should.deepEqual(fog.density);

    });
});
})();

(function(){
const Mesh = Hilo3d.Mesh;

describe('Mesh', () => {
    it('create', () => {
        const mesh = new Mesh();
        mesh.isMesh.should.be.true();
        mesh.className.should.equal('Mesh');
    });

    it('clone', () => {
        const mesh = new Mesh({
            geometry: new Hilo3d.BoxGeometry,
            material: new Hilo3d.Material
        });

        const clonedMesh = mesh.clone();
        clonedMesh.geometry.should.equal(mesh.geometry);
        clonedMesh.material.should.equal(mesh.material);
    });

    it('raycast', () => {
        const material = new Hilo3d.Material;
        const mesh = new Mesh({
            geometry: new Hilo3d.PlaneGeometry,
            material: material,
            side: Hilo3d.constants.FRONT
        });

        const ray = new Hilo3d.Ray({
            origin: new Hilo3d.Vector3(0, 0, 1),
            direction: new Hilo3d.Vector3(0, 0, -1)
        });

        mesh.raycast(ray)[0].elements.should.deepEqual(new Float32Array([0, 0, 0]));

        material.side = Hilo3d.constants.BACK;
        should(mesh.raycast(ray)).be.null();

        ray.origin.z = -1;
        ray. direction.z = 1;
        mesh.raycast(ray)[0].elements.should.deepEqual(new Float32Array([0, 0, 0]));
    });
});
})();

(function(){
const Node = Hilo3d.Node;

describe('Node', function() {
    it('create', () => {
        const node = new Node();
        node.isNode.should.be.true();
        node.className.should.equal('Node');
        node.up.isVector3.should.be.true();
    });

    it('clone', () => {
        const node = new Node({
            name: 'parent',
            x: 2,
            y: 3,
            z: 1,
            jointName: 'head'
        });
        node.addChild(new Node({
            name: 'child0'
        }));

        const clonedNode = node.clone();
        clonedNode.name.should.equal(node.name);
        clonedNode.x.should.equal(node.x);
        clonedNode.y.should.equal(node.y);
        clonedNode.z.should.equal(node.z);
        clonedNode.jointName.should.equal(node.jointName);
        clonedNode.children[0].name.should.equal('child0');
    });

    it('getChildrenNameMap', () => {
        const node = new Node({
            name: 'a1'
        });

        const b1 = new Node({
            name: 'b1'
        });

        const b2 = new Node({
            name: 'b2'
        });

        const b3 = new Node({
            name: 'b3'
        });

        node.addChild(b1);
        node.addChild(b2);
        node.addChild(b3);

        const map = node.getChildrenNameMap();
        map.b1.should.equal(b1);
        map.b2.should.equal(b2);
        map.b3.should.equal(b3);
        should(map.a1).be.undefined();
    });

    it('getChild', () => {
        const node = new Node({
            name: 'a1'
        });

        const b1 = new Node({
            name: 'b1'
        });

        const b2 = new Node({
            name: 'b2'
        });

        const b3 = new Node({
            name: 'b3',
            id: 'hhh'
        });

        const b4 = new Node({
            name: 'b4'
        });

        const b5 = new Node({
            name: 'b5'
        });

        const b6 = new Node({
            name: 'b6'
        });

        node.addChild(b1);
        node.addChild(b2);
        node.addChild(b3);
        b3.addChild(b4);
        b4.addChild(b5);
        b5.addChild(b6);

        node.getChildByFn(child => child.name === 'b1').should.equal(b1);
        node.getChildByFn(child => child.name === 'b5').should.equal(b5);
        node.getChildByFnBFS(child => child.name === 'b1').should.equal(b1);
        node.getChildByFnBFS(child => child.name === 'b6').should.equal(b6);
        node.getChildrenByFn(child => child.name === 'b5')[0].should.equal(b5);
        node.getChildByName('b2').should.equal(b2);
        node.getChildrenByName('b2')[0].should.equal(b2);
        node.getChildById('hhh').should.equal(b3);
        node.getChildrenByClassName('Node')[0].should.equal(b1);
        node.getChildByNamePath(['b3']).should.equal(b3);
        node.getChildByNamePath(['b3', 'b5']).should.equal(b5);
        should(node.getChildByNamePath(['b3', 'b5', 'b2'])).be.null();
    });

    it('traverse_path', () => {
        const node = new Node({
            name: 'r'
        });

        const a = new Node({
            name: 'a'
        });

        const b = new Node({
            name: 'b'
        });

        const c = new Node({
            name: 'c'
        });

        const a0 = new Node({
            name: 'a0'
        });

        const b0 = new Node({
            name: 'b0'
        });

        const c0 = new Node({
            name: 'c0'
        });

        const a1 = new Node({
            name: 'a1'
        });

        const b1 = new Node({
            name: 'b1'
        });

        const b2 = new Node({
            name: 'b2'
        });

        const c1 = new Node({
            name: 'c1'
        });

        node.addChild(a);
        node.addChild(b);
        node.addChild(c);
        a.addChild(a0);
        b.addChild(b0);
        c.addChild(c0);
        a0.addChild(a1);
        b0.addChild(b1);
        b0.addChild(b2);
        c0.addChild(c1);

        /**
        *         r
        *       / | \
        *      a  b  c
        *     /   |   \
        *   a0    b0   c0
        *   /    /  \   \
        *  a1   b1  b2   c1
        */

        let res = [];
        node.traverse((node) => {
            res.push(node.name);
        });
        res.join('-').should.equal('r-a-a0-a1-b-b0-b1-b2-c-c0-c1');

        res = [];
        node.traverse((node) => {
            res.push(node.name);
        }, true);
        res.join('-').should.equal('a-a0-a1-b-b0-b1-b2-c-c0-c1');

        res = [];
        node.traverse((node) => {
            res.push(node.name);
            return Node.TRAVERSE_STOP_NONE;
        }, true);
        res.join('-').should.equal('a-a0-a1-b-b0-b1-b2-c-c0-c1');

        res = [];
        node.traverse((node) => {
            res.push(node.name);
            if (node.name === 'b0') {
                return Node.TRAVERSE_STOP_ALL;
            }
        }, true);
        res.join('-').should.equal('a-a0-a1-b-b0');

        res = [];
        node.traverse((node) => {
            res.push(node.name);
            if (node.name === 'b0') {
                return Node.TRAVERSE_STOP_CHILDREN;
            }
        }, true);
        res.join('-').should.equal('a-a0-a1-b-b0-c-c0-c1');

        // traverseBFS
        res = [];
        node.traverseBFS((node) => {
            res.push(node.name);
        });
        res.join('-').should.equal('r-a-b-c-a0-b0-c0-a1-b1-b2-c1');

        res = [];
        node.traverseBFS((node) => {
            res.push(node.name);
        }, true);
        res.join('-').should.equal('a-b-c-a0-b0-c0-a1-b1-b2-c1');

        res = [];
        node.traverseBFS((node) => {
            res.push(node.name);
            return Node.TRAVERSE_STOP_NONE
        }, true);
        res.join('-').should.equal('a-b-c-a0-b0-c0-a1-b1-b2-c1');

        res = [];
        node.traverseBFS((node) => {
            res.push(node.name);
            if (node.name === 'b0'){
                return Node.TRAVERSE_STOP_ALL
            }
        }, true);
        res.join('-').should.equal('a-b-c-a0-b0');

        res = [];
        node.traverseBFS((node) => {
            res.push(node.name);
            if (node.name === 'b0'){
                return Node.TRAVERSE_STOP_CHILDREN
            }
        }, true);
        res.join('-').should.equal('a-b-c-a0-b0-c0-a1-c1');
    });

    it('traverse', () => {
        const node = new Node({
            name: 'a1'
        });

        const b1 = new Node({
            name: 'b1'
        });

        const b2 = new Node({
            name: 'b2'
        });

        const b3 = new Node({
            name: 'b3',
            id: 'hhh'
        });

        node.addChild(b1);
        node.addChild(b2);
        node.addChild(b3);
        b3.addChild(new Node());

        const callback = sinon.stub();
        node.traverse(callback);
        callback.should.have.callCount(5);

        callback.reset();
        callback.onCall(0).returns(true);
        node.traverse(callback);
        callback.should.have.callCount(1);

        callback.reset();
        callback.onCall(3).returns(true);
        node.traverse(callback);
        callback.should.have.callCount(4);
    });

    it('traverseBFS', () => {
        const node = new Node({
            name: 'a1'
        });

        const b1 = new Node({
            name: 'b1'
        });

        const b2 = new Node({
            name: 'b2'
        });

        const b3 = new Node({
            name: 'b3',
            id: 'hhh'
        });

        node.addChild(b1);
        node.addChild(b2);
        node.addChild(b3);
        b3.addChild(new Node());

        const callback = sinon.stub();
        node.traverseBFS(callback);
        callback.should.have.callCount(5);

        callback.reset();
        callback.onCall(0).returns(true);
        node.traverseBFS(callback);
        callback.should.have.callCount(1);

        callback.reset();
        callback.onCall(3).returns(true);
        node.traverseBFS(callback);
        callback.should.have.callCount(4);
    });

    it('traverseUpdate', () => {
        const node = new Node();
        const b1 = new Node();
        const b2 = new Node();
        const b3 = new Node();
        const c1 = new Node();

        node.addChild(b1);
        node.addChild(b2);
        node.addChild(b3);
        b3.addChild(c1);

        let onUpdate = sinon.stub();

        node.onUpdate = onUpdate;
        b1.onUpdate = onUpdate;
        b2.onUpdate = onUpdate;
        b3.onUpdate = onUpdate;
        c1.onUpdate = onUpdate;

        node.traverseUpdate();
        onUpdate.should.have.callCount(5);

        onUpdate.reset();
        b3.needCallChildUpdate = false;
        node.traverseUpdate();
        onUpdate.should.have.callCount(4);

        onUpdate.reset();
        node.needCallChildUpdate = false;
        node.traverseUpdate();
        onUpdate.should.have.callCount(1);
    });
});
})();

(function(){
const SkinedMesh = Hilo3d.SkinedMesh;

describe('SkinedMesh', () => {
    it('create', () => {
        const mesh = new SkinedMesh;
        mesh.isSkinedMesh.should.be.true();
        mesh.className.should.equal('SkinedMesh');
    })
});
})();

(function(){
const Stage = Hilo3d.Stage;
const WebGLRenderer = Hilo3d.WebGLRenderer;

describe('Stage', () => {
    it('create', () => {
        const stage = new Stage({});
        stage.isStage.should.be.true();
        stage.className.should.equal('Stage');
        stage.width.should.equal(innerWidth);
        stage.height.should.equal(innerHeight);
        stage.pixelRatio.should.aboveOrEqual(1);
        stage.pixelRatio.should.belowOrEqual(2);
        stage.renderer.should.instanceOf(WebGLRenderer);
    });

    it('resize', () => {
        const stage = new Stage({
            width: 800,
            height: 600
        });

        stage.resize(1000, 800, 2);
        stage.width.should.equal(1000);
        stage.height.should.equal(800);
        stage.pixelRatio.should.equal(2);
        stage.rendererWidth.should.equal(2000);
        stage.rendererHeight.should.equal(1600);
        stage.canvas.style.width.should.equal('1000px');
        stage.canvas.style.height.should.equal('800px');
    });
});
})();

(function(){
const Tween = Hilo3d.Tween;
const Ease = Hilo3d.Tween.Ease;
const Ticker = Hilo3d.Ticker;

describe('Tween', function(){
    describe('Tween', function(){
        var ticker = new Ticker(60);
        ticker.addTick(Tween);
        ticker.start();

        var obj;
        beforeEach('init obj', function(){
            obj = {x:0,y:0};
        });

        it('fromTo', function(done){
            var startTime = Date.now();
            Tween.fromTo(obj, {
                x:50, y:50
            }, {
                x:100, y:100
            },{
                duration:300,
                delay:200,
                onStart:function(){
                    try{
                        (Date.now() - startTime).should.be.within(180, 250);
                        obj.should.eql({x:50, y:50});
                    }
                    catch(e){
                        done(e);
                    }
                },
                onComplete:function(){
                    try{
                        (Date.now() - startTime).should.be.within(460, 600);
                        obj.should.eql({x:100, y:100});
                        done();
                    }
                    catch(e){
                        done(e);
                    }
                }
            });
        });

        it('add & remove', function(){
            var tween = new Tween(obj, {}, {});
            Tween.add(tween);
            tween.should.be.equalOneOf(Tween._tweens);
            Tween.remove(tween);
            tween.should.not.be.equalOneOf(Tween._tweens);
        });

        it('removeAll', function(){
            Tween.add(new Tween(obj, {}, {}));
            Tween.add(new Tween(obj, {}, {}));
            Tween.add(new Tween(obj, {}, {}));
            Tween.removeAll();
            Tween._tweens.length.should.equal(0);
        });

        it('seek', function(){
            var tween = new Tween(obj, {x:0, y:0}, {x:100, y:100}, {paused:true, duration:1});
            tween.seek(0);
            obj.should.eql({x:0, y:0});
            tween.seek(0.8);
            obj.should.eql({x:80, y:80});
            tween.seek(1);
            obj.should.eql({x:100, y:100});
        });

    });

    describe('Ease', function(){
        var easeTypeNames = ['Linear', 'Quad', 'Cubic', 'Quart', 'Quint', 'Sine', 'Expo', 'Circ', 'Elastic', 'Back', 'Bounce'];
        var easeFunctionNames = ['EaseNone', 'EaseIn', 'EaseOut', 'EaseInOut'];

        easeTypeNames.forEach(function(easeTypeName){
            var easeType = Ease[easeTypeName];
            it(easeTypeName, function(){
                easeFunctionNames.forEach(function(easeFunctionName){
                    var easeFunction = easeType[easeFunctionName];
                    if(easeFunction){
                        Math.abs(easeFunction(0) - 0).should.belowOrEqual(0.000999);
                        Math.abs(easeFunction(1) - 1).should.belowOrEqual(0.000999);
                    }
                });
            });
        });
    });
});

})();

(function(){
describe('display:geometry', () => {
    const camera = new Hilo3d.PerspectiveCamera({
        aspect: innerWidth / innerHeight,
        far: 100,
        near: 0.1,
        z: 3
    });

    const stage = new Hilo3d.Stage({
        container: document.querySelector('#stage'),
        camera: camera,
        clearColor: new Hilo3d.Color(1, 1, 1),
        width: innerWidth,
        height: innerHeight
    });

    var directionLight = new Hilo3d.DirectionalLight({
        color: new Hilo3d.Color(1, 1, 1),
        direction: new Hilo3d.Vector3(0.7, -1, -0.5)
    }).addTo(stage);

    var ambientLight = new Hilo3d.AmbientLight({
        color: new Hilo3d.Color(1, 1, 1),
        amount: .5
    }).addTo(stage);

    const material = new Hilo3d.BasicMaterial();

    const mesh = new Hilo3d.Mesh({
        material: material,
        rotationX: -60,
        rotationY: 30
    });

    stage.addChild(mesh);

    describe('color', () => {
        beforeEach('init color', () => {
            material.diffuse = new Hilo3d.Color(0.3, 0.6, 0.9);
        });

        it('box', (done) => {
            mesh.geometry = new Hilo3d.BoxGeometry();
            stage.tick();
            utils.diffWithScreenshot('geometry-color-box', done);
        });

        it('sphere', (done) => {
            mesh.geometry = new Hilo3d.SphereGeometry();
            stage.tick();
            utils.diffWithScreenshot('geometry-color-sphere', done);
        });

        it('plane', (done) => {
            mesh.geometry = new Hilo3d.PlaneGeometry();
            stage.tick();
            utils.diffWithScreenshot('geometry-color-plane', done);
        });
    });

    describe('texture', () => {
        const texture = new Hilo3d.Texture();
        const loader = new Hilo3d.TextureLoader();

        beforeEach('load image', (done) => {
            material.diffuse = texture;
            material.id = Hilo3d.math.generateUUID('BasicMaterial');
            loader.load({
                src: './asset/images/logo.png'
            }).then((texture) => {
                material.diffuse = texture;
                done();
            })
        });

        it('box', (done) => {
            mesh.geometry = new Hilo3d.BoxGeometry();
            mesh.geometry.setAllRectUV([
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0]
            ]);
            stage.tick();
            utils.diffWithScreenshot('geometry-texture-box', done);
        });

        it('sphere', (done) => {
            mesh.geometry = new Hilo3d.SphereGeometry();
            stage.tick();
            utils.diffWithScreenshot('geometry-texture-sphere', done);
        });

        it('plane', (done) => {
            mesh.geometry = new Hilo3d.PlaneGeometry();
            stage.tick();
            utils.diffWithScreenshot('geometry-texture-plane', done);
        });
    });
});
})();

(function(){
const BoxGeometry = Hilo3d.BoxGeometry;

describe('BoxGeometry', () => {
    it('create', () => {
        const geometry = new BoxGeometry;
        geometry.isBoxGeometry.should.be.true();
        geometry.className.should.equal('BoxGeometry');
    });
});
})();

(function(){
const Geometry = Hilo3d.Geometry;

describe('Geometry', () => {
    it('create', () => {
        const geometry = new Geometry;
        geometry.isGeometry.should.be.true();
        geometry.className.should.equal('Geometry');
    });
});
})();

(function(){
const GeometryData = Hilo3d.GeometryData;

describe('GeometryData', () => {
    it('create', () => {
        const data = new GeometryData;
        data.isGeometryData.should.be.true();
        data.className.should.equal('GeometryData');
    });

    const testData = new GeometryData(new Float32Array([
        1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30
    ]), 3, {
        stride: 16,
        offset: 4
    });

    it('stride & strideSize', () => {
        testData.stride.should.equal(16);
        testData.strideSize.should.equal(4);
    });

    it('offset & offsetSize', () => {
        testData.offset.should.equal(4);
        testData.offsetSize.should.equal(1);
    });

    it('data', () => {
        testData.type.should.equal(Hilo3d.constants.FLOAT);
    });

    it('length & realLength & count', () => {
        testData.length.should.equal(16);
        testData.realLength.should.equal(12);
        testData.count.should.equal(4);
    });

    it('getOffset', () => {
        testData.getOffset(1).should.equal(5);
    });

    it('get & set', () => {
        testData.get(1).elements.should.deepEqual(new Float32Array([10, 12, 14]));
        testData.set(1, new Hilo3d.Vector3(55, 66, 77));
        testData.get(1).elements.should.deepEqual(new Float32Array([55, 66, 77]));
        testData.set(1, new Hilo3d.Vector3(10, 12, 14));
    });

    it('getByOffset & setByOffset', () => {
        testData.getByOffset(5).elements.should.deepEqual(new Float32Array([10, 12, 14]));
        testData.setByOffset(3, new Hilo3d.Vector3(55, 66, 77));
        testData.getByOffset(3).elements.should.deepEqual(new Float32Array([55, 66, 77]));
        testData.setByOffset(3, new Hilo3d.Vector3(6, 8, 10));
    });

    it('traverse & traverseByComponent', () => {
        let callback = sinon.spy((attribute, index, offset) => {
            offset.should.equal(index * 4 + 1);
            attribute.elements.should.deepEqual(new Float32Array([offset * 2, (offset + 1) * 2, (offset + 2) * 2]));
        });
        testData.traverse(callback);
        callback.callCount.should.equal(4);

        callback = sinon.spy((data, index, offset) => {
            data.should.equal(offset * 2);
            offset.should.equal(Math.floor(index/3) * 4 + index%3 + 1);
        });
        testData.traverseByComponent(callback);
        callback.callCount.should.equal(12);
    });
});
})();

(function(){
const MorphGeometry = Hilo3d.MorphGeometry;

describe('MorphGeometry', () => {
    it('create', () => {
        const geometry = new MorphGeometry;
        geometry.isMorphGeometry.should.be.true();
        geometry.className.should.equal('MorphGeometry');
    });
});
})();

(function(){
const PlaneGeometry = Hilo3d.PlaneGeometry;

describe('PlaneGeometry', () => {
    it('create', () => {
        const geometry = new PlaneGeometry;
        geometry.isPlaneGeometry.should.be.true();
        geometry.className.should.equal('PlaneGeometry');
    });
});
})();

(function(){
const SphereGeometry = Hilo3d.SphereGeometry;

describe('SphereGeometry', () => {
    it('create', () => {
        const geometry = new SphereGeometry;
        geometry.isSphereGeometry.should.be.true();
        geometry.className.should.equal('SphereGeometry');
    });
});
})();

(function(){
const AxisHelper = Hilo3d.AxisHelper;

describe('AxisHelper', () => {
    it('create', () => {
        const helper = new AxisHelper;
        helper.isAxisHelper.should.be.true();
        helper.className.should.equal('AxisHelper');
    });
});
})();

(function(){
const AxisNetHelper = Hilo3d.AxisNetHelper;

describe('AxisNetHelper', () => {
    it('create', () => {
        const helper = new AxisNetHelper;
        helper.isAxisNetHelper.should.be.true();
        helper.className.should.equal('AxisNetHelper');
    });
});
})();

(function(){
const CameraHelper = Hilo3d.CameraHelper;

describe('CameraHelper', () => {
    it('create', () => {
        const helper = new CameraHelper;
        helper.isCameraHelper.should.be.true();
        helper.className.should.equal('CameraHelper');
    });
});
})();

(function(){
const AmbientLight = Hilo3d.AmbientLight;

describe('AmbientLight', () => {
    it('create', () => {
        const light = new AmbientLight();
        light.isAmbientLight.should.be.true();
        light.className.should.equal('AmbientLight');
        light.amount.should.be.Number();
    });
});
})();

(function(){
const DirectionalLight = Hilo3d.DirectionalLight;

describe('DirectionalLight', () => {
    it('create', () => {
        const light = new DirectionalLight();
        light.isDirectionalLight.should.be.true();
        light.className.should.equal('DirectionalLight');
        light.direction.isVector3.should.be.true();
    });

    it('createShadowMap', () => {
        const light = new DirectionalLight({
            shadow:{
                minBias:0.01,
                maxBias:0.1
            }
        });

        const env = utils.createHilo3dEnv();
        light.createShadowMap(env.renderer, env.camera);
        light.lightShadow.isLightShadow.should.be.true();
    });

    it('getWorldDirection', () => {
        const light = new DirectionalLight({
            direction:new Hilo3d.Vector3(0, 0.5, 0)
        });
        light.getWorldDirection().elements.should.deepEqual(new Float32Array([0, 1, 0]));
    });

    it('getViewDirection', () => {
        const camera = new Hilo3d.Camera({
            rotationX:180
        });
        camera.updateViewMatrix();

        const light = new DirectionalLight({
            direction:new Hilo3d.Vector3(0, 0.5, 0)
        });
        light.getViewDirection(camera).equals(new Hilo3d.Vector3(0, -1, 0)).should.be.true();
    });
});
})();

(function(){
const Light = Hilo3d.Light;

describe('Light', () => {
    it('create', () => {
        const light = new Light();
        light.isLight.should.be.true();
        light.className.should.equal('Light');
        light.color.isColor.should.be.true();
    });
});
})();

(function(){
const LightManager = Hilo3d.LightManager;

describe('LightManager', () => {
    it('create', () => {
        const ligthManager = new LightManager;
        ligthManager.isLightManager.should.be.true();
        ligthManager.className.should.equal('LightManager');

        ligthManager.ambientLights.should.be.Array();
        ligthManager.directionalLights.should.be.Array();
        ligthManager.pointLights.should.be.Array();
        ligthManager.spotLights.should.be.Array();
    });

    it('getShadowMapCount & reset', () => {
        const ligthManager = new LightManager;
        ligthManager.addLight(new Hilo3d.PointLight({
            shadow:{}
        }));
        ligthManager.addLight(new Hilo3d.PointLight());
        ligthManager.addLight(new Hilo3d.PointLight({
            shadow:{}
        }));

        ligthManager.getShadowMapCount('POINT_LIGHTS').should.equal(2);

        ligthManager.reset();
        ligthManager.getShadowMapCount('POINT_LIGHTS').should.equal(0);
    });

    it('getRenderOption', () => {
        const ligthManager = new LightManager();
        should(ligthManager.getRenderOption().HAS_LIGHT).be.Undefined();
        ligthManager.addLight(new Hilo3d.PointLight);
        ligthManager.addLight(new Hilo3d.PointLight);
        ligthManager.addLight(new Hilo3d.SpotLight);
        ligthManager.updateInfo(new Hilo3d.Camera);
        should(ligthManager.getRenderOption().HAS_LIGHT).be.equal(1);
        should(ligthManager.getRenderOption().POINT_LIGHTS).be.equal(2);
    });
});
})();

(function(){
const LightShadow = Hilo3d.LightShadow;

describe('LightShadow', () => {
    it('create', ()=>{
        const lightShadow = new LightShadow();
        lightShadow.isLightShadow.should.be.true();
        lightShadow.className.should.equal('LightShadow');
    });

    it('createFramebuffer', ()=>{
        const lightShadow = new LightShadow();
        lightShadow.createFramebuffer();
        lightShadow.framebuffer.isFramebuffer.should.be.true();
        lightShadow.framebuffer.width.should.equal(lightShadow.width);
        lightShadow.framebuffer.height.should.equal(lightShadow.height);
    });
});
})();

(function(){
const PointLight = Hilo3d.PointLight;

describe('PointLight', () => {
    it('create', () => {
        const light = new PointLight();
        light.isPointLight.should.be.true();
        light.className.should.equal('PointLight');
        light.constantAttenuation.should.be.Number();
        light.linearAttenuation.should.be.Number();
        light.quadraticAttenuation.should.be.Number();
    });

    it('toInfoArray', () => {
        const light = new PointLight({
            constantAttenuation:0.1,
            linearAttenuation:0.2,
            quadraticAttenuation:0.3
        });

        const res = [];
        light.toInfoArray(res, 3);
        res[3].should.equal(light.constantAttenuation);
        res[4].should.equal(light.linearAttenuation);
        res[5].should.equal(light.quadraticAttenuation);
    });
});
})();

(function(){
const SpotLight = Hilo3d.SpotLight;

describe('SpotLight', () => {
    it('create', () => {
        const light = new SpotLight({
            cutoff:30,
            outerCutoff:45
        });
        light.isSpotLight.should.be.true();
        light.className.should.equal('SpotLight');
        light.direction.isVector3.should.be.true();
        light.constantAttenuation.should.be.Number();
        light.linearAttenuation.should.be.Number();
        light.quadraticAttenuation.should.be.Number();
        light.outerCutoff.should.be.Number();
        light.cutoff.should.be.Number();
        light._outerCutoffCos.should.equal(Math.cos(Hilo3d.math.degToRad(light.outerCutoff)));
        light._cutoffCos.should.equal(Math.cos(Hilo3d.math.degToRad(light.cutoff)));
    });

    it('toInfoArray', () => {
        const light = new SpotLight({
            constantAttenuation:0.1,
            linearAttenuation:0.2,
            quadraticAttenuation:0.3
        });

        const res = [];
        light.toInfoArray(res, 3);
        res[3].should.equal(light.constantAttenuation);
        res[4].should.equal(light.linearAttenuation);
        res[5].should.equal(light.quadraticAttenuation);
    });

    it('createShadowMap', () => {
        const light = new SpotLight({
            shadow:{
                minBias:0.01,
                maxBias:0.1
            }
        });

        const env = utils.createHilo3dEnv();
        light.createShadowMap(env.renderer, env.camera);
        light.lightShadow.isLightShadow.should.be.true();
    });

    it('getWorldDirection', () => {
        const light = new SpotLight({
            direction:new Hilo3d.Vector3(0, 0.5, 0)
        });
        light.getWorldDirection().elements.should.deepEqual(new Float32Array([0, 1, 0]));
    });

    it('getViewDirection', () => {
        const camera = new Hilo3d.Camera({
            rotationX:180
        });
        camera.updateViewMatrix();

        const light = new SpotLight({
            direction:new Hilo3d.Vector3(0, 0.5, 0)
        });
        light.getViewDirection(camera).equals(new Hilo3d.Vector3(0, -1, 0)).should.be.true();
    });
});
})();

(function(){
const BasicLoader = Hilo3d.BasicLoader;

describe('BasicLoader', () => {
    it('create', () => {
        const loader = new BasicLoader;
        loader.isBasicLoader.should.be.true();
        loader.className.should.equal('BasicLoader');
    });
});
})();

(function(){
const CubeTextureLoader = Hilo3d.CubeTextureLoader;

describe('CubeTextureLoader', () => {
    it('create', () => {
        const loader = new CubeTextureLoader;
        loader.isCubeTextureLoader.should.be.true();
        loader.className.should.equal('CubeTextureLoader');
    });
});
})();

(function(){
const GLTFLoader = Hilo3d.GLTFLoader;

describe('GLTFLoader', () => {
    it('create', () => {
        const loader = new GLTFLoader;
        loader.isGLTFLoader.should.be.true();
        loader.className.should.equal('GLTFLoader');
    });
});
})();

(function(){
const GLTFParser = Hilo3d.GLTFParser;

describe('GLTFParser', () => {
    it('create', () => {
        const parser = new GLTFParser;
        parser.isGLTFParser.should.be.true();
        parser.className.should.equal('GLTFParser');
    });

    it('register & unregister ExtensionHandler', () => {
        const parser = new GLTFParser;
        should(parser.getExtensionHandler('hello')).be.undefined();
        
        GLTFParser.registerExtensionHandler('hello', {
            parse(){

            }
        });
        should(parser.getExtensionHandler('hello')).not.be.undefined();
        should(parser.getExtensionHandler('hello2')).be.undefined();
        
        GLTFParser.unregisterExtensionHandler('hello');
        should(parser.getExtensionHandler('hello')).be.undefined();
    });
});
})();

(function(){
const HDRLoader = Hilo3d.HDRLoader;

describe('HDRLoader', () => {
    it('create', () => {
        const loader = new HDRLoader;
        loader.isHDRLoader.should.be.true();
        loader.className.should.equal('HDRLoader');
    });
});
})();

(function(){
const KTXLoader = Hilo3d.KTXLoader;

describe('KTXLoader', () => {
    it('create', () => {
        const loader = new KTXLoader;
        loader.isKTXLoader.should.be.true();
        loader.className.should.equal('KTXLoader');
    });
});
})();

(function(){
const LoadCache = Hilo3d.LoadCache;

describe('LoadCache', () => {
    it('create', () => {
        const cache = new LoadCache;
        cache.isLoadCache.should.be.true();
        cache.className.should.equal('LoadCache');
    });
});
})();

(function(){
const LoadQueue = Hilo3d.LoadQueue;

describe('LoadQueue', () => {
    it('create', () => {
        const queue = new LoadQueue;
        queue.isLoadQueue.should.be.true();
        queue.className.should.equal('LoadQueue');
    });
});
})();

(function(){
const ShaderMaterialLoader = Hilo3d.ShaderMaterialLoader;

describe('ShaderMaterialLoader', () => {
    it('create', () => {
        const loader = new ShaderMaterialLoader;
        loader.isShaderMaterialLoader.should.be.true();
        loader.className.should.equal('ShaderMaterialLoader');
    });
});
})();

(function(){
const TextureLoader = Hilo3d.TextureLoader;

describe('TextureLoader', () => {
    it('create', () => {
        const loader = new TextureLoader;
        loader.isTextureLoader.should.be.true();
        loader.className.should.equal('TextureLoader');
    });
});
})();

(function(){
const BasicMaterial = Hilo3d.BasicMaterial;

describe('BasicMaterial', () => {
    it('create', () => {
        const material = new BasicMaterial();
        material.isBasicMaterial.should.be.true();
        material.className.should.equal('BasicMaterial');
    });

    it('getRenderOption', () => {
        const material = new BasicMaterial({
            lightType:'BLINN-PHONG',
            specular:new Hilo3d.Texture
        });

        let option = material.getRenderOption();
        option.HAS_SPECULAR.should.equal(1);
        should(option.HAS_TEXCOORD0).undefined();

        option.HAS_LIGHT = 1;
        option = material.getRenderOption(option);
        option.HAS_TEXCOORD0.should.equal(1);

    });
});
})();

(function(){
const GeometryMaterial = Hilo3d.GeometryMaterial;

describe('GeometryMaterial', () => {
    it('create', () => {
        const material = new GeometryMaterial();
        material.isGeometryMaterial.should.be.true();
        material.className.should.equal('GeometryMaterial');
        material.vertexType.should.be.String();
        material.writeOriginData.should.be.Boolean();
        material.lightType.should.equal(Hilo3d.constants.NONE);
    });

    it('getRenderOption', () => {
        let material = new GeometryMaterial({
            vertexType:Hilo3d.constants.POSITION
        });
        let option = material.getRenderOption();
        option.VERTEX_TYPE_POSITION.should.equal(1);
        option.HAS_FRAG_POS.should.equal(1);

        material = new GeometryMaterial({
            vertexType:Hilo3d.constants.NORMAL
        });
        option = material.getRenderOption();
        option.VERTEX_TYPE_NORMAL.should.equal(1);
        option.HAS_NORMAL.should.equal(1);

        material = new GeometryMaterial({
            vertexType:Hilo3d.constants.DEPTH,
            writeOriginData:true
        });
        option = material.getRenderOption();
        option.VERTEX_TYPE_DEPTH.should.equal(1);
        option.WRITE_ORIGIN_DATA.should.equal(1);
    });
});
})();

(function(){
const Material = Hilo3d.Material;
const constants = Hilo3d.constants;

describe('Material', () => {
    it('create', () => {
        const material = new Material();
        material.isMaterial.should.be.true();
        material.className.should.equal('Material');
    });

    it('clone', () => {
        const material = new Material({
            diffuse:new Hilo3d.Color(),
            transparent:true
        });

        const clonedMaterial = material.clone();
        clonedMaterial.diffuse.elements.should.equal(material.diffuse.elements);
        clonedMaterial.transparent.should.equal(material.transparent);
    });

    it('side & cullFace', () => {
        const material = new Material;

        material.side = constants.FRONT;
        material.cullFace.should.be.true();
        material.cullFaceType.should.equal(constants.BACK);

        material.side = constants.FRONT_AND_BACK;
        material.cullFace.should.be.false();

        material.side = constants.BACK;
        material.cullFace.should.be.true();
        material.cullFaceType.should.equal(constants.FRONT);

        material.cullFaceType = constants.BACK;
        material.side.should.equal(constants.FRONT);

        material.cullFace = false;
        material.side.should.equal(constants.FRONT_AND_BACK);
    });

    it('transparent', () => {
        const material = new Material;

        material.transparent = true;
        material.blend.should.be.true();
        material.blendSrc.should.equal(constants.ONE);
        material.blendDst.should.equal(constants.ONE_MINUS_SRC_ALPHA);
        material.blendSrcAlpha.should.equal(constants.ONE);
        material.blendDstAlpha.should.equal(constants.ONE_MINUS_SRC_ALPHA);
        material.depthMask.should.be.false();

        material.transparent = false;
        material.blend.should.be.false();
        material.depthMask.should.be.true();
    });

    it('getRenderOption', () => {
        const material = new Material({
            normalMap:new Hilo3d.Texture({
                uv:1
            }),
            alphaCutoff:0.8
        });

        const option = material.getRenderOption({
            HAS_LIGHT:1
        });
        option.NORMAL_MAP.should.equal(1);
        option.HAS_TEXCOORD1.should.equal(1);
        should(option.HAS_TEXCOORD0).be.undefined();
        option.ALPHA_CUTOFF.should.equal(1);
    });

    it('gammaCorrection', () => {
        let material = new Material();

        material.gammaCorrection.should.be.false();
        material.gammaOutput.should.be.false();
        should(material.getRenderOption().GAMMA_CORRECTION).be.undefined();

        material.gammaCorrection = true;
        material.gammaOutput.should.be.true();
        should(material.getRenderOption().GAMMA_CORRECTION).be.equal(1);

        material.gammaOutput = false;
        material.gammaCorrection.should.be.false();
        should(material.getRenderOption().GAMMA_CORRECTION).be.undefined();
    });
});
})();

(function(){
const PBRMaterial = Hilo3d.PBRMaterial;

describe('PBRMaterial', () => {
    it('create', () => {
        const material = new PBRMaterial();
        material.isPBRMaterial.should.be.true();
        material.className.should.equal('PBRMaterial');
    });

    it('getRenderOption', () => {
        const material = new PBRMaterial({
            metallicRoughnessMap:new Hilo3d.Texture({
                uv:0
            }),
            baseColorMap:new Hilo3d.Texture({
                uv:1
            }),
            specularEnvMap:new Hilo3d.Texture,
            isSpecularGlossiness:true
        });

        const option = material.getRenderOption();
        option.HAS_TEXCOORD0.should.equal(1);
        option.METALLIC_ROUGHNESS_MAP.should.equal(0);

        option.HAS_TEXCOORD1.should.equal(1);
        option.BASE_COLOR_MAP.should.equal(1);

        option.PBR_SPECULAR_GLOSSINESS.should.equal(1);
        should(option.SPECULAR_ENV_MAP).be.undefined();

        material.brdfLUT = new Hilo3d.Texture;
        material.getRenderOption().SPECULAR_ENV_MAP.should.equal(0);
        should(material.getRenderOption().SPECULAR_ENV_MAP_CUBE).be.undefined();

        material.specularEnvMap = new Hilo3d.CubeTexture;
        material.getRenderOption().SPECULAR_ENV_MAP_CUBE.should.equal(1);
    });

    it('gammaCorrection', () => {
        let material = new PBRMaterial();

        material.gammaCorrection.should.be.true();
        material.gammaOutput.should.be.true();
        should(material.getRenderOption().GAMMA_CORRECTION).be.equal(1);

        material.gammaOutput = false;
        material.gammaCorrection.should.be.false();
        should(material.getRenderOption().GAMMA_CORRECTION).be.undefined();

        material.gammaCorrection = true;
        material.gammaOutput.should.be.true();
        should(material.getRenderOption().GAMMA_CORRECTION).be.equal(1);
    });
});
})();

(function(){
const ShaderMaterial = Hilo3d.ShaderMaterial;

describe('ShaderMaterial', () => {
    it('create', () => {
        const material = new ShaderMaterial();
        material.isShaderMaterial.should.be.true();
        material.className.should.equal('ShaderMaterial');
        material.vs.should.be.String();
        material.fs.should.be.String();
    });

    it('getRenderOption', () => {
        const material = new ShaderMaterial({
            getCustomRenderOption:function(option){
                return Object.assign(option, {
                    TEST:1
                });
            }
        });

        const options = {
            INIT:1
        };
        material.getRenderOption(options);

        options.INIT.should.equal(1);
        options.HILO_CUSTUM_OPTION_TEST.should.equal(1);
    });
});
})();

(function(){
var Color = Hilo3d.Color;

describe('Color', () => {
    var colorA;
    beforeEach(() => {
        colorA = new Color(1, 2, 3, 4);
    });

    it('create', () => {
        colorA.isColor.should.be.true();
        colorA.className.should.equal('Color');
        colorA.r.should.equal(1);
        colorA.g.should.equal(2);
        colorA.b.should.equal(3);
        colorA.a.should.equal(4);
    });

    it('toRGBArray', () => {
        var arr = [];
        colorA.toRGBArray(arr, 2);
        arr[2].should.equal(1);
        arr[3].should.equal(2);
        arr[4].should.equal(3);
    });

    it('fromUintArray', () => {
        var arr = [0, 0, 255, 128, 255, 128];
        colorA.fromUintArray(arr, 2).elements.should.equalishValues(1, 128/255, 1, 128/255);
    });

    it('fromHEX', () => {
        new Color().fromHEX(16750950).elements.should.equalishValues(1, 0.6, 0.4, 1);
        new Color().fromHEX(0xff9966).elements.should.equalishValues(1, 0.6, 0.4, 1);
        new Color().fromHEX(0x0000ff).elements.should.equalishValues(0, 0, 1, 1);
        new Color().fromHEX(0x006699).elements.should.equalishValues(0, 0.4, 0.6, 1);
        new Color().fromHEX('#ff9966').elements.should.equalishValues(1, 0.6, 0.4, 1);
        new Color().fromHEX('#f96').elements.should.equalishValues(1, 0.6, 0.4, 1);
        new Color().fromHEX('ff9966').elements.should.equalishValues(1, 0.6, 0.4, 1);
        new Color().fromHEX('f96').elements.should.equalishValues(1, 0.6, 0.4, 1);
    });

    it('toHEX', () => {
        new Color(1, 0.6, 0.4, 1).toHEX().should.equal('ff9966');
    });
});
})();

(function(){
const Euler = Hilo3d.Euler;

describe('Euler', function() {
    var eulerA, identity;

    beforeEach(() => {
        eulerA = new Euler(1, 2, 3);
        eulerA.order = 'XYZ';

        identity = new Euler();
    });

    it('create', () => {
        eulerA.isEuler.should.be.true();
        eulerA.className.should.equal('Euler');
        eulerA.elements.should.equalishValues(1, 2, 3);
        eulerA.x.should.equal(1);
        eulerA.y.should.equal(2);
        eulerA.z.should.equal(3);
    });

    it('clone', () => {
        var euler = eulerA.clone();
        euler.order.should.equal(eulerA.order);
        euler.x.should.equal(eulerA.x);
        euler.y.should.equal(eulerA.y);
        euler.z.should.equal(eulerA.z);
    });

    it('copy', () => {
        identity.copy(eulerA);
        identity.order.should.equal(eulerA.order);
        identity.x.should.equal(eulerA.x);
        identity.y.should.equal(eulerA.y);
        identity.z.should.equal(eulerA.z);
    });

    it('set', () => {
        identity.set(1, 2, 3);
        identity.elements.should.equalishValues(1, 2, 3);
    });

    it('fromArray', () => {
        identity.fromArray([0, 0, 1, 2, 3], 2);
        identity.elements.should.equalishValues(1, 2, 3);
    });

    it('toArray', () => {
        var arr = [];
        eulerA.toArray(arr, 2);
        arr[2].should.equal(1);
        arr[3].should.equal(2);
        arr[4].should.equal(3);
    }); 

    it('fromMat4', () => {
        identity.fromMat4(new Hilo3d.Matrix4().rotateX(Math.PI*0.5));
        identity.elements.should.equalishValues(Math.PI*0.5, 0, 0);
    });

    it('fromQuat', () => {
        identity.fromQuat(new Hilo3d.Quaternion(Math.sin(Math.PI*0.25), 0, 0, Math.cos(Math.PI*0.25)));
        identity.elements.should.equalishValues(Math.PI*0.5, 0, 0);
    });
});
})();

(function(){
const Frustum =  Hilo3d.Frustum;

describe('Frustum', () => {
    var frustumA, identity;
    beforeEach(() => {
        frustumA = new Frustum();
        identity = new Frustum();

        frustumA.fromMatrix(new Hilo3d.Matrix4().perspective(Math.PI/2, 1, 0.01, 10));
    });

    it('create', () => {
        frustumA.isFrustum.should.be.true();
        frustumA.className.should.equal('Frustum');
    });

    it('copy', () => {
        identity.copy(frustumA);
        identity.planes.forEach((plane, index) => {
            plane.normal.equals(frustumA.planes[index].normal);
            plane.distance.should.equal(frustumA.planes[index].distance);
        });
    });

    it('clone', () => {
        var frustum = frustumA.clone();
        frustum.planes.forEach((plane, index) => {
            plane.normal.equals(frustumA.planes[index].normal);
            plane.distance.should.equal(frustumA.planes[index].distance);
        });
    });

    it('fromMatrix', () => {
        identity.fromMatrix(new Hilo3d.Matrix4().frustum(-1, 1, -1, 1, -1, 1));
        var planes = identity.planes;
        var sqrt5 = Math.sqrt(0.5);
        planes[0].normal.elements.should.equalishValues(sqrt5, 0, -sqrt5);
        planes[1].normal.elements.should.equalishValues(-sqrt5, 0, -sqrt5);
        planes[2].normal.elements.should.equalishValues(0, -sqrt5, -sqrt5);
        planes[3].normal.elements.should.equalishValues(0, sqrt5, -sqrt5);
        planes[4].normal.elements.should.equalishValues(0, 0, -1);
        planes[5].normal.elements.should.equalishValues(0, 0, -1);

        planes[0].distance.should.equal(0);
        planes[1].distance.should.equal(0);
        planes[2].distance.should.equal(0);
        planes[3].distance.should.equal(0);
        planes[4].distance.should.equal(-1);
        planes[5].distance.should.equal(1);
    });

    it('intersectsSphere', () => {
        identity.fromMatrix(new Hilo3d.Matrix4().frustum(-1, 1, -1, 1, -1, 1));
        
        identity.intersectsSphere(new Hilo3d.Sphere({
            center:new Hilo3d.Vector3(),
            radius:2
        })).should.be.true();
        
        identity.intersectsSphere(new Hilo3d.Sphere({
            center:new Hilo3d.Vector3(),
            radius:0.1
        })).should.be.false();
    });
});
})();

(function(){
const Matrix3 = Hilo3d.Matrix3;

describe('Matrix3', function() {
    var matA, matB, matC, matD, identity;
    beforeEach(() => {
        matA = new Matrix3();
        matB = new Matrix3();
        matC = new Matrix3();
        matD = new Matrix3();
        identity = new Matrix3();

        matA.set(1, 0, 0, 0, 1, 0, 1, 2, 1);
        matB.set(1, 0, 0, 0, 1, 0, 3, 4, 1);
        matC.set(0, 1, 2, 3, 4, 5, 6, 7, 8);
        matD.set(0, 2, 4, 6, 8, 10, 12, 14, 16);
    });

    it('create', () => {
        identity.isMatrix3.should.be.true();
        identity.className.should.equal('Matrix3');
    });

    it('copy', () => {
        new Matrix3().copy(matC).elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8);
    });

    it('clone', () => {
        matC.clone().elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8);
    });

    it('toArray', () => {
        var arr = [];
        matC.toArray(arr, 3);
        arr[3].should.equal(0);
        arr[4].should.equal(1);
        arr[5].should.equal(2);
    });

    it('fromArray', () => {
        identity.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3).elements.should.equalishValues(3, 4, 5, 6, 7, 8, 9, 10, 11);
    });

    it('set', () => {
        identity.set(0, 1, 2, 3, 4, 5, 6, 7, 8).elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8);
    });

    it('identity', () => {
        matC.identity().elements.should.equalishValues(1, 0, 0, 0, 1, 0, 0, 0, 1);
    });

    it('transpose', () => {
        matC.transpose().elements.should.equalishValues(0, 3, 6, 1, 4, 7, 2, 5, 8);
    });

    it('invert', () => {
        identity.invert(matA).elements.should.equalishValues(1, 0, 0, 0, 1, 0, -1, -2, 1);
        matA.invert().elements.should.equalishValues(1, 0, 0, 0, 1, 0, -1, -2, 1);
    });

    it('adjoint', () => {
        identity.adjoint(matA).elements.should.equalishValues(1, 0, 0, 0, 1, 0, -1, -2, 1);
        matA.adjoint().elements.should.equalishValues(1, 0, 0, 0, 1, 0, -1, -2, 1);
    });

    it('determinant', () => {
        matA.determinant().should.equalish(1);
    });

    it('multiply', () => {
        identity.multiply(matA, matB).elements.should.equalishValues( 1, 0, 0, 0, 1, 0, 4, 6, 1);
        matA.multiply(matB).elements.should.equalishValues( 1, 0, 0, 0, 1, 0, 4, 6, 1);
    });

    it('premultiply', () => {
        matB.premultiply(matA).elements.should.equalishValues( 1, 0, 0, 0, 1, 0, 4, 6, 1);
    });

    it('translate', () => {
        matA.translate(new Hilo3d.Vector2(1, 1)).elements.should.equalishValues(1, 0, 0, 0, 1, 0, 2, 3, 1);
    });

    it('rotate', () => {
        matA.rotate(Math.PI * 0.5).elements.should.equalishValues(0, 1, 0, -1, 0, 0, 1, 2, 1);
    });

    it('scale', () => {
        matA.scale(new Hilo3d.Vector2(0.5, 2)).elements.should.equalishValues(0.5, 0, 0, 0, 2, 0, 1, 2, 1);
    });

    it('fromTranslation', () => {
        identity.fromTranslation(new Hilo3d.Vector2(1, 2)).elements.should.equalishValues(1, 0, 0, 0, 1, 0, 1, 2, 1);
    });

    it('fromRotation', () => {
        identity.fromRotation(Math.PI * .5).elements.should.equalishValues(0, 1, 0, -1, 0, 0, 0, 0, 1);
    });

    it('fromScaling', () => {
        matC.fromScaling(new Hilo3d.Vector2(2, 1)).elements.should.equalishValues(2, 0, 0, 0, 1, 0, 0, 0, 1);
    });

    it('fromQuat', () => {
        matC.fromQuat(new Hilo3d.Quaternion( 0, -0.7071067811865475, 0, 0.7071067811865475)).elements.should.equalishValues(0, 0, 1, 0, 1, 0, -1, 0, 0);
    });

    it('normalFromMat4', () => {
        mat = new Hilo3d.Matrix4();
        mat.translate(new Hilo3d.Vector3(2, 4, 6));
        mat.rotateX(Math.PI / 2);
        matA.normalFromMat4(mat).elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0,-1, 0);
    });

    it('fromMat4', () => {
        mat = new Hilo3d.Matrix4();
        mat.translate(new Hilo3d.Vector3(2, 4, 6));
        mat.rotateX(Math.PI / 2);
        matA.fromMat4(mat).elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0,-1, 0);
    });

    it('frob', () => {
        matA.frob().should.equalish(Math.sqrt(Math.pow(1, 2) + Math.pow(0, 2) + Math.pow(0, 2) + Math.pow(0, 2) + Math.pow(1, 2) + Math.pow(0, 2) + Math.pow(1, 2) + Math.pow(2, 2) + Math.pow(1, 2)));
    });

    it('add', () => {
        identity.add(matC, matD).elements.should.equalishValues(0, 3, 6, 9, 12, 15, 18, 21, 24);
        matD.add(matC).elements.should.equalishValues(0, 3, 6, 9, 12, 15, 18, 21, 24);
    });

    it('subtract', () => {
        identity.subtract(matC, matD).elements.should.equalishValues(0, -1, -2, -3, -4, -5, -6, -7, -8);
        matD.subtract(matC).elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8);
    });

    it('exactEquals', () => {
        matD.set(0, 1, 2, 3, 4, 5, 6, 7, 8);
        matC.exactEquals(matD).should.be.true();
    });

    it('equals', () => {
        matD.set(0, 1, 2, 3, 4, 5, 6, 7, 8.000001);
        matC.exactEquals(matD).should.be.false();
        matC.equals(matD).should.be.true();
    });

    it('fromRotationTranslationScale', () => {
        matB.fromRotationTranslationScale(Math.PI*0.5, 2, 1, 0.1, 2).elements.should.equalishValues(0, -2, 0, 0.1, 0, 0, 2, 1, 1);
    });
});
})();

(function(){
const Matrix4 = Hilo3d.Matrix4;

describe('Matrix4', function() {
    var matA, matB, matC, matD, identity;
    beforeEach(() => {
        matA = new Matrix4();
        matB = new Matrix4();
        matC = new Matrix4();
        matD = new Matrix4();
        identity = new Matrix4();

        matA.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1);
        matB.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1);
        matC.set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
        matD.set(0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30);
    });

    it('create', () => {
        identity.isMatrix4.should.be.true();
        identity.className.should.equal('Matrix4');
    });

    it('copy', () => {
        new Matrix4().copy(matC).elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
    });

    it('clone', () => {
        matC.clone().elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
    });

    it('toArray', () => {
        var arr = [];
        matC.toArray(arr, 3);
        arr[3].should.equal(0);
        arr[4].should.equal(1);
        arr[5].should.equal(2);
    });

    it('fromArray', () => {
        identity.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 3).elements.should.equalishValues(3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18);
    });

    it('set', () => {
        identity.set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15).elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
    });

    it('identity', () => {
        matC.identity().elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    });

    it('transpose', () => {
        matC.transpose().elements.should.equalishValues(0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15);
    });

    it('invert', () => {
        identity.invert(matA).elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, -2, -3, 1);
        matA.invert().elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, -2, -3, 1);
    });

    it('adjoint', () => {
        identity.adjoint(matA).elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, -2, -3, 1);
        matA.adjoint().elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, -2, -3, 1);
    });

    it('determinant', () => {
        matA.determinant().should.equalish(1);
    });

    it('multiply', () => {
        identity.multiply(matA, matB).elements.should.equalishValues( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 7, 9, 1);
        matA.multiply(matB).elements.should.equalishValues( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 7, 9, 1);
    });

    it('premultiply', () => {
        matB.premultiply(matA).elements.should.equalishValues( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 7, 9, 1);
    });

    it('translate', () => {
        matA.translate(new Hilo3d.Vector3(4, 5, 6)).elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 7, 9, 1);
    });

    it('rotate', () => {
        var rad = Math.PI * 0.5;
        matA.rotate(rad, new Hilo3d.Vector3(1, 0, 0)).elements.should.equalishValues( 1, 0, 0, 0, 0, Math.cos(rad), Math.sin(rad), 0, 0, -Math.sin(rad), Math.cos(rad), 0, 1, 2, 3, 1);
    });

    it('rotateX', () => {
        var rad = Math.PI * 0.5;
        matA.rotateX(rad).elements.should.equalishValues( 1, 0, 0, 0, 0, Math.cos(rad), Math.sin(rad), 0, 0, -Math.sin(rad), Math.cos(rad), 0, 1, 2, 3, 1);
    });

    it('rotateY', () => {
        var rad = Math.PI * 0.5;
        matA.rotateY(rad).elements.should.equalishValues( Math.cos(rad), 0, -Math.sin(rad), 0, 0, 1, 0, 0, Math.sin(rad), 0, Math.cos(rad), 0, 1, 2, 3, 1);
    });

    it('rotateZ', () => {
        var rad = Math.PI * 0.5;
        matA.rotateZ(rad, new Hilo3d.Vector3(1, 0, 0)).elements.should.equalishValues(  Math.cos(rad), Math.sin(rad), 0, 0, -Math.sin(rad), Math.cos(rad), 0, 0, 0, 0, 1, 0, 1, 2, 3, 1);
    });

    it('fromTranslation', () => {
        identity.fromTranslation(new Hilo3d.Vector3(1, 2, 3)).elements.should.equalishValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1);
    });

    it('fromScaling', () => {
        identity.fromScaling(new Hilo3d.Vector3(2, 1, 3)).elements.should.equalishValues(2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1);
    });

    it('fromRotation', () => {
        identity.fromRotation(Math.PI*0.5, new Hilo3d.Vector3(0, 1, 0)).elements.should.equalishValues(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
    });

    it('fromXRotation', () => {
        identity.fromXRotation(Math.PI*0.5).elements.should.equalishValues(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
    });

    it('fromYRotation', () => {
        identity.fromYRotation(Math.PI*0.5).elements.should.equalishValues(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
    });

    it('fromZRotation', () => {
        identity.fromZRotation(Math.PI*0.5).elements.should.equalishValues( 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    });

    it('fromRotationTranslation', () => {
        identity.fromRotationTranslation(new Hilo3d.Quaternion(0, 0.7071067811865476, 0, 0.7071067811865476), new Hilo3d.Vector3(1, 2, 3)).elements.should.equalishValues(3.422854177870249e-8, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 2, 3, 1);
    });

    it('getTranslation', () => {
        matB.getTranslation().elements.should.equalishValues(4, 5, 6);
    });

    it('getScaling', () => {
        identity.fromScaling(new Hilo3d.Vector3(1, 2, 3)).getScaling().elements.should.equalishValues(1, 2, 3);
    });

    it('getRotation', () => {
        identity.rotateZ(Math.PI*0.5);
        identity.getRotation().elements.should.equalishValues(0, 0, Math.sqrt(2)*0.5, Math.sqrt(2)*0.5);
    });

    it('fromRotationTranslationScale', () => {
        identity.translate(new Hilo3d.Vector3(1, 2, 3));
        identity.scale(new Hilo3d.Vector3(0.1, 2, 5));
        identity.rotate(Math.PI*0.5, new Hilo3d.Vector3(1, 0, 0));

        matA.fromRotationTranslationScale(new Hilo3d.Quaternion(Math.sqrt(2)*0.5, 0, 0, Math.sqrt(2)*0.5), new Hilo3d.Vector3(1, 2, 3), new Hilo3d.Vector3(0.1, 5, 2));
        matA.equals(identity).should.be.true();
    });

    it('fromRotationTranslationScaleOrigin', () => {
        identity.translate(new Hilo3d.Vector3(5, 6, 7));
        identity.translate(new Hilo3d.Vector3(1, 2, 3));
        identity.scale(new Hilo3d.Vector3(0.1, 2, 5));
        identity.rotate(Math.PI*0.5, new Hilo3d.Vector3(1, 0, 0));
        identity.translate(new Hilo3d.Vector3(-5, -6, -7));

        matA.fromRotationTranslationScaleOrigin(new Hilo3d.Quaternion(Math.sqrt(2)*0.5, 0, 0, Math.sqrt(2)*0.5), new Hilo3d.Vector3(1, 2, 3), new Hilo3d.Vector3(0.1, 5, 2), new Hilo3d.Vector3(5, 6, 7));
        matA.equals(identity).should.be.true();
    });

    it('fromQuat', () => {
        identity.fromQuat(new Hilo3d.Quaternion(0, 0.7071067811865476, 0, 0.7071067811865476)).elements.should.equalishValues(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
    });

    it('frustum', () => {
        identity.frustum(-1, 1, -1, 1, -1, 1).elements.should.equalishValues(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0);
    });

    it('perspective', () => {
        var fovy = Math.PI * 0.5;
        identity.perspective( fovy, 1, 0, 1).elements.should.equalishValues( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0);
    });

    it('perspectiveFromFieldOfView', () => {
        var fov = 45;
        identity.perspectiveFromFieldOfView( {
            upDegrees:fov,
            downDegrees:fov,
            leftDegrees:fov,
            rightDegrees:fov
        }, 0, 1).elements.should.equalishValues( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0);
    });

    it('ortho', () => {
        identity.ortho(-1, 1, -1, 1, -1, 1).elements.should.equalishValues(  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);
    });

    it('lookAt', () => {
        identity.lookAt(new Hilo3d.Vector3(0,2,0), new Hilo3d.Vector3(0,0.6,0), new Hilo3d.Vector3(0,0,-1));
        new Hilo3d.Vector3(1, 2, 0).transformMat4(identity).elements.should.equalishValues(1, 0, 0);
    });

    it('targetTo', () => {
        matB.targetTo(new Hilo3d.Vector3(0, 2, 0), new Hilo3d.Vector3(0, 0.6, 0), new Hilo3d.Vector3(0, 0, -1));
        matB.getScaling().elements.should.equalishValues(1, 1, 1);
        new Hilo3d.Vector3(1, 2, 0).transformMat4(matB).elements.should.equalishValues(1, 2, -2);
    });

    it('frob', () => {
        matA.frob().should.equalish(Math.sqrt(Math.pow(1, 2) + Math.pow(1, 2) + Math.pow(1, 2) + Math.pow(1, 2) + Math.pow(1, 2) + Math.pow(2, 2) + Math.pow(3, 2)));
    });

    it('add', () => {
        identity.add(matC, matD).elements.should.equalishValues(0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45);
        matD.add(matC).elements.should.equalishValues(0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45);
    });

    it('subtract', () => {
        identity.subtract(matC, matD).elements.should.equalishValues(0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15);
        matD.subtract(matC).elements.should.equalishValues(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
    });

    it('exactEquals', () => {
        var mat = matA.clone();
        mat.exactEquals(matA).should.be.true();
    });

    it('equals', () => {
        var mat = matA.clone();
        mat.elements[0] = 1.000001;
        mat.exactEquals(matA).should.be.false();
        mat.equals(matA).should.be.true();
    });

    it('compose', () => {
        identity.translate(new Hilo3d.Vector3(1, 2, 3));
        identity.scale(new Hilo3d.Vector3(0.1, 2, 5));
        identity.rotate(Math.PI*0.5, new Hilo3d.Vector3(1, 0, 0));

        matA.compose(new Hilo3d.Quaternion(Math.sqrt(2)*0.5, 0, 0, Math.sqrt(2)*0.5), new Hilo3d.Vector3(1, 2, 3), new Hilo3d.Vector3(0.1, 5, 2));
        matA.equals(identity).should.be.true();
    });

    it('decompose', () => {
        identity.translate(new Hilo3d.Vector3(1, 2, 3));
        identity.scale(new Hilo3d.Vector3(0.1, 2, 5));
        identity.rotate(Math.PI*0.5, new Hilo3d.Vector3(1, 0, 0));

        var pos = new Hilo3d.Vector3();
        var scale = new Hilo3d.Vector3();
        var quat = new Hilo3d.Quaternion();
        identity.decompose(quat, pos, scale);

        pos.elements.should.equalishValues(1, 2, 3);
        scale.elements.should.equalishValues(0.1, 5, 2);
        quat.elements.should.equalishValues(Math.sqrt(2)*0.5, 0, 0, Math.sqrt(2)*0.5);
    });
});
})();

(function(){
const Plane = Hilo3d.Plane;

describe('Plane', () => {
    var planeA, identity;
    beforeEach(() => {
        planeA = new Plane(new Hilo3d.Vector3(1, 2, 3), 4);
        identity = new Plane();
    });

    it('create', () => {
        planeA.isPlane.should.be.true();
        planeA.className.should.equal('Plane');
        planeA.normal.elements.should.equalishValues(1, 2, 3);
        planeA.distance.should.equal(4);
    });

    it('copy', () => {
        identity.copy(planeA);
        identity.normal.equals(planeA.normal).should.be.true();
        identity.distance.should.equal(planeA.distance);
    });

    it('clone', () => {
        var plane = planeA.clone();
        plane.normal.equals(planeA.normal).should.be.true();
        plane.distance.should.equal(planeA.distance);
    });

    it('set', () => {
        var plane = new Plane();
        plane.set(1, 2, 3, 4);
        plane.normal.elements.should.equalishValues(1, 2, 3, 4);
        plane.distance.should.equal(4);
    });

    it('normalize', () => {
        planeA.set(3, 4, 0, 2).normalize();
        planeA.distance.should.equalish(0.4);
        planeA.normal.length().should.equalish(1);
    });

    it('distanceToPoint', () => {
        planeA.distanceToPoint(new Hilo3d.Vector3(0, 0, 0)).should.equal(4);
    });

    it('projectPoint', () => {
        planeA.projectPoint(new Hilo3d.Vector3(0, 0, 0)).elements.should.equalishValues(-4, -8, -12);
    });
});
})();

(function(){
const Quaternion = Hilo3d.Quaternion;

describe('Quaternion', function() {
    var quatA, quatB, identity, out, deg90;
    beforeEach(() => {
        quatA = new Quaternion(1, 2, 3, 4);
        quatB = new Quaternion(5, 6, 7, 8);
        identity = new Quaternion(0, 0, 0, 1);
        out = new Quaternion(0, 0, 0, 0);
        deg90 = Math.PI * 0.5;
    });

    it('create', () => {
        quatA.isQuaternion.should.be.true();
        quatA.className.should.equal('Quaternion');
        quatA.x.should.equal(1);
        quatA.y.should.equal(2);
        quatA.z.should.equal(3);
        quatA.w.should.equal(4);
    });

    it('copy', () => {
        identity.copy(quatA).elements.should.equalishValues(1, 2, 3, 4);
    });

    it('clone', () => {    
        quatA.clone().elements.should.equalishValues(1, 2, 3, 4);
    });

    it('toArray', () => {
        var result = [];
        quatA.toArray(result, 2);
        result[2].should.equal(1);
        result[3].should.equal(2);
        result[4].should.equal(3);
        result[5].should.equal(4);
    });

    it('fromArray', () => {
        identity.fromArray([0, 0, 1, 2, 3, 4], 2).elements.should.equalishValues(1, 2, 3, 4);
    });

    it('set', () => {
        identity.set(1, 2, 3, 4).elements.should.equalishValues(1, 2, 3, 4);
    });

    it('identity', () => {
        quatA.identity().elements.should.equalishValues(0, 0, 0, 1);
    });

    it('rotationTo', () => {
        identity.rotationTo(new Hilo3d.Vector3(0, 1, 0), new Hilo3d.Vector3(1, 0, 0)).elements.should.equalishValues(0, 0, -Math.sqrt(0.5), Math.sqrt(0.5));
    });

    it('setAxes', () => {
        identity.setAxes(new Hilo3d.Vector3(-1, 0, 0), new Hilo3d.Vector3(0, 0, -1), new Hilo3d.Vector3(0, 1, 0)).elements.should.equalishValues(0, -Math.sqrt(0.5), 0, Math.sqrt(0.5));
        new Hilo3d.Vector3(0, 0, -1).transformQuat(identity).elements.should.equalishValues(1, 0, 0);
    });

    it('setAxisAngle', () => {
        identity.setAxisAngle(new Hilo3d.Vector3(1, 0, 0), Math.PI * 0.5).elements.should.equalishValues(Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    });

    it('getAxisAngle', () => {
        identity.setAxisAngle(new Hilo3d.Vector3(1, 0, 0), 0.7778);
        var axis = new Hilo3d.Vector3();
        identity.getAxisAngle(axis).should.equalish(0.7778);
        axis.elements.should.equalishValues(1, 0, 0);
    });

    it('add', () => {
        quatA.add(quatB).elements.should.equalishValues(6, 8, 10, 12);
    });

    it('multiply', () => {
        quatA.multiply(quatB).elements.should.equalishValues(24, 48, 48, -6);
    });

    it('premultiply', () => {
        quatB.premultiply(quatA).elements.should.equalishValues(24, 48, 48, -6);
    });

    it('scale', () => {
        quatA.scale(2).elements.should.equalishValues(2, 4, 6, 8);
    });

    it('rotateX', () => {
        identity.rotateX(deg90);
        new Hilo3d.Vector3(0, 0, -1).transformQuat(identity).elements.should.equalishValues(0, 1, 0);
    });

    it('rotateY', () => {
        identity.rotateY(deg90);
        new Hilo3d.Vector3(0, 0, -1).transformQuat(identity).elements.should.equalishValues(-1, 0, 0);
    });

    it('rotateZ', () => {
        identity.rotateZ(deg90);
        new Hilo3d.Vector3(0, 1, 0).transformQuat(identity).elements.should.equalishValues(-1, 0, 0);
    });

    it('calculateW', () => {
        quatA.calculateW().elements.should.equalishValues(1, 2, 3, Math.sqrt(Math.abs(1.0 -  1 - 4 - 9)));
    });

    it('dot', () => {
        quatA.dot(quatB).should.equalish(70);
    });

    it('lerp', () => {
        quatA.lerp(quatB, 0.5).elements.should.equalishValues(3, 4, 5, 6);
    }); 

    it('slerp', () => {
        quatA.set(1, 0, 0, 0);
        quatA.rotateX(Math.PI);
        new Quaternion(1, 0, 0, 0).slerp(quatA, 1).elements.should.equalishValues(0, 0, 0, -1);
        new Quaternion(1, 0, 0, 0).slerp(new Quaternion(-1, 0, 0, 0), 0.5).elements.should.equalishValues(1, 0, 0, 0);
        identity.slerp(new Quaternion(0, 1, 0, 0), 0.5).elements.should.equalishValues(0, Math.sqrt(0.5), 0, Math.sqrt(0.5));
    });

    it('sqlerp', () => {
        identity.sqlerp(quatA, quatB, new Quaternion(4, 5, 6, 7), new Quaternion(2, 4, 3, 4), 0.5).elements.should.equalishValues(3, 4.25, 4.75, 5.75);
    });

    it('invert', () => {
        quatA.invert().elements.should.equalishValues(-0.03333333, -0.066666670143, -0.1, 0.13333333);
    });

    it('conjugate', () => {
        quatA.conjugate().elements.should.equalishValues(-1, -2, -3, 4);
    });

    it('length', () => {
        quatA.length().should.equalish(Math.sqrt(30));
    });

    it('squaredLength', () => {
        quatA.squaredLength().should.equalish(30);
    });

    it('normalize', () => {
        quatA.set(5, 0, 0, 0).normalize().elements.should.equalishValues(1, 0, 0, 0);
    });

    it('fromMat3', () => {
        var mat = new Hilo3d.Matrix3().set(1, 0,  0, 0, 0, -1, 0, 1,  0 );
        identity.fromMat3(mat).elements.should.equalishValues(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    });

    it('fromMat4', () => {
        var mat = new Hilo3d.Matrix4().set(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 1, 2, 3, 1 );
        identity.fromMat4(mat).elements.should.equalishValues(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    });

    it('exactEquals', () => {
        quatA.clone().exactEquals(quatA).should.be.true();
    });

    it('equals', () => {
        var quat = quatA.clone();
        quat.x += 0.0000001;
        quat.exactEquals(quatA).should.be.false();
        quat.equals(quatA).should.be.true();
    });

    it('fromEuler', () => {
        identity.fromEuler(new Hilo3d.Euler(-deg90, 0, 0)).elements.should.equalishValues(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    });
});
})();

(function(){
const Ray =  Hilo3d.Ray;
const Vector3 =  Hilo3d.Vector3;

describe('Ray', () => {
    var rayA, identity;
    beforeEach(() => {
        rayA = new Ray({
            origin:new Vector3(1, 2, 3),
            direction:new Vector3(1, 0, 0)
        });

        identity = new Ray();
    });

    it('create', () => {
        rayA.isRay.should.be.true();
        rayA.className.should.equal('Ray');
        rayA.origin.elements.should.equalishValues(1, 2, 3);
        rayA.direction.elements.should.equalishValues(1, 0, 0);
    });

    it('set', () => {
        identity.set(new Vector3(1, 2, 3), new Vector3(1, 0, 0));
        identity.origin.elements.should.equalishValues(1, 2, 3);
        identity.direction.elements.should.equalishValues(1, 0, 0);
    });

    it('copy', () => {
        identity.copy(rayA);
        identity.origin.elements.should.equalishValues(1, 2, 3);
        identity.direction.elements.should.equalishValues(1, 0, 0);
    });

    it('clone', () => {
        var ray = rayA.clone();
        ray.origin.elements.should.equalishValues(1, 2, 3);
        ray.direction.elements.should.equalishValues(1, 0, 0);
    });

    it('fromCamera', () => {
        var camera = new Hilo3d.PerspectiveCamera({
            z:10,
            rotationX:90,
            rotationY:30
        }).lookAt(new Vector3(0, 1, 2)).updateViewProjectionMatrix();

        identity.fromCamera(camera, 1, 2, 3, 4);
        identity.origin.elements.should.equalishValues(0, 0, 10);
        identity.direction.elements.should.equalishValues(-0.15359194576740265, 0.12256336212158203, -0.9805037975311279);

        var camera = new Hilo3d.OrthographicCamera({
            z:10,
            rotationX:90
        }).lookAt(new Vector3(0, 1, 2)).updateViewProjectionMatrix();

        identity.fromCamera(camera, 1, 2, 3, 4);
        identity.origin.elements.should.equalishValues(-0.3333333432674408, -3.19604644971605e-8, 10);
        identity.direction.elements.should.equalishValues( 0, 0.12403473258018494, -0.9922778606414795);
    });

    it('transformMat4', () => {
        rayA.transformMat4(new Hilo3d.Matrix4().translate(new Vector3(1, 2, 3)).rotateY(Math.PI/2));
        rayA.origin.elements.should.equalishValues(4, 4, 2);
        rayA.direction.elements.should.equalishValues(0, 0, -1);
    }); 

    it('sortPoints', () => {
        var points = [new Vector3(0, 0, 0), new Vector3(3, 4, 6), new Vector3(1, 2, 3)];
        rayA.sortPoints(points);
        points[0].elements.should.equalishValues(1, 2, 3);
        points[1].elements.should.equalishValues(0, 0, 0);
        points[2].elements.should.equalishValues(3, 4, 6);

        var points = [{point:new Vector3(0, 0, 0)}, {point:new Vector3(3, 4, 6)}, {point:new Vector3(1, 2, 3)}];
        rayA.sortPoints(points, 'point');
        points[0].point.elements.should.equalishValues(1, 2, 3);
        points[1].point.elements.should.equalishValues(0, 0, 0);
        points[2].point.elements.should.equalishValues(3, 4, 6);
    });

    it('squaredDistance', () => {
        rayA.squaredDistance(new Vector3(1, 0, 0)).should.equalish(13);
    });

    it('distance', () => {
        rayA.distance(new Vector3(1, 0, 0)).should.equalish(Math.sqrt(13));
    });

    it('intersectsSphere', () => {
        identity.intersectsSphere([0, 0, 0], 5).elements.should.equalishValues(0, 0, 5);
        should(identity.intersectsSphere([0, 0, 6], 5)).be.null();
    });

    it('intersectsPlane', () => {
        identity.intersectsPlane([0, 0, 1], 5).elements.should.equalishValues(0, 0, -5);
        should(identity.intersectsPlane([0, 0, 1], -5)).be.null();
    });

    it('intersectsTriangle', () => {
        identity.intersectsTriangle([[-0.5, -0.289, 0], [0.5, -0.289, 0], [0, 0, 0.9]]).elements.should.equalishValues(0, 0, 0.9);
    });

    it('intersectsBox', () => {
        identity.intersectsBox([[-1, -1, -1], [1, 1, 1]]).elements.should.equalishValues(0, 0, 1);
    });

    it('intersectsTriangleCell', () => {
        identity.intersectsTriangleCell([0, 1, 2], [[-0.5, -0.289, 0], [0.5, -0.289, 0], [0, 0, 0.9]]).elements.should.equalishValues(0, 0, 0.9);
    });

    it('_getRes', () => {
        should(rayA._getRes()).be.null();
        rayA._getRes([1, 2, 3]).elements.should.equalishValues(1, 2, 3);
    });
});
})();

(function(){
const Sphere =  Hilo3d.Sphere;

describe('Sphere', () => {
    var sphereA, identity;
    beforeEach(() => {
        sphereA = new Sphere({
            center:new Hilo3d.Vector3(1, 2, 3),
            radius:1
        });

        identity = new Sphere();
    });

    it('create', () => {
        sphereA.isSphere.should.be.true();
        sphereA.className.should.equal('Sphere');
        sphereA.center.elements.should.equalishValues(1, 2, 3);
        sphereA.radius.should.equal(1);
    });

    it('clone', () => {
        var sphere = sphereA.clone();
        sphere.center.equals(sphereA.center).should.be.true();
        sphere.radius.should.equal(sphereA.radius);
    });

    it('copy', () => {
        identity.copy(sphereA);
        identity.center.equals(sphereA.center).should.be.true();
        identity.radius.should.equal(sphereA.radius);
    });

    it('fromPoints', () => {
        sphereA.fromPoints([
            1, 2, 3,
            1, 2, 6,
        ]);
        sphereA.radius.should.equal(3);

        sphereA.fromPoints([
            1, 5, -1,
            1, 2, 6,
        ]);
        sphereA.radius.should.equal(5);
    });

    it('transformMat4', () => {
        sphereA.transformMat4(new Hilo3d.Matrix4().scale(new Hilo3d.Vector3(2, 1, 1)).translate(new Hilo3d.Vector3(1, 2, 3)));
        sphereA.radius.should.equal(2);
        sphereA.center.elements.should.equalishValues(4, 4, 6);
    });
});
})();

(function(){
const Vector2 = Hilo3d.Vector2;

describe('Vector2', function() {
    it('create', () => {
        const vec = new Vector2(1, 2);
        vec.isVector2.should.be.true();
        vec.className.should.equal('Vector2');

        vec.x.should.equal(1);
        vec.y.should.equal(2);
    });

    it('copy', () => {
        const v = new Vector2(1, 2);
        new Vector2().copy(v).elements.should.deepEqual(v.elements);
    });

    it('clone', () => {
        const v = new Vector2(1, 2);
        v.clone().elements.should.deepEqual(v.elements);
    });

    it('toArray', () => {
        const res = [];
        new Vector2(1, 2).toArray(res, 5);
        res[5].should.equal(1);
        res[6].should.equal(2);
    });

    it('fromArray', () => {
        const res = [0, 0, 0, 1, 2, 3];
        new Vector2().fromArray(res, 2).elements.should.equalishValues(0, 1);
    });

    it('set', () => {
        new Vector2().set(1, 2).elements.should.equalishValues(1, 2);
    });

    it('add', () => {
        new Vector2(1, 2).add(new Vector2(3, 4)).elements.should.equalishValues(4, 6);
        new Vector2(1, 2).add(new Vector2(3, 4), new Vector2(1, 0)).elements.should.equalishValues(4, 4);
    });

    it('subtract', () => {
        new Vector2(1, 2).subtract(new Vector2(3, 4)).elements.should.equalishValues(-2, -2);
        new Vector2(1, 2).subtract(new Vector2(3, 4), new Vector2(1, 0)).elements.should.equalishValues(2, 4);
    });

    it('multiply', () => {
        new Vector2(1, 2).multiply(new Vector2(3, 4)).elements.should.equalishValues(3, 8);
        new Vector2(1, 2).multiply(new Vector2(3, 4), new Vector2(1, 0)).elements.should.equalishValues(3, 0);
    });

    it('divide', () => {
        new Vector2(6, 2).divide(new Vector2(3, 4)).elements.should.equalishValues(2, 0.5);
        new Vector2(1, 2).divide(new Vector2(3, 4), new Vector2(1, 2)).elements.should.equalishValues(3, 2);
    });

    it('ceil', () => {
        new Vector2(1.1, 2.9).ceil().elements.should.equalishValues(2, 3);
    });

    it('floor', () => {
        new Vector2(1.1, 2.9).floor().elements.should.equalishValues(1, 2);
    });

    it('min', () => {
        new Vector2(6, 2).min(new Vector2(3, 4)).elements.should.equalishValues(3, 2);
        new Vector2(1, 2).min(new Vector2(3, 4), new Vector2(1, 2)).elements.should.equalishValues(1, 2);
    });

    it('max', () => {
        new Vector2(6, 2).max(new Vector2(3, 4)).elements.should.equalishValues(6, 4);
        new Vector2(1, 2).max(new Vector2(3, 4), new Vector2(1, 2)).elements.should.equalishValues(3, 4);
    });

    it('round', () => {
        new Vector2(1.2, 2.5).round().elements.should.equalishValues(1, 3);
    });

    it('scale', () => {
        new Vector2(1.2, 2.5).scale(2).elements.should.equalishValues(2.4, 5);
    });

    it('scaleAndAdd', () => {
        new Vector2(6, 2).scaleAndAdd(2, new Vector2(3, 4)).elements.should.equalishValues(12, 10);
        new Vector2(1, 2).scaleAndAdd(2, new Vector2(3, 4), new Vector2(1, 2)).elements.should.equalishValues(5, 8);
    });

    it('distance', () => {
        new Vector2(6, 2).distance(new Vector2(3, 6)).should.equal(5);
        new Vector2(1, 2).distance(new Vector2(3, 4), new Vector2(0, 0)).should.equal(5);
    });

    it('squaredDistance', () => {
        new Vector2(6, 2).squaredDistance(new Vector2(3, 6)).should.equal(25);
        new Vector2(1, 2).squaredDistance(new Vector2(3, 4), new Vector2(0, 0)).should.equal(25);
    });

    it('length', () => {
        new Vector2(3, -4).length().should.equal(5);
    });

    it('squaredLength', () => {
        new Vector2(3, -4).squaredLength().should.equal(25);
    });

    it('negate', () => {
        new Vector2(0.5, -0.25).negate().elements.should.equalishValues(-0.5, 0.25);
    });

    it('inverse', () => {
        new Vector2(0.5, -0.25).inverse().elements.should.equalishValues(2, -4);
        new Vector2(0.5, -0.25).inverse(new Vector2(0.5, -0.2)).elements.should.equalishValues(2, -5);
    });

    it('normalize', () => {
        new Vector2(3, -4).normalize().elements.should.equalishValues(0.6, -0.8);
    });

    it('dot', () => {
        new Vector2(1, 2).dot(new Vector2(3, 4)).should.equal(11);
    });

    it('cross', () => {
        new Vector2(1, 2).cross(new Vector2(3, 4)).elements.should.equalishValues(0, 0);
        new Vector2(2, 4).cross(new Vector2(1, 2), new Vector2(3, 4)).elements.should.equalishValues(0, 0);
    });

    it('lerp', () => {
        new Vector2(1, 2).lerp(new Vector2(3, 4), 0.5).elements.should.equalishValues(2, 3);
    });

    it('random', () => {
        const len = new Vector2(1, 2).random(0.4).length();
        len.should.be.within(0, 0.40001);
    }); 

    it('transformMat3', () => {
        const mat3 = new Hilo3d.Matrix3().scale(new Vector2(2, 0.5));
        new Vector2(2, 1).transformMat3(mat3).elements.should.equalishValues(4, 0.5);
    });

    it('transformMat4', () => {
        const mat4 = new Hilo3d.Matrix4().scale(new Hilo3d.Vector3(2, 0.5, 1));
        new Vector2(2, 1).transformMat4(mat4).elements.should.equalishValues(4, 0.5);
    });

    it('equals & exactEquals', () => {
        new Vector2(1.001, 2.009).exactEquals(new Vector2(1.001, 2.009)).should.be.True();

        new Vector2(1.001, 2.009).exactEquals(new Vector2(1.001001, 2.009)).should.be.False();
        new Vector2(1.001, 2.009).equals(new Vector2(1.001001, 2.009)).should.be.True();
    });
});
})();

(function(){
const Vector3 = Hilo3d.Vector3;

describe('Vector3', function() {
    it('create', () => {
        const vec = new Vector3(1, 2, 3);
        vec.isVector3.should.be.true();
        vec.className.should.equal('Vector3');

        vec.x.should.equal(1);
        vec.y.should.equal(2);
        vec.z.should.equal(3);
    });

    it('copy', () => {
        const v = new Vector3(1, 2, 3);
        new Vector3().copy(v).elements.should.deepEqual(v.elements);
    });

    it('clone', () => {
        const v = new Vector3(1, 2, 3);
        v.clone().elements.should.deepEqual(v.elements);
    });

    it('toArray', () => {
        const res = [];
        new Vector3(1, 2, 3).toArray(res, 5);
        res[5].should.equal(1);
        res[6].should.equal(2);
        res[7].should.equal(3);
    });

    it('fromArray', () => {
        const res = [0, 0, 0, 1, 2, 3];
        new Vector3().fromArray(res, 2).elements.should.equalishValues(0, 1, 2);
    });

    it('set', () => {
        new Vector3().set(1, 2, 3).elements.should.equalishValues(1, 2, 3);
    });

    it('add', () => {
        new Vector3(1, 2, 3).add(new Vector3(3, 4, 5)).elements.should.equalishValues(4, 6, 8);
        new Vector3(1, 2, 3).add(new Vector3(3, 4, 5), new Vector3(1, 0, 1)).elements.should.equalishValues(4, 4, 6);
    });

    it('subtract', () => {
        new Vector3(1, 2, 3).subtract(new Vector3(3, 4, 5)).elements.should.equalishValues(-2, -2, -2);
        new Vector3(1, 2, 3).subtract(new Vector3(3, 4, 5), new Vector3(1, 0, 1)).elements.should.equalishValues(2, 4, 4);
    });

    it('multiply', () => {
        new Vector3(1, 2, 3).multiply(new Vector3(3, 4, 5)).elements.should.equalishValues(3, 8, 15);
        new Vector3(1, 2, 3).multiply(new Vector3(3, 4, 5), new Vector3(1, 0, 1)).elements.should.equalishValues(3, 0, 5);
    });

    it('divide', () => {
        new Vector3(6, 2, 7).divide(new Vector3(3, 4, 7)).elements.should.equalishValues(2, 0.5, 1);
        new Vector3(1, 2, 3).divide(new Vector3(3, 4, 7), new Vector3(1, 2, 1)).elements.should.equalishValues(3, 2, 7);
    });

    it('ceil', () => {
        new Vector3(1.1, 2.9, 1.2).ceil().elements.should.equalishValues(2, 3, 2);
    });

    it('floor', () => {
        new Vector3(1.1, 2.9, 2.1).floor().elements.should.equalishValues(1, 2, 2);
    });

    it('min', () => {
        new Vector3(6, 2, 1).min(new Vector3(3, 4, 2)).elements.should.equalishValues(3, 2, 1);
        new Vector3(1, 2, 1).min(new Vector3(3, 4, 1), new Vector3(1, 2, 1)).elements.should.equalishValues(1, 2, 1);
    });

    it('max', () => {
        new Vector3(6, 2, 1).max(new Vector3(3, 4, 2)).elements.should.equalishValues(6, 4, 2);
        new Vector3(1, 2, 1).max(new Vector3(3, 4, 1), new Vector3(1, 2, 1)).elements.should.equalishValues(3, 4, 1);
    });

    it('round', () => {
        new Vector3(1.2, 2.5, 3.1).round().elements.should.equalishValues(1, 3, 3);
    });

    it('scale', () => {
        new Vector3(1.2, 2.5, 0.8).scale(2).elements.should.equalishValues(2.4, 5, 1.6);
    });

    it('scaleAndAdd', () => {
        new Vector3(6, 2, 1).scaleAndAdd(2, new Vector3(3, 4, 0)).elements.should.equalishValues(12, 10, 1);
        new Vector3(1, 2, 1).scaleAndAdd(2, new Vector3(3, 4, 1), new Vector3(1, 2, 1)).elements.should.equalishValues(5, 8, 3);
    });

    it('distance', () => {
        new Vector3(6, 2, 3).distance(new Vector3(3, 6, 3)).should.equal(5);
        new Vector3(1, 2, 3).distance(new Vector3(3, 4, 4), new Vector3(0, 0, 4)).should.equal(5);
    });

    it('squaredDistance', () => {
        new Vector3(6, 2, 1).squaredDistance(new Vector3(3, 6, 1)).should.equal(25);
        new Vector3(1, 2, 2).squaredDistance(new Vector3(3, 4, 2), new Vector3(0, 0, 2)).should.equal(25);
    });

    it('length', () => {
        new Vector3(3, -4, 0).length().should.equal(5);
    });

    it('squaredLength', () => {
        new Vector3(3, -4, 0).squaredLength().should.equal(25);
    });

    it('negate', () => {
        new Vector3(0.5, -0.25, 1).negate().elements.should.equalishValues(-0.5, 0.25, -1);
    });

    it('inverse', () => {
        new Vector3(0.5, -0.25, 1).inverse().elements.should.equalishValues(2, -4, 1);
        new Vector3(0.5, -0.25, 1).inverse(new Vector3(0.5, -0.25, 0.5)).elements.should.equalishValues(2, -4, 2);
    });

    it('normalize', () => {
        new Vector3(3, -4, 0).normalize().elements.should.equalishValues(0.6, -0.8, 0);
    });

    it('dot', () => {
        new Vector3(1, 2, 1).dot(new Vector3(3, 4, 2)).should.equal(13);
    });

    it('cross', () => {
        new Vector3(1, 2, 0).cross(new Vector3(3, 4, 0)).elements.should.equalishValues(0, 0, -2);
        new Vector3(2, 4, 0).cross(new Vector3(1, 2, 0), new Vector3(3, 4, 0)).elements.should.equalishValues(0, 0, -2);
    });

    it('lerp', () => {
        new Vector3(1, 2, 3).lerp(new Vector3(3, 4, 5), 0.5).elements.should.equalishValues(2, 3, 4);
    });

    it('hermite', () => {
        new Vector3().hermite(new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector3(1, 1, 0), new Vector3(2, 0, 0), 0.6).elements.should.equalishValues(1.152, -0.048, 0);
    });

    it('bezier', () => {
        new Vector3().bezier(new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector3(1, 1, 0), new Vector3(2, 0, 0), 0.6).elements.should.equalishValues(0.864, 0.72, 0);
    });

    it('random', () => {
        const len = new Vector3(1, 2).random(0.4).length();
        len.should.be.within(0, 0.40001);
    }); 

    it('transformMat3', () => {
        const mat3 = new Hilo3d.Matrix3().fromMat4(new Hilo3d.Matrix4().scale(new Vector3(2, 0.5, 3)));
        new Vector3(2, 1, 5).transformMat3(mat3).elements.should.equalishValues(4, 0.5, 15);
    });

    it('transformMat4', () => {
        const mat4 = new Hilo3d.Matrix4().scale(new Hilo3d.Vector3(2, 0.5, 3));
        new Vector3(2, 1, 3).transformMat4(mat4).elements.should.equalishValues(4, 0.5, 9);
    });

    it('transformQuat', () => {
        new Vector3(1, 0, 0).transformQuat(new Hilo3d.Quaternion(0, 0, 1, 0)).elements.should.equalishValues(-1, 0, 0);
    });

    it('transformDirection', () => {
        const mat4 = new Hilo3d.Matrix4().scale(new Hilo3d.Vector3(2, 0.5, 3)).translate(new Hilo3d.Vector3(1, -2, 0));
        new Vector3(1, 0, 0).transformDirection(mat4).elements.should.equalishValues(2, 0, 0)
    });

    it('rotateX', () => {
        new Vector3(2, 7, 0).rotateX(new Vector3(2, 5, 0), Math.PI).elements.should.equalishValues(2, 3, 0);
    });

    it('rotateY', () => {
        new Vector3(1, 0, 0).rotateY(new Vector3(0, 0, 0), Math.PI).elements.should.equalishValues(-1, 0, 0);
    });

    it('rotateZ', () => {
        new Vector3(0, 6, -5).rotateZ(new Vector3(0, 0, -5), Math.PI).elements.should.equalishValues(0, -6, -5);
    });

    it('equals & exactEquals', () => {
        new Vector3(1.001, 2.009, 2).exactEquals(new Vector3(1.001, 2.009, 2)).should.be.True();

        new Vector3(1.001, 2.009, 2).exactEquals(new Vector3(1.001001, 2.009, 2)).should.be.False();
        new Vector3(1.001, 2.009, 2).equals(new Vector3(1.001001, 2.009, 2)).should.be.True();
    });
});
})();

(function(){
const Vector4 = Hilo3d.Vector4;

describe('Vector4', function() {
    it('create', () => {
        const vec = new Vector4(1, 2, 3, 4);
        vec.isVector4.should.be.true();
        vec.className.should.equal('Vector4');

        vec.x.should.equal(1);
        vec.y.should.equal(2);
        vec.z.should.equal(3);
        vec.w.should.equal(4);
    });

    it('copy', () => {
        const v = new Vector4(1, 2, 3, 4);
        new Vector4().copy(v).elements.should.deepEqual(v.elements);
    });

    it('clone', () => {
        const v = new Vector4(1, 2, 3, 4);
        v.clone().elements.should.deepEqual(v.elements);
    });

    it('toArray', () => {
        const res = [];
        new Vector4(1, 2, 3, 4).toArray(res, 5);
        res[5].should.equal(1);
        res[6].should.equal(2);
        res[7].should.equal(3);
        res[8].should.equal(4);
    });

    it('fromArray', () => {
        const res = [0, 0, 0, 1, 2, 3, 4];
        new Vector4().fromArray(res, 2).elements.should.equalishValues(0, 1, 2, 3);
    });

    it('set', () => {
        new Vector4().set(1, 2, 3, 4).elements.should.equalishValues(1, 2, 3, 4);
    });

    it('add', () => {
        new Vector4(1, 2, 3, 4).add(new Vector4(3, 4, 5, 6)).elements.should.equalishValues(4, 6, 8, 10);
        new Vector4(1, 2, 3, 4).add(new Vector4(3, 4, 5, 6), new Vector4(1, 0, 1, 2)).elements.should.equalishValues(4, 4, 6, 8);
    });

    it('subtract', () => {
        new Vector4(1, 2, 3, 4).subtract(new Vector4(3, 4, 5, 7)).elements.should.equalishValues(-2, -2, -2, -3);
        new Vector4(1, 2, 3, 4).subtract(new Vector4(3, 4, 5, 6), new Vector4(1, 0, 1, 3)).elements.should.equalishValues(2, 4, 4, 3);
    });

    it('multiply', () => {
        new Vector4(1, 2, 3, 4).multiply(new Vector4(3, 4, 5, 6)).elements.should.equalishValues(3, 8, 15, 24);
        new Vector4(1, 2, 3, 4).multiply(new Vector4(3, 4, 5, 6), new Vector4(1, 0, 1, 2)).elements.should.equalishValues(3, 0, 5, 12);
    });

    it('divide', () => {
        new Vector4(6, 2, 7, 1).divide(new Vector4(3, 4, 7, 1)).elements.should.equalishValues(2, 0.5, 1, 1);
        new Vector4(1, 2, 3, 10).divide(new Vector4(3, 4, 7, 8), new Vector4(1, 2, 1, 4)).elements.should.equalishValues(3, 2, 7, 2);
    });

    it('ceil', () => {
        new Vector4(1.1, 2.9, 1.2, 5).ceil().elements.should.equalishValues(2, 3, 2, 5);
    });

    it('floor', () => {
        new Vector4(1.1, 2.9, 2.1, 2.8).floor().elements.should.equalishValues(1, 2, 2, 2);
    });

    it('min', () => {
        new Vector4(6, 2, 1, 10).min(new Vector4(3, 4, 2, 1.2)).elements.should.equalishValues(3, 2, 1, 1.2);
        new Vector4(1, 2, 1, 0).min(new Vector4(3, 4, 1, 2.3), new Vector4(1, 2, 1, 2.2)).elements.should.equalishValues(1, 2, 1, 2.2);
    });

    it('max', () => {
        new Vector4(6, 2, 1, 1).max(new Vector4(3, 4, 2, 0)).elements.should.equalishValues(6, 4, 2, 1);
        new Vector4(1, 2, 1, 2).max(new Vector4(3, 4, 1, 2), new Vector4(1, 2, 1, 22)).elements.should.equalishValues(3, 4, 1, 22);
    });

    it('round', () => {
        new Vector4(1.2, 2.5, 3.1, 3.5).round().elements.should.equalishValues(1, 3, 3, 4);
    });

    it('scale', () => {
        new Vector4(1.2, 2.5, 0.8, 1.1).scale(2).elements.should.equalishValues(2.4, 5, 1.6, 2.2);
    });

    it('scaleAndAdd', () => {
        new Vector4(6, 2, 1, 0).scaleAndAdd(2, new Vector4(3, 4, 0, 1)).elements.should.equalishValues(12, 10, 1, 2);
        new Vector4(1, 2, 1, 0).scaleAndAdd(2, new Vector4(3, 4, 1, 1), new Vector4(1, 2, 1, 3)).elements.should.equalishValues(5, 8, 3, 7);
    });

    it('distance', () => {
        new Vector4(6, 1, 2, 3).distance(new Vector4(3, 1, 6, 3)).should.equal(5);
        new Vector4(1, 1, 2, 3).distance(new Vector4(3, 1, 4, 4), new Vector4(0, 1, 0, 4)).should.equal(5);
    });

    it('squaredDistance', () => {
        new Vector4(1, 6, 2, 1).squaredDistance(new Vector4(1, 3, 6, 1)).should.equal(25);
        new Vector4(1, 1, 2, 2).squaredDistance(new Vector4(1, 3, 4, 2), new Vector4(1, 0, 0, 2)).should.equal(25);
    });

    it('length', () => {
        new Vector4(3, 0, -4, 0).length().should.equal(5);
    });

    it('squaredLength', () => {
        new Vector4(3, -4, 0, 1).squaredLength().should.equal(26);
    });

    it('negate', () => {
        new Vector4(0.5, -0.25, 1, -1).negate().elements.should.equalishValues(-0.5, 0.25, -1, 1);
    });

    it('inverse', () => {
        new Vector4(0.5, -0.25, 1, -1).inverse().elements.should.equalishValues(2, -4, 1, -1);
        new Vector4(0.5, -0.25, 1, -1).inverse(new Vector4(0.5, -0.25, 1, -2)).elements.should.equalishValues(2, -4, 1, -0.5);
    });

    it('normalize', () => {
        new Vector4(3, 0, -4, 0).normalize().elements.should.equalishValues(0.6, 0, -0.8, 0);
    });

    it('dot', () => {
        new Vector4(1, 2, 1, 3).dot(new Vector4(3, 4, 2, 5)).should.equal(28);
    });

    it('lerp', () => {
        new Vector4(1, 2, 3, 4).lerp(new Vector4(3, 4, 5, 6), 0.5).elements.should.equalishValues(2, 3, 4, 5);
    });

    it('random', () => {
        new Vector4(1, 2, 3, 5).random(0.4).length().should.be.equalish(0.4);
    }); 

    it('transformMat4', () => {
        const mat4 = new Hilo3d.Matrix4().scale(new Hilo3d.Vector3(2, 0.5, 3));
        new Vector4(2, 1, 3, 1).transformMat4(mat4).elements.should.equalishValues(4, 0.5, 9, 1);
    });

    it('transformQuat', () => {
        new Vector4(1, 0, 0, 2).transformQuat(new Hilo3d.Quaternion(0, 0, 1, 0)).elements.should.equalishValues(-1, 0, 0, 2);
    });

    it('equals & exactEquals', () => {
        new Vector4(2, 1.001, 2.009, 2).exactEquals(new Vector4(2, 1.001, 2.009, 2)).should.be.True();

        new Vector4(2, 1.001, 2.009, 2).exactEquals(new Vector4(2, 1.001001, 2.009, 2)).should.be.False();
        new Vector4(2, 1.001, 2.009, 2).equals(new Vector4(2, 1.001001, 2.009, 2)).should.be.True();
    });
});
})();

(function(){
const math = Hilo3d.math;

describe('math', function() {
    it('generateUUID', () => {
        math.generateUUID().should.not.equal(math.generateUUID());
        math.generateUUID().should.be.String();
    });

    it('clamp', () => {
        math.clamp(1, 1, 2).should.equalish(1);
        math.clamp(2, 1, 2).should.equalish(2);
        math.clamp(-1, 1, 2).should.equalish(1);
        math.clamp(3, 1, 2).should.equalish(2);
        math.clamp(1.5, 1, 2).should.equalish(1.5);
    });

    it('degToRad', () => {
        math.DEG2RAD.should.equalish(Math.PI/180);
        math.degToRad(90).should.equalish(Math.PI/2);
    });

    it('radToDeg', () => {
        math.RAD2DEG.should.equalish(180/Math.PI);
        math.radToDeg(Math.PI/3).should.equalish(60);
    });

    it('isPowerOfTwo', () => {
        math.isPowerOfTwo(2).should.be.true();
        math.isPowerOfTwo(256).should.be.true();
        math.isPowerOfTwo(238).should.be.false();
    });

    it('nearestPowerOfTwo', () => {
        math.nearestPowerOfTwo(2).should.equalish(2);
        math.nearestPowerOfTwo(9).should.equalish(8);
        math.nearestPowerOfTwo(15).should.equalish(16);
    });

    it('nextPowerOfTwo', () => {
        math.nextPowerOfTwo(9).should.equalish(16);
        math.nextPowerOfTwo(2).should.equalish(2);
    });
});
})();

(function(){
const Buffer = Hilo3d.Buffer;

describe('Buffer', () => {
    it('create', () => {
        const buffer = new Buffer(testEnv.gl);
        buffer.isBuffer.should.be.true();
        buffer.className.should.equal('Buffer');
    });

    it('cache & destroy', () => {
        const buffer = Buffer.createVertexBuffer(testEnv.gl, new Hilo3d.GeometryData());
        Buffer.cache.getObject(buffer).should.equal(buffer);
        buffer.destroy();
        should(Buffer.cache.getObject(buffer)).be.undefined();
    });
});
})();

(function(){
const Framebuffer = Hilo3d.Framebuffer;

describe('Framebuffer', () => {
    it('create', () => {
        const framebuffer = new Framebuffer(testEnv.renderer);
        framebuffer.isFramebuffer.should.be.true();
        framebuffer.className.should.equal('Framebuffer');

        framebuffer.init();
        framebuffer.isComplete().should.be.true();
    });

    it('readPixels', () => {
        const framebuffer = new Framebuffer(testEnv.renderer);
        framebuffer.readPixels(0, 0, 2, 2).should.deepEqual(new Uint8Array(16));
    });

    it('cache & destroy', () => {
        const framebuffer = new Framebuffer(testEnv.renderer);
        Framebuffer.cache.get(framebuffer.id).should.equal(framebuffer);
        framebuffer.destroy();
        should(Framebuffer.cache.get(framebuffer.id)).be.undefined();
        should(framebuffer.framebuffer).be.null();
        should(framebuffer.texture).be.null();
        should(framebuffer.renderbuffer).be.null();
    });
});
})();

(function(){
const Program = Hilo3d.Program;

describe('Program', () => {
    it('create', () => {
        const program = new Program({
            state:testEnv.state
        });
        program.isProgram.should.be.true();
        program.className.should.equal('Program');
    });

    it('getProgram & cache & destroy', () => {
        const shader = new Hilo3d.Shader();
        const program = Program.getProgram(shader, testEnv.state);
        Program.cache.get(shader.id).should.equal(program);

        program.destroy();
        should(Program.cache.get(shader.id)).be.undefined();
        should(program.program).be.null();
        should(program.gl).be.null();
        should(program.state).be.null();
        should(program.uniforms).be.null();
        should(program.attributes).be.null();
    });

    it('getBlankProgram', () => {
        const errorProgram = Program.getProgram(new Hilo3d.Shader, testEnv.state);
        errorProgram.should.equal(Program.getBlankProgram(testEnv.state));

        const successProgram = Program.getProgram(new Hilo3d.Shader({
            vs:'void main(){}',
            fs:'void main(){}'
        }), testEnv.state);
        successProgram.should.not.equal(Program.getBlankProgram(testEnv.state));
    });
});
})();

(function(){
const RenderInfo = Hilo3d.RenderInfo;

describe('RenderInfo', () => {
    it('create', () => {
        const info = new RenderInfo;
        info.isRenderInfo.should.be.true();
        info.className.should.equal('RenderInfo');
    });

    it('addFaceCount', () => {
        const info = new RenderInfo;
        info.addFaceCount(5);
        info._currentFaceCount.should.equal(5);
        info.addFaceCount(3);
        info._currentFaceCount.should.equal(8);
        info.addFaceCount(0);
        info._currentFaceCount.should.equal(8);
    });

    it('addDrawCount', () => {
        const info = new RenderInfo;
        info.addDrawCount(5);
        info._currentDrawCount.should.equal(5);
        info.addDrawCount(3);
        info._currentDrawCount.should.equal(8);
        info.addDrawCount(0);
        info._currentDrawCount.should.equal(8);
    });

    it('reset', () => {
        const info = new RenderInfo;
        info.addFaceCount(5);
        info.addFaceCount(3.2);
        info.addDrawCount(1);
        info.addDrawCount(3);

        info.reset();

        info._currentFaceCount.should.equal(0);
        info._currentDrawCount.should.equal(0);
        info.faceCount.should.equal(8);
        info.drawCount.should.equal(4);
    });
});
})();

(function(){
const RenderList = Hilo3d.RenderList;

describe('RenderList', () => {
    it('create', () => {
        const list = new RenderList;
        list.isRenderList.should.be.true();
        list.className.should.equal('RenderList');
    });

    let renderList;
    beforeEach(() => {
        list = new RenderList;
        const camera = testEnv.camera;
        
        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                transparent: true
            }),
            geometry: new Hilo3d.BoxGeometry()
        }), camera);

        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                transparent: false
            }),
            geometry: new Hilo3d.BoxGeometry()
        }), camera);

        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                id:'testRenderListMaterial1',
                transparent: false
            }),
            geometry: new Hilo3d.BoxGeometry({
                id:'testRenderListGeometry1',
            })
        }), camera);

        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                transparent: true
            }),
            geometry: new Hilo3d.BoxGeometry()
        }), camera);

        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                id:'testRenderListMaterial1',
                transparent: false
            }),
            geometry: new Hilo3d.BoxGeometry({
                id:'testRenderListGeometry1',
            })
        }), camera);

        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                id:'testRenderListMaterial1',
                transparent: false,
                renderOrder:1
            }),
            geometry: new Hilo3d.BoxGeometry({
                id:'testRenderListGeometry1',
            })
        }), camera);

        list.addMesh(new Hilo3d.Mesh({
            material: new Hilo3d.Material({
                id:'testRenderListMaterial1',
                transparent: false,
                renderOrder:-1
            }),
            geometry: new Hilo3d.BoxGeometry({
                id:'testRenderListGeometry1',
            })
        }), camera);
    });

    it("sort", () => {
        list.sort();
        list.opaqueList[0].material.renderOrder.should.equal(-1);
        list.opaqueList[list.opaqueList.length-1].material.renderOrder.should.equal(1);
    });

    it('addMesh', () => {
        list.transparentList.should.have.length(2);
        list.opaqueList.should.have.length(5);
    });

    it('traverse', () => {
        const callback = sinon.spy();
        list.traverse(callback);
        callback.callCount.should.equal(7);
    });

    it('reset', () => {
        list.reset();
        list.transparentList.should.have.length(0);
        list.opaqueList.should.have.length(0);
        list.instancedDict.should.have.size(0);
    });
});
})();

(function(){
const VertexArrayObject = Hilo3d.VertexArrayObject;

describe('VertexArrayObject', () => {
    it('create', () => {
        const vao = new VertexArrayObject;
        vao.isVertexArrayObject.should.be.true();
        vao.className.should.equal('VertexArrayObject');
    });

    it('cache & destroy', () => {
        const vao = VertexArrayObject.getVao(testEnv.gl, '_hiloTestVao');
        VertexArrayObject.cache.get('_hiloTestVao').should.equal(vao);
        vao.destroy();
        should(VertexArrayObject.cache.get('_hiloTestVao')).be.undefined();
        should(vao.gl).be.null();
        should(vao.indexBuffer).be.null();
        should(vao.attributes).be.null();
    });

    it('getVertexCount', () => {
        const vao = VertexArrayObject.getVao(testEnv.gl, '_hiloTestVao');
        vao.getVertexCount().should.equal(0);
    });
});
})();

(function(){
const WebGLRenderer = Hilo3d.WebGLRenderer;

describe('WebGLRenderer', () => {
    it('create', () => {
        const renderer = new WebGLRenderer;
        renderer.isWebGLRenderer.should.be.true();
        renderer.className.should.equal('WebGLRenderer');
    });

    it('onInit', () => {
        const renderer = new WebGLRenderer({
            domElement:document.createElement('canvas')
        });
        const onInit1 = sinon.stub();
        const onInit2 = sinon.stub();
        const onInit3 = sinon.stub();
        
        renderer.onInit(onInit1);
        renderer.on('init', onInit2);
        onInit1.should.have.callCount(0);
        onInit2.should.have.callCount(0);
        onInit3.should.have.callCount(0);

        // init context
        renderer.initContext();
        onInit1.should.have.callCount(1);
        onInit2.should.have.callCount(1);
        onInit3.should.have.callCount(0);

        renderer.onInit(onInit3);
        onInit1.should.have.callCount(1);
        onInit2.should.have.callCount(1);
        onInit3.should.have.callCount(1);

        renderer.fire('init');
        onInit1.should.have.callCount(1);
        onInit2.should.have.callCount(2);
        onInit3.should.have.callCount(1);
    });
});
})();

(function(){
const WebGLState = Hilo3d.WebGLState;

describe('WebGLState', () => {
    it('create', () => {
        const state = new WebGLState;
        state.isWebGLState.should.be.true();
        state.className.should.equal('WebGLState');
    });

    let gl, state;

    beforeEach(() => {
        gl = testEnv.gl;
        state = new WebGLState(gl);
    });

    it('set1', () => {
        const enable = sinon.spy(gl, 'enable');

        state.set1('enable', 1);
        enable.callCount.should.equal(1);

        state.set1('enable', 1);
        enable.callCount.should.equal(1);

        state.set1('enable', 2);
        enable.callCount.should.equal(2);

        state.set1('enable', 1);
        enable.callCount.should.equal(3);

        enable.restore();
    });

    it('set2', () => {
        const depthRange = sinon.spy(gl, 'depthRange');
        
        state.set2('depthRange', 1, 2);
        depthRange.callCount.should.equal(1);

        state.set2('depthRange', 1, 2);
        depthRange.callCount.should.equal(1);

        state.set2('depthRange', 1, 3);
        depthRange.callCount.should.equal(2);

        state.set2('depthRange', 2, 3);
        depthRange.callCount.should.equal(3);

        depthRange.restore();
    });

    it('set3', () => {
        const stencilOp = sinon.spy(state.gl, 'stencilOp');

        state.set3('stencilOp', gl.KEEP, gl.KEEP, gl.KEEP);
        stencilOp.callCount.should.equal(1);
        
        state.set3('stencilOp', gl.KEEP, gl.KEEP, gl.KEEP);
        stencilOp.callCount.should.equal(1);
        
        state.set3('stencilOp', gl.KEEP, gl.REPLACE, gl.KEEP);
        stencilOp.callCount.should.equal(2);
        
        state.set3('stencilOp', gl.REPLACE, gl.REPLACE, gl.KEEP);
        stencilOp.callCount.should.equal(3);

        stencilOp.restore();
    });

    it('set4', () => {
        const viewport = sinon.spy(gl, 'viewport');

        state.set4('viewport', 1, 2, 3, 4);
        viewport.callCount.should.equal(1);

        state.set4('viewport', 1, 2, 3, 4);
        viewport.callCount.should.equal(1);

        state.set4('viewport', 1, 2, 4, 4);
        viewport.callCount.should.equal(2);

        state.set4('viewport', 1, 2, 3, 4);
        viewport.callCount.should.equal(3);

        viewport.restore();
    });

    it('enable & disable', () => {
        const enable = sinon.spy(gl, 'enable');
        const disable = sinon.spy(gl, 'disable');

        state.enable(1);
        enable.callCount.should.equal(1);

        state.enable(2);
        enable.callCount.should.equal(2);

        state.disable(1);
        disable.callCount.should.equal(1);

        state.disable(1);
        disable.callCount.should.equal(1);

        state.enable(1);
        enable.callCount.should.equal(3);

        enable.restore();
        disable.restore();
    });

    it('bindFramebuffer & bindSystemFramebuffer', () => {
        const bindFramebuffer = sinon.spy(gl, 'bindFramebuffer');

        const framebuffer1 = gl.createFramebuffer();
        const framebuffer2 = gl.createFramebuffer();
        const framebuffer3 = gl.createFramebuffer();

        state.bindFramebuffer(1, framebuffer1);
        bindFramebuffer.callCount.should.equal(1);

        state.bindFramebuffer(1, framebuffer1);
        bindFramebuffer.callCount.should.equal(1);

        state.bindFramebuffer(1, framebuffer2);
        bindFramebuffer.callCount.should.equal(2);
        state.preFramebuffer.should.equal(framebuffer1);

        state.bindFramebuffer(1, framebuffer3);
        bindFramebuffer.callCount.should.equal(3);
        state.preFramebuffer.should.equal(framebuffer2);

        state.bindSystemFramebuffer();
        bindFramebuffer.callCount.should.equal(4);
        state.preFramebuffer.should.equal(framebuffer3);

        bindFramebuffer.restore();
    });

    it('pixelStorei', () => {
        const pixelStorei = sinon.spy(gl, 'pixelStorei');

        state.pixelStorei('test1', 1);
        pixelStorei.callCount.should.equal(1);

        state.pixelStorei('test2', 1);
        pixelStorei.callCount.should.equal(2);

        state.pixelStorei('test1', 1);
        pixelStorei.callCount.should.equal(2);

        state.pixelStorei('test1', 2);
        pixelStorei.callCount.should.equal(3);

        state.pixelStorei('test2', 1);
        pixelStorei.callCount.should.equal(3);

        pixelStorei.restore();
    });

    it('activeTexture', () => {
        const activeTexture = sinon.spy(gl, 'activeTexture');

        state.activeTexture(gl.TEXTURE0);
        state.activeTextureIndex.should.equal(gl.TEXTURE0);
        activeTexture.callCount.should.equal(1);

        state.activeTexture(gl.TEXTURE1);
        activeTexture.callCount.should.equal(2);
        state.activeTextureIndex.should.equal(gl.TEXTURE1);

        state.activeTexture(gl.TEXTURE1);
        activeTexture.callCount.should.equal(2);
        state.activeTextureIndex.should.equal(gl.TEXTURE1);

        activeTexture.restore();
    });

    it('bindTexture & getActiveTextureUnit', () => {
        const texture = gl.createTexture();
        const bindTexture = sinon.spy(gl, 'bindTexture');

        state.activeTexture(gl.TEXTURE3);
        state.bindTexture(gl.TEXTURE_2D, texture);
        state.getActiveTextureUnit()[gl.TEXTURE_2D].should.equal(texture);
        bindTexture.callCount.should.equal(1);

        state.activeTexture(gl.TEXTURE3);
        state.bindTexture(gl.TEXTURE_2D, texture);
        state.getActiveTextureUnit()[gl.TEXTURE_2D].should.equal(texture);
        bindTexture.callCount.should.equal(1);

        state.activeTexture(gl.TEXTURE4);
        state.bindTexture(gl.TEXTURE_2D, texture);
        state.getActiveTextureUnit()[gl.TEXTURE_2D].should.equal(texture);
        bindTexture.callCount.should.equal(2);

        bindTexture.restore();
    });
});
})();

(function(){
const capabilities = Hilo3d.capabilities;

describe('capabilities', () => {
    let gl = testEnv.gl;

    it('init', () => {
        capabilities.init(gl);

        [
            'MAX_RENDERBUFFER_SIZE',
            'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
            'MAX_CUBE_MAP_TEXTURE_SIZE',
            'MAX_FRAGMENT_UNIFORM_VECTORS',
            'MAX_TEXTURE_IMAGE_UNITS',
            'MAX_TEXTURE_SIZE',
            'MAX_VARYING_VECTORS',
            'MAX_VERTEX_ATTRIBS',
            'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
            'MAX_VERTEX_UNIFORM_VECTORS',
            'MAX_COMBINED_TEXTURE_IMAGE_UNITS'
        ].forEach((name) => {
            capabilities[name].should.equal(gl.getParameter(gl[name]));
        });
    });

    it('getMaxPrecision', () => {
        capabilities.getMaxPrecision('highp', 'highp').should.equal('highp');
        capabilities.getMaxPrecision('highp', 'mediump').should.equal('mediump');
        capabilities.getMaxPrecision('highp', 'lowp').should.equal('lowp');

        capabilities.getMaxPrecision('mediump', 'highp').should.equal('mediump');
        capabilities.getMaxPrecision('mediump', 'mediump').should.equal('mediump');
        capabilities.getMaxPrecision('mediump', 'lowp').should.equal('lowp');

        capabilities.getMaxPrecision('lowp', 'highp').should.equal('lowp');
        capabilities.getMaxPrecision('lowp', 'mediump').should.equal('lowp');
        capabilities.getMaxPrecision('lowp', 'lowp').should.equal('lowp');
    });

    it('get', () => {
        capabilities.get('MAX_VERTEX_TEXTURE_IMAGE_UNITS').should.equal(gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
    });
});
})();

(function(){
const extensions = Hilo3d.extensions;

describe('extensions', () => {
    it('init', () => {
        extensions.init(testEnv.gl);

        extensions.instanced.should.equal(testEnv.gl.getExtension('ANGLE_instanced_arrays'));
        extensions.vao.should.equal(testEnv.gl.getExtension('OES_vertex_array_object'));
        extensions.texFloat.should.equal(testEnv.gl.getExtension('OES_texture_float'));
        extensions.loseContext.should.equal(testEnv.gl.getExtension('WEBGL_lose_context'));
        extensions.uintIndices.should.equal(testEnv.gl.getExtension('OES_element_index_uint'));
    });

    it('enable & disable', () => {
        extensions.disable('ANGLE_instanced_arrays');
        should(extensions.get('ANGLE_instanced_arrays')).be.null();
        extensions.enable('ANGLE_instanced_arrays');
        should(extensions.get('ANGLE_instanced_arrays')).not.be.null();
    });
});
})();

(function(){
const glType = Hilo3d.glType;

describe('glType', () => {
    it('get', () => {
        const info = glType.get(Hilo3d.constants.FLOAT_VEC3);
        info.name.should.equal('FLOAT_VEC3');
        info.glValue.should.equal(Hilo3d.constants.FLOAT_VEC3);
    });
});
})();

(function(){
const Shader = Hilo3d.Shader;
const ShaderMaterial = Hilo3d.ShaderMaterial;

describe('Shader', () => {
    Shader.init(testEnv.renderer);

    it('create', () => {
        const shader = new Shader;
        shader.isShader.should.be.true();
        shader.className.should.equal('Shader');
    });

    it('getHeaderKey', () => {
        const {
            mesh,
            material,
            renderer,
            geometry,
            fog
        } = testEnv;
        const lightManager = renderer.lightManager;
        const key = Shader.getHeaderKey(mesh, material, lightManager, fog);
        key.should.equal(`header_${material.id}_${lightManager.lightInfo.uid}_fog_${fog.mode}_${geometry.getShaderKey()}`);
    });

    it('getHeader', () => {
        const {
            mesh,
            material,
            renderer,
            geometry,
            fog
        } = testEnv;
        const lightManager = renderer.lightManager;
        const header = Shader.getHeader(mesh, material, lightManager, fog);
        header.should.equal(`#define SHADER_NAME Material
#define HILO_LIGHT_TYPE_NONE 1
#define HILO_SIDE 1028
#define HILO_RECEIVE_SHADOWS 1
#define HILO_CAST_SHADOWS 1
#define HILO_HAS_FOG 1
#define HILO_FOG_LINEAR 1
`);
        const shaderMaterialHeader = Shader.getHeader(mesh, new ShaderMaterial({
            getCustomRenderOption(options){
                options.CUSTUM_1 = 1;
                options.CUSTUM_2 = 0;
                return options;
            }
        }), lightManager, fog);
        shaderMaterialHeader.should.equal(`#define SHADER_NAME ShaderMaterial
#define HILO_LIGHT_TYPE_NONE 1
#define HILO_SIDE 1028
#define HILO_RECEIVE_SHADOWS 1
#define HILO_CAST_SHADOWS 1
#define CUSTUM_1 1
#define CUSTUM_2 0
#define HILO_HAS_FOG 1
#define HILO_FOG_LINEAR 1
`);
    });

    it('getCustomShader', () => {
        const shader = Shader.getCustomShader('void main(){}', 'void main(){}', '#define HILO_LIGHT_TYPE_NONE 1\n');
        shader.vs.should.equal(`
#define HILO_MAX_PRECISION highp
#define HILO_MAX_VERTEX_PRECISION highp
#define HILO_MAX_FRAGMENT_PRECISION highp
#define HILO_LIGHT_TYPE_NONE 1
void main(){}`);

        shader.fs.should.equal(`
#define HILO_MAX_PRECISION highp
#define HILO_MAX_VERTEX_PRECISION highp
#define HILO_MAX_FRAGMENT_PRECISION highp
#define HILO_LIGHT_TYPE_NONE 1
void main(){}`);
    });

    it('getBasicShader', () => {
        const shader = Shader.getBasicShader(testEnv.material, false, '#define HILO_LIGHT_TYPE_NONE 1');
        shader.fs.should.be.String();
        shader.vs.should.be.String();
    });

    it('cache', () => {
        const shader = Shader.getCustomShader('', '', '', 'testCustomId');
        Shader.cache.get('testCustomId').should.equal(shader);
        Shader.reset();
        should(Shader.cache.get('testCustomId')).be.undefined();
    });
});
})();

(function(){
const CubeTexture = Hilo3d.CubeTexture;

describe('CubeTexture', () => {
    it('create', () => {
        const texture = new CubeTexture();
        texture.isCubeTexture.should.be.true();
        texture.className.should.equal('CubeTexture');
    });

    it('images', () => {
        const texture = new CubeTexture({
            image:[
                new Image,
                new Image,
                new Image,
                new Image,
                new Image,
                new Image,
            ]
        });

        texture.right.should.equal(texture.image[0]);
        texture.left.should.equal(texture.image[1]);
        texture.top.should.equal(texture.image[2]);
        texture.bottom.should.equal(texture.image[3]);
        texture.front.should.equal(texture.image[4]);
        texture.back.should.equal(texture.image[5]);
    });
});
})();

(function(){
const DataTexture = Hilo3d.DataTexture;

describe('DataTexture', () => {
    it('create', () => {
        const texture = new DataTexture();
        texture.isDataTexture.should.be.true();
        texture.className.should.equal('DataTexture');
    });

    it('resetSize', () => {
        const texture = new DataTexture();
        texture.resetSize(100);
        texture.width.should.equal(4);
        texture.height.should.equal(8);

        texture.resetSize(200);
        texture.width.should.equal(8);
        texture.height.should.equal(8);
    });

    it('data', () => {
        const texture = new DataTexture({
            data:new Float32Array(100)
        });
        texture.width.should.equal(4);
        texture.height.should.equal(8);
        texture.image.length.should.equal(128);
    });
});
})();

(function(){
const LazyTexture = Hilo3d.LazyTexture;

describe('LazyTexture', () => {
    it('create', () => {
        const texture = new LazyTexture();
        texture.isLazyTexture.should.be.true();
        texture.className.should.equal('LazyTexture');
    });

    it('load', (done) => {
        const texture = new LazyTexture({
            src:'./asset/images/logo.png'
        });

        texture.on('load', () => {
            texture.image.width.should.equal(600);
            done();
        });

        texture.on('error', () => {
            done(new Error('load error!'));
        })
    });
});
})();

(function(){
const Texture = Hilo3d.Texture;

describe('Texture', () => {
    it('create', () => {
        const texture = new Texture();
        texture.isTexture.should.be.true();
        texture.className.should.equal('Texture');
    });

    it('isImgPowerOfTwo', () => {
        const texture = new Texture();
        const img = new Image;
        img.width = 100;
        img.height = 100;

        texture.isImgPowerOfTwo(img).should.be.false();
        img.width = 512;
        texture.isImgPowerOfTwo(img).should.be.false();
        img.height = 1024;
        texture.isImgPowerOfTwo(img).should.be.true();
    });

    it('resizeImgToPowerOfTwo', (done) => {
        const texture = new Texture();
        const img = new Image;
        img.onload = () => {
            texture.isImgPowerOfTwo(img).should.be.false();
            texture.isImgPowerOfTwo(texture.resizeImgToPowerOfTwo(img)).should.be.true();
            done();
        };
        img.src='./asset/images/logo.png';
    });

    it('getSupportSize', () => {
        const texture = new Texture();
        let img = {width:1024000, height:2040};
        const originMaxTextureSize = Hilo3d.capabilities.MAX_TEXTURE_SIZE;
        let size;

        Hilo3d.capabilities.MAX_TEXTURE_SIZE = null;
        size = texture.getSupportSize(img);
        size.width.should.equal(img.width);
        size.height.should.equal(img.height);

        Hilo3d.capabilities.MAX_TEXTURE_SIZE = 4096;
        size = texture.getSupportSize(img);
        size.width.should.equal(4096);
        size.height.should.equal(2040);

        Hilo3d.capabilities.MAX_TEXTURE_SIZE = 4096;
        size = texture.getSupportSize(img, true);
        size.width.should.equal(4096);
        size.height.should.equal(2048);

        img.width = 4097;
        img.height = 4097;
        Hilo3d.capabilities.MAX_TEXTURE_SIZE = 4096;
        size = texture.getSupportSize(img, true);
        size.width.should.equal(4096);
        size.height.should.equal(4096);

        img.width = 4097;
        img.height = 19999;
        Hilo3d.capabilities.MAX_TEXTURE_SIZE = 20000;
        size = texture.getSupportSize(img, true);
        size.width.should.equal(8192);
        size.height.should.equal(20000);

        Hilo3d.capabilities.MAX_TEXTURE_SIZE = originMaxTextureSize;
    });
});
})();

(function(){
const Ticker = Hilo3d.Ticker;

describe('Ticker', function(){
    let ticker, tickObj;
    beforeEach('init Ticker', function(){
        ticker = new Ticker(60);
        tickObj = {
            tickNum:0,
            tick:function(){
                this.tickNum ++;
            }
        };
    });

    afterEach('destroy Ticker', function(){
        ticker.stop();
    });

    it('addTick & removeTick', function(){
        ticker._tick();
        tickObj.tickNum.should.equal(0);

        //addTick
        ticker.addTick(tickObj);
        ticker._tick();
        tickObj.tickNum.should.equal(1);
        ticker._tick();
        tickObj.tickNum.should.equal(2);

        //removeTick
        ticker.removeTick(tickObj);
        ticker._tick();
        tickObj.tickNum.should.equal(2);
    });

    it('tick time', function(done){
        let startTime;
        ticker.addTick({
            tick:function(){
                if(!startTime){
                    startTime = Date.now();
                }
                else{
                    try{
                        (Date.now() - startTime).should.be.within(11, 21);
                        done();
                    }
                    catch(e){
                        done(e);
                    }
                }
            }
        });
        ticker.start(false);
    });
});
})();

(function(){
const util = Hilo3d.util;

describe('util', function () {

    function asc(a, b) {
        return a - b;
    }

    function dest(a, b) {
        return b - a;
    }

    describe('getIndexFromSortedArray', function() {
        it('undefined', function () {
            const indexArr = util.getIndexFromSortedArray(undefined, 1, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 0]);
        });
        it('should be 0, 0', function() {
            const indexArr = util.getIndexFromSortedArray([], 1, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 0]);
        });
        it('single item asc same', function () {
            const indexArr = util.getIndexFromSortedArray([1], 1, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 0]);
        });
        it('single item asc higher', function() {
            const indexArr = util.getIndexFromSortedArray([1], 2, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 1]);
        });
        it('single item asc lower', function() {
            const indexArr = util.getIndexFromSortedArray([1], 0, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([-1, 0]);
        });

        it('single item dest same', function () {
            const indexArr = util.getIndexFromSortedArray([1], 1, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 0]);
        });
        it('single item dest higher', function() {
            const indexArr = util.getIndexFromSortedArray([1], 2, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([-1, 0]);
        });
        it('single item dest lower', function() {
            const indexArr = util.getIndexFromSortedArray([1], 0, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 1]);
        });
        
        it('two items asc same', function() {
            let indexArr = util.getIndexFromSortedArray([1, 3], 1, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 0]);

            indexArr = util.getIndexFromSortedArray([1, 3], 3, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([1, 1]);
        });
        it('two items asc higher', function() {
            const indexArr = util.getIndexFromSortedArray([1, 3], 5, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([1, 2]);
        });
        it('two items asc middle', function() {
            const indexArr = util.getIndexFromSortedArray([1, 3], 2, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 1]);
        });
        it('two items asc lower', function() {
            const indexArr = util.getIndexFromSortedArray([1, 3], 0, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([-1, 0]);
        });

        it('two items dest same', function() {
            let indexArr = util.getIndexFromSortedArray([3, 1], 1, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([1, 1]);

            indexArr = util.getIndexFromSortedArray([3, 1], 3, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 0]);
        });
        it('two items dest higher', function() {
            const indexArr = util.getIndexFromSortedArray([3, 1], 5, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([-1, 0]);
        });
        it('two items dest middle', function() {
            const indexArr = util.getIndexFromSortedArray([3, 1], 2, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([0, 1]);
        });
        it('two items dest lower', function() {
            const indexArr = util.getIndexFromSortedArray([3, 1], 0, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([1, 2]);
        });

        function randomArray(arr) {
            let m = arr.length, t, i;
            while (m) {
                i = Math.floor(Math.random() * m--);
                t = arr[m];
                arr[m] = arr[i];
                arr[i] = t;
            }
        }
        it('complex asc', function () {
            const arr = [];
            const count = Math.floor(Math.random() * 20) + 10;
            for (var i = 0; i < count; i++) {
                arr.push(i);
            }

            for (var i = 0; i < count; i++) {
                let value = Math.floor(Math.random() * count);
                let indexArr = util.getIndexFromSortedArray(arr, value, asc);
                indexArr.length.should.equal(2);
                indexArr.should.eql([value, value]);

                indexArr = util.getIndexFromSortedArray(arr, value + .5, asc);
                indexArr.length.should.equal(2);
                indexArr.should.eql([value, value + 1]);
            }

            let indexArr = util.getIndexFromSortedArray(arr, -1, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([-1, 0]);

            indexArr = util.getIndexFromSortedArray(arr, count + 1, asc);
            indexArr.length.should.equal(2);
            indexArr.should.eql([count - 1, count]);
        });
        it('complex dest', function () {
            const arr = [];
            const count = Math.floor(Math.random() * 20) + 10;
            for (var i = 0; i < count; i++) {
                arr.push(i);
            }
            arr.reverse();

            for (var i = 0; i < count; i++) {
                let value = Math.floor(Math.random() * count);
                let indexArr = util.getIndexFromSortedArray(arr, value, dest);
                indexArr.length.should.equal(2);
                indexArr.should.eql([count - 1 - value, count - 1 - value]);

                indexArr = util.getIndexFromSortedArray(arr, value + .5, dest);
                indexArr.length.should.equal(2);
                indexArr.should.eql([count - 1 - value - 1, count - 1 - value]);
            }

            let indexArr = util.getIndexFromSortedArray(arr, -1, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([count - 1, count]);

            indexArr = util.getIndexFromSortedArray(arr, count + 1, dest);
            indexArr.length.should.equal(2);
            indexArr.should.eql([-1, 0]);
        });
    });
});
})();
