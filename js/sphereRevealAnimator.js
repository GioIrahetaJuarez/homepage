export function createSphereRevealAnimator(options = {}) {
    const config = {
        stagger: options.stagger ?? 70,
        fadeDuration: options.fadeDuration ?? 520,
        pulseDuration: options.pulseDuration ?? 520,
        pulseStrength: options.pulseStrength ?? 0.055,
        popStrength: options.popStrength ?? 0.09,
        startScale: options.startScale ?? 0.62
    };

    const items = [];
    const pulses = [];
    let nextRevealStart = 0;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    function register(mesh, basePosition, isFinal = false) {
        const now = performance.now();
        const start = Math.max(now, nextRevealStart);
        nextRevealStart = start + config.stagger;

        mesh.userData.basePosition = basePosition.clone();
        mesh.material.opacity = 0;
        mesh.scale.setScalar(config.startScale);

        items.push({
            mesh,
            basePosition: mesh.userData.basePosition,
            start,
            isFinal,
            pulsed: false
        });
    }

    function getWarp(now) {
        let warp = 0;

        for (let i = pulses.length - 1; i >= 0; i--) {
            const age = now - pulses[i].start;
            const t = age / config.pulseDuration;

            if (t >= 1) {
                pulses.splice(i, 1);
                continue;
            }

            warp += Math.sin(t * Math.PI) * config.pulseStrength * (1 - t);
        }

        return warp;
    }

    function update() {
        const now = performance.now();
        const warp = getWarp(now);

        for (const item of items) {
            const t = clamp01((now - item.start) / config.fadeDuration);
            const active = t > 0 && t < 1;

            if (item.isFinal && t > 0 && !item.pulsed) {
                pulses.push({ start: now });
                item.pulsed = true;
            }

            const fade = easeOutCubic(t);
            const scale = config.startScale + (1 - config.startScale) * easeOutBack(t);
            const pop = active ? Math.sin(t * Math.PI) * config.popStrength : 0;

            item.mesh.material.opacity = fade;
            item.mesh.scale.setScalar(scale);
            item.mesh.position.copy(item.basePosition).multiplyScalar(1 + warp + pop);
        }
    }

    function reset() {
        items.length = 0;
        pulses.length = 0;
        nextRevealStart = 0;
    }

    return {
        register,
        update,
        reset
    };
}
