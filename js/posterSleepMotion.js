export function createSleepMotion(mesh, options = {}) {
    const basePosition = mesh.position.clone();
    const baseRotation = mesh.rotation.clone();
    const baseScale = mesh.scale.clone();

    const config = {
        shuffleAmount: options.shuffleAmount ?? 0.08,
        rollAmount: options.rollAmount ?? 0.035,
        breatheAmount: options.breatheAmount ?? 0.035,
        speed: options.speed ?? 0.0014
    };

    return {
        update(time) {
            const slow = time * config.speed;
            const quick = time * config.speed * 2.7;

            mesh.position.x = basePosition.x + Math.sin(slow) * config.shuffleAmount;
            mesh.position.y = basePosition.y + Math.sin(quick + 1.2) * config.shuffleAmount * 0.35;
            mesh.rotation.z = baseRotation.z + Math.sin(slow + 0.7) * config.rollAmount;

            const breathe = 1 + Math.sin(slow * 1.6) * config.breatheAmount;
            mesh.scale.set(
                baseScale.x * breathe,
                baseScale.y * (1 + Math.sin(slow * 1.6 + 0.4) * config.breatheAmount * 0.45),
                baseScale.z
            );
        }
    };
}
