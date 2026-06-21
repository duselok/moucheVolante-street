(function () {
const canvas = document.getElementById('scene');
const mainCtx = canvas.getContext('2d');
let ctx = mainCtx;
let lastMouse = null;
let moveVector = { x: 0, y: 0 };
let smoothedMoveAngle = 0;
let hasSmoothedMoveAngle = false;
let isMouseMoving = false;
let lastMoveAt = 0;
let motion = { x: 0, y: 0 };
let lastFrameAt = performance.now();
let globalOrbitAngle = 0;
let targetGlobalOrbitAngle = 0;
let travelPhase = 0;
let frameIndex = 0;
let motionTotal = { x: 0, y: 0 };
const SCHLIERE_SPRITE_REFRESH_FRAMES = 4;
const SCHLIEREN_ALPHA_MUL = 2.43;
const SCHLIEREN_THICKNESS_MUL = 0.55;
const GREY_SCHLIEREN_ALPHA_MUL = 0.50;
const LIGHT_SCHLIEREN_ALPHA_MUL = 3.10;
const SHOW_LIGHT_SCHLIEREN_MARKERS = false;

const SCHLIEREN = [
  { x: 0.31, y: 0.34, len: 360, thick: 0.56, curve: 58, angle: -48, alpha: 0.86, seed: 1.7, shape: 'comma', fleckAlpha: 0.72 },
  { x: 0.29, y: 0.10, len: 28, thick: 0.34, curve: -5, angle: 63, alpha: 0.58, seed: 3.2, shape: 'dot', fleckAlpha: 0.42 },
  { x: 0.67, y: 0.36, len: 390, thick: 0.46, curve: 62, angle: 34, alpha: 0.84, seed: 4.8, shape: 'zig' },
  { x: 0.75, y: 0.10, len: 48, thick: 0.42, curve: 10, angle: -71, alpha: 0.54, seed: 6.1, shape: 'arc', fleckAlpha: 0.55 },
  { x: 0.92, y: 0.22, len: 620, thick: 0.54, curve: -54, angle: 82, alpha: 0.70, seed: 8.4, shape: 'loop', fleckAlpha: 0.88 },
  { x: 0.19, y: 0.30, len: 70, thick: 0.32, curve: 14, angle: -37, alpha: 0.52, seed: 10.2, shape: 'arc' },
  { x: 0.42, y: 0.31, len: 380, thick: 0.42, curve: -22, angle: 118, alpha: 0.62, seed: 12.6, shape: 'kink', fleckAlpha: 0.50 },
  { x: 0.67, y: 0.32, len: 24, thick: 0.30, curve: 4, angle: -102, alpha: 0.50, seed: 15.1, shape: 'dot', fleckAlpha: 0.38 },
  { x: 0.87, y: 0.37, len: 60, thick: 0.34, curve: 12, angle: 45, alpha: 0.56, seed: 16.7, shape: 'hook' },
  { x: 0.35, y: 0.66, len: 440, thick: 0.62, curve: -72, angle: -29, alpha: 0.90, seed: 18.3, shape: 'fold', fleckAlpha: 0.74 },
  { x: 0.35, y: 0.49, len: 180, thick: 0.40, curve: 22, angle: 76, alpha: 0.64, seed: 20.9, shape: 'arc', fleckAlpha: 0.44 },
  { x: 0.58, y: 0.53, len: 560, thick: 0.46, curve: -48, angle: -64, alpha: 0.60, seed: 22.4, shape: 'loop' },
  { x: 0.79, y: 0.50, len: 34, thick: 0.30, curve: 5, angle: 132, alpha: 0.48, seed: 24.8, shape: 'dot', fleckAlpha: 0.36 },
  { x: 0.94, y: 0.58, len: 250, thick: 0.46, curve: -24, angle: 25, alpha: 0.62, seed: 27.2, shape: 'hook', fleckAlpha: 0.62 },
  { x: 0.18, y: 0.71, len: 46, thick: 0.28, curve: 8, angle: -126, alpha: 0.46, seed: 29.5, shape: 'arc' },
  { x: 0.43, y: 0.69, len: 650, thick: 0.54, curve: 56, angle: 57, alpha: 0.72, seed: 31.4, shape: 'kink', fleckAlpha: 0.86 },
  { x: 0.64, y: 0.73, len: 82, thick: 0.36, curve: -14, angle: -41, alpha: 0.54, seed: 34.0, shape: 'kink', fleckAlpha: 0.45 },
  { x: 0.85, y: 0.72, len: 210, thick: 0.42, curve: 20, angle: 104, alpha: 0.58, seed: 36.6, shape: 'arc' },
  { x: 0.27, y: 0.88, len: 56, thick: 0.32, curve: -10, angle: -75, alpha: 0.52, seed: 38.7, shape: 'hook', fleckAlpha: 0.40 },
  { x: 0.70, y: 0.67, len: 480, thick: 0.58, curve: 70, angle: 14, alpha: 0.88, seed: 40.9, shape: 'loop', fleckAlpha: 0.70 },
  { x: -0.04, y: 0.18, len: 130, thick: 0.34, curve: 18, angle: 36, alpha: 0.44, seed: 43.1, shape: 'arc', edge: true, fleckAlpha: 0.32 },
  { x: 1.04, y: 0.24, len: 92, thick: 0.30, curve: -12, angle: -58, alpha: 0.38, seed: 45.2, shape: 'hook', edge: true },
  { x: 0.14, y: -0.05, len: 170, thick: 0.36, curve: 22, angle: 105, alpha: 0.42, seed: 47.3, shape: 'kink', edge: true, fleckAlpha: 0.28 },
  { x: 0.82, y: -0.04, len: 76, thick: 0.28, curve: 8, angle: -112, alpha: 0.34, seed: 49.4, shape: 'dot', edge: true },
  { x: -0.03, y: 0.62, len: 210, thick: 0.38, curve: -26, angle: -18, alpha: 0.46, seed: 51.5, shape: 'fold', edge: true, fleckAlpha: 0.30 },
  { x: 1.03, y: 0.66, len: 118, thick: 0.32, curve: 16, angle: 74, alpha: 0.40, seed: 53.6, shape: 'arc', edge: true },
  { x: 0.10, y: 1.04, len: 150, thick: 0.34, curve: -20, angle: -42, alpha: 0.42, seed: 55.7, shape: 'hook', edge: true, fleckAlpha: 0.26 },
  { x: 0.52, y: 1.05, len: 88, thick: 0.30, curve: 10, angle: 28, alpha: 0.36, seed: 57.8, shape: 'dot', edge: true },
  { x: 0.96, y: 1.03, len: 190, thick: 0.36, curve: 24, angle: 122, alpha: 0.44, seed: 59.9, shape: 'loop', edge: true, fleckAlpha: 0.34 },
  { x: 0.50, y: -0.06, len: 126, thick: 0.32, curve: -18, angle: -5, alpha: 0.38, seed: 62.0, shape: 'zig', edge: true },
  { x: -0.22, y: 0.34, len: 74, thick: 0.24, curve: 9, angle: -18, alpha: 0.28, seed: 64.1, shape: 'arc', edge: true },
  { x: -0.18, y: 0.82, len: 96, thick: 0.26, curve: -13, angle: 32, alpha: 0.30, seed: 65.2, shape: 'hook', edge: true },
  { x: 1.18, y: 0.18, len: 68, thick: 0.23, curve: 8, angle: 74, alpha: 0.26, seed: 66.3, shape: 'arc', edge: true },
  { x: 1.24, y: 0.61, len: 116, thick: 0.27, curve: 15, angle: -64, alpha: 0.31, seed: 67.4, shape: 'zig', edge: true },
  { x: 0.28, y: -0.22, len: 88, thick: 0.24, curve: -10, angle: 115, alpha: 0.26, seed: 68.5, shape: 'hook', edge: true },
  { x: 0.78, y: -0.19, len: 78, thick: 0.23, curve: 9, angle: -102, alpha: 0.25, seed: 69.6, shape: 'arc', edge: true },
  { x: 0.36, y: 1.22, len: 104, thick: 0.26, curve: 14, angle: -38, alpha: 0.29, seed: 70.7, shape: 'kink', edge: true },
  { x: 0.82, y: 1.20, len: 82, thick: 0.24, curve: -11, angle: 58, alpha: 0.27, seed: 71.8, shape: 'hook', edge: true },
  { x: 0.12, y: 0.16, len: 72, thick: 0.20, curve: 8, angle: -28, alpha: 0.18, seed: 73.1, shape: 'arc' },
  { x: 0.38, y: 0.18, len: 96, thick: 0.22, curve: -12, angle: 64, alpha: 0.20, seed: 74.2, shape: 'hook' },
  { x: 0.61, y: 0.22, len: 84, thick: 0.20, curve: 10, angle: -86, alpha: 0.17, seed: 75.3, shape: 'zig' },
  { x: 0.86, y: 0.42, len: 110, thick: 0.23, curve: 14, angle: 31, alpha: 0.21, seed: 76.4, shape: 'kink' },
  { x: 0.14, y: 0.54, len: 68, thick: 0.19, curve: -8, angle: 112, alpha: 0.16, seed: 77.5, shape: 'arc' },
  { x: 0.47, y: 0.88, len: 92, thick: 0.21, curve: 11, angle: -44, alpha: 0.19, seed: 78.6, shape: 'hook' },
  { x: 0.76, y: 0.90, len: 74, thick: 0.20, curve: -9, angle: 82, alpha: 0.17, seed: 79.7, shape: 'arc' },
  { x: 0.94, y: 0.12, len: 88, thick: 0.21, curve: 12, angle: -132, alpha: 0.18, seed: 80.8, shape: 'kink' }
];

const HELLE_SCHLIEREN = [
  { x: 0.08, y: 0.18, len: 132, thick: 0.18, curve: 16, angle: -28, alpha: 0.34, seed: 201.1, shape: 'arc', light: true },
  { x: 0.32, y: 0.14, len: 92, thick: 0.16, curve: -11, angle: 62, alpha: 0.28, seed: 202.2, shape: 'hook', light: true },
  { x: 0.58, y: 0.20, len: 168, thick: 0.19, curve: 24, angle: -76, alpha: 0.32, seed: 203.3, shape: 'kink', light: true },
  { x: 0.86, y: 0.18, len: 76, thick: 0.14, curve: 8, angle: 34, alpha: 0.25, seed: 204.4, shape: 'arc', light: true },
  { x: 0.18, y: 0.42, len: 210, thick: 0.20, curve: -28, angle: 16, alpha: 0.30, seed: 205.5, shape: 'fold', light: true },
  { x: 0.44, y: 0.46, len: 118, thick: 0.17, curve: 13, angle: -118, alpha: 0.27, seed: 206.6, shape: 'zig', light: true },
  { x: 0.69, y: 0.44, len: 184, thick: 0.18, curve: -18, angle: 78, alpha: 0.31, seed: 207.7, shape: 'loop', light: true },
  { x: 0.93, y: 0.52, len: 104, thick: 0.15, curve: 10, angle: -44, alpha: 0.26, seed: 208.8, shape: 'hook', light: true },
  { x: 0.10, y: 0.70, len: 84, thick: 0.15, curve: -9, angle: 105, alpha: 0.24, seed: 209.9, shape: 'arc', light: true },
  { x: 0.36, y: 0.72, len: 232, thick: 0.21, curve: 31, angle: -18, alpha: 0.33, seed: 211.0, shape: 'kink', light: true },
  { x: 0.62, y: 0.74, len: 138, thick: 0.17, curve: -15, angle: 138, alpha: 0.27, seed: 212.1, shape: 'fold', light: true },
  { x: 0.84, y: 0.82, len: 118, thick: 0.16, curve: 12, angle: 42, alpha: 0.29, seed: 213.2, shape: 'arc', light: true },
  { x: -0.18, y: 0.28, len: 142, thick: 0.17, curve: 18, angle: -12, alpha: 0.24, seed: 214.3, shape: 'hook', light: true, edge: true },
  { x: 1.16, y: 0.34, len: 126, thick: 0.16, curve: -14, angle: 70, alpha: 0.23, seed: 215.4, shape: 'zig', light: true, edge: true },
  { x: 0.24, y: -0.16, len: 110, thick: 0.15, curve: 11, angle: 112, alpha: 0.22, seed: 216.5, shape: 'arc', light: true, edge: true },
  { x: 0.72, y: 1.14, len: 156, thick: 0.18, curve: -20, angle: -54, alpha: 0.25, seed: 217.6, shape: 'loop', light: true, edge: true }
];

const ALLE_SCHLIEREN = SCHLIEREN.concat(HELLE_SCHLIEREN);

const SCHLIEREN_FLECKEN = [
  { x: 0.23, y: 0.24, size: 17, alpha: 0.10, angle: -0.35, seed: 101.1 },
  { x: 0.73, y: 0.28, size: 14, alpha: 0.08, angle: 0.18, seed: 102.2 },
  { x: 0.46, y: 0.47, size: 19, alpha: 0.09, angle: -0.12, seed: 103.3 },
  { x: 0.18, y: 0.72, size: 12, alpha: 0.07, angle: 0.42, seed: 104.4 },
  { x: 0.82, y: 0.76, size: 15, alpha: 0.085, angle: -0.25, seed: 105.5 }
];

const ELEMENTE = [];

ALLE_SCHLIEREN.forEach((item, index) => {
  item.number = index + 1;
  item.px = 0;
  item.py = 0;
  item.vx = 0;
  item.vy = 0;
  item.curl = 0;
  item.curlEnabled = item.number === 16 || item.number % 2 === 1;
  item.motionMul = 0.82 + stable01(item.seed + 141.2) * 0.34;
  item.driftPhase = stable01(item.seed + 151.7) * Math.PI * 2;
  item.driftAmp = 3 + stable01(item.seed + 162.3) * 9;
  item.freeX = 0;
  item.freeY = 0;
  item.rot = 0;
  item.targetRot = 0;
  item.sprite = null;
  item.spriteBounds = null;
  item.spriteCurlKey = null;
  item.nextSpriteFrame = 0;
  item.visibility = item.light
    ? (0.20 + stable01(item.seed) * 0.34)
    : (0.30 + stable01(item.seed) * 0.70) * 0.50;
  const thinStart = 0.18 + stable01(item.seed + 71.3) * 0.58;
  const thinLen = 0.10 + stable01(item.seed + 83.9) * 0.13;
  item.thinning = {
    start: thinStart,
    end: Math.min(0.92, thinStart + thinLen),
    width: 0.34 + stable01(item.seed + 91.6) * 0.18,
    alpha: 0.42 + stable01(item.seed + 104.2) * 0.22
  };
});

SCHLIEREN_FLECKEN.forEach((item) => {
  item.px = 0;
  item.py = 0;
  item.motionMul = 0.86 + stable01(item.seed + 171.4) * 0.24;
  item.driftPhase = stable01(item.seed + 181.9) * Math.PI * 2;
  item.driftAmp = 2 + stable01(item.seed + 192.5) * 5;
  item.freeX = 0;
  item.freeY = 0;
});

ELEMENTE.forEach((item) => {
  item.px = 0;
  item.py = 0;
});

function stable01(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx = mainCtx;
  mainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function pathY(item, t, offset = 0) {
  const seed = item.seed + offset;
  const curl = schliereCurlY(item, t);
  const base = (
    Math.sin(t * Math.PI * (0.72 + 0.24 * Math.abs(Math.sin(seed))) + seed * 0.296) * 0.66 +
    Math.sin((t - 0.18) * Math.PI * (2.05 + 0.72 * Math.abs(Math.cos(seed))) + seed * 0.225) * 0.34 +
    Math.sin(t * Math.PI * (3.7 + 1.35 * Math.abs(Math.sin(seed * 0.7))) + seed * 0.152) * 0.18
  ) * item.curve;

  if (item.shape === 'arc') {
    return (Math.sin(t * Math.PI) * 0.95 + Math.sin(t * Math.PI * 2.1 + seed) * 0.12) * item.curve + curl;
  }
  if (item.shape === 'hook') {
    const endHook = t > 0.62 ? Math.pow((t - 0.62) / 0.38, 1.7) * item.curve * 0.95 : 0;
    return base * 0.42 + endHook + curl;
  }
  if (item.shape === 'kink') {
    const kink = t > 0.48 ? item.curve * 0.45 : -item.curve * 0.22;
    return base * 0.34 + kink + Math.sin(t * Math.PI * 1.2 + seed) * item.curve * 0.16 + curl;
  }
  if (item.shape === 'loose') {
    return (
      Math.sin(t * Math.PI * 0.55 + seed * 0.11) * 0.82 +
      Math.sin(t * Math.PI * 1.85 - seed * 0.07) * 0.28 +
      Math.sin(t * Math.PI * 4.9 + seed * 0.13) * 0.10
    ) * item.curve + curl;
  }
  if (item.shape === 'dot') {
    return Math.sin(t * Math.PI * 1.2 + seed) * item.curve * 0.28;
  }
  return base + curl;
}

function schliereCurlY(item, t) {
  if (!item.curlEnabled) return 0;
  const curl = item.curl || 0;
  const end = smoothstep(0.34, 1, t);
  const direction = stable01(item.seed + 121.4) > 0.5 ? 1 : -1;
  const roll = Math.sin(end * Math.PI * (1.65 + stable01(item.seed + 122.5) * 0.9)) * 122 * direction;
  const bend = Math.sin(t * Math.PI) * 64 * direction;
  return (roll + bend) * curl;
}

function schliereCurlX(item, t) {
  if (!item.curlEnabled) return 0;
  const curl = item.curl || 0;
  const end = smoothstep(0.34, 1, t);
  const direction = stable01(item.seed + 128.8) > 0.5 ? 1 : -1;
  return (-item.len * 0.32 * end + Math.cos(end * Math.PI * 1.9) * 56 * end * direction) * curl;
}

function smoothstep(edge0, edge1, value) {
  const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function pathX(item, t) {
  const start = -item.len / 2;
  const base = start + t * item.len;
  const curl = schliereCurlX(item, t);

  if (item.shape === 'arc') {
    return start + t * item.len * 0.72 + curl;
  }
  if (item.shape === 'hook') {
    const back = t > 0.64 ? Math.pow((t - 0.64) / 0.36, 1.4) * item.len * 0.26 : 0;
    return base - back + curl;
  }
  if (item.shape === 'kink') {
    return base + (t > 0.48 ? -item.len * 0.11 : item.len * 0.04) + curl;
  }
  if (item.shape === 'loop') {
    return start + t * item.len * 0.34 + Math.sin(t * Math.PI * 2) * item.len * 0.20 + curl;
  }
  if (item.shape === 'comma') {
    return start + t * item.len * 0.38 - Math.pow(t, 2.2) * item.len * 0.20 + curl;
  }
  if (item.shape === 'fold') {
    return start + t * item.len * 0.48 - Math.max(0, t - 0.52) * item.len * 0.44 + curl;
  }
  if (item.shape === 'zig') {
    return base + (t > 0.33 ? -item.len * 0.12 : item.len * 0.04) + (t > 0.66 ? item.len * 0.18 : 0) + curl;
  }
  if (item.shape === 'dot') {
    return start + t * item.len * 0.52 + curl;
  }
  return base + curl;
}

function schlierePath(item, offset = 0) {
  schlierePathRange(item, offset, 0, 1);
}

function schlierePathRange(item, offset = 0, startT = 0, endT = 1) {
  ctx.beginPath();
  const steps = 26;
  for (let j = 0; j <= steps; j++) {
    const t = startT + (endT - startT) * (j / steps);
    const x = pathX(item, t);
    const y = pathY(item, t, offset);
    if (j === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}

function schliereVisibleAt(item, x, y) {
  const radius = Math.max(item.len * 0.62, Math.abs(item.curve) * 2.2, item.thick * 18, 120);
  return (
    x > -radius &&
    x < window.innerWidth + radius &&
    y > -radius &&
    y < window.innerHeight + radius
  );
}

function drawSchliere(item, index) {
  const x = item.x * window.innerWidth;
  const y = item.y * window.innerHeight;
  const hasAttachedFleck = !item.light && index % 3 !== 2;
  const alpha = item.alpha * item.visibility * SCHLIEREN_ALPHA_MUL * (item.light ? LIGHT_SCHLIEREN_ALPHA_MUL : GREY_SCHLIEREN_ALPHA_MUL);
  const offsets = item.edge
    ? [[0, 0], [-window.innerWidth, 0], [window.innerWidth, 0], [0, -window.innerHeight], [0, window.innerHeight]]
    : [[0, 0]];

  offsets.forEach(([ox, oy]) => {
    const point = orbitPoint(x + item.px + ox, y + item.py + oy);
    if (!schliereVisibleAt(item, point.x, point.y)) return;
    drawSchliereSprite(item, alpha, hasAttachedFleck, point.x, point.y, globalOrbitAngle);
    if (item.light && SHOW_LIGHT_SCHLIEREN_MARKERS) drawLightMarker(point.x, point.y);
  });

  // Labels are intentionally disabled for smoother visual testing.
}

function drawLightMarker(x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 45, 180, 0.92)';
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function orbitPoint(x, y) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = x - cx;
  const dy = y - cy;
  const cos = Math.cos(globalOrbitAngle);
  const sin = Math.sin(globalOrbitAngle);

  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos
  };
}

function drawSchliereBody(item, alpha, hasAttachedFleck, x, y, orbitAngle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((item.angle * Math.PI) / 180 + item.rot + orbitAngle);
  drawSchliereBodyLocal(item, alpha, hasAttachedFleck);
  ctx.restore();
}

function drawSchliereBodyLocal(item, alpha, hasAttachedFleck) {
  ctx.save();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const thick = item.thick * SCHLIEREN_THICKNESS_MUL;
  if (item.light) {
    drawCloudLayer(item, 18, `rgba(250, 252, 255, ${0.32 * alpha})`, Math.max(5.2, thick * 5.4), 0);
    drawCloudLayer(item, 11, `rgba(232, 236, 242, ${0.18 * alpha})`, Math.max(3.2, thick * 3.2), 1.4);
    drawCloudLayer(item, 6, `rgba(214, 219, 228, ${0.10 * alpha})`, Math.max(1.3, thick * 1.2), -1.0);
    ctx.filter = 'none';
    ctx.restore();
    return;
  }

  drawCloudLayer(item, 14, `rgba(68, 70, 84, ${0.24 * alpha})`, Math.max(4.4, thick * 3.9), 0);
  drawCloudLayer(item, 10, `rgba(78, 80, 94, ${0.17 * alpha})`, Math.max(6.4, thick * 5.3), 1.8);
  drawCloudLayer(item, 6.5, `rgba(110, 112, 126, ${0.17 * alpha})`, Math.max(2.1, thick * 1.8), 0);
  drawCloudLayer(item, 4.5, `rgba(140, 142, 154, ${0.09 * alpha})`, Math.max(1.1, thick * 0.8), -1.2);

  ctx.filter = 'blur(16px)';
  ctx.strokeStyle = `rgba(64, 66, 80, ${0.075 * alpha})`;
  strokeSchliereLayer(item, Math.max(7.8, thick * 6.8), 3.4);

  if (hasAttachedFleck) {
    drawAttachedFleck(item, alpha);
  }

  ctx.filter = 'none';
  ctx.restore();
}

function schliereLocalBounds(item, hasAttachedFleck) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const offsets = [0, 1.8, -1.2, 2.2, 3.4];
  offsets.forEach(offset => {
    for (let j = 0; j <= 32; j++) {
      const t = j / 32;
      const x = pathX(item, t);
      const y = pathY(item, t, offset);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  });

  if (hasAttachedFleck) {
    const dia = Math.max(7, item.thick * 11);
    const fleckX = -item.len * 0.34;
    const fleckY = pathY(item, 0.18, 2.2);
    minX = Math.min(minX, fleckX - dia * 2.8);
    maxX = Math.max(maxX, fleckX + dia * 2.8);
    minY = Math.min(minY, fleckY - dia * 2.0);
    maxY = Math.max(maxY, fleckY + dia * 2.0);
  }

  const margin = Math.max(76, item.thick * 34);
  const x = Math.floor(minX - margin);
  const y = Math.floor(minY - margin);
  return {
    x,
    y,
    width: Math.ceil(maxX - minX + margin * 2),
    height: Math.ceil(maxY - minY + margin * 2)
  };
}

function updateSchliereSprite(item, alpha, hasAttachedFleck) {
  const curlKey = Math.round((item.curl || 0) * 32);
  const needsSprite = !item.sprite || item.spriteCurlKey !== curlKey;
  if (!needsSprite) return;
  if (item.sprite && frameIndex < item.nextSpriteFrame) return;

  const bounds = schliereLocalBounds(item, hasAttachedFleck);
  const sprite = item.sprite || document.createElement('canvas');
  const w = Math.max(2, Math.min(1800, bounds.width));
  const h = Math.max(2, Math.min(900, bounds.height));
  if (sprite.width !== w || sprite.height !== h) {
    sprite.width = w;
    sprite.height = h;
  }
  const spriteCtx = sprite.getContext('2d');
  spriteCtx.setTransform(1, 0, 0, 1, 0, 0);
  spriteCtx.clearRect(0, 0, w, h);

  const previousCtx = ctx;
  ctx = spriteCtx;
  ctx.save();
  ctx.translate(-bounds.x, -bounds.y);
  drawSchliereBodyLocal(item, alpha, hasAttachedFleck);
  ctx.restore();
  ctx = previousCtx;

  item.sprite = sprite;
  item.spriteBounds = bounds;
  item.spriteCurlKey = curlKey;
  item.nextSpriteFrame = frameIndex + (item.curlEnabled ? SCHLIERE_SPRITE_REFRESH_FRAMES : 999999);
}

function drawSchliereSprite(item, alpha, hasAttachedFleck, x, y, orbitAngle = 0) {
  updateSchliereSprite(item, alpha, hasAttachedFleck);
  if (!item.sprite || !item.spriteBounds) {
    drawSchliereBody(item, alpha, hasAttachedFleck, x, y, orbitAngle);
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((item.angle * Math.PI) / 180 + item.rot + orbitAngle);
  ctx.drawImage(item.sprite, item.spriteBounds.x, item.spriteBounds.y);
  ctx.restore();
}

function drawAttachedFleck(item, alpha) {
  const dia = Math.max(7, item.thick * 11 * SCHLIEREN_THICKNESS_MUL);
  const fleckX = -item.len * 0.34;
  const fleckY = pathY(item, 0.18, 2.2);

  ctx.save();
  ctx.filter = 'blur(8px)';
  const fleckAlpha = item.fleckAlpha == null ? 1 : item.fleckAlpha;
  ctx.fillStyle = `rgba(86, 88, 102, ${0.16 * alpha * fleckAlpha})`;
  ctx.beginPath();
  ctx.ellipse(fleckX, fleckY, dia * 2.2, dia * 1.25, 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'blur(3.2px)';
  ctx.fillStyle = `rgba(136, 138, 150, ${0.13 * alpha * fleckAlpha})`;
  ctx.beginPath();
  ctx.ellipse(fleckX, fleckY, dia * 1.55, dia * 0.82, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCloudLayer(item, blurPx, strokeStyle, lineWidth, offset) {
  ctx.filter = `blur(${blurPx}px)`;
  ctx.strokeStyle = strokeStyle;
  strokeSchliereLayer(item, lineWidth, offset);
}

function strokeSchliereLayer(item, lineWidth, offset) {
  const thin = item.thinning;
  strokeSchliereSegment(item, offset, 0, thin.start, lineWidth, 1);
  strokeSchliereSegment(item, offset, thin.start, thin.end, lineWidth * thin.width, thin.alpha);
  strokeSchliereSegment(item, offset, thin.end, 1, lineWidth, 1);
}

function strokeSchliereSegment(item, offset, startT, endT, lineWidth, alphaMul) {
  if (endT <= startT) return;
  ctx.save();
  ctx.globalAlpha *= alphaMul;
  ctx.lineWidth = lineWidth;
  schlierePathRange(item, offset, startT, endT);
  ctx.stroke();
  ctx.restore();
}

function drawNumber(number, x, y) {
  ctx.save();
  ctx.font = '600 11px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(230, 30, 160, 0.86)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), x + 14, y - 14);
  ctx.restore();
}

function drawGreenNumber(number, x, y) {
  ctx.save();
  ctx.font = '600 11px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(20, 160, 70, 0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), x + 12, y - 12);
  ctx.restore();
}

function drawSchlierenFleck(item, index) {
  const point = orbitPoint(item.x * window.innerWidth + item.px, item.y * window.innerHeight + item.py);
  const x = point.x;
  const y = point.y;
  const s = item.size;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(item.angle + globalOrbitAngle);
  ctx.filter = 'blur(18px)';
  ctx.fillStyle = `rgba(76, 78, 92, ${item.alpha * SCHLIEREN_ALPHA_MUL})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 1.95, s * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'blur(10px)';
  ctx.fillStyle = `rgba(122, 124, 138, ${item.alpha * 0.42 * SCHLIEREN_ALPHA_MUL})`;
  ctx.beginPath();
  ctx.ellipse(s * 0.08, -s * 0.04, s * 1.12, s * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Labels are intentionally disabled for smoother visual testing.
}

function drawElement(item) {
  const point = orbitPoint(item.x * window.innerWidth + item.px, item.y * window.innerHeight + item.py);
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(item.angle + globalOrbitAngle);
  ctx.scale(item.scale, item.scale);

  if (item.kind === 'hf1') drawHf1(item.alpha);
  else if (item.kind === 'sem') drawSem(item.alpha);
  else if (item.kind === 'nuclei') drawNucleiGroup(item.alpha);
  else if (item.kind === 'triangle') drawTriangleGroup(item.alpha);
  else if (item.kind === 'round') drawRoundElement(item.alpha);
  else drawDiffuseCloud(item.alpha, item.kind === 'greycloud' ? 95 : 58);

  ctx.restore();
}

function drawHf1(alpha) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.filter = 'blur(5px)';
  ctx.strokeStyle = `rgba(238, 242, 242, ${0.18 * alpha})`;
  ctx.lineWidth = 18;
  hfPath();
  ctx.stroke();

  ctx.filter = 'blur(1.6px)';
  ctx.strokeStyle = `rgba(34, 34, 42, ${0.28 * alpha})`;
  ctx.lineWidth = 2.2;
  hfPath(-8);
  ctx.stroke();
  hfPath(8);
  ctx.stroke();

  ctx.filter = 'blur(3px)';
  ctx.fillStyle = `rgba(34, 32, 38, ${0.55 * alpha})`;
  ctx.beginPath();
  ctx.ellipse(-58, 18, 18, 13, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function hfPath(offset = 0) {
  ctx.beginPath();
  ctx.moveTo(-108, 8 + offset);
  ctx.bezierCurveTo(-72, -28 + offset, -38, -36 + offset, -4, -16 + offset);
  ctx.bezierCurveTo(30, 4 + offset, 68, 2 + offset, 102, -18 + offset);
}

function drawSem(alpha) {
  ctx.save();
  ctx.strokeStyle = `rgba(96, 100, 108, ${0.30 * alpha})`;
  ctx.fillStyle = `rgba(245, 248, 248, ${0.16 * alpha})`;
  ctx.lineWidth = 2;
  ctx.filter = 'blur(2.2px)';
  drawSemPart(-34, 16, 34, 18, -0.55);
  drawSemPart(18, 0, 28, 15, 0.55);
  drawSemPart(8, -34, 22, 18, -0.08);
  ctx.restore();
}

function drawSemPart(x, y, w, h, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0.25 * Math.PI, 1.55 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawNucleiGroup(alpha) {
  const pts = [[-34, -10], [-12, -20], [10, -12], [28, 4], [8, 18], [-18, 16]];
  pts.forEach(([x, y], i) => drawNucleusBead(x, y, 12 + (i % 2) * 2, alpha));
}

function drawTriangleGroup(alpha) {
  const pts = [[-34, 18], [-12, -18], [20, 12], [-22, 10], [-2, -8], [14, 7], [38, 18], [52, 24]];
  pts.forEach(([x, y], i) => drawNucleusBead(x, y, 10 + (i % 3), alpha * 0.85));
}

function drawNucleusBead(x, y, r, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.filter = 'blur(2.4px)';
  ctx.fillStyle = `rgba(245, 248, 250, ${0.18 * alpha})`;
  ctx.strokeStyle = `rgba(90, 92, 104, ${0.18 * alpha})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.05, r * 0.9, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRoundElement(alpha) {
  ctx.save();
  ctx.filter = 'blur(2.4px)';
  ctx.fillStyle = `rgba(248, 250, 250, ${0.20 * alpha})`;
  ctx.strokeStyle = `rgba(88, 90, 100, ${0.22 * alpha})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.filter = 'blur(5px)';
  ctx.fillStyle = `rgba(78, 78, 86, ${0.18 * alpha})`;
  ctx.beginPath();
  ctx.arc(1, 1, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDiffuseCloud(alpha, size) {
  ctx.save();
  ctx.filter = 'blur(22px)';
  ctx.fillStyle = `rgba(34, 34, 44, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.62, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'blur(34px)';
  ctx.fillStyle = `rgba(112, 114, 126, ${alpha * 0.55})`;
  ctx.beginPath();
  ctx.ellipse(-size * 0.05, -size * 0.03, size * 0.7, size * 0.45, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw() {
  ctx = mainCtx;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ELEMENTE.forEach(drawElement);
  ALLE_SCHLIEREN.forEach(drawSchliere);
  SCHLIEREN_FLECKEN.forEach(drawSchlierenFleck);
}

function updateMotion() {
  const speed = 860.0;
  const now = performance.now();
  const dt = Math.min(50, now - lastFrameAt);
  lastFrameAt = now;
  const movingNow = now - lastMoveAt < 180;
  const ease = 1 - Math.exp(-dt / (movingNow ? 125 : 170));
  const directionEase = 1 - Math.exp(-dt / 105);
  if (movingNow) {
    const targetAngle = Math.atan2(moveVector.y, moveVector.x);
    if (!hasSmoothedMoveAngle) {
      smoothedMoveAngle = targetAngle;
      hasSmoothedMoveAngle = true;
    } else {
      smoothedMoveAngle += angleDelta(smoothedMoveAngle, targetAngle) * directionEase;
    }
  }
  const driveVector = hasSmoothedMoveAngle
    ? { x: Math.cos(smoothedMoveAngle), y: Math.sin(smoothedMoveAngle) }
    : moveVector;
  const targetMotion = movingNow
    ? { x: driveVector.x * speed, y: driveVector.y * speed }
    : { x: 0, y: 0 };

  motion.x += (targetMotion.x - motion.x) * ease;
  motion.y += (targetMotion.y - motion.y) * ease;
  const frameMoveX = motion.x * (dt / 1000);
  const frameMoveY = motion.y * (dt / 1000);
  motionTotal.x += frameMoveX;
  motionTotal.y += frameMoveY;
  const motionMag = Math.hypot(motion.x, motion.y);
  travelPhase += motionMag * (dt / 1000) * 0.012;
  if (movingNow) {
    targetGlobalOrbitAngle = motion.x * 0.00055;
    globalOrbitAngle += (targetGlobalOrbitAngle - globalOrbitAngle) * 0.055;
  }
  window.mvSchlierenMotion = {
    frameIndex,
    moving: movingNow,
    frameX: frameMoveX,
    frameY: frameMoveY,
    totalX: motionTotal.x,
    totalY: motionTotal.y,
    motionX: motion.x,
    motionY: motion.y
  };

  ALLE_SCHLIEREN.forEach((item) => {
    item.px += frameMoveX * item.motionMul;
    item.py += frameMoveY * item.motionMul;
    updateFreeDrift(item, motion.x, motion.y);

    if (Math.abs(motion.x) > 0.01 || Math.abs(motion.y) > 0.01) {
      const motionDirX = motion.x / Math.max(0.001, Math.hypot(motion.x, motion.y));
      const rotationStrength = item.number === 16 ? 0.055 : 0.025;
      item.targetRot = motionDirX * rotationStrength;
      const rotationEase = item.number === 16 ? 0.10 : 0.13;
      item.rot += (item.targetRot - item.rot) * rotationEase;

      if (item.curlEnabled) {
        const travel = Math.hypot(item.px, item.py);
        const halfScreen = Math.max(1, window.innerWidth * 0.5);
        const targetCurl = smoothstep(0.02, 0.35, travel / halfScreen);
        item.curl += (targetCurl - item.curl) * (0.08 + stable01(item.seed + 133.9) * 0.08);
      }
    }
    item.vx = 0;
    item.vy = 0;
  });

  SCHLIEREN_FLECKEN.forEach((item) => {
    item.px += frameMoveX * item.motionMul;
    item.py += frameMoveY * item.motionMul;
    updateFreeDrift(item, motion.x, motion.y);
  });

  ELEMENTE.forEach((item) => {
    item.px += frameMoveX;
    item.py += frameMoveY;
  });

  isMouseMoving = false;
  requestAnimationFrame(tick);
}

function tick() {
  frameIndex++;
  updateMotion();
  draw();
}

function angleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function updateFreeDrift(item, mx, my) {
  const mag = Math.hypot(mx, my);
  if (mag < 0.01) return;

  const nx = -my / mag;
  const ny = mx / mag;
  const wave = Math.sin(travelPhase * (0.55 + stable01(item.seed + 205.1) * 0.45) + item.driftPhase);
  const targetX = nx * wave * item.driftAmp;
  const targetY = ny * wave * item.driftAmp;
  item.freeX += (targetX - item.freeX) * 0.035;
  item.freeY += (targetY - item.freeY) * 0.035;
  item.px += item.freeX * 0.018;
  item.py += item.freeY * 0.018;
}

window.addEventListener('mousemove', (event) => {
  if (!lastMouse) {
    lastMouse = { x: event.clientX, y: event.clientY };
    return;
  }

  const dx = event.clientX - lastMouse.x;
  const dy = event.clientY - lastMouse.y;
  const mag = Math.hypot(dx, dy);
  lastMouse = { x: event.clientX, y: event.clientY };

  if (mag > 0.5) {
    moveVector.x = dx / mag;
    moveVector.y = dy / mag;
    isMouseMoving = true;
    lastMoveAt = performance.now();
  }
});

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(tick);
})();

