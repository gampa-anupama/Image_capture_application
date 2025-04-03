const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("captureBtn");
const statusMessage = document.getElementById("status"); // ✅ Fix: Use existing message box

let model;

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                console.log("✅ Camera loaded successfully");
                video.play();
                resolve();
            };
        });
    } catch (error) {
        console.error("❌ Camera access error:", error);
        alert("Error: Camera access denied. Please allow camera permissions.");
    }
}

async function loadModel() {
    model = await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection"
    });
    console.log("✅ Face detection model loaded");
}

async function detectFace() {
    if (!model) return;

    const faces = await model.estimateFaces(video, { flipHorizontal: false });

    if (faces.length === 0) {
        captureBtn.disabled = true;
        updateMessage("❌ No face detected. Look at the camera.");
        return requestAnimationFrame(detectFace);
    }

    const face = faces[0].box;
    const width = video.videoWidth;
    const height = video.videoHeight;

    ctx.clearRect(0, 0, width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.strokeRect(face.xMin, face.yMin, face.width, face.height);

    let restrictionMessage = checkFaceConditions(face, width, height);
    
    if (!restrictionMessage) {
        captureBtn.disabled = false;
        updateMessage("✅ Ready to capture!");
    } else {
        captureBtn.disabled = true;
        updateMessage(`❌ ${restrictionMessage}`);
    }

    requestAnimationFrame(detectFace);
}

// ✅ Fix: Ensure UI updates correctly
function updateMessage(text) {
    statusMessage.innerText = text;
    console.log(text);
}

// ✅ Fix: Improved face position, straightness, and lighting conditions check
function checkFaceConditions(face, width, height) {
    const faceSizeRatio = (face.width * face.height) / (width * height);

    if (faceSizeRatio < 0.08) return "Face too far. Move closer.";

    const faceCenterX = face.xMin + face.width / 2;
    const centerThreshold = width * 0.15;

    if (faceCenterX < width / 2 - centerThreshold || faceCenterX > width / 2 + centerThreshold) {
        return "Face not centered. Look straight at the camera.";
    }

    if (checkImageBrightness()) return "Image too dark (shadow detected). Use better lighting.";

    return null;
}

// ✅ Fix: Improved Brightness Check (Shadow Detection)
function checkImageBrightness() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let brightness = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        brightness += imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114; // Standard brightness formula
    }

    brightness /= imageData.data.length / 4;

    return brightness < 60;
}

// ✅ Capture Image Function
captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL("image/png");
    console.log("📸 Captured Image:", imageDataURL);
    alert("✅ Image Captured!");

    // Download the image
    const a = document.createElement("a");
    a.href = imageDataURL;
    a.download = "captured_image.png";
    a.click();
});

// ✅ Start everything
(async () => {
    await setupCamera();
    await loadModel();
    detectFace();
})();
