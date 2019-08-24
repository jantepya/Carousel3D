import * as THREE from '../lib/three/build/three.module.js';
import { TWEEN } from '../lib/three/examples/jsm/libs/tween.module.min.js';
import { CSS3DRenderer, CSS3DObject } from '../lib/three/examples/jsm/renderers/CSS3DRenderer.js';
// import { TrackballControls } from '../lib/three/examples/jsm/controls/TrackballControls.js';


var Carousel3D = function carousel3D () {

  this.container = null;
  this.sceneGL = null;
  this.sceneCSS = null;
  this.camera = null;
  this.renderer = null;
  this.rendererGL = null;
  this.arrowDiv = null;
  this.targets = [];
  this.CSSobjects = [];
  this.ShadowObjects = [];
  this.tileOffset = 0;


  this.containerName = "";
  this.textSelectable = true;
  this.tileBackgroundColor = "black";
  this.tileMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shadowSide: THREE.BackSide} );
  this.tileSize = {
    'w':120,
    'h':160,
  };
  this.tileMargin = 20;
  this.tileElements = [];
  this.planeHeight = -46;
  this.backgroundColor = 0x000000;
  this.planeColor = 0xffffff;
  this.ambientLight = false;
  this.cameraZoom = 0;
  this.cameraHeight = 40;

  this.init = function () {


    this.container = document.getElementById( this.containerName );

    if (!this.container) {
      console.warn("Carousel3D: error finding container element.");
      return;
    }

    this.camera = new THREE.PerspectiveCamera( 50, this.container.clientWidth / this.container.clientHeight, 1, 10000 );
    this.camera.position.z = 300 - this.cameraZoom;
    this.camera.position.y = this.cameraHeight;


    this.sceneCSS = new THREE.Scene();
    this.sceneGL = new THREE.Scene();
    this.sceneGL.background = new THREE.Color( this.backgroundColor );

    if (this.ambientLight) {
      var light = new THREE.AmbientLight( 0xaaaaaa ); // soft white light
      this.sceneGL.add( light );

      this.sceneGL.fog = new THREE.Fog(this.backgroundColor, 70, 2500);
    }

    // create target positions
    var circleRadius = 10000*this.tileSize.w;
    var w = (this.tileSize.w + this.tileMargin);
    for ( var i = 0; i < 12; i += 1 ) {

      var x = (i+1) * w - 6 * w; // 12 is the default number of displayed tiles. Multiply by 6 becaue 12 / 2
      var y = 45;
      var z = Math.sqrt(circleRadius - Math.pow((x-25), 2)) - 1000; // equation for circle

      var object = new THREE.Object3D();
      object.position.set( x, y , z);

      this.targets.push( object );
    }

    // create tile elements
    // var offset = 0;
    if (this.tileElements.length < this.targets.length) {
      var offset = Math.floor((this.targets.length - this.tileElements.length) / 2);
      this.tileOffset = -offset;
    }


    for (var i = 0; i < this.tileElements.length; i += 1 ) {
      this.createTile(i);
    }


    {
      var geometry = new THREE.PlaneGeometry( 10000, 10000 );
      var material = new THREE.MeshPhongMaterial({color:this.planeColor, shininess:100})
      var plane = new THREE.Mesh( geometry, material );
      plane.receiveShadow = true;
      plane.rotation.x = -Math.PI/2;
      plane.position.y = this.planeHeight;

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
    // this.container.appendChild( this.renderer.domElement );

    this.rendererGL = new THREE.WebGLRenderer( {antialias: true});
    this.rendererGL.setPixelRatio( window.devicePixelRatio );
    this.rendererGL.setSize( this.container.clientWidth, this.container.clientHeight );
    this.rendererGL.shadowMap.enabled = true;


    {
      // add arrows to container
      var arrow_container = document.createElement( 'div' );
      arrow_container.className = 'Carousel3D-Arrow noselect';
      arrow_container.style.height = this.container.clientHeight + "px";
      arrow_container.style.width = this.container.clientWidth + "px";


      // --------------------
      // left arrow
      var arrow_left_helper = document.createElement( 'div' );
      arrow_left_helper.className = 'Carousel3D-Arrow helper';
      arrow_container.appendChild(arrow_left_helper);

      var arrow_left_span = document.createElement( 'span' );
      arrow_left_helper.appendChild(arrow_left_span);

      arrow_left_helper.innerHTML += '<svg height="64px" width="64px" aria-hidden="true" focusable="false" data-icon="angle-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"></path></svg>';
      // var arrow_left_img = document.createElement( 'img' );
      // arrow_left_img.src = "./src/angle-left.png";
      // arrow_left_helper.appendChild(arrow_left_img);

      // --------------------
      // right arrow
      var arrow_right_helper = document.createElement( 'div' );
      arrow_right_helper.className = 'Carousel3D-Arrow helper right';
      arrow_container.appendChild(arrow_right_helper);

      var arrow_right_span = document.createElement( 'span' );
      arrow_right_helper.appendChild(arrow_right_span);

      arrow_right_helper.innerHTML += '<svg height="64px" width="64px" aria-hidden="true" focusable="false" data-icon="angle-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path></svg>';
      // var arrow_right_img = document.createElement( 'img' );
      // arrow_right_img.src = "./src/angle-right.png";
      // arrow_right_helper.appendChild(arrow_right_img);


      arrow_left_helper.addEventListener( 'click', () => { this.tileOffset -= 1; this.rotate( 400); }  , false );
      arrow_right_helper.addEventListener( 'click', () => { this.tileOffset += 1; this.rotate( 400); }  , false );

      arrow_container.appendChild( this.renderer.domElement );
      this.container.appendChild(arrow_container);
      this.container.appendChild( this.rendererGL.domElement );
      this.arrowDiv = arrow_container;

    }

    //
    //
    // controls = new TrackballControls( this.camera, this.renderer.domElement );
		// controls.minDistance = 200;
		// controls.maxDistance = 6000;
		// controls.addEventListener( 'change',  () => { this.render() } );


    this.render();
    this.animate();

    window.addEventListener( 'resize', () => { this.onWindowResize() }  , false );

  }


  this.animate = function () {

    TWEEN.update();

    // controls.update();

    requestAnimationFrame( () => { this.animate() } );
  }


  this.rotate = function (duration) {

    //TWEEN.removeAll();

    // make sure at most only 12 tiles are moving
    var limit = this.targets.length + this.tileOffset;

    if (limit > this.CSSobjects.length)
      limit = this.CSSobjects.length;

    // starting tile index can't be less than 0
    var start = this.tileOffset > 0 ? this.tileOffset : 0;

    // don't rotate if all tiles pass the center point

    if ( this.CSSobjects.length <= this.targets.length/2 ) {
      var bounds = Math.floor( this.CSSobjects.length / 2) ;
      var center = - Math.floor((this.targets.length - this.tileElements.length) / 2);

      if ( this.tileOffset > center + bounds ) {
        this.tileOffset -= 1;
        return;
      }
      else if (this.tileOffset < center - bounds + 1 ) {
        this.tileOffset -= Math.sign(this.tileOffset);
        return;
      }
    }
    else if (limit - start < this.targets.length/2 ) {
      this.tileOffset -= Math.sign(this.tileOffset);
      return;
    }



    for ( var i = start; i < limit; i ++ ) {

      var objectCSS = this.CSSobjects[ i ];
      var shadowObject = this.ShadowObjects[ i ];
      var target = this.targets[ i - this.tileOffset ];

      new TWEEN.Tween( objectCSS.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
        .easing( TWEEN.Easing.Quartic.Out )
        .start();

      new TWEEN.Tween( shadowObject.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
        .easing( TWEEN.Easing.Quartic.Out )
        .start();
    }

    new TWEEN.Tween(  )
      .to( {}, duration * 2 )
      .onUpdate( () => { this.render() } )
      .start();
  }

  this.createTile = function ( i , offset ) {

      var tile = document.createElement( 'div' );
      tile.style.backgroundColor = this.tileBackgroundColor;
      tile.style.width = this.tileSize.w + "px";
      tile.style.height = this.tileSize.h + "px";
      if (this.textSelectable) {
        tile.className = 'Carousel3D-Tile';
      }
      else {
        tile.className = 'Carousel3D-Tile noselect';
      }



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
      object.position.copy( this.targets[ j - this.tileOffset ].position );
      this.sceneCSS.add( object );
      this.CSSobjects.push( object );


      var geometry = new THREE.PlaneBufferGeometry( this.tileSize.w, this.tileSize.h );
      var mesh = new THREE.Mesh( geometry, this.tileMaterial );
      mesh.castShadow = true;
      mesh.position.copy( this.targets[ j - this.tileOffset ].position);
      this.sceneGL.add( mesh );
      this.ShadowObjects.push( mesh );

	}


  this.onWindowResize = function () {

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
    this.rendererGL.setSize( this.container.clientWidth, this.container.clientHeight );

    this.arrowDiv.style.height = this.container.clientHeight + "px";
    this.arrowDiv.style.width = this.container.clientWidth + "px";

    this.render();
  }

  this.render = function () {
    this.renderer.render( this.sceneCSS, this.camera );
    this.rendererGL.render( this.sceneGL, this.camera );
  }

}

var controls;


export { Carousel3D };
