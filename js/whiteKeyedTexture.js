export function loadWhiteKeyedTexture(path, threshold = 255) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';

        image.addEventListener('load', () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                const red = pixels[i];
                const green = pixels[i + 1];
                const blue = pixels[i + 2];

                const brightness = (red + green + blue) / 3;

                if (brightness >= threshold) {
                    pixels[i + 3] = 0;
                }
            }

            context.putImageData(imageData, 0, 0);

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            resolve(texture);
        });

        image.addEventListener('error', reject);
        image.src = path;
    });
}
