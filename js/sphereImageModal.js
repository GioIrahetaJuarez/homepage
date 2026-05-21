export function createSphereImageModal({ renderer, camera, imageGroup }) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const itemsByMesh = new WeakMap();
    const downPosition = { x: 0, y: 0 };
    const clickThreshold = 6;

    const modal = document.createElement('div');
    modal.className = 'sphere-modal';
    modal.innerHTML = `
        <button class="sphere-modal-close" type="button" aria-label="Close image">×</button>
        <img class="sphere-modal-image" alt="">
        <div class="sphere-modal-title"></div>
    `;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector('.sphere-modal-image');
    const modalTitle = modal.querySelector('.sphere-modal-title');
    const closeButton = modal.querySelector('.sphere-modal-close');

    function setPointerFromEvent(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function getHit(event) {
        setPointerFromEvent(event);
        raycaster.setFromCamera(pointer, camera);
        const mesh = raycaster.intersectObjects(imageGroup.children, false)[0]?.object;
        return mesh ? itemsByMesh.get(mesh) : null;
    }

    function open(sphereItem) {
        if (!sphereItem?.fullImageUrl) return;

        modalImage.src = sphereItem.fullImageUrl;
        modalImage.alt = sphereItem.title || '';
        modalTitle.textContent = sphereItem.title || '';
        modal.classList.add('is-open');
    }

    function close() {
        modal.classList.remove('is-open');
        modalImage.removeAttribute('src');
    }

    function onCloseClick(event) {
        event.stopPropagation();
        close();
    }

    function onPointerDown(event) {
        downPosition.x = event.clientX;
        downPosition.y = event.clientY;
    }

    function onPointerUp(event) {
        const distance = Math.hypot(
            event.clientX - downPosition.x,
            event.clientY - downPosition.y
        );

        if (distance > clickThreshold) return;
        open(getHit(event));
    }

    function onModalClick(event) {
        if (event.target === modal) close();
    }

    function onKeyDown(event) {
        if (event.key === 'Escape') close();
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    modal.addEventListener('click', onModalClick);
    closeButton.addEventListener('click', onCloseClick);
    window.addEventListener('keydown', onKeyDown);

    return {
        register(sphereItem) {
            itemsByMesh.set(sphereItem.mesh, sphereItem);
        },

        destroy() {
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            renderer.domElement.removeEventListener('pointerup', onPointerUp);
            modal.removeEventListener('click', onModalClick);
            closeButton.removeEventListener('click', onCloseClick);
            window.removeEventListener('keydown', onKeyDown);
            modal.remove();
        }
    };
}
