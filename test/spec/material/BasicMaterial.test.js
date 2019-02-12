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