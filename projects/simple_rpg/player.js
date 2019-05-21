class Player {
  constructor(name, x, y) {
    this.tiles = new TileCharacter(name);
    this.tiles.drawMode = 'center';

    this.frame = 0;

    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.standFriction = 0.2;
    this.walkFriction = 0.9;

    this.availableDirs = ["N","NE","E","SE","S","SW","W","NW"];
    this.dir = "N";
    this.diff = createVector();

    this.aim = null;
    this.nextAim = null;
    this.aimRadius = 100;

    this.target = null;
    this.nextTarget = null;
    this.targetRadius = 20;
    this.stoppingRadius = 150;

    // triggers for FSM https://en.wikipedia.org/wiki/Finite-state_machine
    this.stateTriggers = new Set();
    // state for FSM
    this.action = "still";
    this.stillDirTime = 10; // time to change dir in still state
    this.stillDirLastTime = 0;
    this.attackMaxSpeed = 1;
    // set frame to zero if rotate speed greater
    this.attackMaxRotateSpeed = PI / 3;

    this.tiles.loading.then(
      result => {
        this.actions = result.texture_json.actions;
        this.rpg = result.texture_json.rpg;

        this.projectile = new Projectile(this.rpg.weapon.projectile);
        this.projectilesMax = 5;
        this.projectiles = [];
        for (let i = 0; i < this.projectilesMax; i++) {
          this.projectiles[i] = this.projectile.copy();
          this.projectiles[i].pos = createVector();
          this.projectiles[i].vel = createVector();
          this.projectiles[i].tiles.loading.then(
            result => {
              this.projectiles[i].onTileLoaded(result);
            },
            error => {
              console.error(error);
            }
          );
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  update(frames, dt) {
    // FIXME
    if (!this.actions) {
      return;
    }

    for (let i = 0; i < this.projectiles.length; i++) {
      this.projectiles[i].update(frames, dt)
    }

    let nFrames = Math.floor(frames);
    if (nFrames > 0) {
      this.frame += nFrames;

      this.updateTriggers();
      this.updateStates();
    }

    this.vel.add(p5.Vector.mult(this.acc, dt));
    this.vel.limit(this.rpg.speed);
    if (["still", "attack", "dying"].indexOf(this.action) != -1) {
      this.vel.mult(map(dt, 0, 1, 1, this.standFriction));
      if (this.vel.mag() < 0.01) {
        this.vel.set();
      }
    } else if (this.action == "walk") {
      let vTan = createVector(this.acc.x, this.acc.y);
      vTan.mult(cos(vTan.angleBetween(this.vel) | 0) * this.vel.mag() / this.acc.mag());
      let vNorm = p5.Vector.sub(this.vel, vTan);

      vTan.mult(map(dt, 0, 1, 1, this.walkFriction));
      vNorm.mult(map(dt, 0, 1, 1, this.standFriction));
      this.vel.set(p5.Vector.add(vTan, vNorm));
    }
    this.pos.add(p5.Vector.mult(this.vel, dt));
    // this.acc.set();

    // console.log(nf(this.vel.mag(),0, 3), nf(this.acc.mag(), 0, 3), this.action);
  }

  draw() {
    if (this.actions) {
      for (let i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].draw();
      }

      this.tiles.draw(this.pos.x, this.pos.y, this.action, this.dir, this.frame, this.action == "dying");
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

  updateTriggers() {
    if (this.nextTarget) {
      if (["still", "walk", "attack"].indexOf(this.action) != -1) {
        this.target = this.nextTarget;
        this.stateTriggers.add("getTarget");
      }
      this.nextTarget = null;
    }

    if (this.nextAim) {
      if (["still", "walk", "attack"].indexOf(this.action) != -1) {
        if (this.vel.mag() < this.attackMaxSpeed) {
          if (this.aim) {
            const nextDiff = p5.Vector.sub(this.nextAim, this.pos);
            if (this.diff.angleBetween(nextDiff) > this.attackMaxRotateSpeed) {
              this.frame = 0;
            }
          }
          this.aim = this.nextAim;
          this.nextAim = null;
        } else {
          this.aim = null;
        }
        this.stateTriggers.add("getAim");
      }
    }

    if (this.action == "walk") {
      if (p5.Vector.sub(this.target, this.pos).mag() < this.targetRadius) {
        // this.target = null;
        this.stateTriggers.add("targetReached");
      }
    }

    if (this.action == "attack") {
      if (this.frame % this.actions.attack.nFrames == 0) {
        this.stateTriggers.add("loseAim");
      }
    }

    if (["still", "walk", "attack"].indexOf(this.action) != -1) {
      if (this.rpg.health <= 0) {
        this.stateTriggers.add("dying");
      }
    }
  }

  updateStates() {
    const pAction = this.action;

    if (this.stateTriggers.has("dying")) {
      this.action = "dying";
      this.target = null;
      this.aim = null;
      this.stateTriggers.clear();
    }

    if (this.stateTriggers.has("getAim")) {
      if (this.aim) {
        this.action = "attack";
      } else {
        this.action = "still";
      }
      this.target = null;
      this.stateTriggers.clear();
    }

    if (this.stateTriggers.has("getTarget")) {
      this.action = "walk";
      this.aim = null;
    }

    if (this.stateTriggers.has("targetReached")) {
      this.action = "still";
      this.target = null;
    }

    if (this.stateTriggers.has("loseAim")) {
      this.action = "still";
      this.aim = null;
    }

    this.stateTriggers.clear();

    if (this.action != pAction) {
      this.frame = 0;
    }

    this.acc.set();
    if (this.action == "still") {
      if (this.frame>this.stillDirLastTime+this.stillDirTime) {
        this.dir = random(this.availableDirs);
        this.stillDirLastTime = this.frame;
      }

    } else if (this.action == "walk") {
      this.stillDirLastTime = 0;
      this.diff = p5.Vector.sub(this.target, this.pos);
      this.acc.set(this.diff);
      if (this.diff.mag() > this.targetRadius) {
        this.acc.setMag(map(this.diff.mag(), this.targetRadius, this.stoppingRadius, 0.0001, this.rpg.acceleration));
        this.acc.limit(this.rpg.acceleration);
      } else {
        this.acc.setMag(0.0001);
        this.frame = 0;
      }
      this.dir = this.availableDirs[this.angle8(this.diff)];

    } else if (this.action == "attack") {
      this.stillDirLastTime = 0;
      this.diff = p5.Vector.sub(this.aim, this.pos);
      this.dir = this.availableDirs[this.angle8(this.diff)];
      if (this.frame % this.actions.attack.nFrames == this.rpg.weapon.shotFrame) {
        // Find max range particle
        let proj = this.projectiles[0];
        for (let i = 0; i < this.projectiles.length; i++) {
          // console.log("projectile "+i+" "+(this.projectiles[i].alive ? "alive" : "dead")+" "+this.projectiles[i].range)
          if (!this.projectiles[i].alive) {
            proj = this.projectiles[i];
            break;
          }
          if (this.projectiles[i].range > proj.range) {
            proj = this.projectiles[i];
          }
        }
        let projVel = createVector(this.diff.x, this.diff.y);
        projVel.setMag(this.projectile.velMax); 
        proj.reset(this.pos.x, this.pos.y, projVel.x, projVel.y);
      }

    } else if (this.action == "dying") {
      this.stillDirLastTime = 0;
      this.dir = this.availableDirs[this.angle4(this.diff)];

    }

    
  }
}