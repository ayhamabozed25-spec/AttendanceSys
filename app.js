const officeLat = 33.5138
const officeLon = 36.2765

const allowedDistance = 100

function getDistance(lat1, lon1, lat2, lon2){

const R = 6371e3

const φ1 = lat1 * Math.PI/180
const φ2 = lat2 * Math.PI/180

const Δφ = (lat2-lat1) * Math.PI/180
const Δλ = (lon2-lon1) * Math.PI/180

const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
Math.cos(φ1) * Math.cos(φ2) *
Math.sin(Δλ/2) * Math.sin(Δλ/2)

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

return R * c

}

function getLocation(){

navigator.geolocation.getCurrentPosition(position => {

let distance = getDistance(
position.coords.latitude,
position.coords.longitude,
officeLat,
officeLon
)

if(distance <= allowedDistance){

document.getElementById("result").innerText = "تم تسجيل الحضور"

}else{

document.getElementById("result").innerText = "انت خارج موقع العمل"

}

})

}
