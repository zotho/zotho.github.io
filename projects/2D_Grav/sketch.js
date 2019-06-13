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
const fixedDt = 0.001;
let error;

// const initIVX = 1157;
const initIVX = 965;
let dIVX = -1;
let iVx = initIVX;

let graphShow = true;
let graph;
let results = [];

let markersShow = true;
let markers;
let canv;

function setup() {
  const divSpeed = createDiv().id('settingsDiv');
  // divSpeed.elt.setAttribute('style','display:flex;');
  const fSpeedToText = ()=>'Speed: '+nf(multDt, 2, 4);
  const d0 = createDiv(fSpeedToText()).id('speedText');
  const fMultSpeed = (n)=>{
    multDt *= n;
    document.getElementById('speedText').textContent = fSpeedToText()
  };
  const b0 = createButton('x1/2').id('double').mousePressed(()=>fMultSpeed(1/2));
  const b1 = createButton('  x2').id('half')  .mousePressed(()=>fMultSpeed(2));

  const fTargetToText = ()=>'Target: '+ 
    (space.targetOptions.index != undefined ? 
      space.targetOptions.index : 
      space.targetOptions.impulse ? 
        'COM' : 
        'none'
    );
  const d1 = createDiv('none').id('targetText');
  const fChangeTarget = (n)=>{
    if (n != -1) {
      space.setTarget({'index':n, 'layers':[canv, markers], 'needClear':true});
    } else {
      space.setTarget({'impulse':true, 'layers':[canv, markers], 'needClear':true});
    }
    document.getElementById('targetText').textContent = fTargetToText();
  };
  const b2_c = createButton('COM').id('tc').mousePressed(()=>fChangeTarget(-1));
  const b2_0 = createButton('0').id('t0').mousePressed(()=>fChangeTarget(0));
  const b2_1 = createButton('1').id('t1').mousePressed(()=>fChangeTarget(1));
  const b2_2 = createButton('2').id('t2').mousePressed(()=>fChangeTarget(2));

  const fChangeImpulse = ()=>{
    markersShow = !markersShow;
    document.getElementById('impulse').textContent=(markersShow?'Hide Impulse':'Show Impulse');
  }
  const b3 = createButton('Hide Impulse').id('impulse').mousePressed(fChangeImpulse);

  const b4 = createButton('Restart').id('restart').mousePressed(reset);
  // const b4 = createButton('Restart').id('restart').mousePressed(reset);
  const all = [d0, b0, b1, d1, b2_c, b2_0, b2_1, b2_2, b3, b4];
  all.forEach((e)=>{e.class('settings')});
  divSpeed.elt.append(...all.map(e=>e.elt), );

  createCanvas(windowWidth, windowHeight - divSpeed.elt.scrollHeight);
  canv = createGraphics(windowWidth, windowHeight);
  graph = createGraphics(windowWidth, windowHeight);
  markers = createGraphics(windowWidth, windowHeight);
  space = new Space();
  reset();
  space.initImpulse();
  space.addRectWalls({
    // 'type': 'teleport',
    'type': 'bounce',
    'left': -30000,
    'right': 30000,
    'top': -30000,
    'bottom': 30000,
    'r': 0.1,
  });
  // space.setTarget({'impulse':true});
}

function draw() {
  dt = multDt / (frameRate() || 1000);
  nFrames = dt / fixedDt;
  nFrames = min(nFrames, 500);
  time += floor(nFrames) * fixedDt;

  // Updating
  // for (let i = 0; i < nFrames; ++i) {
  //   space.updateAcc(fixedDt);
  //   space.updateVel(fixedDt);
  //   space.updatePos(fixedDt);
  //   space.updateWalls();
  // }
  space.updateNTimes(nFrames, fixedDt).then( ()=>{
    canv.resetMatrix();
    canv.translate(width / 2 - space.target.x, height / 2 - space.target.y);
    // const backgroundAlpha = 100 - max(100*pow((100-0.1)/100, ceil(nFrames)), 2);
    // canv.background(255, backgroundAlpha);
    space.draw(canv, true, nFrames);
    clear();
    image(canv, 0, 0);
  } ).then( ()=>{
    space.countImpulse();
    space.countError();
    if (space.error.vn > 0.1) {
      updateGraph();
      reset();
    }
    if (markersShow) {
    	markers.resetMatrix();
    	markers.translate(width / 2 - space.target.x, height / 2 - space.target.y);
    	markers.clear();
    	space.drawImpulse(markers);
    	space.drawError(markers);
    	image(markers, 0, 0);
    };
    if (graphShow) image(graph, 0, 0);
    // text("Time: " + nf(time / 3600, 0, 5) + " hours", 10, 10);
  });

}

function reset() {
  const minMass = pow(10, -3);
  const maxMass = pow(10, 5);
  const avg = (minMass + maxMass) / 2;
  const options = {'m':avg, 'dm':avg-minMass};
  options.color = color(255, 0, 0);
  space.addParticle(0, 60, 100, 30, pow(10, 5), options);
  options.color = color(0, 255, 0);
  space.addParticle(0, 0, -1000, -300, pow(10, 4), options);
  options.color = color(0, 0, 255);
  space.addParticle(0, -10, -150, -300, pow(10, 2), options);
  // options.color = color(0, 0, 0);
  // space.addParticle(0, 120, iVx, -30, pow(10, 1), options);
  space.addRandomGaussianField( 100, 0, 300, 0, 300, 0, 1000, 0, 1000, pow(10, -2), pow(10, -2),
    {'drop':true, 'm':options.m, 'dm':options.dm} 
  );
  space.initImpulse();
  space.setTarget(Object.assign(space.targetOptions, {'needClear':false}));
  dt = multDt / 60;;
}

function updateGraph() {
  const x = (iVx - initIVX)/dIVX * 2;
  graph.stroke(255, 0, 0);
  graph.strokeWeight(1);
  graph.line(x, height, x, height - log(time+1) * 100);
  results.push([iVx, time]);
  // console.log('Boom! ' + iVx + ' ' + nf(time, 1, 3) + ' best:' + nf((results.sort((a,b) => b[1]-a[1])[0][1]), 1, 3));
  while (space.particles.length) {
    space.particles.pop();
  }
  time = 0;
  iVx += dIVX;
}