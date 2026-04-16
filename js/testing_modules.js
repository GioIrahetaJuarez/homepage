import Sphere from "./sphereDisplay.js"
import Gallery from "./search.js"

// ── Module definitions ──────────────────────────────────────
const modules = {
Sphere,
Gallery,
}

// ── Module Engine ──────────────────────────────────────
let current = 'Sphere';
modules[current].enter();

function switchTo(id) {
if (id === current) return;
// EXIT current
modules[current].exit();
document.getElementById(current).classList.remove('active');
// ENTER next
current = id;
document.getElementById(current).classList.add('active');
modules[current].enter();
// update nav
// document.querySelectorAll('#nav button').forEach(b => {
//     b.classList.toggle('active', b.dataset.mod === id);
// });
}

// ── Button Callbacks ──────────────────────────────────────
document.querySelectorAll('button').forEach(btn => {
btn.addEventListener('click', () => switchTo(btn.textContent));
});
