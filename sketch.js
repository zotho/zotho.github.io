let canvas;

let canvasWidth = 600,
    canvasHeight = 600;

let texture;

let char;
let frameCount = 0;

let time = 0;
let fr = 60;
let dt = 0;
let fDt = 0;
let frameTime = 200;
let newTime = 0;
let fFrames = 0;
let nFrames = 0;

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  canvas = createCanvas(canvasWidth, canvasHeight).canvas;
  smooth();

  char = new TileCharacter('Elven_Archer');
  player = new Player('Elven_Archer', width/2, height/2);

  player2 = new Player('Death_Knight', width/2, height/2);

  // frameRate(4);
  // noLoop();
  // time = millis();
}

function draw() {
  background(255);

  let x = 500,
      y = 10;

  // rect(x-10, y-10, 500, 500);

  // char.draw(x, y, "dying", "NE", frameCount);
  // char.draw(x+50*1, y, "dying", "SE", frameCount);

  // char.draw(x+50*2, y, "walk", "N", frameCount);
  // char.draw(x+50*3, y, "walk", "NE", frameCount);
  // char.draw(x+50*4, y, "walk", "E", frameCount);
  // char.draw(x+50*5, y, "walk", "SE", frameCount);
  // char.draw(x+50*6, y, "walk", "S", frameCount);
  // char.draw(x+50*7, y, "walk", "NW", frameCount);
  // y += 70;
  // char.draw(x+50*2, y, "attack", "N", frameCount);
  // char.draw(x+50*3, y, "attack", "NE", frameCount);
  // char.draw(x+50*4, y, "attack", "E", frameCount);
  // char.draw(x+50*5, y, "attack", "SE", frameCount);
  // char.draw(x+50*6, y, "attack", "S", frameCount);
  // y += 70;
  // char.draw(x+50*2, y, "still", "N", frameCount);
  // char.draw(x+50*3, y, "still", "NE", frameCount);
  // char.draw(x+50*4, y, "still", "E", frameCount);
  // char.draw(x+50*5, y, "still", "SE", frameCount);
  // char.draw(x+50*6, y, "still", "S", frameCount);

  if (mouseIsPressed) {
    if (mouseButton === LEFT) {
      player2.nextAim = createVector(mouseX, mouseY);
    }
    if (mouseButton === RIGHT) {
      player2.nextTarget = createVector(mouseX, mouseY);
    }
    if (mouseButton === CENTER) {
      player2.rpg.health = 0;
    }
  }

  pfFrames = fFrames;

  fr = frameRate();
  fr = fr > 20 ? fr : 20;
  dt = 1000 / (fr || 1);
  fDt = dt/frameTime;
  fFrames += fDt;
  player2.update(fFrames, fDt);
  fFrames = fFrames%1;
  player2.draw();

  // time = millis();

  // circle((100+time/10)%500, 100, 50);
  // point((100+time/10)%500, player.pos.y);
  // line((100+time/10)%500, pfFrames, (100+time/10)%500, fFrames);

  frameCount += nFrames;
}

function mouseDragged(event) {
  // console.log(event);
  if (event.which == 1) {
    player2.nextAim = createVector(event.x, event.y);
  } else if (event.which == 3) {
    player2.nextTarget = createVector(event.x, event.y);
    // console.log(player.target);
  }
  return false;
}

function mouseReleased(event) {
  // console.log(event);
  return false;
}

function mousePressed(event) {
  // console.log(event);
  if (event.which == 1) {
    player2.nextAim = createVector(event.x, event.y);
  } else if (event.which == 3) {
    player2.nextTarget = createVector(event.x, event.y);
    // console.log(player.target);
  }
  return false;
}

function mouseClicked(event) {
  return false;
}