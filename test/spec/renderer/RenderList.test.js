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
    });

    it('addMesh', () => {
        list.transparentList.should.have.length(2);
        list.dict.should.have.size(2);
        list.dict['testRenderListMaterial1_testRenderListGeometry1'].should.have.length(2);
    });

    it('traverse', () => {
        const callback = sinon.spy();
        list.traverse(callback);
        callback.callCount.should.equal(4);
        callback.args[0][0].should.have.length(1);
        callback.args[1][0].should.have.length(2);
        callback.args[2][0].should.have.length(1);
        callback.args[2][0][0].material.transparent.should.be.true();
        callback.args[3][0].should.have.length(1);
    });

    it('reset', () => {
        list.reset();
        list.transparentList.should.have.length(0);
        list.dict.should.have.size(0);
    });
});