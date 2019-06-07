class Particle {
  constructor(x, y, vx, vy, m, options) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = 0;
    this.ay = 0;
    this.m = m;

    this.options = (options || {'m':m, 'dm':1});
    this.om = this.options.m;
    this.odm = this.options.dm;

    // vars for save memory
    this.limAR = 1;
    this.limVR = 1.1;
    this.limC = 10000000;
    this.lim = 0;
    // this.trail = [this.pos.copy()];
    
    this.toDelete = false;
  }

  updatePos(dt) {
    this.x += this.vx * dt;  
    this.y += this.vy * dt;  
  }

  updateVel(dt) {
    this.lim = sqrt(sq(this.ax) + sq(this.ay));
    if (this.lim > this.limC) {
      this.limAR = this.limC / this.lim;
      this.ax *= this.limAR;
      this.ay *= this.limAR;
      this.vx *= this.limVR;
      this.vy *= this.limVR;
    }    

    this.vx += this.ax * dt;  
    this.vy += this.ay * dt;  
    this.ax = 0;
    this.ay = 0;
  }

  draw(layer) {
    if (layer) {
      layer.stroke(this.options.color || color(255, 0, 0));
      layer.circle(this.x, this.y, pow(map(this.m, this.om - this.odm, this.om + this.odm, 1, 216), 1/3) );
    } else {
      stroke(this.options.color || color(255, 0, 0));
      circle(this.x, this.y, pow(map(this.m, this.om - this.odm, this.om + this.odm, 1, 216), 1/3) );
    }
    // noFill();
    // beginShape();
    // for (const v of this.trail) {
    //   vertex(v.x, v.y);
    // }
    // endShape();
  }
}