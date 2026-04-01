const FAJR_START_AFTER_SAHRI_IN_MINUTE = 5;
const FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE = 10;
const FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE = -3;
const FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE = 3;
const FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE = -13;
const SUNSET_TIME_BEFORE_MAGHRIB_IN_MINUTE = -3;

// Use explicit date construction instead of string parsing for cross-platform safety
function createTimeDate(hours, minutes) {
  var d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function addMinutes(hours, minutes, minsToAdd) {
  var time = createTimeDate(hours, minutes);
  time = new Date(time.getTime() + minsToAdd * 60000);
  return formatAMPM(time.getHours(), time.getMinutes());
}

function formatAMPM(hours, minutes) {
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + "" + ampm;
  return strTime;
}

function getDateIndex() {
  let now = new Date();
  let start = new Date(now.getFullYear(), 0, 0);
  let diff =
    now -
    start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  let oneDay = 1000 * 60 * 60 * 24;
  let day = Math.floor(diff / oneDay);

  // check leap year
  const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() == 1;
  if (isLeapYear || now.getMonth() < 2) {
    return day - 1;
  } else {
    return day;
  }
}

function getHijriMonthName(monthNo) {
  let monthName = "";
  switch (monthNo) {
    case 1:
      monthName = "মহররম";
      break;
    case 2:
      monthName = "সফর";
      break;
    case 3:
      monthName = "রবিউল আউয়াল";
      break;
    case 4:
      monthName = "রবিউস সানি";
      break;
    case 5:
      monthName = "জমাদিউল আউয়াল";
      break;
    case 6:
      monthName = "জুমাদাল উখরা";
      break;
    case 7:
      monthName = "রজব";
      break;
    case 8:
      monthName = "শাবান";
      break;
    case 9:
      monthName = "রমজান";
      break;
    case 10:
      monthName = "শাওয়াল";
      break;
    case 11:
      monthName = "জিলকদ";
      break;
    case 12:
      monthName = "জিলহজ";
      break;
  }
  return monthName;
}

function getCurrentDayName(salatTimeToday) {
  let dayName = "";
  let dayNo = new Date().getDay();
  if (isNowAfterSunset(salatTimeToday)) {
    dayNo = (dayNo + 1) % 7;
  }
  switch (dayNo) {
    case 0:
      dayName = "রবি";
      break;
    case 1:
      dayName = "সোম";
      break;
    case 2:
      dayName = "মঙ্গল";
      break;
    case 3:
      dayName = "বুধ";
      break;
    case 4:
      dayName = "বৃহ:";
      break;
    case 5:
      dayName = "শুক্র";
      break;
    case 6:
      dayName = "শনি";
      break;
  }
  return dayName;
}

function getCurrentHijriDate(english_hijri_mappings, salatTimeToday) {
  let english_date = english_hijri_mappings["english_date"];
  let english_month = english_hijri_mappings["english_month"];
  let english_year = english_hijri_mappings["english_year"];
  let hijri_date = english_hijri_mappings["hijri_date"];
  let hijri_month = english_hijri_mappings["hijri_month"];
  let hijri_year = english_hijri_mappings["hijri_year"];

  let now = new Date();
  let start = new Date(english_year, english_month - 1, english_date);
  let diff =
    now -
    start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  let oneDay = 1000 * 60 * 60 * 24;
  let day = Math.floor(diff / oneDay);
  hijri_date += day;

  // +1 after sunset
  if (isNowAfterSunset(salatTimeToday)) {
    hijri_date += 1;
  }

  // check if hijri date > 30 i.e., new month
  if (hijri_date > 30) {
    hijri_date = hijri_date % 30;
    hijri_month += 1;
    // if month > 12, rotate
    if (hijri_month > 12) {
      hijri_month = hijri_month % 12;
    }
  } else if (hijri_date == 0) {
    hijri_date = 30;
    hijri_month -= 1;
    // if month < 1, rotate
    if (hijri_month < 1) {
      hijri_month = 12;
      hijri_year -= 1;
    }
  }

  hijri_month = getHijriMonthName(hijri_month);
  return "" + hijri_date + " " + hijri_month + " " + hijri_year;
}

function isNowAfterSunset(salatTimeToday) {
  let now = new Date();
  let hour = salatTimeToday["magribStartHour"];
  let minute = salatTimeToday["magribStartMinute"];
  var sunset_time = createTimeDate(hour, minute);
  sunset_time = new Date(
    sunset_time.getTime() + SUNSET_TIME_BEFORE_MAGHRIB_IN_MINUTE * 60000
  );

  var nowTime = createTimeDate(now.getHours(), now.getMinutes());
  return nowTime >= sunset_time;
}

function getCurrentEnglishDate() {
  let date = new Date();
  return (
    date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
  );
}

function renderPrayerTimes(salatTimeTable24, english_hijri_mappings) {
  let day = getDateIndex();
  const salatTimeToday = salatTimeTable24[day];

  var hour, minute, time, timeStart, timeEnd;

  var hirji_date_today = getCurrentHijriDate(english_hijri_mappings, salatTimeToday);
  document.getElementById("date-hijri").innerHTML =
    getCurrentDayName(salatTimeToday) + ", " + hirji_date_today;

  document.getElementById("date-english").innerHTML =
    "(" + getCurrentEnglishDate() + ")";

  hour = salatTimeToday["sahriEndHour"];
  minute = salatTimeToday["sahriEndMinute"];
  time = formatAMPM(hour, minute);
  document.getElementById("sahri-end").innerHTML = time;

  hour = salatTimeToday["sahriEndHour"];
  minute = salatTimeToday["sahriEndMinute"];
  time = addMinutes(hour, minute, FAJR_START_AFTER_SAHRI_IN_MINUTE);
  document.getElementById("fajr-start").innerHTML = time;

  hour = salatTimeToday["sunriseHour"];
  minute = salatTimeToday["sunriseMinute"];
  timeStart = formatAMPM(hour, minute);
  timeEnd = addMinutes(hour, minute, FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE);
  time = timeStart + " - " + timeEnd;
  document.getElementById("sunrise-forbidden").innerHTML = time;

  time = timeEnd;
  document.getElementById("ishrak").innerHTML = time;

  hour = salatTimeToday["noonHour"];
  minute = salatTimeToday["noonMinute"];
  timeStart = addMinutes(
    hour,
    minute,
    FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE
  );
  timeEnd = addMinutes(hour, minute, FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE);
  time = timeStart + " - " + timeEnd;
  document.getElementById("noon-forbidden").innerHTML = time;

  document.getElementById("duhr-start").innerHTML = timeEnd;

  hour = salatTimeToday["asrStartHour"];
  minute = salatTimeToday["asrStartMinute"];
  time = formatAMPM(hour, minute);
  document.getElementById("asr-start").innerHTML = time;

  hour = salatTimeToday["magribStartHour"];
  minute = salatTimeToday["magribStartMinute"];
  timeStart = addMinutes(
    hour,
    minute,
    FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE
  );
  timeEnd = addMinutes(hour, minute, SUNSET_TIME_BEFORE_MAGHRIB_IN_MINUTE);
  time = timeStart + " - " + timeEnd;
  document.getElementById("sunset-forbidden").innerHTML = time;

  hour = salatTimeToday["magribStartHour"];
  minute = salatTimeToday["magribStartMinute"];
  time = formatAMPM(hour, minute);
  document.getElementById("magrib-start").innerHTML = time;

  hour = salatTimeToday["ishaStartHour"];
  minute = salatTimeToday["ishaStartMinute"];
  time = formatAMPM(hour, minute);
  document.getElementById("isha-start").innerHTML = time;
}

// Fetch data and render - called on load and on SW update
function loadDataAndRender() {
  Promise.all([
    fetch("SalatTimeTable24.json").then(function (r) { return r.json(); }),
    fetch("english_hijri_mapping.json").then(function (r) { return r.json(); })
  ]).then(function (results) {
    renderPrayerTimes(results[0], results[1]);
  }).catch(function (err) {
    console.error("Failed to load prayer data:", err);
  });
}

loadDataAndRender();
