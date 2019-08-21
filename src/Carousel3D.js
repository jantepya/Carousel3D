import * as THREE from '../lib/three/build/three.module.js';
import { TWEEN } from '../lib/tween/tween.module.min.js';
import { TrackballControls } from '../lib/three/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from '../lib/three/jsm/renderers/CSS3DRenderer.js';

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
  this.objects = [];
  this.table = [];
  this.targets = [];

  this.init = function () {

    this.container = document.getElementById( 'container' );


    {
      // add arrows to container
      var arrow_left = document.createElement( 'div' );
      arrow_left.className = 'Carousel3D-Arrow ';
      var arrow_left_img = document.createElement( 'img' );
      arrow_left_img.src = "/src/angle-left.png";
      arrow_left.appendChild(arrow_left_img);

      var arrow_right = document.createElement( 'div' );
      arrow_right.className = 'Carousel3D-Arrow ';
      arrow_right.style.right = 0;
      var arrow_right_img = document.createElement( 'img' );
      arrow_right_img.src = "/src/angle-right.png";
      arrow_right.appendChild(arrow_right_img);

      this.container.appendChild(arrow_left);
      this.container.appendChild(arrow_right);
    }


    this.camera = new THREE.PerspectiveCamera( 50, this.container.clientWidth / this.container.clientHeight, 1, 10000 );
    this.camera.position.z = 300;
    this.camera.position.y = 40;


    this.sceneCSS = new THREE.Scene();
    this.sceneGL = new THREE.Scene();

    // create tile elements
    for ( var i = 0; i < table.length; i += 5 ) {

      this.createTile(i);

      // var object = new THREE.Object3D();
      // object.position.x = ( table[ i + 3 ] * 140 ) - table.length * 15;
      // object.position.y = - ( table[ i + 4 ] * 180 ) + window.innerHeight/2 - 80;
      //
      // targets.push( object );

    }

    {
      var geometry = new THREE.PlaneGeometry( 10000, 10000 );
      var material = new THREE.MeshPhongMaterial({color:0xffffff, shininess:100,})
      var plane = new THREE.Mesh( geometry, material );
      plane.receiveShadow = true;
      plane.position.z = -350;
      plane.rotation.x = 30;
      this.sceneGL.add( plane );
    }

    //
    // var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
		// sceneGL.add( ambientLight );

    // var pointLight = new THREE.PointLight( 0xffff00, 1.0 );
    var spotLight = new THREE.SpotLight( 0xffffff, 0.5 );
    spotLight.position.set( 0, 250, -200 );

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 50;
    spotLight.shadow.camera.far = 1200;
    spotLight.shadow.camera.fov = 30;
    spotLight.penumbra = 1;

		// var pointLight = new THREE.PointLight( 0xffff00, 1.0 );
    // pointLight.position.set( 0, 100, 100);
    // pointLight.castShadow = true; // default false
    // pointLight.shadow.mapSize.width = 1024; // default
    // pointLight.shadow.mapSize.height = 1024; // default
    // pointLight.shadow.camera.near = 1; // default
    // pointLight.shadow.camera.far = 1000 // default

    // pointLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 1, 5000));
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

    // controls = new TrackballControls( camera, this.renderer.domElement );
		// controls.minDistance = 200;
		// controls.maxDistance = 6000;
		// controls.addEventListener( 'change',  () => { this.render() } );


    // transform( targets, 2000 );
    this.render();
    //

    window.addEventListener( 'resize', () => { this.onWindowResize() }  , false );

  }


  this.animate = animate;

  function animate() {
    requestAnimationFrame( animate );

    TWEEN.update();

    // controls.update();
  }

  this.createTile = function createTile( i ) {

      var element = document.createElement( 'div' );
      element.className = 'element';
      element.style.backgroundColor = 'rgba(0,0,0,0)';

      var number = document.createElement( 'div' );
      number.className = 'number noselect';
      number.textContent = ( i / 5 ) + 1;
      element.appendChild( number );

      var symbol = document.createElement( 'div' );
      symbol.className = 'symbol';
      symbol.textContent = table[ i ];
      element.appendChild( symbol );

      var details = document.createElement( 'div' );
      details.className = 'details';
      details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
      element.appendChild( details );

      var object = new CSS3DObject( element );
      object.position.x = ( table[ i + 3 ] * 140 ) - table.length * 15;
      object.position.y = - ( table[ i + 4 ] * 180 ) + this.container.clientHeight/2 + 80;
      object.position.z = 0;
      this.sceneCSS.add( object );

      this.objects.push( object );


      var geometry = new THREE.PlaneBufferGeometry( 120, 160 );
      var mesh = new THREE.Mesh( geometry );
      mesh.material.shadowSide = THREE.DoubleSide;
      mesh.castShadow = true;
      mesh.position.x = ( table[ i + 3 ] * 140 ) - table.length * 15;
      mesh.position.y = - ( table[ i + 4 ] * 180 ) + this.container.clientHeight/2 + 80;
      this.sceneGL.add( mesh );
	}

  this.transform = function (targets, duration) {

    TWEEN.removeAll();

    for ( var i = 0; i < objects.length; i ++ ) {

      var object = objects[ i ];
      var target = targets[ i ];

      new TWEEN.Tween( object.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

      new TWEEN.Tween( object.rotation )
        .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

    }

    new TWEEN.Tween( this )
      .to( {}, duration * 2 )
      .onUpdate( render )
      .start();
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


var table = [
  "H", "Hydrogen", "1.00794", 1, 1,
  "He", "Helium", "4.002602", 2, 1,
  "Li", "Lithium", "6.941", 3, 1,
  "Be", "Beryllium", "9.012182", 4, 1,
  "B", "Boron", "10.811", 5, 1,
  "C", "Carbon", "12.0107", 6, 1,
  "N", "Nitrogen", "14.0067", 7, 1,
  "O", "Oxygen", "15.9994", 8, 1,
  "F", "Fluorine", "18.9984032", 9, 1,
];



var controls;

var objects = [];
var targets = [];


// init();
// animate();





// function render() {
//
//   renderer.render( scene, camera );
//   rendererGL.render( sceneGL, camera );
//
// }


export { Carousel3D };
