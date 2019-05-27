function newBox() {
  var randomColor = '#' + Math.random().toString(16).substr(-6);
  var heights = [50, 90, 150, 190, 230];
  var randomHeight = heights[Math.floor(Math.random() * heights.length)];
  var box = document.createElement('div');
  box.className = 'box';
  box.style.backgroundColor = randomColor;
  box.style.height = randomHeight + "px";
  return box;
}

function simpleBox() {
  var box = document.createElement('div');
  box.className = 'box';
  return box;
}

var bricklayer = new Bricklayer(document.querySelector('.bricklayer'))

bricklayer.on("breakpoint", function (e) {
  console.log(e.detail.columnCount);
})

bricklayer.on("afterPrepend", function (e) {
  var el = e.detail.item;
  el.classList.add('is-prepend');
  setTimeout(function () {
    el.classList.remove('is-prepend');
  }, 500);
})

bricklayer.on("afterAppend", function (e) {
  var el = e.detail.item;
  el.classList.add('is-append');
  setTimeout(function () {
    el.classList.remove('is-append');
  }, 500);
});

////////////////////////////////////////////////////////////

var buttons = document.querySelectorAll("button");

function goToScroll(value) {
  document.body.scrollTop = value;
}

Array.prototype.slice.call(buttons).forEach(function (button) {
  button.addEventListener('click', function (e) {
    var button = e.target;
    var box = newBox();

    box.innerHTML = (bricklayer.elements.length + 1);

    if (button.hasAttribute("data-append")) {
      // bricklayer.append(box);
      // Image will wait source to be loaded to append.
      bricklayer.appendLazyElement(function (done) {
        var image = new Image();
        image.src = "img/image-"+(bricklayer.elements.length + 1)+".jpg";
        image.onload = function () {
          done(image);
        }
      })
      goToScroll(document.body.scrollHeight)
    }

    if (button.hasAttribute("data-prepend")) {
      bricklayer.prepend(box);
      goToScroll(0);
    }

    if (button.hasAttribute("data-append-multiple")) {
      var anotherBox = newBox();
      anotherBox.innerHTML = (bricklayer.elements.length + 2);
      bricklayer.append([box, anotherBox]);
      goToScroll(document.body.scrollHeight);
    }
  });
});

function nextBrick() {
  if (img_names.length) {
    var name = img_names.shift();
    console.log(name);
    var box = simpleBox();
    console.log("box");
    var img = imgs[name];
    var p = pimgs[name];
    console.log(img);
    p.then(
      result => {
        console.log("done");
        img.classList.add('img-responsive');
        box.appendChild(img);
        bricklayer.append(box);
        goToScroll(document.body.scrollHeight);
        setTimeout(nextBrick, 100);
      }
    )
    // img.onload = function () {
    //   console.log("done");
    //   img.classList.add('img-responsive');
    //   box.appendChild(img);
    //   bricklayer.append(box);
    //   goToScroll(document.body.scrollHeight);
    //   setTimeout(nextBrick, 100);
    //   // nextBrick();
    // }
    // bricklayer.appendLazyElement(function (done) {
    // })
    // goToScroll(document.body.scrollHeight);
  }
}

img_names = [ "image-1.jpg",
              "image-2.jpg",
              "image-3.jpg",
              "image-4.jpg",
              "image-5.jpg",
              "image-6.jpg",
              "image-7.jpg",
              "image-8.jpg",
              "image-9.jpg",
              "image-10.jpg",
              "image-11.gif",
              "image-12.gif",
              "image-13.jpg"]

imgs = {}
pimgs = {}

for (let name of img_names) {
  var img = new Image();
  img.src = "img/"+name;
  imgs[name] = img;
  pimgs[name] = new Promise((resolve) => img.onload = resolve);
}

nextBrick();