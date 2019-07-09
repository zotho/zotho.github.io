# Noise pattern

**_[Demo](https://zotho.github.io/projects/noise_pattern/)_**

![Demo animation](animation.gif)

Capture 4D noise pattern and save zip archive of frames.
To convert use [ffmpeg](https://ffmpeg.org/) ([link](https://stackoverflow.com/questions/24961127/how-to-create-a-video-from-images-with-ffmpeg) to guide)
Delete last frame and run:
```ffmpeg -start_number 0 -i %07d.png -c:v libx264 -vf "fps=30,format=yuv420p" movie.mp4```

## Used
* (p5.js)[https://p5js.org/]
* (Open Simplex Noise.js)[https://github.com/joshforisha/open-simplex-noise-js]
* (dat.GUI)[https://workshop.chromeexperiments.com/examples/gui/]
* (CCapture.js)[https://github.com/spite/ccapture.js/]