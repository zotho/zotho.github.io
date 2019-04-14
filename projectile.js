class Projectile {
  constructor(name) {
    this.tiles = new TileCharacter(name);
    this.tiles.drawMode = 'center';

    this.frame = 0;

    this.pos = createVector();
    this.vel = createVector();
    this.acc = null;
    this.flyFriction = null;

    this.availableDirs = ["N","NE","E","SE","S","SW","W","NW"];
    this.dir = "N";
    
    this.range = 0;
    this.alive = false;

    this.action = null;

    this.tiles.loading.then(
      result => {
        this.onTileLoaded(result)
      },
      error => {
        console.error(error);
      }
    );
  }

  onTileLoaded(result) {
    this.action = Object.keys(result.texture_json.actions)[0];
    this.rangeMax = result.texture_json.rangeMax;
    this.velMax = result.texture_json.velMax;
    if (result.texture_json.acc) {
      this.acc = createVector(...result.texture_json.acc);
    }
    if (result.texture_json.flyFriction !== undefined) {
      this.flyFriction = result.texture_json.flyFriction;
    }
  }

  reset(x, y, vx, vy) {
    this.pos.set(x, y);
    this.vel.set(vx, vy);
    this.frame = 0;
    this.range = 0;
    this.alive = true;
  }

  copy() {
    let clone = Object.assign( Object.create( Object.getPrototypeOf(this) ), this);
    return clone;
  }

  update(frames, dt) {
    let nFrames = Math.floor(frames);
    if (this.alive && this.action) {
      this.frame += nFrames;
      
      if (this.flyFriction) {
        this.vel.mult(map(dt, 0, 1, 1, this.flyFriction));
      }
        
      // Gravity
      if (this.acc) {
        this.vel.add(p5.Vector.mult(this.acc, dt))
      }
      
      let dPos = p5.Vector.mult(this.vel, dt);
      this.pos.add(dPos);
      this.dir = this.availableDirs[this.angle8(this.vel)]
      this.range += dPos.mag();
      if (this.range > this.rangeMax || this.vel.mag() < 0.1) {
        this.alive = false;
      }
    }
  }

  draw() {
    if (this.alive) {
      this.tiles.draw(this.pos.x, this.pos.y, this.action, this.dir, this.frame);
    }
  }

  // dir index for N NE E SE S SW W NW
  angle8(diff) { 
    let angle = Math.round(diff.heading()/PI*4 + 8) - 8 + 2;
    if (angle < 0) {
      angle += 8;
    }
    return angle;
  }

  // dir index for NE SE SW NW
  angle4(diff) {
    let angle = Math.round(diff.heading()/PI*2 + 0.5 + 4) - 4;
    if (angle < 0) {
      angle += 4;
    }
    return angle * 2 + 1;
  }

  
}