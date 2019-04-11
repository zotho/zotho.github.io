class TileCharacter {
  constructor(name) {
    this.texture_src = null;
    this.texture_json_src = name+'.json';
    this.texture = null;
    this.texture_json = null;
    this.tiles = [];
    this.imgDone = false;
    this.jsonDone = false;

    this.drawMode = 'zero'; // center, zero
    this.loading = this.load();
  }

  async load() {
    let src = 'textures/'+this.texture_json_src;
    this.texture_json = await ( (s) => new Promise((resolve) => {
      let json = loadJSON(s, () => {resolve(json)});
    }))(src);
    console.log('json done');
    this.jsonDone = true;

    this.texture_src = this.texture_json.source;

    src = 'textures/'+this.texture_src;
    const promise = ((s) => new Promise((resolve) => {
      let tex = loadImage(s, resolve, event => {console.error(event)})
    }))(src);

    this.name = this.texture_json.name;

    let json_tiles = this.texture_json.tiles;
    for (let t = 0; t < json_tiles.length; t++) {
      let tiles_rect = json_tiles[t];
      for (let i = 0; i < tiles_rect.nRows; i++) {
        let y = tiles_rect.offsetY + i * tiles_rect.height/tiles_rect.nRows;
        for (let j = 0; j < tiles_rect.nCols; j++) {
          let x = tiles_rect.offsetX + j * tiles_rect.width/tiles_rect.nCols;
          this.tiles.push({ x:Math.round(x),
                            y:Math.round(y),
                            w:Math.round(tiles_rect.width/tiles_rect.nCols),
                            h:Math.round(tiles_rect.height/tiles_rect.nRows)
                          })
        }
      }
    }

    this.texture = await promise;
    console.log('image done');
    this.imgDone = true;
    return this;
  }

  draw(x, y, action, direction, frame, noLoop) {
    if (this.jsonDone && this.imgDone) {
      let dir = direction;
      let horizontalFlip = false;
      if (direction.includes("W")) {
        horizontalFlip = true;
        dir = dir.replace("W", "E");
      }

      let json_action = this.texture_json.actions[action];
      let f = frame % json_action.nFrames;
      if (noLoop && frame > f) {
        f = json_action.nFrames - 1;
      }
      let iFrame = json_action.directions[dir][json_action.timeFrames[f]];
      let tile = this.tiles[iFrame];

      push();
      let oX = 0;
      let oY = 0;
      if (this.drawMode == 'center') {
        oX += tile.w/2;
        oY += tile.h/2
      }

      if (horizontalFlip) {
        translate(Math.round(x + tile.w - oX), Math.round(y - oY));
        scale(-1, 1);
      } else {
        translate(Math.round(x - oY), Math.round(y - oY));
      }
      image(this.texture, 0, 0, tile.w, tile.h, tile.x, tile.y, tile.w, tile.h);
      pop();
    }
  }

}