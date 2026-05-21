const images = [
    '../img/gallery/design/FAILED_poster.jpg',
    '../img/gallery/art/Made_physical.jpg'
];
const stage = document.querySelector('#poster-stage');

let camera;
let renderer;
let posterGroup;
let targetYaw = 0;
let targetTilt = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f1eb);

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

    loadPoster(images[0], 0, 0, 0, 0, 0, 0);
    loadPoster(images[1], 4, 0, 1, 0, (Math.PI / 2), 0);
    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    renderer.setAnimationLoop(animate);
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
    });
}

function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const aspect = width / height;
    const viewSize = 5.2;

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
    if (posterGroup) {
        posterGroup.rotation.y += (targetYaw - posterGroup.rotation.y) * 0.12;
        posterGroup.rotation.x += (targetTilt - posterGroup.rotation.x) * 0.12;
    }

    renderer.render(scene, camera);
}

init();
