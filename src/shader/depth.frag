#pragma glslify: import('./chunk/baseDefine.glsl');
#pragma glslify: import('./chunk/precision.frag');

// varying vec3 v_fragPos;

void main(void) {
    // gl_FragColor = vec4(gl_FragCoord.x, gl_FragCoord.y, gl_FragCoord.z, 1.0);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // float z = (1.0 - gl_FragCoord.z) / 2.0;
    // float z = 2.0 * gl_FragCoord.z - 1.0;
    
    float z = gl_FragCoord.z;
    gl_FragColor = vec4(z, z, z, 1.0);
}