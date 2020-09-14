# Carousel3D

![imgur image](https://i.imgur.com/uMbWhRk.png)
Carousel3D is an interactive 3D HTML/JS carousel made with ThreeJS. The Carousel3D object uses the ThreeJS CSS3DRenderer to display 3D tiles. Each tile is actually just an HTML \<div\> element so you should be able to generate and load your own HTML elements, such as images, videos, or text.

## Example

Try it out here: https://jonmadethings.com/Carousel3D/



## Getting Started

### Include Styling

```HTML
<link type="text/css" rel="stylesheet" href="./dist/Carousel3D.css">
```

### Import module

```Javascript
 import { Carousel3D } from './dist/Carousel3D.js';
```

### Create Carousel3D Instance
Create a new instance of Carousel3D:
```Javascript
var car = new Carousel3D();
```

In your HTML file, you need to have a \<div\> container to load Carousel3D.
```HTML
<!-- HTML -->
<div id="container" ></div>
```
```Javascript
// Javascript
car.containerName = "container";
```

Each tile in Carousel3D is actually just a \<div\> element. You need to provide the HTML contents for each tile. The following example creates 15 tiles with just plain text numbers on them.

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
Download the project and install dependencies
```
npm install
```

Run test server with 
```
npm run test
```
You should now be able access the project in your browser at http://127.0.0.1:8000/index.html.

