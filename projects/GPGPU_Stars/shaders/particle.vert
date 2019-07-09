#version 100
// particleVertexShader

// Particles vertex shader


// For PI declaration:
#include <common>

// highp 3X3 matrix of float;
precision highp float;
precision highp int;
#define DOUBLE_SIDED
// uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
// uniform vec3 cameraPosition;
// attribute vec3 position;
// attribute vec3 normal;
attribute vec2 uv;


uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float cameraConstant;
uniform float density;

varying vec4 vColor;

// Tangent speed for shear in fragment buffer
// Rotate by vel angle, scale and rotate back
varying mat3 scaleVel;

// varying float flareMult;

mat3 rotZ (vec2 norm)
{
    float c = dot(normalize(norm), vec2(1.0, 0.0));
    float s = sqrt(1.0 - pow(c, 2.0)) * -sign(norm.y);
    mat3 matZ = mat3 (vec3 (  c,   s, 0.0),
                      vec3 ( -s,   c, 0.0),
                      vec3 (0.0, 0.0, 1.0));
    return matZ;
}

mat3 scaleY (float scl)
{
    mat3 maxY = mat3 (vec3 (1.0, 0.0, 0.0),
                      vec3 (0.0, scl, 0.0),
                      vec3 (0.0, 0.0, 1.0));
    return maxY;
}

mat3 inverse(mat3 m) {
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 = a22 * a11 - a12 * a21;
    float b11 = -a22 * a10 + a12 * a20;
    float b21 = a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
                b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
                b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float radiusFromMass( float mass ) {
    // Calculate radius of a sphere from mass and density
    return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
}

vec4 starColor(float mvVel_z, float velLength)
{
    float yellow_hue =  60.0;
    float red_hue =     0.0;
    float blue_hue =    240.0;

    float saturation = 100.0;
    float satVelLimit = 100.0;
    if (velLength > satVelLimit) {
        saturation -= min(velLength - satVelLimit, 100.0);
    }

    if (abs(mvVel_z) > 100.0) {
        mvVel_z = sign(mvVel_z) * 100.0;
    }

    float star_hue = yellow_hue;

    if (mvVel_z > 0.0) {
        star_hue -= map(mvVel_z, 0.0, 100.0, 0.0, 60.0); // from yellow to red
    } else {
        star_hue += map(-mvVel_z, 0.0, 100.0, 0.0, 180.0); // from yellow to blue
    }

    // vColor = vec4( 1.0, mass / 250.0, map(z_vel, 0.0, 10.0, 0.0, 1.0), 1.0 );
    // vColor = vec4(  map(-mvVelocity.z, -100.0, 100.0, 0.0, 1.0),
    //                 0.0,
    //                 map(-mvVelocity.z, 100.0, -100.0, 0.0, 1.0),
    //                 1.0 );

    vec4 color = vec4( hsv2rgb(vec3(star_hue / 360.0, saturation / 100.0, 1.0)), 1.0 );

    return color;
}

void main() {

    vec4 posTemp = texture2D( texturePosition, uv );
    vec3 pos = posTemp.xyz;

    vec4 velTemp = texture2D( textureVelocity, uv );
    vec3 vel = velTemp.xyz;
    float mass = velTemp.w;

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

    vec4 mvVelocity = modelViewMatrix * vec4(pos + vel, 1.0) - mvPosition;

    // Scale by velocity
    vec2 tanVel = mvVelocity.xy;
    float tanVelLength = length(tanVel);
    mat3 rotateIn = rotZ( tanVel );
    float scaleFactor = 1.0 / max(exp(tanVelLength/100.0), 1.0);
    mat3 scaleMat = scaleY( scaleFactor );
    mat3 rotateOut = rotZ( -tanVel );
    mat3 scaleRotateMat = rotateOut * scaleMat * rotateIn;
    scaleVel = inverse(scaleRotateMat);

    float mvVel_z = -mvVelocity.z;


    float velLength = length(mvVelocity.xyz);   
    vColor = starColor(mvVel_z, velLength);

    // Calculate radius of a sphere from mass and density
    //float radius = pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
    float radius = radiusFromMass( mass );

    // Apparent size in pixels
    // flareMult = 2.0;
    if ( mass == 0.0 ) {
                gl_PointSize = 0.0;
                gl_Position =  vec4(0.0, 0.0, 0.0, 0.0);
    }
    else {
        // gl_PointSize = max(flareMult * radius * cameraConstant / ( - mvPosition.z ), 3.0);
        scaleFactor = max(log(1.0/scaleFactor), 1.0);
        gl_PointSize = max(radius * cameraConstant * scaleFactor / ( - mvPosition.z ), 3.0);
        // gl_PointSize = 100.0;
        gl_Position = projectionMatrix * mvPosition;
    }

}