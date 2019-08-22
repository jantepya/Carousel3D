import * as THREE from '../lib/three/build/three.module.js';
import { TWEEN } from '../lib/three/examples/jsm/libs/tween.module.min.js';
import { TrackballControls } from '../lib/three/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from '../lib/three/examples/jsm/renderers/CSS3DRenderer.js';

var Carousel3D = function carousel3D () {

  this.container = null;
  this.sceneGL = null;
  this.sceneCSS = null;
  this.camera = null;
  this.renderer = null;
  this.rendererGL = null;
  this.tileMaterial = null;

  this.tileSize = {
    'w':120,
    'h':160,
  };

  this.CSSobjects = [];
  this.ShadowObjects = [];
  this.tileElements = [];
  this.targets = [];
  this.isRotating = false;

  this.tileOffset = 0;

  // this.containerWidth = 800;
  // this.containerHeight = 300;

  this.init = function () {

    this.container = document.getElementById( 'container' );


    {
      // add arrows to container
      var arrow_left = document.createElement( 'div' );
      arrow_left.className = 'Carousel3D-Arrow noselect';
      var arrow_left_img = document.createElement( 'img' );
      arrow_left_img.src = "./src/angle-left.png";
      arrow_left.appendChild(arrow_left_img);

      var arrow_right = document.createElement( 'div' );
      arrow_right.className = 'Carousel3D-Arrow noselect';
      arrow_right.style.right = 0;
      var arrow_right_img = document.createElement( 'img' );
      arrow_right_img.src = "./src/angle-right.png";
      arrow_right.appendChild(arrow_right_img);

      // arrow_left.addEventListener( 'mouseover', () => { this.isRotating = true; }  , false );
      // arrow_left.addEventListener( 'mouseout', () => { this.isRotating = false; }  , false );
      arrow_left.addEventListener( 'click', () => { this.tileOffset += 1; this.rotate( 500); }  , false );
      arrow_right.addEventListener( 'click', () => { this.tileOffset -= 1; this.rotate( 500); }  , false );

      this.container.appendChild(arrow_left);
      this.container.appendChild(arrow_right);
    }


    this.camera = new THREE.PerspectiveCamera( 50, this.container.clientWidth / this.container.clientHeight, 1, 10000 );
    this.camera.position.z = 300;
    this.camera.position.y = 40;


    this.sceneCSS = new THREE.Scene();
    this.sceneGL = new THREE.Scene();

    // create target positions
    for ( var i = 0; i < 12; i += 1 ) {

      var x = (i+1) * 140  - 12 * 70; // 12 is the number of displayed tiles.
      var y = 45;
      var z = Math.sqrt(1200000 - Math.pow((x-25), 2)) - 1000;

      var object = new THREE.Object3D();
      object.position.x = x;
      object.position.y = y;
      object.position.z = z;

      this.targets.push( object );
    }

    // create tile elements
    for ( var i = 0; i < this.tileElements.length; i += 1 ) {
      this.createTile(i);
    }


    {
      var geometry = new THREE.PlaneGeometry( 10000, 10000 );
      var material = new THREE.MeshPhongMaterial({color:0xffffff, shininess:100,})
      var plane = new THREE.Mesh( geometry, material );
      plane.receiveShadow = true;
      plane.rotation.x = -Math.PI/2;
      plane.position.y = -50;

      this.sceneGL.add( plane );
    }

    // var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
		// sceneGL.add( ambientLight );

    var spotLight = new THREE.SpotLight( 0xffffff, 0.5 );
    spotLight.position.set( 0, 250, -200 );

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 50;
    spotLight.shadow.camera.far = 1200;
    spotLight.shadow.camera.fov = 30;
    spotLight.penumbra = 1;

		this.sceneGL.add( spotLight );

    // var help = new THREE.CameraHelper( spotLight.shadow.camera )
    // sceneGL.add( help );

    this.container = document.getElementById( 'container' );

    this.renderer = new CSS3DRenderer();
    this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = 0;
    this.container.appendChild( this.renderer.domElement );

    this.rendererGL = new THREE.WebGLRenderer( {antialias: true});
    this.rendererGL.setPixelRatio( window.devicePixelRatio );
    this.rendererGL.setSize( this.container.clientWidth, this.container.clientHeight );
    this.rendererGL.shadowMap.enabled = true;

    this.container.appendChild( this.rendererGL.domElement );

    //
    //
    controls = new TrackballControls( this.camera, this.renderer.domElement );
		controls.minDistance = 200;
		controls.maxDistance = 6000;
		controls.addEventListener( 'change',  () => { this.render() } );


    // transform( targets, 2000 );
    this.render();
    this.animate();
    //

    window.addEventListener( 'resize', () => { this.onWindowResize() }  , false );

  }


  this.animate = function () {

    TWEEN.update();

    controls.update();

    requestAnimationFrame( () => { this.animate() } );
  }


  this.rotate = function (duration) {
    console.log("Rotate");

    TWEEN.removeAll();


    for ( var i = Math.abs(this.tileOffset); i < this.targets.length; i ++ ) {

      var objectCSS = this.CSSobjects[ i ];
      var shadowObject = this.ShadowObjects[ i ];
      var target = this.targets[ i - this.tileOffset ];

      new TWEEN.Tween( objectCSS.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

      new TWEEN.Tween( shadowObject.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();
    }

    new TWEEN.Tween(  )
      .to( {}, duration * 2 )
      .onUpdate( () => { this.render() } )
      .start();
  }

  this.createTile = function ( i ) {

      var tile = document.createElement( 'div' );
      tile.className = 'Carousel3D-Tile';
      tile.style.backgroundColor = 'rgba(0,0,0,1)';

      try {
        tile.appendChild( this.tileElements[ i ] );
      }
      catch(err) {
        console.warn("Carousel3D:", err.message);;
      }


      var j = i;
      if ( j > 11) {
        j = 11;
      }

      var object = new CSS3DObject( tile );
      object.position.copy( this.targets[j].position );
      this.sceneCSS.add( object );
      this.CSSobjects.push( object );


      var geometry = new THREE.PlaneBufferGeometry( 120, 160 );
      var mesh = new THREE.Mesh( geometry );
      mesh.material.shadowSide = THREE.DoubleSide;
      mesh.castShadow = true;
      mesh.position.copy( this.targets[j].position);
      this.sceneGL.add( mesh );

      this.ShadowObjects.push( mesh );

	}


  this.onWindowResize = function () {

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
    this.rendererGL.setSize( this.container.clientWidth, this.container.clientHeight );

    this.render();

  }

  this.render = function () {
    this.renderer.render( this.sceneCSS, this.camera );
    this.rendererGL.render( this.sceneGL, this.camera );
  }

}



var controls;




export { Carousel3D };
