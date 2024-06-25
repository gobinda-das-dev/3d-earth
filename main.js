import './style.css'
import * as THREE from 'three';
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import atmosphereVertexShader from './shader/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shader/atmosphereFragment.glsl';
import gsap from 'gsap';


const { innerWidth, innerHeight } = window;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(2)
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load('./public/globe.png')
      }
    }
  })
);

// Atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
);
atmosphere.scale.set(1.15, 1.15, 1.15);
scene.add(atmosphere);
camera.position.z = 15;

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const numStars = 1000;
const starVertices = [];
for (let i = 0; i < numStars; i++) {
  const x = gsap.utils.random(-innerWidth/2, innerWidth/2, 0.01);
  const y = gsap.utils.random(-innerWidth/2, innerWidth/2, 0.01);
  const z = gsap.utils.random(-innerWidth/2, innerWidth/2, 0.01);

  starVertices.push(x, y, z);
  
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))


const mouse = {
  x: null,
  y: null
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  sphere.rotation.y += 0.001;
  atmosphere.rotation.y += 0.001;
  sphere.rotation.z += 0.001;
  atmosphere.rotation.z += 0.001;

  gsap.to(group.rotation, {
    x: mouse.y * 0.5,
    y: mouse.x * 0.5,
    duration: 2
  })
}
animate();

window.addEventListener('mousemove', ({x, y}) => {
  mouse.x = (x / innerWidth) * 2 - 1;
  mouse.y = (y / innerHeight) * 2 + 1;

  // console.log(mouse);
})