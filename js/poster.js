import { createSleepMotion } from './posterSleepMotion.js';
import { loadWhiteKeyedTexture } from './whiteKeyedTexture.js';

const images = [
    '../img/gallery/design/FAILED_poster.jpg',
    '../img/gallery/art/Made_physical.jpg',
    '../img/Pulses_and_feathers_around_me.jpg',
    '../img/gallery/art/WhatTheFreak.jpg',
    '../img/gallery/art/Adrians-Charco.jpg',
    '../img/sleeping-person.jpg'
];
const stage = document.querySelector('#poster-stage');

let camera;
let renderer;
let posterGroup;
let sleepMotion;
let targetYaw = 0;
let targetTilt = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f1eb);
const connectorMaterial = new THREE.LineBasicMaterial({ color: 0xE3DD2D});
const SLEEPER_WHITE_THRESHOLD = 205;

function init() {
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(4, 3, 4);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);

    posterGroup = new THREE.Group();
    posterGroup.position.set(0, 0, 0);
    scene.add(posterGroup);

    loadPoster(images[0], 0, 0, 4, 0, 0, 0);
    loadPoster(images[1], 4, 0, 1, 0, (Math.PI / 2), 0);
    loadPoster(images[2], -5, 0, 0, 0, (Math.PI / -2), 0);
    loadPoster(images[3], 0, 0, -4, 0, (Math.PI / 1), 0);
    loadPoster(images[4], 0, 0, -4.5, 0, (Math.PI / 1), 0);
    loadSleepingPerson(images[5], 0, 0, 0, 0, 0, 0);
    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    renderer.setAnimationLoop(animate);


    //Debating where this is gonna go for now code debt.
    const geometry = new THREE.BoxGeometry(1,1,1);
    const wireframeGeo = new THREE.EdgesGeometry(geometry); 

    // Use a Line material instead of a Mesh material
    const mat = new THREE.LineBasicMaterial({ color: 0x292929 });

    // Create LineSegments and add to scene
    const wireframe = new THREE.LineSegments(wireframeGeo, mat);
    
    wireframe.scale.set(2, 2, 2);
    const meshCopy = wireframe.clone();
    meshCopy.position.set(0, -0.90, 0);
    meshCopy.scale.set(0.75,0.25,0.5);
    
    posterGroup.add(meshCopy);
    posterGroup.add(wireframe);
}

function loadPoster(img, xpos, ypos, zpos, xrot, yrot, zrot) {
    const loader = new THREE.TextureLoader();

    loader.load(img, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const aspect = texture.image.width / texture.image.height;
        const height = 4;
        const width = height * aspect;
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        const poster = new THREE.Mesh(geometry, material);
        poster.position.set(xpos, ypos, zpos);
        poster.rotation.set(xrot,yrot,zrot)
        posterGroup.add(poster);
        addConnectorToOrigin(poster.position);
    });
}

function loadSleepingPerson(img, xpos, ypos, zpos, xrot, yrot, zrot) {
    loadWhiteKeyedTexture(img, SLEEPER_WHITE_THRESHOLD).then((texture) => {
        const aspect = texture.image.width / texture.image.height;
        const height = 1;
        const width = height * aspect;
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        const sleeper = new THREE.Mesh(geometry, material);
        sleeper.position.set(xpos, ypos, zpos);
        sleeper.rotation.set(xrot, yrot, zrot);
        posterGroup.add(sleeper);

        sleepMotion = createSleepMotion(sleeper);
    });
}

function addConnectorToOrigin(position) {
    const points = [
        new THREE.Vector3(0, -1, 0),
        position.clone()
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, connectorMaterial);
    posterGroup.add(line);
}

function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const aspect = width / height;
    const viewSize = 6;

    camera.left = -viewSize * aspect;
    camera.right = viewSize * aspect;
    camera.top = viewSize;
    camera.bottom = -viewSize;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();

    if (key === 'a' || key === 'arrowleft') {
        targetYaw -= Math.PI / 4;
    }

    if (key === 'd' || key === 'arrowright') {
        targetYaw += Math.PI / 4;
    }

    if (key === 'arrowup') {
        targetTilt = Math.max(targetTilt - Math.PI / 24, -Math.PI / 8);
    }

    if (key === 'arrowdown') {
        targetTilt = Math.min(targetTilt + Math.PI / 24, Math.PI / 8);
    }
}

function animate() {
    const time = performance.now();

    if (posterGroup) {
        posterGroup.rotation.y += (targetYaw - posterGroup.rotation.y) * 0.12;
        posterGroup.rotation.x += (targetTilt - posterGroup.rotation.x) * 0.12;
    }

    if (sleepMotion) {
        sleepMotion.update(time);
    }

    renderer.render(scene, camera);
}

init();
