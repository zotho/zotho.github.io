// const solarMass = 2 * Math.pow(10, 30);
// const bhMass = 5 * Math.pow(10, 9) * solarMass;
const G = 6.11 * Math.pow(10, -11);
// const c = 299792458;
const pixelLength = Math.pow(10, 12);

let space;

let dt;
let time = 0;
let multDt = 0.1;
let nFrames = 10;
const fixedDt = 0.0001;
let error;

// const initIVX = 1157;
const initIVX = 965;
let dIVX = -1;
let iVx = initIVX;
let graph;
let results = [];

let markers;
let canv;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  canv = createGraphics(windowWidth, windowHeight);
  graph = createGraphics(windowWidth, windowHeight);
  graph.loadPixels();
  for (let i = 0; i < graph.width; ++i) {
    for (let j = 0; j < graph.height; ++j) {
      graph.set(i, j, color(255, 0));
    }  
  }
  graph.updatePixels();
  markers = createGraphics(windowWidth, windowHeight);
  markers.loadPixels();
  for (let i = 0; i < markers.width; ++i) {
    for (let j = 0; j < markers.height; ++j) {
      markers.set(i, j, color(255, 0));
    }  
  }
  markers.updatePixels();
  space = new Space();
  reset();
  // space.addParticle(100, 100, 0, 0, pow(10, 3), options);
  // space.addParticle(-100, -100, 0, 0, pow(10, 3), options);
  // space.addRandomGaussianField( 1000, 0, 100, 0, 100, 0, 10, 0, 10, pow(10, 9), pow(10, 10) );
  space.initImpulse();
  space.addRectWalls({
    // 'type': 'teleport',
    'type': 'bounce',
    'left': -300,
    'right': 300,
    'top': -300,
    'bottom': 300,
    'r': 0.1,
  });
  // space.setTarget({'impulse':true});
}

function draw() {
  dt = multDt / (frameRate() || 1000);
  nFrames = dt / fixedDt;
  time += floor(nFrames) * fixedDt;

  // Updating
  for (let i = 0; i < nFrames; ++i) {
    space.updateAcc(fixedDt);
    space.updateVel(fixedDt);
    space.updatePos(fixedDt);
    space.updateWalls();
  }
  space.countImpulse();

  // Drawing
  canv.resetMatrix();
  canv.translate(width / 2 - space.target.x, height / 2 - space.target.y);
  canv.background(255, 2);
  space.draw(canv);
  // resetMatrix();
  markers.resetMatrix();
  markers.translate(width / 2 - space.target.x, height / 2 -space.target.y);
  markers.clear();
  space.drawImpulse(markers);
  space.drawError(markers);
  space.countError();
  if (space.error.vn > 0.01) {
    updateGraph();
    reset();
  }
  image(canv, 0, 0);
  // image(markers, 0, 0);
  image(graph, 0, 0);
  // text("Time: " + nf(time / 3600, 0, 5) + " hours", 10, 10);
}

function reset() {
  const avg = (pow(10, 2) + pow(10, 5)) / 2;
  const options = {'m':avg, 'dm':avg-pow(10, 1)};
  options.color = color(255, 0, 0);
  space.addParticle(0, 60, 100, 30, pow(10, 5), options);
  options.color = color(0, 255, 0);
  space.addParticle(0, 0, -1000, -300, pow(10, 4), options);
  options.color = color(0, 0, 255);
  space.addParticle(0, -10, -150, -300, pow(10, 2), options);
  options.color = color(0, 0, 0);
  space.addParticle(0, 120, iVx, -30, pow(10, 1), options);
  space.initImpulse();
  if (space.targetOptions) {
    space.setTarget(Object.assign(space.targetOptions, {'needClear':false}));
  }
}

function updateGraph() {
  const x = (iVx - initIVX)/dIVX * 2;
  graph.stroke(255, 0, 0);
  graph.strokeWeight(1);
  graph.line(x, height, x, height - log(time+1) * 100);
  results.push([iVx, time]);
  console.log('Boom! ' + iVx + ' ' + nf(time, 1, 3) + ' best:' + nf((results.sort((a,b) => b[1]-a[1])[0][1]), 1, 3));
  while (space.particles.length) {
    space.particles.pop();
  }
  time = 0;
  iVx += dIVX;
}