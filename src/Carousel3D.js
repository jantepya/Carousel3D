"use strict";

import * as THREE from '../node_modules/three/build/three.module.js';
import { TWEEN } from '../node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CSS3DRenderer } from '../node_modules/three/examples/jsm/renderers/CSS3DRenderer.js';

import { Carousel3DTile } from './Carousel3DTile.js';

const DEFAULT_MAX_POOL_ITEMS = 12;

const Carousel3D = function () {
	this.container = null;
	this.sceneGL = null;
	this.sceneCSS = null;
	this.camera = null;
	this.renderer = null;
	this.rendererGL = null;
	this.arrowDiv = null;
	this.targetPositions = []; // Fixed position list used to reassign 3D object positions on rotate
	this.tiles3D = [];
	this.tileOffset = 0; // Index offset needed to center elements

	// User Modified fields
	this.containerName = "";
	this.textSelectable = true;
	this.tileBackgroundColor = "black";
	this.tileBorderColor = "blue";
	this.tileMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, shadowSide: THREE.BackSide });
	this.tileSize = { 'w': 120, 'h': 160 };
	this.spotLightPosition = { 'x': 0, 'y': 250, 'z': -200 };
	this.tileMargin = 20;
	this.tileElements = [];
	this.planeHeight = -46;
	this.backgroundColor = 0x000000;
	this.planeColor = 0xffffff;
	this.ambientLight = false;
	this.cameraZoom = 0;
	this.cameraHeight = 40;

	// Callbacks
	this.onSelectionChange = null;
	this.onStart = null;
}

Carousel3D.prototype.init = function () {

	this.container = document.getElementById(this.containerName);

	if (!this.container) {
		console.warn("Carousel3D: error finding container element.");
		return;
	}

	this.camera = new THREE.PerspectiveCamera(50, this.container.clientWidth / this.container.clientHeight, 1, 10000);
	this.camera.position.z = 300 - this.cameraZoom;
	this.camera.position.y = this.cameraHeight;

	this.sceneCSS = new THREE.Scene();
	this.sceneGL = new THREE.Scene();
	this.sceneGL.background = new THREE.Color(this.backgroundColor);

	if (this.ambientLight) {
		const light = new THREE.AmbientLight(0xaaaaaa); // soft white light
		this.sceneGL.add(light);

		this.sceneGL.fog = new THREE.Fog(this.backgroundColor, 70, 2500);
	}

	// Create fixed target positions
	const circleRadius = 6.5 * this.tileSize.w;
	const tileWidth = this.tileSize.w + this.tileMargin;
	const zOffset = -900;
	const yHeight = 45;

	for (var i = 0; i < DEFAULT_MAX_POOL_ITEMS; i += 1) {

		// equation for circle: ( x - h )^2 + ( z - k )^2 = r^2, where ( h, k ) is the center and r is the radius.
		const x = (i + 1) * tileWidth - (DEFAULT_MAX_POOL_ITEMS / 2) * tileWidth;
		let z = Math.pow(circleRadius, 2) - Math.pow(x, 2);
		z = (Math.sign(z) * Math.sqrt(Math.abs(z))) + zOffset; 

		this.targetPositions.push({ x: x, y: yHeight, z: z });
	}

	// determine initial offset needed to center elements
	if (this.tileElements.length < this.targetPositions.length) {
		const offset = Math.floor((this.targetPositions.length - this.tileElements.length) / 2);
		this.tileOffset = -offset;
	}

	// Create tile elements
	for (var i = 0; i < this.tileElements.length; i += 1) {
		const tile = new Carousel3DTile(this, i, (t) => this.rotateTo(t.index));

		var j = Math.min(DEFAULT_MAX_POOL_ITEMS - 1, i);
		const targetPosition = this.targetPositions[j - this.tileOffset];
		tile.SetPosition(targetPosition);
		tile.SetIsVisible(i < DEFAULT_MAX_POOL_ITEMS);
		tile.SetContent(this.tileElements[i]);
		this.sceneGL.add(tile.mesh);
		this.sceneCSS.add(tile.CSS3DObject);
		this.tiles3D.push(tile);
	}

	{
		const geometry = new THREE.PlaneGeometry(10000, 10000);
		const material = new THREE.MeshPhongMaterial({ color: this.planeColor, shininess: 100 })
		const plane = new THREE.Mesh(geometry, material);
		plane.receiveShadow = true;
		plane.rotation.x = -Math.PI / 2;
		plane.position.y = this.planeHeight;

		this.sceneGL.add(plane);
	}

	const spotLight = new THREE.SpotLight(0xffffff, 0.5);
	spotLight.position.copy(this.spotLightPosition);

	spotLight.castShadow = true;

	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;

	spotLight.shadow.camera.near = 50;
	spotLight.shadow.camera.far = 1200;
	spotLight.shadow.camera.fov = 30;
	spotLight.penumbra = 1;

	this.sceneGL.add(spotLight);

	this.renderer = new CSS3DRenderer();
	this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
	this.renderer.domElement.style.position = 'absolute';

	this.rendererGL = new THREE.WebGLRenderer({ antialias: true });
	this.rendererGL.setPixelRatio(window.devicePixelRatio);
	this.rendererGL.setSize(this.container.clientWidth, this.container.clientHeight);
	this.rendererGL.shadowMap.enabled = true;


	{
		// add arrows to container
		const arrow_container = document.createElement('div');
		arrow_container.className = 'Carousel3D-Arrow noselect';
		arrow_container.style.height = this.container.clientHeight + "px";
		arrow_container.style.width = this.container.clientWidth + "px";

		// --------------------
		// left arrow
		const arrow_left_helper = document.createElement('div');
		arrow_left_helper.className = 'Carousel3D-Arrow helper';
		arrow_container.appendChild(arrow_left_helper);

		const arrow_left_span = document.createElement('span');
		arrow_left_helper.appendChild(arrow_left_span);

		arrow_left_helper.innerHTML += '<svg height="64px" width="64px" aria-hidden="true" focusable="false" data-icon="angle-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"></path></svg>';

		// --------------------
		// right arrow
		const arrow_right_helper = document.createElement('div');
		arrow_right_helper.className = 'Carousel3D-Arrow helper right';
		arrow_container.appendChild(arrow_right_helper);

		const arrow_right_span = document.createElement('span');
		arrow_right_helper.appendChild(arrow_right_span);

		arrow_right_helper.innerHTML += '<svg height="64px" width="64px" aria-hidden="true" focusable="false" data-icon="angle-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path></svg>';

		arrow_left_helper.addEventListener('click', () => { this.tileOffset -= 1; this.rotate(400); }, false);
		arrow_right_helper.addEventListener('click', () => { this.tileOffset += 1; this.rotate(400); }, false);

		arrow_container.appendChild(this.renderer.domElement);
		this.container.appendChild(arrow_container);
		this.container.appendChild(this.rendererGL.domElement);
		this.arrowDiv = arrow_container;
	}

	this.render();
	this.animate();

	window.addEventListener('resize', () => { this.onWindowResize() }, false);

	try {
		const ind = this.getSelectedIndex();
		this.onStart(ind);
	}
	catch (err) { }
}

Carousel3D.prototype.animate = function () {
	TWEEN.update();
	requestAnimationFrame(() => { this.animate() });
}

Carousel3D.prototype.getSelectedIndex = function () {
	return this.tileOffset + Math.floor(this.targetPositions.length / 2) - 1;
}

Carousel3D.prototype.rotate = function (duration) {

	TWEEN.removeAll();

	const endIndex = Math.min(this.targetPositions.length + this.tileOffset, this.tiles3D.length);
	const startIndex = Math.max(this.tileOffset, 0);
    console.assert(endIndex - startIndex <= this.targetPositions.length, {end: endIndex, start: startIndex, errorMsg: "Carousel3D Invalid start/end index"});

	// don't rotate if all tiles pass the center point
	if (this.tiles3D.length <= this.targetPositions.length / 2) {
		let bounds = Math.floor(this.tiles3D.length / 2);
		let center = - Math.floor((this.targetPositions.length - this.tileElements.length) / 2);

		if (this.tileOffset > center + bounds) {
			this.tileOffset -= 1;
			return;
		}
		else if (this.tileOffset < center - bounds + 1) {
			this.tileOffset -= Math.sign(this.tileOffset);
			return;
		}
	}
	else if (endIndex - startIndex < this.targetPositions.length / 2) {
		this.tileOffset -= Math.sign(this.tileOffset);
		return;
	}

	// Hide inactive tiles
	const startPosition = this.targetPositions[0];
	for (let i = 0; i < startIndex; i++) {
		const tile = this.tiles3D[i];
		tile.SetPosition(startPosition);
		tile.SetIsVisible(false);
	}

	const endPosition = this.targetPositions[this.targetPositions.length - 1];
	for (let i = endIndex; i < this.tiles3D.length; i++) {
		const tile = this.tiles3D[i];
		tile.SetPosition(endPosition);
		tile.SetIsVisible(false);
	}

	// Animate active tiles
	for (let i = startIndex; i < endIndex; i++) {

		const tile = this.tiles3D[i];
		this.tiles3D[i].SetIsVisible(true);

		const target = this.targetPositions[i - this.tileOffset];

		new TWEEN.Tween(tile.CSS3DObject.position)
			.to(target, duration)
			.easing(TWEEN.Easing.Quartic.Out)
			.start();

		new TWEEN.Tween(tile.mesh.position)
			.to(target, duration)
			.easing(TWEEN.Easing.Quartic.Out)
			.start();
	}

	new TWEEN.Tween()
		.to({}, duration * 2)
		.onUpdate(() => { this.render() })
		.start();

	if (this.onSelectionChange) {
		const ind = this.getSelectedIndex();
		this.onSelectionChange(ind);
	}
}

Carousel3D.prototype.rotateTo = function (index) {
	const current = this.getSelectedIndex();
	this.tileOffset += index - current;
	this.rotate(800);
}

Carousel3D.prototype.onWindowResize = function () {

	this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
	this.rendererGL.setSize(this.container.clientWidth, this.container.clientHeight);

	this.arrowDiv.style.height = this.container.clientHeight + "px";
	this.arrowDiv.style.width = this.container.clientWidth + "px";

	this.render();
}

Carousel3D.prototype.render = function () {
	this.renderer.render(this.sceneCSS, this.camera);
	this.rendererGL.render(this.sceneGL, this.camera);
}

export { Carousel3D };