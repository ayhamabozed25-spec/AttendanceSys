// إعداد المتغيرات
const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const resultText = document.getElementById("result");

// تشغيل الكاميرا
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error(err);
    resultText.innerText = "لا يمكن الوصول إلى الكاميرا";
  }
}

// تحميل النماذج
async function loadModels() {
  resultText.innerText = "جارٍ تحميل النماذج…";

 await faceapi.nets.tinyFaceDetector.loadFromUri("./facemodels/");
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri("./facemodels/");
    await faceapi.nets.faceRecognitionNet.loadFromUri("./facemodels/");

  resultText.innerText = "النماذج جاهزة، يمكنك التقاط بصمة الوجه الآن";
  captureBtn.style.display = "inline";
}

// تسجيل بصمة الوجه
async function captureFace() {
  const empId = document.getElementById("empId").value;
  const name = document.getElementById("name").value;

  if (!empId || !name) {
    resultText.innerText = "أدخل الرقم والاسم";
    return;
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    resultText.innerText = "لم يتم التعرف على الوجه. حاول وضع الوجه أمام الكاميرا بشكل واضح";
    return;
  }

  const faceVector = Array.from(detection.descriptor);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "register",
        employee: empId,
        name: name,
        face: faceVector
      }),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    resultText.innerText = result.status === "ok"
      ? "تم تسجيل الموظف بنجاح"
      : "خطأ: " + result.error;
  } catch (err) {
    console.error(err);
    resultText.innerText = "حدث خطأ أثناء تسجيل الموظف";
  }
}

// بدء التطبيق بعد تحميل DOM
window.addEventListener("DOMContentLoaded", async () => {
  await loadModels();
  await startCamera();
});
