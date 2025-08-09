import { normalizedToPixel, dist, avgPoint } from './mediapipe-helpers.js';
const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const snapBtn = document.getElementById('snapBtn');
const resultDiv = document.getElementById('result');
const metricsDiv = document.getElementById('metrics');
let faceMesh = null;
let stream = null;
function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}
async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  video.srcObject = stream;
  await video.play();
  resizeCanvas();
  initFaceMesh();
}
startBtn.onclick = startCamera;
snapBtn.onclick = () => analyzeCurrentFrame();
async function initFaceMesh() {
  if (!window.FaceMesh) {
    await import('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
    await import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    await import('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
  }
  faceMesh = new Facemesh.FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  faceMesh.onResults(onResults);
  const camera = new Camera.Camera(video, {
    onFrame: async () => { await faceMesh.send({image: video}); },
    width: 1280,
    height: 720
  });
  camera.start();
}
function onResults(results) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    resultDiv.textContent = 'No face detected';
    return;
  }
  const landmarks = results.multiFaceLandmarks[0];
  drawLandmarks(landmarks);
  const metrics = computeAsymmetry(landmarks);
  showMetrics(metrics);
}
function drawLandmarks(landmarks) {
  if (window.drawConnectors) {
    drawConnectors(ctx, landmarks, Facemesh.FACEMESH_TESSELATION, {color: '#888', lineWidth: 1});
    drawLandmarks(ctx, landmarks, {color: '#ff0', lineWidth: 1});
  } else {
    ctx.fillStyle = 'rgba(0,200,0,0.8)';
    const w = canvas.width, h = canvas.height;
    landmarks.forEach(p => {
      const px = p.x * w, py = p.y * h;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
    });
  }
}
function computeAsymmetry(landmarks) {
  const leftMouth = landmarks[61];
  const rightMouth = landmarks[291];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1] || landmarks[4];
  const dLeft = dist(leftMouth, nose);
  const dRight = dist(rightMouth, nose);
  const mouthAsym = Math.abs(dLeft - dRight) / ((dLeft + dRight)/2);
  const leftEyeY = leftEye.y;
  const rightEyeY = rightEye.y;
  const eyeAsym = Math.abs(leftEyeY - rightEyeY);
  return { mouthAsym, eyeAsym, dLeft, dRight };
}
function showMetrics(m) {
  const mouthThresh = 0.06;
  const eyeThresh = 0.01;
  let alert = 'No obvious droop detected';
  if (m.mouthAsym > mouthThresh || m.eyeAsym > eyeThresh) {
    alert = 'Possible facial droop detected — seek help and check FAST criteria.';
  }
  resultDiv.textContent = alert;
  metricsDiv.innerHTML = `
    <div>Mouth asymmetry (rel): ${m.mouthAsym.toFixed(3)}</div>
    <div>Eye Y diff: ${m.eyeAsym.toFixed(4)}</div>
    <div>Left mouth dist: ${m.dLeft.toFixed(3)}</div>
    <div>Right mouth dist: ${m.dRight.toFixed(3)}</div>
  `;
}