import './style.css';
import * as THREE from 'three';
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import atmosphereVertexShader from './shader/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shader/atmosphereFragment.glsl';
import gsap from 'gsap';
import * as dat from 'dat.gui';

const { innerWidth, innerHeight } = window;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load('/globe.png')
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
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});
let stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const starVertices = [];
let numStars = 1000;
createStars(numStars);

function createStars(numStars) {
  starVertices.length = 0; // Clear the array
  for (let i = 0; i < numStars; i++) {
    const x = gsap.utils.random(-innerWidth / 2, innerWidth / 2, 0.01);
    const y = gsap.utils.random(-innerWidth / 2, innerWidth / 2, 0.01);
    const z = gsap.utils.random(-innerWidth / 2, innerWidth / 2, 0.01);
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
}

const mouse = {
  x: null,
  y: null
}

// GUI controls
const gui = new dat.GUI();
const settings = {
  sphereRotationSpeed: 0.001,
  atmosphereRotationSpeed: 0.001,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 15,
  atmosphereScale: 1.15,
  numStars: 1000,
  sphereSize: 5,
  starSpeed: 0.01,
  starSize: 1,
  stopStars: false,
  stopEarth: false
};

// Grouping controls in a specific order
const sphereFolder = gui.addFolder('Sphere Settings');
sphereFolder.add(settings, 'sphereSize', 1, 10, 0.1).name('Sphere Size').onChange(updateSphereSize);
sphereFolder.add(settings, 'sphereRotationSpeed', 0, 0.01, 0.001).name('Sphere Rotation');
sphereFolder.add(settings, 'stopEarth').name('Stop Earth').onChange(toggleEarthRotation);

const atmosphereFolder = gui.addFolder('Atmosphere Settings');
atmosphereFolder.add(settings, 'atmosphereScale', 0.1, 2, 0.01).name('Atmosphere Scale').onChange(updateAtmosphereScale);
atmosphereFolder.add(settings, 'atmosphereRotationSpeed', 0, 0.01, 0.001).name('Atmosphere Rotation');

const starFolder = gui.addFolder('Star Settings');
starFolder.add(settings, 'numStars', 100, 5000, 1).name('Number of Stars').onChange(updateStarCount);
starFolder.add(settings, 'starSize', 0.1, 3, 0.1).name('Star Size').onChange(updateStarSize);
starFolder.add(settings, 'starSpeed', 0, 0.1, 0.01).name('Star Speed');
starFolder.add(settings, 'stopStars').name('Stop Stars').onChange(toggleStarMovement);

const cameraFolder = gui.addFolder('Camera Settings');
cameraFolder.add(settings, 'cameraX', -100, 100, 0.1).name('Camera X').onChange(updateCameraPosition);
cameraFolder.add(settings, 'cameraY', -100, 100, 0.1).name('Camera Y').onChange(updateCameraPosition);
cameraFolder.add(settings, 'cameraZ', -100, 100, 0.1).name('Camera Z').onChange(updateCameraPosition);

sphereFolder.open();
atmosphereFolder.open();
starFolder.open();
cameraFolder.open();

function updateCameraPosition() {
  gsap.to(camera.position, {
    x: settings.cameraX,
    y: settings.cameraY,
    z: settings.cameraZ,
    duration: 1,
    ease: 'power1.inOut'
  });
}

function updateAtmosphereScale() {
  gsap.to(atmosphere.scale, {
    x: settings.atmosphereScale,
    y: settings.atmosphereScale,
    z: settings.atmosphereScale,
    duration: 1,
    ease: 'power1.inOut'
  });
}

function updateStarCount() {
  numStars = settings.numStars;
  scene.remove(stars);
  createStars(numStars);
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function updateSphereSize() {
  gsap.to(sphere.scale, {
    x: settings.sphereSize,
    y: settings.sphereSize,
    z: settings.sphereSize,
    duration: 1,
    ease: 'power1.inOut'
  });
}

function updateStarSize() {
  starMaterial.size = settings.starSize;
}

let starMovement = true;

function toggleStarMovement() {
  starMovement = !settings.stopStars;
}

function toggleEarthRotation() {
  if (settings.stopEarth) {
    settings.sphereRotationSpeed = 0;
    settings.atmosphereRotationSpeed = 0;
  } else {
    settings.sphereRotationSpeed = 0.001;
    settings.atmosphereRotationSpeed = 0.001;
  }
}

function animateStars() {
  if (starMovement) {
    for (let i = 0; i < starGeometry.attributes.position.array.length; i += 3) {
      starGeometry.attributes.position.array[i] += gsap.utils.random(-settings.starSpeed, settings.starSpeed);
      starGeometry.attributes.position.array[i + 1] += gsap.utils.random(-settings.starSpeed, settings.starSpeed);
      starGeometry.attributes.position.array[i + 2] += gsap.utils.random(-settings.starSpeed, settings.starSpeed);
    }
    starGeometry.attributes.position.needsUpdate = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  if (!settings.stopEarth) {
    sphere.rotation.y += settings.sphereRotationSpeed;
    atmosphere.rotation.y += settings.atmosphereRotationSpeed;
    sphere.rotation.z += settings.sphereRotationSpeed;
    atmosphere.rotation.z += settings.atmosphereRotationSpeed;
  }

  gsap.to(group.rotation, {
    x: mouse.y * 0.5,
    y: mouse.x * 0.5,
    duration: 2
  });

  animateStars();
}
animate();

window.addEventListener('mousemove', ({ x, y }) => {
  mouse.x = (x / innerWidth) * 2 - 1;
  mouse.y = (y / innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});