const container = document.querySelector('.left-content');
const titleStyleSource = document.querySelector('#main-title-left');

new p5(function(p) {
  let x, y, vx, vy, angle, vAngle;
  let titleSize;
  let titleColor;
  let titleFamily;
  let titleWeight;
  let halfWidth;
  let halfHeight;
  let dragging = false;
  let active = false;
  let dragOffX, dragOffY, lastX, lastY;

  const GRAVITY = 0.5;
  const BOUNCE = 0.6;
  const FRICTION = 0.88;
  const ROT_DAMP = 0.97;

  function syncTitleStyle() {
    const styles = getComputedStyle(titleStyleSource);
    titleSize = parseFloat(styles.fontSize);
    titleColor = styles.color;
    titleFamily = styles.fontFamily;
    titleWeight = styles.fontWeight;

    p.textFont(titleFamily);
    p.textSize(titleSize);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);

    halfWidth = p.textWidth('G') / 2;
    halfHeight = titleSize * 0.48;
  }

  function positionLikeHtmlTitle() {
    const containerRect = container.getBoundingClientRect();
    const titleRect = titleStyleSource.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(titleStyleSource).lineHeight) || titleSize * 1.2;

    x = titleRect.right - containerRect.left - halfWidth;
    y = titleRect.top - containerRect.top + lineHeight / 2;
  }

  p.setup = function() {
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent('sketch');
    canvas.style.background = 'transparent';
    syncTitleStyle();
    positionLikeHtmlTitle();
    vx = 0; vy = 0; angle = 0; vAngle = 0;
  };

  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    syncTitleStyle();
    if (!active) positionLikeHtmlTitle();
  };

  p.draw = function() {
    // Clear background without the trailing pixel stuffs
    p.clear();

    if (active && !dragging) {
      vy += GRAVITY;
      x += vx;
      y += vy;
      angle += vAngle;
      vAngle *= ROT_DAMP;

      if (y + halfHeight >= p.height) {
        y = p.height - halfHeight;
        vy *= -BOUNCE;
        vx *= FRICTION;
        vAngle = vx * 0.012;
        if (Math.abs(vy) < 1) vy = 0;
      }
      if (y - halfHeight <= 0) { y = halfHeight; vy *= -BOUNCE; }
      if (x + halfWidth >= p.width) { x = p.width - halfWidth; vx *= -BOUNCE; vAngle *= -0.7; }
      if (x - halfWidth <= 0) { x = halfWidth; vx *= -BOUNCE; vAngle *= -0.7; }
    }

    p.push();
    p.translate(x, y);
    p.rotate(angle);
    p.fill(titleColor);
    p.drawingContext.font = `${titleWeight} ${titleSize}px ${titleFamily}`;

    const hoveringTitle = hitting(p.mouseX, p.mouseY);

    if (dragging) {
      p.cursor('grab');
    } else if (hoveringTitle) {
      p.cursor('grab');
    } else {
      p.cursor('default');
    }

    p.noStroke();
    p.text('G', 0, 0);
    p.pop();
  };

  function hitting(mx, my) {
    const dx = mx - x, dy = my - y;
    const cos = Math.cos(-angle), sin = Math.sin(-angle);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    return Math.abs(lx) < halfWidth && Math.abs(ly) < halfHeight;
  }

  p.mousePressed = function() {
    if (hitting(p.mouseX, p.mouseY)) {
      active = true;
      dragging = true;
      dragOffX = p.mouseX - x;
      dragOffY = p.mouseY - y;
      lastX = p.mouseX; lastY = p.mouseY;
      vx = 0; vy = 0; vAngle = 0;
    }
  };

  p.mouseDragged = function() {
    if (!dragging) return;
    vx = p.mouseX - lastX;
    vy = p.mouseY - lastY;
    lastX = p.mouseX; lastY = p.mouseY;
    x = p.mouseX - dragOffX;
    y = p.mouseY - dragOffY;
  };

  p.mouseReleased = function() {
    if (dragging) {
      vAngle = vx * 0.018 + vy * 0.004;
      dragging = false;
    }
  };
});
