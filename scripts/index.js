const FAJR_START_AFTER_SAHRI_IN_MINUTE = 5;
const FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE = 10;
const FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE = -3;
const FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE = 3;
const FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE = -13;
const FORBIDDEN_TIME_END_BEFORE_MAGHRIB_IN_MINUTE = -3;

function D(J) { return (J < 10 ? '0' : '') + J };
function addMinutes(time, minsToAdd) {
    var piece = time.split(':');

    var mins = piece[0] * 60 + +piece[1] + +minsToAdd;

    return D(mins % (24 * 60) / 60 | 0) + ':' + D(mins % 60);
}

const salatTimeTable24 = JSON.parse(data);
console.log(salatTimeTable24);
const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
const oneDay = 1000 * 60 * 60 * 24;
const day = Math.floor(diff / oneDay);
console.log('Day of year: ' + day);
const salatTimeToday = salatTimeTable24[day];

var hour, minute, meridian, time, timeStart, timeEnd;
hour = salatTimeToday['sahriEndHour'];
minute = salatTimeToday['sahriEndMinute'];
if (hour < 12) {
    meridian = "am"
}
else {
    hour -= 12;
    meridian = "pm";
}
hour = D(hour);
minute = D(minute);
time = "" + hour + ":" + minute + " " + meridian;
document.getElementById('sahri-end').innerHTML = time;

// fajr start
hour = salatTimeToday['sahriEndHour'];
minute = salatTimeToday['sahriEndMinute'];
if (hour < 12) {
    meridian = "am"
}
else {
    hour -= 12;
    meridian = "pm";
}
hour = D(hour);
minute = D(minute);
time = "" + hour + ":" + minute;
time = addMinutes(time, FAJR_START_AFTER_SAHRI_IN_MINUTE);
time += " " + meridian
document.getElementById('fajr-start').innerHTML = time;

//sunrise-forbidden
hour = salatTimeToday['sunriseHour'];
minute = salatTimeToday['sunriseMinute'];
if (hour < 12) {
    meridian = "am"
}
else {
    hour -= 12;
    meridian = "pm";
}
hour = D(hour);
minute = D(minute);
timeStart = "" + hour + ":" + minute;
timeEnd = addMinutes(time, FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE);
timeStart += " " + meridian;
timeEnd += " " + meridian;
time = timeStart + " - " + timeEnd;
document.getElementById('sunrise-forbidden').innerHTML = time;

//noon-forbidden
hour = salatTimeToday['noonHour'];
minute = salatTimeToday['noonMinute'];
if (hour < 12) {
    meridian = "am"
}
else {
    hour -= 12;
    meridian = "pm";
}
hour = D(hour);
minute = D(minute);
time = "" + hour + ":" + minute;
timeEnd = addMinutes(time, FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE);
time += " " + meridian;
timeEnd += " " + meridian;
time += " - " + timeEnd;
document.getElementById('sunrise-forbidden').innerHTML = time;
