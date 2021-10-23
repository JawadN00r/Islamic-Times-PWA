const FAJR_START_AFTER_SAHRI_IN_MINUTE = 5;
const FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE = 10;
const FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE = -3;
const FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE = 3;
const FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE = -13;
const FORBIDDEN_TIME_END_BEFORE_MAGHRIB_IN_MINUTE = -3;

const defaultDate = "1970-01-01 ";

function addMinutes(hours, minutes, minsToAdd) {
    var time = "" + hours + ":" + minutes;
    time = new Date(defaultDate + time);
    time = new Date(time.getTime() + minsToAdd * 60000);
    return formatAMPM(time.getHours(), time.getMinutes());
}

function formatAMPM(hours, minutes) {
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function getDateIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    // check leap year
    const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() == 1
    if (isLeapYear || now.getMonth() < 2) {
        return day - 1;
    } else {
        return day;
    }

}

const salatTimeTable24 = JSON.parse(data);

let day = getDateIndex();
const salatTimeToday = salatTimeTable24[day];

var hour, minute, meridian, time, timeStart, timeEnd;
hour = salatTimeToday['sahriEndHour'];
minute = salatTimeToday['sahriEndMinute'];
time = formatAMPM(hour, minute);
document.getElementById('sahri-end').innerHTML = time;

// fajr start
hour = salatTimeToday['sahriEndHour'];
minute = salatTimeToday['sahriEndMinute'];
time = addMinutes(hour, minute, FAJR_START_AFTER_SAHRI_IN_MINUTE);
document.getElementById('fajr-start').innerHTML = time;

//sunrise-forbidden
hour = salatTimeToday['sunriseHour'];
minute = salatTimeToday['sunriseMinute'];
timeStart = formatAMPM(hour, minute);
timeEnd = addMinutes(hour, minute, FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE);
time = timeStart + " - " + timeEnd;
document.getElementById('sunrise-forbidden').innerHTML = time;

//noon-forbidden
hour = salatTimeToday['noonHour'];
minute = salatTimeToday['noonMinute'];
timeStart = addMinutes(hour, minute, FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE);
timeEnd = addMinutes(hour, minute, FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE);
time = timeStart + " - " + timeEnd;
document.getElementById('noon-forbidden').innerHTML = time;

//duhr-start
document.getElementById('duhr-start').innerHTML = timeEnd;

//asr-start
hour = salatTimeToday['asrStartHour'];
minute = salatTimeToday['asrStartMinute'];
time = formatAMPM(hour, minute);
document.getElementById('asr-start').innerHTML = time;


//sunset-forbidden
hour = salatTimeToday['magribStartHour'];
minute = salatTimeToday['magribStartMinute'];
timeStart = addMinutes(hour, minute, FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE);
timeEnd = addMinutes(hour, minute, FORBIDDEN_TIME_END_BEFORE_MAGHRIB_IN_MINUTE);
time = timeStart + " - " + timeEnd;
document.getElementById('sunset-forbidden').innerHTML = time;

//magrib-start
hour = salatTimeToday['magribStartHour'];
minute = salatTimeToday['magribStartMinute'];
time = formatAMPM(hour, minute);
document.getElementById('magrib-start').innerHTML = time;

//isha-start
hour = salatTimeToday['ishaStartHour'];
minute = salatTimeToday['ishaStartMinute'];
time = formatAMPM(hour, minute);
document.getElementById('isha-start').innerHTML = time;
