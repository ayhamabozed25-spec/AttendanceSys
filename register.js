let video = document.getElementById("video");

async function startCamera() {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

let modelsLoaded=false;

async function loadModels(){
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/");
  await faceapi.nets.faceLandmark68Net.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/");
  await faceapi.nets.faceRecognitionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/");
  modelsLoaded=true;
}

loadModels();

async function captureFace() {
  const empId = document.getElementById("empId").value;
  const name = document.getElementById("name").value;

  if (!empId || !name) {
    document.getElementById("result").innerText = "أدخل الرقم والاسم";
    return;
  }

  // التحقق من الوجه
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    document.getElementById("result").innerText = "لم يتم التعرف على الوجه";
    return;
  }

  const faceVector = Array.from(detection.descriptor); // تحويل Float32Array إلى Array

  // إرسال البيانات للـ Google Script لتخزينها في Employees Sheet
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      type: "register",
      employee: empId,
      name: name,
      face: faceVector
    })
  });

  const result = await response.json();
  if (result.status === "ok") {
    document.getElementById("result").innerText = "تم تسجيل الموظف بنجاح";
  } else {
    document.getElementById("result").innerText = "خطأ: " + result.error;
  }
}
