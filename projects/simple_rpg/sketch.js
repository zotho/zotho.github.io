let canvas;

let canvasWidth = 600,
    canvasHeight = 600;

let char;
let icons;

let frameCount = 0;

let fr = 60;
let dt = 0;
let fDt = 0;
let frameTime = 200;
let newTime = 0;
let fFrames = 0;
let nFrames = 0;

let players = [];
let currPlayers = [];


function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  canvas = createCanvas(canvasWidth, canvasHeight).canvas;

  icons = loadImage('textures/icons.png');

  char = new TileCharacter('Elven_Archer');
  
  players.push({id:0, key: 49, group:51, player:new Player('Elven_Archer', width/2-100, height/2)});
  players.push({id:1, key: 50, group:51, player:new Player('Death_Knight', width/2+100, height/2)});
  currPlayers = [players[0]];
}

function draw() {
  background(255);

  // let x = 500,
  //     y = 10;

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
      currPlayers.forEach((player) => {player.player.nextAim = createVector(mouseX, mouseY)});
    }
    if (mouseButton === RIGHT) {
      currPlayers.forEach((player) => {player.player.nextTarget = createVector(mouseX, mouseY)});
    }
    if (mouseButton === CENTER) {
      currPlayers.forEach((player) => {player.player.rpg.health = 0});
    }
  }

  pfFrames = fFrames;

  fr = frameRate();
  fr = fr > 20 ? fr : 20;
  dt = 1000 / (fr || 1);
  fDt = dt/frameTime;
  fFrames += fDt;

  // Update all players
  for (let i = 0; i < players.length; i++) {
    players[i].player.update(fFrames, fDt);
  }

  fFrames = fFrames%1;
  frameCount += nFrames;

  // Sort for draw far players first
  players.sort((a,b) => {
    if (a.player.pos.y < b.player.pos.y) {
      return -1;
    }
    if (a.player.pos.y > b.player.pos.y) {
      return 1;
    }
    return 0;
  })

  // Draw all players
  for (let i = 0; i < players.length; i++) {
    players[i].player.draw();
  }

  const pad = 20;
  push();
  
  const first = currPlayers.some(p => p.id == 0);
  const second = currPlayers.some(p => p.id == 1);
  
  strokeWeight(14 - 5*first);
  stroke(0, 0, 200 * first);
  rect(pad, pad, icons.width, icons.height*2);
  
  strokeWeight(14 - 5*second);
  stroke(200 * second, 0, 0);
  rect(pad*2+icons.width, pad, icons.width, icons.height*2);

  let rpg = players.find(p => p.id == 0).player.rpg;
  if (rpg && rpg.health <= 0) {
    let img = createImage(icons.width, icons.height);
    img.copy(icons, 0, 0, icons.width, icons.height, 0, 0, icons.width, icons.height);
    img.filter(GRAY);
    image(img, pad, pad, icons.width, icons.height*2, 0, 0, icons.width/2, icons.height);
  } else {
    image(icons, pad, pad, icons.width, icons.height*2, 0, 0, icons.width/2, icons.height);
  }

  rpg = players.find(p => p.id == 1).player.rpg;
  if (rpg && rpg.health <= 0) {
    let img = createImage(icons.width, icons.height);
    img.copy(icons, 0, 0, icons.width, icons.height, 0, 0, icons.width, icons.height);
    img.filter(GRAY);
    image(img, 
      pad*2 + icons.width,  pad, 
      icons.width,          icons.height*2, 
      icons.width/2,        0, 
      icons.width/2,        icons.height);
  } else {
    image(icons, 
      pad*2 + icons.width,  pad, 
      icons.width,          icons.height*2, 
      icons.width/2,        0, 
      icons.width/2,        icons.height);
  }

  pop();

}

function mouseDragged(event) {
  // console.log(event);
  if (event.which == 1) {
    currPlayers.forEach((player) => {player.player.nextAim = createVector(event.x, event.y)});
  } else if (event.which == 3) {
    currPlayers.forEach((player) => {player.player.nextTarget = createVector(event.x, event.y)});
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
    currPlayers.forEach((player) => {player.player.nextAim = createVector(event.x, event.y)});
  } else if (event.which == 3) {
    currPlayers.forEach((player) => {player.player.nextTarget = createVector(event.x, event.y)});
    // console.log(player.target);
  }
  return false;
}

function mouseClicked(event) {
  return false;
}

function keyPressed() {
  for (let i = 0; i < players.length; i++) {
    if (players[i].key == keyCode) {
      currPlayers = [players[i]];
      return false; // prevent default
    }
  }
  let currGroup = [];
  for (let i = 0; i < players.length; i++) {
    if (players[i].group == keyCode) {
      currGroup.push(players[i]);
    }
  }
  if (currGroup.length) {
    currPlayers = currGroup;
  }
}