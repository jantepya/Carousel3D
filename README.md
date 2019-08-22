# Carousel3D
Carousel3D is a interactive 3D carousel made with ThreeJS. The Carousel3D object uses the ThreeJS CSS3DRenderer to display tiles. Each tile is actually just an HTML \<div\> element. For each tile, you should be able to generate and load your own HTML items, such as images, videos, or text.

## Getting Started

### Import module

```Javascript
 import { Carousel3D } from './src/Carousel3D.js';
```

### Create Carousel3D Instance

```Javascript
var car = new Carousel3D();
```

Each tile is actually just an HTML \<div\> element. So for each tile, you need to generate the HTML contents of the tile.

```Javascript
var tileElements = []

for (var i = 0; i < 15; i++) {
  var numberElement = document.createElement( 'div' );
  numberElement.textContent = i;
  tileElements.push(numberElement);
}

car.tileElements = tileElements;
```

Once the Carousel3D instance has been configured, run the following command to render

```Javascript
car.init();
```

## Development
Download the project and run local test server with python command:
```
python3 -m http.server --bind 127.0.0.1
```
You should now be able access the project in your browser at http://127.0.0.1:8000/index.html.


## Demo

Try it out here: https://jantepya.github.io/Carousel3D/
