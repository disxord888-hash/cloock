window.lastError = 'No errors';
window.addEventListener('error', (e) => { window.lastError = e.message; });

const A1 = 1 << 0;
const A2 = 1 << 1;
const B = 1 << 2;
const C = 1 << 3;
const D2 = 1 << 4;
const D1 = 1 << 5;
const E = 1 << 6;
const F = 1 << 7;
const G1 = 1 << 8;
const G2 = 1 << 9;
const H = 1 << 10; // \ top-left
const I = 1 << 11; // | top-mid
const J = 1 << 12; // / top-right
const K = 1 << 13; // \ bottom-right
const L = 1 << 14; // | bottom-mid
const M = 1 << 15; // / bottom-left
const DP = 1 << 16; // . dot (bottom-right)
const TAIL = 1 << 17; // tail for comma
const CD1 = 1 << 18; // center top dot
const CD2 = 1 << 19; // center middle dot
const CD3 = 1 << 20; // center bottom dot

const CHAR_MAP = {
  'A': A1 | A2 | B | C | E | F | G1 | G2,
  'B': A1 | A2 | B | C | D1 | D2 | I | L | G2,
  'C': A1 | A2 | F | E | D1 | D2,
  'D': A1 | A2 | B | C | D1 | D2 | I | L,
  'E': A1 | A2 | F | E | D1 | D2 | G1 | G2,
  'F': A1 | A2 | F | E | G1,
  'G': A1 | A2 | F | E | D1 | D2 | C | G2,
  'H': F | E | B | C | G1 | G2,
  'I': A1 | A2 | I | L | D1 | D2,
  'J': B | C | D1 | D2 | E,
  'K': F | E | G1 | J | K,
  'L': F | E | D1 | D2,
  'M': F | E | B | C | H | J,
  'N': F | E | B | C | H | K,
  'O': A1 | A2 | B | C | D1 | D2 | F | E,
  'P': A1 | A2 | F | E | B | G1 | G2,
  'Q': A1 | A2 | B | C | D1 | D2 | F | E | K,
  'R': A1 | A2 | F | E | B | G1 | G2 | K,
  'S': A1 | A2 | F | G1 | G2 | C | D1 | D2,
  'T': A1 | A2 | I | L,
  'U': F | E | D1 | D2 | B | C,
  'V': F | E | D1 | D2 | B | C, // V mapped similar to U for standard readability
  'W': F | E | B | C | M | K,
  'X': H | J | M | K,
  'Y': H | J | L,
  'Z': A1 | A2 | J | M | D1 | D2,
  '0': A1 | A2 | B | C | D1 | D2 | F | E | J | M,
  '1': B | C | J,
  '2': A1 | A2 | B | G2 | G1 | E | D1 | D2,
  '3': A1 | A2 | B | C | D1 | D2 | G2,
  '4': F | G1 | G2 | B | C,
  '5': A1 | A2 | F | G1 | G2 | C | D1 | D2,
  '6': A1 | A2 | F | E | D1 | D2 | C | G1 | G2,
  '7': A1 | A2 | B | C,
  '8': A1 | A2 | B | C | D1 | D2 | F | E | G1 | G2,
  '9': A1 | A2 | B | C | D1 | D2 | F | G1 | G2,
  ' ': 0,
  '-': G1 | G2 | CD2,
  '_': D1 | D2,
  '=': G1 | G2 | D1 | D2 | CD2,
  '+': G1 | G2 | I | L | CD2,
  '*': G1 | G2 | I | L | H | J | M | K | CD2,
  '/': J | M,
  '\\': H | K,
  '|': I | L,
  '(': J | M,
  ')': H | K,
  '[': A1 | F | E | D1,
  ']': A2 | B | C | D2,
  '<': G2 | H | M,
  '>': G1 | J | K,
  '!': I | CD3,
  '?': A1 | A2 | B | G2 | CD3,
  ':': CD1 | CD3,
  '.': DP,
  ',': DP | TAIL,
  "'": I,
  '"': I | B,
  '@': A1 | A2 | B | C | D1 | D2 | F | E | G1 | J
};

const segmentsPaths = [
  "M14,2 L48,2 L44,14 L18,14 Z", // 0: a1
  "M52,2 L86,2 L82,14 L56,14 Z", // 1: a2
  "M98,14 L86,18 L86,74 L98,78 Z", // 2: b
  "M98,82 L86,86 L86,142 L98,146 Z", // 3: c
  "M56,146 L82,146 L86,158 L52,158 Z", // 4: d2
  "M18,146 L44,146 L48,158 L14,158 Z", // 5: d1
  "M2,82 L14,86 L14,142 L2,146 Z", // 6: e
  "M2,14 L14,18 L14,74 L2,78 Z", // 7: f
  "M16,74 L46,74 L48,80 L46,86 L16,86 L12,80 Z", // 8: g1
  "M54,74 L84,74 L88,80 L84,86 L54,86 L52,80 Z", // 9: g2
  "M18,20 L42,68 L34,72 L12,26 Z", // 10: h
  "M44,16 L56,16 L56,72 L50,76 L44,72 Z", // 11: i
  "M82,20 L88,26 L64,72 L56,68 Z", // 12: j
  "M56,92 L64,88 L88,134 L82,140 Z", // 13: k
  "M44,88 L50,84 L56,88 L56,144 L44,144 Z", // 14: l
  "M44,92 L18,140 L12,134 L36,88 Z", // 15: m
  "M104,146 L114,146 L110,158 L100,158 Z",  // 16: dp
  "M100,158 L110,158 L100,170 L96,170 Z",   // 17: tail
  "M50,38 L54,44 L50,50 L46,44 Z",          // 18: cd1
  "M50,74 L54,80 L50,86 L46,80 Z",          // 19: cd2
  "M50,110 L54,116 L50,122 L46,116 Z"       // 20: cd3
];

const MAX_DIGITS = 128;
const container = document.getElementById('display-container');
const inputField = document.getElementById('text-input');

function createDigit() {
  const digitDiv = document.createElement('div');
  digitDiv.className = 'digit';

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 160");
  svg.setAttribute("preserveAspectRatio", "none");

  segmentsPaths.forEach((pathStr, index) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathStr);
    path.className.baseVal = `segment seg-${index}`;

    // 手動で点灯・消灯を切り替えるイベント
    path.addEventListener('click', () => {
      path.classList.toggle('on');
    });

    svg.appendChild(path);
  });

  digitDiv.appendChild(svg);
  return digitDiv;
}

function initDisplay() {
  for (let i = 0; i < 8; i++) {
    container.appendChild(createDigit());
  }
}

function updateDisplay(text) {
  const parsed = [];
  const rawChars = text.toUpperCase().split('');
  let isSubscript = false;
  for (let i = 0; i < rawChars.length; i++) {
    const c = rawChars[i];
    if (c === '\x01') {
      isSubscript = true;
      continue;
    }
    if (c === '\x02') {
      isSubscript = false;
      continue;
    }
    if ((c === '.' || c === ',') && parsed.length > 0 && parsed[parsed.length - 1].char !== ' ' && parsed[parsed.length - 1].char !== '\n') {
      parsed[parsed.length - 1].modifier = c;
    } else {
      parsed.push({ char: c, modifier: null, isSubscript: isSubscript });
    }
  }

  // Adjust number of digit elements dynamically up to MAX_DIGITS
  const targetCount = Math.max(8, Math.min(parsed.length, MAX_DIGITS));
  while (container.children.length < targetCount) {
    container.appendChild(createDigit());
  }
  while (container.children.length > targetCount && container.children.length > 8) {
    container.removeChild(container.lastChild);
  }

  const digitElements = container.querySelectorAll('.digit');

  digitElements.forEach((digit, i) => {
    const p = parsed[i] || { char: ' ', modifier: null, isSubscript: false };
    
    if (p.char === '\n') {
      digit.className = 'digit line-break';
      digit.querySelector('svg').style.display = 'none';
      return;
    } else {
      digit.className = 'digit';
      if (p.isSubscript) {
        digit.classList.add('subscript');
      }
      digit.querySelector('svg').style.display = '';
    }

    let mask = CHAR_MAP[p.char] !== undefined ? CHAR_MAP[p.char] : 0;

    if (p.modifier === '.') {
      mask |= DP;
    } else if (p.modifier === ',') {
      mask |= (DP | TAIL);
    }

    const paths = digit.querySelectorAll('.segment');
    paths.forEach((path, bitIndex) => {
      if ((mask & (1 << bitIndex)) !== 0) {
        path.classList.add('on');
      } else {
        path.classList.remove('on');
      }
    });
  });
}

inputField.addEventListener('input', (e) => {
  updateDisplay(e.target.value);
});

// Controls
const sizeSlider = document.getElementById('size-slider');
if (sizeSlider) {
  sizeSlider.addEventListener('input', (e) => {
    root.style.setProperty('--digit-scale', e.target.value);
  });
}

// Color gradient controls
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const gradStart = document.getElementById('grad-start');
const gradEnd = document.getElementById('grad-end');
const root = document.documentElement;

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 243;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateColors() {
  const c1 = color1Input.value;
  const c2 = color2Input.value;
  gradStart.setAttribute('stop-color', c1);
  gradEnd.setAttribute('stop-color', c2);

  const glowColor = hexToRgba(c1, 0.6);
  root.style.setProperty('--glow-color', glowColor);
  root.style.setProperty('--seg-on-color', c1);
  root.style.setProperty('--seg-on-glow', glowColor);
  root.style.setProperty('--seg-fill', 'url(#seg-grad)');
}

if (color1Input && color2Input) {
  color1Input.addEventListener('input', updateColors);
  color2Input.addEventListener('input', updateColors);
  updateColors();
}

// Initialize with some placeholder text to show off the neon!
initDisplay();
setTimeout(() => {
  const initialText = "NEON\n21:! ?";
  inputField.value = initialText;
  updateDisplay(initialText);

  const dbg = document.getElementById('debug-info');
  if (dbg) dbg.innerText = 'Digits: ' + document.querySelectorAll('.digit').length + ' | Error: ' + window.lastError;
}, 100);

// Clock mode logic
let timeOffset = 0;

async function syncTimeWithServer() {
  try {
    const start = performance.now();
    // Fetch time from WorldTimeAPI (Asia/Tokyo) as it has robust CORS support for browsers
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Tokyo', { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    const end = performance.now();
    
    // Calculate network latency (one-way estimate)
    const latency = (end - start) / 2;
    // WorldTimeAPI provides datetime as an ISO string
    const serverTime = new Date(data.datetime).getTime();
    
    // timeOffset is added to local Date.now() to get accurate JST
    timeOffset = (serverTime + latency) - Date.now();
    console.log(`Synced with WorldTimeAPI (JST). Offset: ${timeOffset.toFixed(2)}ms`);
    
    const dbg = document.getElementById('debug-info');
    if (dbg) dbg.innerText += ` | JST Sync: OK (${timeOffset > 0 ? '+' : ''}${Math.round(timeOffset)}ms)`;
  } catch (err) {
    console.warn('Failed to sync time with server, falling back to local time.', err);
    const dbg = document.getElementById('debug-info');
    if (dbg) dbg.innerText += ` | JST Sync: Failed (using local)`;
  }
}

// Start sync immediately
syncTimeWithServer();

let clockInterval = null;
const clockToggleBtn = document.getElementById('clock-toggle');
const formatInput = document.getElementById('format-input');

function formatTime(date, format) {
  let d = new Date(date.getTime());
  
  let hMode = null;
  if (format.includes('32h')) {
    if (d.getHours() < 8) {
      d.setDate(d.getDate() - 1);
    }
    hMode = '32h';
  } else if (format.includes('30h')) {
    if (d.getHours() < 6) {
      d.setDate(d.getDate() - 1);
    }
    hMode = '30h';
  }

  const yyyy = d.getFullYear().toString();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  
  let hours = date.getHours();
  let displayHours = hours;
  if (hMode === '32h') {
    displayHours = hours < 8 ? hours + 24 : hours;
  } else if (hMode === '30h') {
    displayHours = hours < 6 ? hours + 24 : hours;
  }

  const h24 = String(displayHours).padStart(2, '0');
  const h12 = String(hours % 12 || 12).padStart(2, '0');
  const realH24 = String(hours).padStart(2, '0');

  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const sss = String(date.getMilliseconds()).padStart(3, '0');

  let result = format;
  result = result.replace(/YYYY/g, yyyy);
  result = result.replace(/MM/g, mm);
  result = result.replace(/DD/g, dd);
  result = result.replace(/32h/g, h24);
  result = result.replace(/30h/g, h24);
  result = result.replace(/24h/g, realH24);
  result = result.replace(/12h/g, h12);
  result = result.replace(/mm/g, min);
  result = result.replace(/sss/g, '\x01' + sss + '\x02');
  result = result.replace(/ss/g, ss);

  return result;
}

if (clockToggleBtn) {
  clockToggleBtn.addEventListener('click', () => {
    const isActive = clockToggleBtn.classList.toggle('active');
    if (isActive) {
      inputField.style.display = 'none';
      if (formatInput) {
        formatInput.style.display = 'block';
        if (!formatInput.value) {
          formatInput.value = 'YYYY-MM-DD 24h:mm:ss';
        }
      }
      clockToggleBtn.innerText = 'CLOCK MODE ON';
      const updateClock = () => {
        const fmt = formatInput ? (formatInput.value || 'YYYY-MM-DD 24h:mm:ss.sss') : 'YYYY-MM-DD 24h:mm:ss.sss';
        updateDisplay(formatTime(new Date(Date.now() + timeOffset), fmt));
      };
      updateClock();
      clockInterval = setInterval(updateClock, 30);
    } else {
      inputField.style.display = 'block';
      if (formatInput) formatInput.style.display = 'none';
      clockToggleBtn.innerText = 'TOGGLE CLOCK';
      clearInterval(clockInterval);
      updateDisplay(inputField.value);
    }
  });
}

if (formatInput) {
  formatInput.addEventListener('input', () => {
    if (clockToggleBtn.classList.contains('active')) {
      updateDisplay(formatTime(new Date(Date.now() + timeOffset), formatInput.value || 'YYYY-MM-DD 24h:mm:ss.sss'));
    }
  });
}

