
const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const resultText = document.getElementById("result");

// --- تشغيل الكاميرا ---
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    resultText.innerText = "حدث خطأ عند الوصول للكاميرا: " + err;
  }
}

// --- تحميل النماذج ---
async function loadModels() {
  resultText.innerText = "جاري تحميل النماذج، الرجاء الانتظار...";

  try {
    // تحميل النماذج من مجلد local على GitHub
    await faceapi.nets.tinyFaceDetector.loadFromUri("./facemodels/");
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri("./facemodels/");
    await faceapi.nets.faceRecognitionNet.loadFromUri("./facemodels/");

    // تفعيل الزر بعد تحميل النماذج
   
    resultText.innerText = "النماذج جاهزة، يمكنك التقاط بصمة الوجه الآن";
    console.log("النماذج جاهزة");
  } catch (err) {
    resultText.innerText = "خطأ أثناء تحميل النماذج: " + err;
    console.error(err);
  }
}

// --- التقاط بصمة الوجه وإرسالها للـ Google Sheet ---
async function captureFace() {
  const empId = document.getElementById("empId").value;
  const name = document.getElementById("name").value;

  if (!empId || !name) {
    resultText.innerText = "الرجاء إدخال رقم الموظف واسم الموظف";
    return;
  }

  // التقاط الوجه
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    resultText.innerText = "لم يتم التعرف على الوجه. حاول وضع الوجه أمام الكاميرا بشكل واضح";
    return;
  }

  // تحويل face descriptor لمصفوفة لإرسالها
  const faceVector = Array.from(detection.descriptor);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "register", // نوع العملية: تسجيل موظف
        employee: empId,
        name: name,
        face: faceVector
      })
    });

    const result = await response.json();
    if (result.status === "ok") {
      resultText.innerText = "تم تسجيل الموظف بنجاح ✅";
    } else {
      resultText.innerText = "حدث خطأ أثناء التسجيل: " + result.error;
    }
  } catch (err) {
    resultText.innerText = "حدث خطأ عند الاتصال بالخادم: " + err;
    console.error(err);
  }
}

// --- تشغيل الكاميرا وتحميل النماذج عند فتح الصفحة ---
window.addEventListener("DOMContentLoaded", async () => {
  await loadModels();
  await startCamera();
});
