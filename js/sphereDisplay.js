import data from '../img/img.json' with {type: 'json'};

let camera, scene, renderer;
let imageGroup;
const radius = 150;
let isDragging = false;
let prevMousePosition = { x: 0, y: 0 };
let rotationSpeed = { x: 0, y: 0 };
const dampingFactor = 0.95;
const minZoom = 100;
const maxZoom = 800;

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
init();
animate();

function init() {
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xe30000);
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // ── Performance: cap pixel ratio on high-DPI screens ──
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    imageGroup = new THREE.Group();
    scene.add(imageGroup);

    const points = fibonacciSpherePoints(imageUrls.length, radius);

    points.forEach((point, index) => {
        if (index < imageUrls.length) {
            createImageAtPoint(point, '../' + imageUrls[index]);
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

function createImageAtPoint(point, imageUrl) {
    // ── Performance: use queued loading instead of firing all at once ──
    enqueueLoad(imageUrl, (texture) => {
        // ── Fix: derive aspect ratio from the actual image ──
        const aspect = texture.image.width / texture.image.height;
        const width = 20;
        const height = width / aspect;

        // ── Performance: reduce texture memory ──
        texture.minFilter = THREE.LinearFilter; // skip mipmap generation
        texture.generateMipmaps = false;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(point);
        imageGroup.add(mesh);
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (!isDragging) {
        rotationSpeed.x *= dampingFactor;
        rotationSpeed.y *= dampingFactor;
        imageGroup.rotation.y += rotationSpeed.x;
        imageGroup.rotation.x += rotationSpeed.y;
    }

    imageGroup.children.forEach(child => {
    if (child.isMesh) {
        // True inverse of the group's rotation using quaternions
        child.quaternion.copy(imageGroup.quaternion).invert();
    }
});
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    if (newZ >= minZoom && newZ <= maxZoom) camera.position.z = newZ;
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
            if (newZ >= minZoom && newZ <= maxZoom) camera.position.z = newZ;
        }
        prevPinchDistance = dist;
    }
}

function onTouchEnd() { isDragging = false; prevPinchDistance = null; }

function onGestureStart(event) { event.preventDefault(); initialGestureScale = event.scale; }

function onGestureChange(event) {
    event.preventDefault();
    const newZ = camera.position.z + (initialGestureScale - event.scale) * 50;
    if (newZ >= minZoom && newZ <= maxZoom) camera.position.z = newZ;
    initialGestureScale = event.scale;
}

function onGestureEnd() { initialGestureScale = null; }