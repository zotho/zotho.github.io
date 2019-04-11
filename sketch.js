let canvas;

let canvasWidth = 600,
    canvasHeight = 600;

let texture;

let char;
let frameCount = 0;

let time = 0;
let dt = 0;
let frameTime = 200;

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  canvas = createCanvas(canvasWidth, canvasHeight).canvas;
  smooth();

  char = new TileCharacter('Elven_Archer');
  player = new Player('Elven_Archer', width/2, height/2);

  // frameRate(4);
  // noLoop();
  time = millis();
}

function draw() {
  background(255);

  let x = 500,
      y = 10;

  // rect(x-10, y-10, 500, 500);

  char.draw(x, y, "dying", "NE", frameCount);
  char.draw(x+50*1, y, "dying", "SE", frameCount);

  char.draw(x+50*2, y, "walk", "N", frameCount);
  char.draw(x+50*3, y, "walk", "NE", frameCount);
  char.draw(x+50*4, y, "walk", "E", frameCount);
  char.draw(x+50*5, y, "walk", "SE", frameCount);
  char.draw(x+50*6, y, "walk", "S", frameCount);
  char.draw(x+50*7, y, "walk", "NW", frameCount);
  y += 70;
  char.draw(x+50*2, y, "attack", "N", frameCount);
  char.draw(x+50*3, y, "attack", "NE", frameCount);
  char.draw(x+50*4, y, "attack", "E", frameCount);
  char.draw(x+50*5, y, "attack", "SE", frameCount);
  char.draw(x+50*6, y, "attack", "S", frameCount);
  y += 70;
  char.draw(x+50*2, y, "still", "N", frameCount);
  char.draw(x+50*3, y, "still", "NE", frameCount);
  char.draw(x+50*4, y, "still", "E", frameCount);
  char.draw(x+50*5, y, "still", "SE", frameCount);
  char.draw(x+50*6, y, "still", "S", frameCount);

  if (mouseIsPressed) {
    if (mouseButton === LEFT) {
      player.nextAim = createVector(mouseX, mouseY);
    }
    if (mouseButton === RIGHT) {
      player.nextTarget = createVector(mouseX, mouseY);
    }
    if (mouseButton === CENTER) {
      player.rpg.health = 0;
    }
  }

  let newTime = millis();
  dt += newTime - time;
  time = newTime;
  let fFrames = dt/frameTime;
  let nFrames = Math.floor(fFrames);
  dt = dt - nFrames*frameTime;
  player.update(fFrames);
  player.draw();

  frameCount += nFrames;
}

function mouseDragged(event) {
  // console.log(event);
  if (event.which == 1) {
    player.nextAim = createVector(event.x, event.y);
  } else if (event.which == 3) {
    player.nextTarget = createVector(event.x, event.y);
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
    player.nextAim = createVector(event.x, event.y);
  } else if (event.which == 3) {
    player.nextTarget = createVector(event.x, event.y);
    // console.log(player.target);
  }
  return false;
}

function mouseClicked(event) {
  return false;
}