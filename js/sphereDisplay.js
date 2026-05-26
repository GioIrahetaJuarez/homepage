import data from '../img/sphere.json' with {type: 'json'};
import fullData from '../img/img.json' with {type: 'json'};
import { createSphereRevealAnimator } from './sphereRevealAnimator.js';
import { createSphereImageModal } from './sphereImageModal.js';

let camera, scene, renderer;
let imageGroup;
let revealAnimator;
let imageModal;
let sphereItems = [];
const radius = 150;
let isDragging = false;
let prevMousePosition = { x: 0, y: 0 };
let rotationSpeed = { x: 0, y: 0 };
const dampingFactor = 0.95;
const minZoom = 100;
const maxZoom = 800;
const INITIAL_LOAD_COUNT = 40;
const PROGRESSIVE_LOAD_DELAY = 20;
let hasUserZoomed = false;

function getInitialCameraZ() {
    return window.innerWidth <= 768 ? 520 : 400;
}

function getStageSize() {
    const bottomBar = document.querySelector('.bottom-bar');
    const bottomBarHeight = bottomBar?.offsetHeight || 0;

    return {
        width: window.innerWidth,
        height: window.innerHeight - bottomBarHeight
    };
}

// ── Performance: limit concurrent texture loads ──────────────────────────────
const MAX_CONCURRENT = 6; // match browser's per-host connection limit
let loadQueue = [];
let activeLoads = 0;

function enqueueLoad(url, callback) {
    loadQueue.push({ url, callback });
    processQueue();
}

function processQueue() {
    while (activeLoads < MAX_CONCURRENT && loadQueue.length > 0) {
        const { url, callback } = loadQueue.shift();
        activeLoads++;
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (texture) => { activeLoads--; callback(texture); processQueue(); },
            undefined,
            ()  => { activeLoads--; processQueue(); } // skip broken images
        );
    }
}
// ───────────────────────────────────────────────────────────────────────────

const imageUrls = data.map(img => img.url);

function init() {
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xe30000);
    scene.background = new THREE.Color(0xffffff);

    const stageSize = getStageSize();
    camera = new THREE.PerspectiveCamera(60, stageSize.width / stageSize.height, 1, 1000);
    camera.position.z = getInitialCameraZ();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(stageSize.width, stageSize.height);
    // ── Performance: cap pixel ratio on high-DPI screens ──
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    imageGroup = new THREE.Group();
    scene.add(imageGroup);
    revealAnimator = createSphereRevealAnimator();
    imageModal = createSphereImageModal({ renderer, camera, imageGroup });
    sphereItems = [];

    const points = fibonacciSpherePoints(imageUrls.length, radius);

    points.forEach((point, index) => {
        if (index < imageUrls.length) {
            const loadImage = () => createImageAtPoint(point, '../' + imageUrls[index], index === imageUrls.length - 1, index);

            if (index < INITIAL_LOAD_COUNT) {
                loadImage();
            } else {
                setTimeout(loadImage, (index - INITIAL_LOAD_COUNT) * PROGRESSIVE_LOAD_DELAY);
            }
        }
    });

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onMouseWheel, { passive: false });
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    renderer.domElement.addEventListener('gesturestart', onGestureStart, { passive: false });
    renderer.domElement.addEventListener('gesturechange', onGestureChange, { passive: false });
    renderer.domElement.addEventListener('gestureend', onGestureEnd);
}

function fibonacciSpherePoints(samples, radius) {
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = phi * i;
        points.push(new THREE.Vector3(
            Math.cos(theta) * r * radius,
            y * radius,
            Math.sin(theta) * r * radius
        ));
    }
    return points;
}

function createImageAtPoint(point, imageUrl, isFinal = false, index = 0) {
    // ── Performance: use queued loading instead of firing all at once ──
    enqueueLoad(imageUrl, (texture) => {
        if (!imageGroup) return;
        // ── Fix: derive aspect ratio from the actual image ──
        const aspect = texture.image.width / texture.image.height;
        const width = 20;
        const height = width / aspect;

        // ── Performance: reduce texture memory ──
        texture.minFilter = THREE.LinearFilter; // skip mipmap generation
        texture.generateMipmaps = false;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0
        });

        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        const sphereItem = {
            mesh,
            index,
            title: fullData[index]?.title || data[index]?.title || '',
            thumbImageUrl: imageUrl,
            fullImageUrl: '../' + (fullData[index]?.url || data[index]?.url),
            basePosition: point.clone(),
            isFinal
        };

        mesh.position.copy(sphereItem.basePosition);
        imageGroup.add(mesh);
        sphereItems.push(sphereItem);
        revealAnimator.register(sphereItem);
        imageModal.register(sphereItem);
    });
}

// Modified this to no self calling errr whyyyyy more and more complex
function animate() {
    if (!isDragging) {
        rotationSpeed.x *= dampingFactor;
        rotationSpeed.y *= dampingFactor;
        imageGroup.rotation.y += rotationSpeed.x;
        imageGroup.rotation.x += rotationSpeed.y;
    }

    imageGroup.children.forEach(child => {
        if (child.isMesh) {
            child.quaternion.copy(imageGroup.quaternion).invert();
        }
    });

    revealAnimator.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const stageSize = getStageSize();
    camera.aspect = stageSize.width / stageSize.height;
    if (!hasUserZoomed) camera.position.z = getInitialCameraZ();
    camera.updateProjectionMatrix();
    renderer.setSize(stageSize.width, stageSize.height);
}

function onMouseDown(event) {
    isDragging = true;
    prevMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
    if (!isDragging) return;
    const dx = event.clientX - prevMousePosition.x;
    const dy = event.clientY - prevMousePosition.y;
    rotationSpeed.x = dx * 0.005;
    rotationSpeed.y = dy * 0.005;
    imageGroup.rotation.y += rotationSpeed.x;
    imageGroup.rotation.x += rotationSpeed.y;
    prevMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseUp() { isDragging = false; }

function onMouseWheel(event) {
    event.preventDefault();
    const newZ = camera.position.z - Math.sign(event.deltaY) * -30;
    if (newZ >= minZoom && newZ <= maxZoom) {
        camera.position.z = newZ;
        hasUserZoomed = true;
    }
}

let prevPinchDistance = null;
let initialGestureScale = null;

function onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        isDragging = true;
        prevMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
}

function onTouchMove(event) {
    event.preventDefault();
    if (isDragging && event.touches.length === 1) {
        const dx = event.touches[0].clientX - prevMousePosition.x;
        const dy = event.touches[0].clientY - prevMousePosition.y;
        rotationSpeed.x = dx * 0.005;
        rotationSpeed.y = dy * 0.005;
        imageGroup.rotation.y += rotationSpeed.x;
        imageGroup.rotation.x += rotationSpeed.y;
        prevMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.touches.length === 2) {
        const dist = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );
        if (prevPinchDistance !== null) {
            const newZ = camera.position.z + (prevPinchDistance - dist) * 0.5;
            if (newZ >= minZoom && newZ <= maxZoom) {
                camera.position.z = newZ;
                hasUserZoomed = true;
            }
        }
        prevPinchDistance = dist;
    }
}

function onTouchEnd() { isDragging = false; prevPinchDistance = null; }

function onGestureStart(event) { event.preventDefault(); initialGestureScale = event.scale; }

function onGestureChange(event) {
    event.preventDefault();
    const newZ = camera.position.z + (initialGestureScale - event.scale) * 50;
    if (newZ >= minZoom && newZ <= maxZoom) {
        camera.position.z = newZ;
        hasUserZoomed = true;
    }
    initialGestureScale = event.scale;
}

function onGestureEnd() { initialGestureScale = null; }

let initialized = false;

export default {
    name: 'Sphere',
    _frame: null,
    enter() {
        if (!initialized) {
            init();           // runs first time
            initialized = true;
        } else {
        // just re-append the canvas
            document.body.appendChild(renderer.domElement);
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('wheel', onMouseWheel, { passive: false });
        }
        //Animation
        const tick = () => { animate(); this._frame = requestAnimationFrame(tick); };
        this._frame = requestAnimationFrame(tick);
    },
    update() {},
    exit() {
        cancelAnimationFrame(this._frame);
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('wheel', onMouseWheel);
        renderer.domElement.remove(); // just detach, wont dispose
    }
};
