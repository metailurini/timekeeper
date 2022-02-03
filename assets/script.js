const TIME_STORAGE_KEY = 'saved_time';
let TIME_LIMIT;
let timePassed;
let timeLeft;
let timerInterval;
let remainingPathColor;
let FULL_DASH_ARRAY;
let WARNING_THRESHOLD;
let ALERT_THRESHOLD;
let COLOR_CODES;

main();

const setRemainingPathColor = async (timeLeft) => {
    const {alert, warning, info} = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        document.getElementById("base-timer-path-remaining").classList.remove(warning.color);
        document.getElementById("base-timer-path-remaining").classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        document.getElementById("base-timer-path-remaining").classList.remove(info.color);
        document.getElementById("base-timer-path-remaining").classList.add(warning.color);
    }
}

const setCircleDasharray = async () => {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    document
      .getElementById("base-timer-path-remaining")
      .setAttribute("stroke-dasharray", circleDasharray);
}

async function main() {
  FULL_DASH_ARRAY = 283;
  WARNING_THRESHOLD = 10;
  ALERT_THRESHOLD = 5;

  COLOR_CODES = { info: { color: "green" },
                  warning: { color: "orange", threshold: WARNING_THRESHOLD },
                  alert: { color: "red", threshold: ALERT_THRESHOLD } };

  TIME_LIMIT = timeFromQuery() || await savedTime();
  timePassed = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = null;
  remainingPathColor = COLOR_CODES.info.color;

  defineApp();
  run();
}

function run() {
  document
    .querySelector("#base-timer-label")
    .onclick = startTimer;
}

function timeFromQuery() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const { second } = Object.fromEntries(urlSearchParams.entries());
  return second ? parseInt(second) : null;
}

async function savedTime(time=null) {
  let hKey = `${TIME_STORAGE_KEY}_H`;
  let mKey = `${TIME_STORAGE_KEY}_M`;
  let sKey = `${TIME_STORAGE_KEY}_S`;

  let { h, m, s } = time ? 
    formatTime(time, false) :
    {
      h: parseInt(localStorage.getItem(hKey)),
      m: parseInt(localStorage.getItem(mKey)),
      s: parseInt(localStorage.getItem(sKey)) 
    };

  h = h > 0 ? h : 0;
  m = m > 0 ? m : 25;
  s = s > 0 ? s : 0;

  localStorage.setItem(hKey, h);
  localStorage.setItem(mKey, m);
  localStorage.setItem(sKey, s);

  return h * 3600 + m * 60 + s;
}

function defineApp() {
  document.getElementById("app").innerHTML = `
  <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
          id="base-timer-path-remaining"
          stroke-dasharray="283"
          class="base-timer__path-remaining ${remainingPathColor}"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
  </div>
  `;
}

function onTimesUp() {
  clearInterval(timerInterval);
  document.querySelector("body > audio").play();
}

function startTimer() {
    timerInterval = setInterval(()=>{
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);

        setCircleDasharray();
        setRemainingPathColor(timeLeft);
        savedTime(timeLeft);

        if (timeLeft === 0) {
            onTimesUp();
        }
    }
    , 1000);
}

function formatTime(time, string=true) {
    d = Number(time);

    const zeroPad = (num,places)=>String(num).padStart(places, '0')

    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    
    if (string) {
        return `${zeroPad(h, 2)}:${zeroPad(m, 2)}:${zeroPad(s, 2)}`;
    } else {
        return { h, m, s }
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}
