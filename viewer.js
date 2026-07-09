const scenes = [
  { id: 'museum', title: 'Museum', image: 'images/Museum.jpg' },
  { id: 'town', title: 'Town', image: 'images/Town.jpg' },
  { id: 'train-station', title: 'Train Station', image: 'images/Train Station.jpg' },
];

const viewport = document.getElementById('viewport');
const image = document.getElementById('sceneImage');
const sceneSelect = document.getElementById('sceneSelect');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const resetButton = document.getElementById('resetView');
const fitButton = document.getElementById('fitView');
const fullscreenButton = document.getElementById('fullscreenToggle');
const message = document.getElementById('viewerMessage');

let currentScene = scenes[0];
let scale = 1;
let minScale = 0.1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let lastPointer = { x: 0, y: 0 };
let pointers = new Map();
let lastPinchDistance = 0;
let lastTapTime = 0;
let lastTapPoint = { x: 0, y: 0 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getSceneFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('scene');
  return scenes.find((scene) => scene.id === requested) || scenes[0];
}

function populateSceneSelect() {
  scenes.forEach((scene) => {
    const option = document.createElement('option');
    option.value = scene.id;
    option.textContent = scene.title;
    sceneSelect.append(option);
  });
}

function setMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function applyTransform() {
  image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function calculateFitScale() {
  if (!image.naturalWidth || !image.naturalHeight) return 1;
  const rect = viewport.getBoundingClientRect();
  const horizontalScale = rect.width / image.naturalWidth;
  const verticalScale = rect.height / image.naturalHeight;
  return Math.min(horizontalScale, verticalScale, 1);
}

function fitToScreen() {
  minScale = Math.max(calculateFitScale(), 0.02);
  scale = minScale;
  translateX = 0;
  translateY = 0;
  applyTransform();
}

function resetView() {
  fitToScreen();
}

function zoomAt(pointX, pointY, factor) {
  const rect = viewport.getBoundingClientRect();
  const originX = pointX - rect.left - rect.width / 2;
  const originY = pointY - rect.top - rect.height / 2;
  const nextScale = clamp(scale * factor, minScale * 0.5, 8);
  const ratio = nextScale / scale;

  translateX = originX - (originX - translateX) * ratio;
  translateY = originY - (originY - translateY) * ratio;
  scale = nextScale;
  applyTransform();
}

function zoomFromCenter(factor) {
  const rect = viewport.getBoundingClientRect();
  zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
}

function loadScene(scene) {
  currentScene = scene;
  document.title = `${scene.title} · Scene Viewer`;
  sceneSelect.value = scene.id;
  setMessage('');
  image.alt = scene.title;
  image.src = scene.image;
  const url = new URL(window.location.href);
  url.searchParams.set('scene', scene.id);
  window.history.replaceState({}, '', url);
}

function distanceBetween(activePointers) {
  const [first, second] = activePointers;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function midpoint(activePointers) {
  const [first, second] = activePointers;
  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
}

populateSceneSelect();
loadScene(getSceneFromUrl());

image.addEventListener('load', fitToScreen);
image.addEventListener('error', () => {
  setMessage(`Could not load ${currentScene.image}. Add the image file with this exact name and path.`);
});

sceneSelect.addEventListener('change', () => {
  const scene = scenes.find((item) => item.id === sceneSelect.value);
  if (scene) loadScene(scene);
});

zoomInButton.addEventListener('click', () => zoomFromCenter(1.25));
zoomOutButton.addEventListener('click', () => zoomFromCenter(0.8));
resetButton.addEventListener('click', resetView);
fitButton.addEventListener('click', fitToScreen);

fullscreenButton.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenButton.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
});

viewport.addEventListener('wheel', (event) => {
  event.preventDefault();
  zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.12 : 0.88);
}, { passive: false });

viewport.addEventListener('pointerdown', (event) => {
  viewport.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, event);

  const now = Date.now();
  const tapDistance = Math.hypot(event.clientX - lastTapPoint.x, event.clientY - lastTapPoint.y);
  if (now - lastTapTime < 320 && tapDistance < 35) {
    zoomAt(event.clientX, event.clientY, 1.8);
    lastTapTime = 0;
  } else {
    lastTapTime = now;
    lastTapPoint = { x: event.clientX, y: event.clientY };
  }

  isDragging = true;
  lastPointer = { x: event.clientX, y: event.clientY };
  if (pointers.size === 2) lastPinchDistance = distanceBetween([...pointers.values()]);
});

viewport.addEventListener('pointermove', (event) => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, event);

  if (pointers.size === 2) {
    const activePointers = [...pointers.values()];
    const nextDistance = distanceBetween(activePointers);
    const center = midpoint(activePointers);
    if (lastPinchDistance) zoomAt(center.x, center.y, nextDistance / lastPinchDistance);
    lastPinchDistance = nextDistance;
    return;
  }

  if (!isDragging) return;
  translateX += event.clientX - lastPointer.x;
  translateY += event.clientY - lastPointer.y;
  lastPointer = { x: event.clientX, y: event.clientY };
  applyTransform();
});

function endPointer(event) {
  pointers.delete(event.pointerId);
  isDragging = pointers.size > 0;
  lastPinchDistance = 0;
}

viewport.addEventListener('pointerup', endPointer);
viewport.addEventListener('pointercancel', endPointer);
viewport.addEventListener('pointerleave', endPointer);

viewport.addEventListener('dblclick', (event) => {
  event.preventDefault();
  zoomAt(event.clientX, event.clientY, 1.8);
});

window.addEventListener('keydown', (event) => {
  if (event.target === sceneSelect) return;
  if (event.key === '+' || event.key === '=') zoomFromCenter(1.25);
  if (event.key === '-') zoomFromCenter(0.8);
  if (event.key === '0') resetView();
});

window.addEventListener('resize', () => {
  minScale = Math.max(calculateFitScale(), 0.02);
  if (scale < minScale) fitToScreen();
});
