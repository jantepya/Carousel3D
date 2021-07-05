import * as THREE from '../node_modules/three/build/three.module.js';
import { CSS3DObject } from '../node_modules/three/examples/jsm/renderers/CSS3DRenderer.js';

const Carousel3DTile = function (options, index, onClick) {
	options = options || {};

	this.index = index;

	const width = options.tileSize?.w || 0;
	const height = options.tileSize?.h || 0;

	this.tile = document.createElement('div');
	this.tile.style.backgroundColor = options.tileBackgroundColor;
	this.tile.style.width = width + "px";
	this.tile.style.height = height + "px";

	if (options.textSelectable) {
		this.tile.className = 'Carousel3D-Tile ' + options.tileBorderColor;
	}
	else {
		this.tile.className = 'Carousel3D-Tile ' + options.tileBorderColor + ' noselect';
	}
	
	this.tile.addEventListener("click", () => { 
		if (onClick) {
			onClick(this);
		}
	}, false);

	this.CSS3DObject = new CSS3DObject(this.tile);

	const geometry = new THREE.PlaneBufferGeometry(width, height);
	this.mesh = new THREE.Mesh(geometry, options.tileMaterial);
	this.mesh.castShadow = true;
}

Carousel3DTile.prototype.SetPosition = function(position) {
	if (this.mesh) {
		this.mesh.position.copy(position);
	}

	if (this.CSS3DObject) {
		this.CSS3DObject.position.copy(position);
	}
}

Carousel3DTile.prototype.SetContent = function(content) {
	if (this.tile) {

		// remove any exising tile content before setting new content
		while (this.tile.lastElementChild) {
			this.tile.removeChild(this.tile.lastElementChild);
		}

		try {
			tile.appendChild(content);
		}
		catch (err) {
			console.warn("Carousel3D:", err.message);;
		}
	}
}

export { Carousel3DTile };