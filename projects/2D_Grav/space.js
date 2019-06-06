class Space {
  constructor(G) {
    // this.G = (G || 6.11 * Math.pow(10, -11) );
    this.G = (G || 6.11 * Math.pow(10, 2) );
    this.particles = [];
    this.walls = {'on': false};

    this.x = NaN;
    this.y = NaN;
    this.vx = NaN;
    this.vy = NaN;
    this.vn = NaN;
    this.m = NaN;
    this.initStat = {};
    this.error = {};
    this.target = {
      'x':0,
      'y':0,
    }
    this.targetOptions = {
      'needClear':false,
    };
  }

  updatePos(dt) {
    for (let p of this.particles) {
      p.updatePos(dt);
    }
  }

  updateVel(dt) {
    for (let p of this.particles) {
      p.updateVel(dt);
    }
  }

  updateAcc(dt) {
    let p0, p1, dist, dx, dy, ax, ay, mult, lim, limR;
    for (let i0 = 0; i0 < this.particles.length - 1; ++i0) {
      for (let i1 = i0 + 1; i1 < this.particles.length; ++i1) {
        p0 = this.particles[i0];
        p1 = this.particles[i1];
        dx = p1.x - p0.x;
        dy = p1.y - p0.y;
        dist = sqrt(sq(dx) + sq(dy));
        mult = this.G / pow(dist, 3);
        ax = dx * mult;
        ay = dy * mult;
        p0.ax += ax * p1.m;
        p0.ay += ay * p1.m;
        p1.ax -= ax * p0.m;
        p1.ay -= ay * p0.m;
      }
    }
  }

  updateWalls() {
    if (this.walls.on) {
      if (this.walls.type == 'bounce') {
        for (let p of this.particles) {
          if (p.x < this.walls.left) {
            p.x = this.walls.left + (this.walls.left - p.x);
            p.vx *= -this.walls.r;
          }
          if (p.x > this.walls.right) {
            p.x = this.walls.right - (p.x - this.walls.right);
            p.vx *= -this.walls.r;
          }
          if (p.y < this.walls.top) {
            p.y = this.walls.top + (this.walls.top - p.y);
            p.vy *= -this.walls.r;
          }
          if (p.y > this.walls.bottom) {
            p.y = this.walls.bottom - (p.y - this.walls.bottom);
            p.vy *= -this.walls.r;
          }
        }
      } else if (this.walls.type == 'teleport') {
        for (let p of this.particles) {
          if (p.x < this.walls.left) {
            p.x = this.walls.right - (this.walls.left - p.x);
            p.vx *= this.walls.r;
          }
          if (p.x > this.walls.right) {
            p.x = this.walls.left + (p.x - this.walls.right);
            p.vx *= this.walls.r;
          }
          if (p.y < this.walls.top) {
            p.y = this.walls.bottom - (this.walls.top - p.y);
            p.vy *= this.walls.r;
          }
          if (p.y > this.walls.bottom) {
            p.y = this.walls.top + (p.y - this.walls.bottom);
            p.vy *= this.walls.r;
          }
        }
      }
    }
  }

  draw(layer) {
    for (let p of this.particles) {
      p.draw(layer);
    }
  }

  drawImpulse(layer) {
    if (layer) {
      layer.stroke(255, 0, 0);
      // Draw center of mass
      layer.line(
        this.x - 10,
        this.y,
        this.x + 10,
        this.y,
      )
      layer.line(
        this.x,
        this.y - 10,
        this.x,
        this.y + 10,
      )
      layer.stroke(0, 255, 0);
      // Draw avg velocity
      layer.line(
        this.x,
        this.y,
        this.x + this.vx * 200,
        this.y + this.vy * 200,
      )
    } else {
      stroke(255, 0, 0);
      // Draw center of mass
      line(
        this.x - 10,
        this.y,
        this.x + 10,
        this.y,
      )
      line(
        this.x,
        this.y - 10,
        this.x,
        this.y + 10,
      )
      stroke(0, 255, 0);
      // Draw avg velocity
      line(
        this.x,
        this.y,
        this.x + this.vx * 200,
        this.y + this.vy * 200,
      )
    }
  }

  drawError(layer) {
    if (layer) {
      layer.stroke(0, 0, 255);
      layer.line(
        this.error.x,
        this.error.y,
        this.error.x + this.error.vx * 200,
        this.error.y + this.error.vy * 200,
      )
    } else {
      stroke(0, 0, 255);
      line(
        this.error.x,
        this.error.y,
        this.error.x + this.error.vx * 200,
        this.error.y + this.error.vy * 200,
      )
    }
  }

  countImpulse() {
    if (this.particles.length) {
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.vn = 0;
      this.m = 0;
      for (let p of this.particles) {
        this.x += p.x * p.m;
        this.y += p.y * p.m;
        this.vx += p.vx * p.m;
        this.vy += p.vy * p.m;
        this.m += p.m;
      }
      this.x /= this.m;
      this.y /= this.m;
      this.vx /= this.m;
      this.vy /= this.m;
      this.vn = sqrt(sq(this.vx) + sq(this.vy));
    } else {
      this.x = NaN;
      this.y = NaN;
      this.vx = NaN;
      this.vy = NaN;
      this.vn = NaN;
      this.m = NaN;
    }
  }

  countError() {
    this.error.x = this.x - this.initStat.x;
    this.error.y = this.y - this.initStat.y;
    this.error.vx = this.vx - this.initStat.vx;
    this.error.vy = this.vy - this.initStat.vy;
    this.error.vn = sqrt(sq(this.error.vx) + sq(this.error.vy));
    this.error.m = this.m - this.initStat.m;
  }

  initImpulse() {
    this.countImpulse();
    this.initStat.x = this.x;
    this.initStat.y = this.y;
    this.initStat.vx = this.vx;
    this.initStat.vy = this.vy;
    this.initStat.vn = this.vn;
    this.initStat.m = this.m;
  }

  setTarget(options) {
  // Using
  // space.setTarget({'index':0, 'layers':[canv, markers]})
    if (options.needClear) {
      if (options.layers) {
        for (let l of options.layers) {
          l.clear();
        }
      }
      clear();
    }
    if (options.impulse) {
      this.target = this;
    } else if (options.index !== undefined) {
      this.target = (this.particles[options.index] || this.target);
    }
    this.targetOptions = Object.assign({}, options);
  }

  addParticle(x, y, vx, vy, m, options) {
    this.particles.push( new Particle(x, y, vx, vy, m, Object.assign({}, options) ) );
  }

  addRandomGaussianField(count, x, dx, y, dy, vx, dvx, vy, dvy, m, dm, options) {
    for (let i = 0; i < count; ++i) {
      this.addParticle(randomGaussian(x, dx),
                       randomGaussian(y, dy),
                       randomGaussian(vx, dvx),
                       randomGaussian(vy, dvy),
                       randomGaussian(m, dm),
                       Object.assign((options || {}), {'m':m, 'dm':dm}),
                      );
    }
  }

  addRectWalls(options) {
    this.walls.on = true;
    this.walls.type = (options.type || 'bounce');
    this.walls.left = (options.left || -100);
    this.walls.right = (options.right || 100);
    this.walls.top = (options.top || -100);
    this.walls.bottom = (options.bottom || 100);
    this.walls.r = (options.r || 1);
  }
}