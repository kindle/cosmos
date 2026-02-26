import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-zodiac',
  templateUrl: './zodiac.page.html',
  styleUrls: ['./zodiac.page.scss'],
})
export class ZodiacPage implements OnInit {

  @ViewChild('rendererContainer', { static: true }) rendererContainer: ElementRef|any;

  scene: THREE.Scene|any;
  camera: THREE.PerspectiveCamera|any;
  renderer: THREE.WebGLRenderer|any;
  cube: THREE.Mesh|any;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initThree();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    this.camera.position.z = 5;

    this.createText('text');

    this.animate();
  }

  createText(text:any){
    // Inside the initThree() method

    // Create the label div dynamically
    const label = document.createElement('div');
    label.textContent = 'Sky'; 
    label.style.position = 'absolute';
    label.style.top = '200px';
    label.style.left = '400px';
    label.style.color = 'white'

    // Append the label to the renderer container
    this.rendererContainer.nativeElement.appendChild(label);

  }

  animate() {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => this.animate());
    });

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);
  }

}
