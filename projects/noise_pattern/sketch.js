/* Saved tar archive with animation frames (first equal last)
  To convert use ffmpeg
    https://stackoverflow.com/questions/24961127/how-to-create-a-video-from-images-with-ffmpeg
  Delete last frame and run
    ffmpeg -start_number 0 -i %07d.png -c:v libx264 -vf "fps=30,format=yuv420p" movie.mp4
*/

'use strict';

let canvas,
    canvasWidth = Math.pow(2, 9); // canvas size
let canvasHeight = canvasWidth;

let textureSize = canvasHeight,
    textureWidth = textureSize,
    textureHeight = textureSize;

let textureNoise;
let increment = 0.0200; // scale
let offsetX = 102.5,
    offsetY = 200.5,
    offsetZ = 100.0,
    offsetW = 340.0,
    radius = 50,        // speed
    phi = 0;

let settings = function() {
  this.increment = increment;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
  this.offsetZ = offsetZ;
  this.offsetW = offsetW;
}
let sett;
let gui;

let counter = 0,
    totalFrames = 256; // animation frames

let capturer = new CCapture( { 
      format: 'png',
      name: 'open_simplex_noise_loop_' + canvasWidth+'w_' + totalFrames + 'f',
      // verbose: true
    } );

const record = true;

function setup() {
  canvas = createCanvas(canvasWidth, canvasHeight).canvas;
  textureNoise = createImage(textureWidth, textureHeight);
  noise = new OpenSimplexNoise(Date.now());

  sett = new settings();
  gui = new dat.GUI();
  // gui.add(sett, 'cellSize',1,100).onChange(settingsChanged);
  gui.add(sett, 'increment',0.0001,1, 0.0001).onChange(settingsChanged);
  gui.add(sett, 'offsetX',-10.5,20.5, 0.01).onChange(settingsChanged);
  gui.add(sett, 'offsetY',-10.5,20.5, 0.01).onChange(settingsChanged);
  gui.add(sett, 'offsetZ',-10.5,20.5, 0.01).onChange(settingsChanged);
  gui.add(sett, 'offsetW',-10.5,20.5, 0.01).onChange(settingsChanged);

  updateTexture();
  drawTexture();

  if (record) capturer.start();
}

function draw() {
  // -1 for save end frame equal first
  phi = map(counter, 0, totalFrames-1, 0, TWO_PI);
  sett.offsetZ = offsetZ + sin(phi) * radius;
  sett.offsetW = offsetW + cos(phi) * radius;
  updateTexture();
  drawTexture();
  if (record && counter < totalFrames) {
    // note that canvas animations don't run in the background
    // you will have to keep the window open to record
    capturer.capture(canvas);
  }
  else if (record) {
    capturer.stop();
    capturer.save();
    // this will download a tar archive with the pngs inside
    // extract with 7zip or a similar tool
    // then use ffmpeg to convert into a gif or video
    noLoop();
  }
  counter++;
  console.log(nf(counter * 100 / totalFrames, 3, 1) + '%');
}

function updateTexture() {
  textureNoise.loadPixels();
  const top = 12;
  const bot = 8;
  const xoff = sett.offsetX;
  const yoff = sett.offsetY;
  const zoff = sett.offsetZ;
  const woff = sett.offsetW;

  const factor = 3;

  function calcExpCoords(x, y, d) {
    // Exp lens
    const left = 1;
    const rd = sqrt(sq(x) + sq(y)) / d;
    const mult = exp(left * (rd - (left - 1))) / exp(left * (0 - (left - 1)));
    // return 2d coords
    return [mult * x, mult * y];
  }

  function calcRoundCoords(x, y, q) {
    // Section of three-dimensional noise in the sphere form

    // q - quarter sphere equator length
    const d = sqrt(sq(x) + sq(y));
    // angle
    const a = map(d, 0, q, 0, HALF_PI);
    // sphere radius
    const r = 4 * q / TWO_PI;
    // multiplication factor
    const m = d != 0 ? r * sin(a) / d : 0;
    // return 3d coords
    return [m * x, m * y, r - r * cos(a)]
  }

  for (let y = 0; y < textureHeight; y++) {
    for (let x = 0; x < textureWidth; x++) {
      let n0, n1;

      // let [x1, y1] = [x, y];
          // OR
      // let [x1, y1] = calcExpCoords(x - textureWidth / 2,
      //                              y - textureHeight / 2,
      //                              textureWidth / 2);

      // n0 = noise.noise4D( (xoff + x1) * sett.increment,
      //                     (yoff + y1) * sett.increment,
      //                     zoff * sett.increment,
      //                     woff * sett.increment);

      // n1 = noise.noise4D( (xoff + x1) * sett.increment * factor,
      //                     (yoff + y1) * sett.increment * factor,
      //                     zoff * sett.increment * factor,
      //                     woff * sett.increment * factor);

      let [x1, y1, z1] = calcRoundCoords( x - textureWidth / 2,
                                          y - textureHeight / 2,
                                          textureWidth / 2);
      
      n0 = noise.noise4D( (xoff + x1) * sett.increment,
                          (yoff + y1) * sett.increment,
                          (zoff + z1 * cos(phi)) * sett.increment,
                          (woff + z1 * sin(phi)) * sett.increment);

      n1 = noise.noise4D( (xoff + x1) * sett.increment * factor,
                          (yoff + y1) * sett.increment * factor,
                          (zoff + z1 * cos(phi)) * sett.increment * factor,
                          (woff + z1 * sin(phi)) * sett.increment * factor);

      let bright = map(n0, -1, 1, 0, 255) / 2;
      bright += map(n1, -1, 1, 0, 255);
      bright = map(bright, 0, 255 + 255 / 2, 0, 255);
      const ab = abs(bright - 255 / 2);
      // bright = ab < 10 ? 0 : 255;  // for simple bound
      if (ab < top) {                 // for smooth bound
        if (ab < bot) {
          bright = 0;
        } else {
          bright = map(ab, bot, top, 0, 255);
        }
      } else {
        bright = 255;
      }
      let index = (x + y * textureWidth) * 4;
      
      // textureNoise.pixels[index] = map(n0, -1, 1, 0, 255) > 255/2+top ? 255 * bright : 0;
      // textureNoise.pixels[index + 1] = map(n1, -1, 1, 0, 255) > 255/2+top ? 255 * bright : 0;
      
      textureNoise.pixels[index] = bright;
      textureNoise.pixels[index + 1] = bright;
      textureNoise.pixels[index + 2] = bright;
      textureNoise.pixels[index + 3] = 255;
    }
  }
  textureNoise.updatePixels();
  drawTexture();
}

function drawTexture() {
  background(200);
  image(textureNoise, 0, 0);
}

function settingsChanged() {
  increment = sett.increment;
  offsetX = sett.offsetX;
  offsetY = sett.offsetY;
  offsetZ = sett.offsetZ;
  offsetW = sett.offsetW;

  updateTexture();
}