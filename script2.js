const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

let lastAlert = "";
let faceModel;

// Start webcam
async function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
  });
}

// Load BlazeFace model for face detection
async function loadFaceModel() {
  faceModel = await blazeface.load();
}

// Analyze each frame for face detection and conditions
// async function analyzeFrame() {
//   const predictions = await faceModel.estimateFaces(video, false);

//   if (predictions.length === 0) {
//     triggerAlert("❌ No face detected!", false);
//     return false;
//   }

//   const face = predictions[0]; // Only considering first face detected
//   const faceX = face.topLeft[0];
//   const faceY = face.topLeft[1];
//   const faceWidth = face.bottomRight[0] - faceX;
//   const faceHeight = face.bottomRight[1] - faceY;

//   // Define thresholds for centering
//   const videoWidth = video.videoWidth;
//   const videoHeight = video.videoHeight;
//   const centerX = videoWidth / 2;
//   const centerY = videoHeight / 2;

//   // if (
//   //   Math.abs(faceX + faceWidth / 2 - centerX) > 100 ||
//   //   Math.abs(faceY + faceHeight / 2 - centerY) > 100
//   // ) {
//   //   triggerAlert("⚠️ Face not centered!", false);
//   //   return false;
//   // }

//   // Capture frame for checks
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//   if (!checkLighting(imageData)) {
//     triggerAlert("💡 Poor lighting detected!", false);
//     return false;
//   }

//   if (!checkBlur(imageData)) {
//     triggerAlert("🔍 Blurry image detected!", false);
//     return false;
//   }

//   triggerAlert("✅ Everything is good!", true);
//   return true;
// }
// async function analyzeFrame() {
//   const predictions = await faceModel.estimateFaces(video, false);

//   if (predictions.length === 0) {
//     triggerAlert("❌ No face detected!", false);
//     return false;
//   }

//   const face = predictions[0]; // Only considering the first detected face
//   const faceX = face.topLeft[0];
//   const faceY = face.topLeft[1];
//   const faceWidth = face.bottomRight[0] - faceX;
//   const faceHeight = face.bottomRight[1] - faceY;

//   const videoWidth = video.videoWidth;
//   const videoHeight = video.videoHeight;

//   // **Check if part of the face is out of bounds**
//   if (
//     faceX < 0 ||
//     faceY < 0 ||
//     faceX + faceWidth > videoWidth ||
//     faceY + faceHeight > videoHeight
//   ) {
//     triggerAlert("⚠️ Face is partially out of frame!", false);
//     return false;
//   }

//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//   if (!checkLighting(imageData)) {
//     triggerAlert("💡 Poor lighting detected!", false);
//     return false;
//   }

//   if (!checkBlur(imageData)) {
//     triggerAlert("🔍 Blurry image detected!", false);
//     return false;
//   }

//   triggerAlert("✅ Everything is good!", true);
//   return true;
// }
async function analyzeFrame() {
  const predictions = await faceModel.estimateFaces(video, false);
  // console.log("Predictions:", predictions);

  if (predictions.length === 0) {
    triggerAlert("❌ No face detected!", false);
    return false;
  }

  const face = predictions[0]; // First detected face

  // console.log("Face Data:", face); // Log details about the detected face

  if (!face.landmarks) {
    console.warn("⚠️ No landmarks found!");
    triggerAlert("⚠️ Face partially blocked or not detected properly!", false);
    return false;
  }

  // Extract key landmarks (eye, nose, mouth)
  // const leftEye = face.landmarks[0]; // Left eye
  // const rightEye = face.landmarks[1]; // Right eye
  // const nose = face.landmarks[2]; // Nose
  // const mouth = face.landmarks[3]; // Mouth

  const leftEye = face.landmarks[0]; // Left eye
  const rightEye = face.landmarks[1]; // Right eye
  const nose = face.landmarks[2]; // Nose
  const mouth = face.landmarks[3]; // Mouth (center)
  const leftEar = face.landmarks[4]; // Left ear
  const rightEar = face.landmarks[5]; // Right ear

  // console.log("Left Eye:", leftEye);
  // console.log("Right Eye:", rightEye);
  // console.log("Nose:", nose);
  // console.log("Mouth:", mouth);s
  // console.log("Left Ear:", leftEar);
  // console.log("Right Ear:", rightEar);

  if (!leftEye || !rightEye || !nose || !mouth) {
    triggerAlert("⚠️ Face partially blocked!", false);
    return false;
  }

  // const face = predictions[0]; // Only considering the first detected face
  const faceX = face.topLeft[0];
  const faceY = face.topLeft[1];
  const faceWidth = face.bottomRight[0] - faceX;
  const faceHeight = face.bottomRight[1] - faceY;

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // **Check if part of the face is out of bounds**
  if (
    faceX < 0 ||
    faceY < 0 ||
    faceX + faceWidth > videoWidth ||
    faceY + faceHeight > videoHeight
  ) {
    triggerAlert("⚠️ Face is partially out of frame!", false);
    return false;
  }

  // Continue with other checks (lighting, blur, etc.)
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (!checkLighting(imageData)) {
    triggerAlert("💡 Poor lighting detected!", false);
    return false;
  }

  if (!checkBlur(imageData)) {
    triggerAlert("🔍 Blurry image detected!", false);
    return false;
  }

  triggerAlert("✅ Everything is good!", true);
  return true;
}

// Check if lighting is good
// function checkLighting(imageData) {
//   const pixels = imageData.data;
//   let brightnessSum = 0;
//   for (let i = 0; i < pixels.length; i += 4) {
//     brightnessSum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
//   }
//   const brightnessAvg = brightnessSum / (pixels.length / 4);
//   return brightnessAvg > 50 && brightnessAvg < 200;
// }
function checkLighting(imageData) {
  const pixels = imageData.data;
  let brightnessSum = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    brightnessSum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  }

  const brightnessAvg = brightnessSum / (pixels.length / 4);

  // console.log("Brightness Level:", brightnessAvg); // Debugging log

  if (brightnessAvg < 80) {
    triggerAlert("💡 Too Dim! Increase lighting.", false);
    return false;
  } else if (brightnessAvg > 220) {
    triggerAlert("🔆 Too Bright! Reduce lighting.", false);
    return false;
  }

  return true;
}

// Check if image is blurry using edge detection
function checkBlur(imageData) {
  let edgeCount = 0;
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length - 4; i += 4) {
    const diff =
      Math.abs(pixels[i] - pixels[i + 4]) +
      Math.abs(pixels[i + 1] - pixels[i + 5]) +
      Math.abs(pixels[i + 2] - pixels[i + 6]);
    if (diff > 30) edgeCount++;
  }

  return edgeCount > 5000; // Higher edge count means sharp image
}

// Update status alert
function triggerAlert(message, isGood) {
  if (lastAlert !== message) {
    lastAlert = message;
    statusText.innerText = message;
    statusText.className = isGood ? "status good" : "status bad";
  }
}

// Capture image only if conditions are good
async function captureImage() {
  const result = await analyzeFrame();
  if (result) {
    alert("📸 Image Captured Successfully!");
    console.log("Image Captured!");
  }
}

// Main function to start everything
async function main() {
  await startCamera();
  await loadFaceModel();

  setInterval(analyzeFrame, 1000); // Run every second
}

main();
