let video=document.getElementById("video")

async function startCamera(){

let stream=await navigator.mediaDevices.getUserMedia({video:true})

video.srcObject=stream

}

async function loadModels(){
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models/");
await faceapi.nets.faceLandmark68Net.loadFromUri("./models/");
await faceapi.nets.faceRecognitionNet.loadFromUri("./models/");
}

loadModels()

const officeLat=33.5138
const officeLon=36.2765

const allowedDistance=100

function getDistance(lat1,lon1,lat2,lon2){

const R=6371e3

const φ1=lat1*Math.PI/180
const φ2=lat2*Math.PI/180

const Δφ=(lat2-lat1)*Math.PI/180
const Δλ=(lon2-lon1)*Math.PI/180

const a=Math.sin(Δφ/2)*Math.sin(Δφ/2)+
Math.cos(φ1)*Math.cos(φ2)*
Math.sin(Δλ/2)*Math.sin(Δλ/2)

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))

return R*c

}

async function getFace(){

let detection=await faceapi
.detectSingleFace(video,new faceapi.TinyFaceDetectorOptions())
.withFaceLandmarks()
.withFaceDescriptor()

return detection.descriptor

}

async function verify(){

let empId=document.getElementById("empId").value

navigator.geolocation.getCurrentPosition(async position=>{

let distance=getDistance(
position.coords.latitude,
position.coords.longitude,
officeLat,
officeLon
)

if(distance>allowedDistance){

document.getElementById("result").innerText="انت خارج موقع العمل"

return

}

let face=await getFace()

let response=await fetch(API_URL+"?employee="+empId)

let data=await response.json()

let stored=new Float32Array(data.face)

let dist=faceapi.euclideanDistance(face,stored)

if(dist<0.6){

document.getElementById("result").innerText="تم تسجيل الحضور"

await fetch(API_URL,{
method:"POST",
body:JSON.stringify({
employee:empId,
time:new Date().toISOString(),
lat:position.coords.latitude,
lon:position.coords.longitude
})
})

}else{

document.getElementById("result").innerText="الوجه غير مطابق"

}

})

}
