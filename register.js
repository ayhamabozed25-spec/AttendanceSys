let video=document.getElementById("video");
let captureBtn=document.getElementById("captureBtn");

async function startCamera(){
  let stream=await navigator.mediaDevices.getUserMedia({video:true});
  video.srcObject=stream;
}

async function loadModels(){
  // روابط CDN موثوقة للنماذج
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/");
  await faceapi.nets.faceLandmark68Net.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/");
  await faceapi.nets.faceRecognitionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models/");
  
  // تفعيل الزر بعد تحميل النماذج
  
  document.getElementById("result").innerText="النماذج جاهزة، يمكنك التقاط بصمة الوجه الآن";
}

loadModels();

async function captureFace(){
  const empId=document.getElementById("empId").value;
  const name=document.getElementById("name").value;

  if(!empId || !name){
    document.getElementById("result").innerText="أدخل الرقم والاسم";
    return;
  }

  const detection=await faceapi
    .detectSingleFace(video,new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if(!detection){
    document.getElementById("result").innerText="لم يتم التعرف على الوجه. حاول وضع الوجه أمام الكاميرا بشكل واضح";
    return;
  }

  const faceVector=Array.from(detection.descriptor);

  const response=await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      type:"register",
       employee: empId,
        name: name,
        face: faceVector
    })
  });

  const result=await response.json();
  if(result.status==="ok"){
    document.getElementById("result").innerText="تم تسجيل الموظف بنجاح";
  }else{
    document.getElementById("result").innerText="خطأ: "+result.error;
  }
}
