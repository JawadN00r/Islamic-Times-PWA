const FAJR_START_AFTER_SAHRI_IN_MINUTE = 5;
const FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE = 10;
const FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE = -3;
const FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE = 3;
const FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE = -13;
const SUNSET_TIME_BEFORE_MAGHRIB_IN_MINUTE = -3;
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

var appState = {
  salatTimeTable24: null,
  englishHijriMappings: null,
  selectedDate: normalizeDate(new Date())
};

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(firstDate, secondDate) {
  return normalizeDate(firstDate).getTime() === normalizeDate(secondDate).getTime();
}

function padNumber(value) {
  return value < 10 ? "0" + value : "" + value;
}

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

function getDateIndex(targetDate) {
  let start = new Date(targetDate.getFullYear(), 0, 0);
  let diff =
    targetDate -
    start +
    (start.getTimezoneOffset() - targetDate.getTimezoneOffset()) * 60 * 1000;
  let day = Math.floor(diff / MILLISECONDS_IN_DAY);

  // check leap year
  const isLeapYear = new Date(targetDate.getFullYear(), 1, 29).getMonth() == 1;
  if (isLeapYear || targetDate.getMonth() < 2) {
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

function getDayName(dayNo) {
  let dayName = "";
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

function getDayNameForDate(selectedDate, shouldAdvanceDay) {
  let dayNo = selectedDate.getDay();
  if (shouldAdvanceDay) {
    dayNo = (dayNo + 1) % 7;
  }
  return getDayName(dayNo);
}

function getHijriDateForDate(english_hijri_mappings, selectedDate, shouldAdvanceDay) {
  let english_date = english_hijri_mappings["english_date"];
  let english_month = english_hijri_mappings["english_month"];
  let english_year = english_hijri_mappings["english_year"];
  let hijri_date = english_hijri_mappings["hijri_date"];
  let hijri_month = english_hijri_mappings["hijri_month"];
  let hijri_year = english_hijri_mappings["hijri_year"];

  let start = new Date(english_year, english_month - 1, english_date);
  let diff =
    selectedDate -
    start +
    (start.getTimezoneOffset() - selectedDate.getTimezoneOffset()) * 60 * 1000;
  let day = Math.floor(diff / MILLISECONDS_IN_DAY);
  hijri_date += day;

  if (shouldAdvanceDay) {
    hijri_date += 1;
  }

  while (hijri_date > 30) {
    hijri_date -= 30;
    hijri_month += 1;
    if (hijri_month > 12) {
      hijri_month = 1;
      hijri_year += 1;
    }
  }

  while (hijri_date < 1) {
    hijri_date += 30;
    hijri_month -= 1;
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

function getEnglishDateLabel(selectedDate) {
  return (
    padNumber(selectedDate.getDate()) +
    "-" +
    padNumber(selectedDate.getMonth() + 1) +
    "-" +
    selectedDate.getFullYear()
  );
}

function updateNavigationState() {
  let todayButton = document.getElementById("nav-today");
  let isTodaySelected = isSameDate(appState.selectedDate, new Date());

  todayButton.disabled = isTodaySelected;
  todayButton.setAttribute("aria-current", isTodaySelected ? "date" : "false");
}

function renderPrayerTimes(salatTimeTable24, english_hijri_mappings, selectedDate) {
  let day = getDateIndex(selectedDate);
  const salatTimeToday = salatTimeTable24[day];
  const shouldAdvanceDay =
    isSameDate(selectedDate, new Date()) && isNowAfterSunset(salatTimeToday);

  var hour, minute, time, timeStart, timeEnd;

  var hirji_date_today = getHijriDateForDate(
    english_hijri_mappings,
    selectedDate,
    shouldAdvanceDay
  );
  document.getElementById("date-hijri").textContent =
    getDayNameForDate(selectedDate, shouldAdvanceDay) + ", " + hirji_date_today;

  document.getElementById("date-english").textContent =
    "(" + getEnglishDateLabel(selectedDate) + ")";

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

  updateNavigationState();
}

function renderSelectedDate() {
  if (!appState.salatTimeTable24 || !appState.englishHijriMappings) {
    return;
  }

  renderPrayerTimes(
    appState.salatTimeTable24,
    appState.englishHijriMappings,
    appState.selectedDate
  );
}

function shiftSelectedDate(dayOffset) {
  let nextDate = new Date(appState.selectedDate);
  nextDate.setDate(nextDate.getDate() + dayOffset);
  appState.selectedDate = normalizeDate(nextDate);
  renderSelectedDate();
}

function goToToday() {
  appState.selectedDate = normalizeDate(new Date());
  renderSelectedDate();
}

function initDateNavigation() {
  document
    .getElementById("nav-prev-day")
    .addEventListener("click", function () {
      shiftSelectedDate(-1);
    });

  document
    .getElementById("nav-next-day")
    .addEventListener("click", function () {
      shiftSelectedDate(1);
    });

  document.getElementById("nav-today").addEventListener("click", function () {
    goToToday();
  });
}

// Fetch data and render - called on load and on SW update
function loadDataAndRender() {
  Promise.all([
    fetch("SalatTimeTable24.json").then(function (r) { return r.json(); }),
    fetch("english_hijri_mapping.json").then(function (r) { return r.json(); })
  ]).then(function (results) {
    appState.salatTimeTable24 = results[0];
    appState.englishHijriMappings = results[1];
    renderSelectedDate();
  }).catch(function (err) {
    console.error("Failed to load prayer data:", err);
  });
}

initDateNavigation();
loadDataAndRender();
