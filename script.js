const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const spinCountEl = document.getElementById('spinCount');
const rewardModal = document.getElementById('rewardModal');
const prizeText = document.getElementById('prizeText');
const claimBtn = document.getElementById('claimBtn');

// Elemen Admin
const secretAdminTrigger = document.getElementById('secretAdminTrigger');
const adminModal = document.getElementById('adminModal');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const resetSpinUserBtn = document.getElementById('resetSpinUserBtn');
const adminBadge = document.getElementById('adminBadge');

const ADMIN_PASSWORD = "dionbau";

// =========================================================================
// HADIAH PERMANEN (ZONK ada di urutan pertama / Index 0)
// =========================================================================
let defaultPrizes = [
  'ZONK', // Index 0
  'SALDO Rp 50.000',        // Index 1
  'SALDO RP 100,000',
  'BONUS DP 50%',
  'SALDO Rp 100.000',
  'PUTAR SEKALI',
  'JACKPOT Rp 500k',
  'BONUS DP 10%'
];

let isAdminMode = localStorage.getItem('spin_admin_mode') === 'true';

let prizeList = defaultPrizes;
let prizes = buildPrizeObjects(prizeList);

let hasSpun = localStorage.getItem('has_spun_user') === 'true';
let spinsLeft = (isAdminMode) ? '∞' : (hasSpun ? 0 : 1);
let currentRotation = 0;
let isSpinning = false;

function buildPrizeObjects(list) {
  return list.map((text, index) => ({
    text: text.trim(),
    color: index % 2 === 0 ? '#1f2430' : '#32374a',
    textColor: index % 2 === 0 ? '#ffd700' : '#ffffff'
  }));
}

function updateUI() {
  if (spinCountEl) spinCountEl.textContent = spinsLeft;
  if (spinBtn) {
    if (!isAdminMode && hasSpun) {
      spinBtn.disabled = true;
      spinBtn.innerText = "HABIS";
    } else {
      spinBtn.disabled = false;
      spinBtn.innerHTML = "<span>SPIN</span>";
    }
  }

  if (adminBadge) {
    adminBadge.style.display = isAdminMode ? 'inline-block' : 'none';
  }
}

function drawWheel() {
  if (!canvas || !ctx) return;
  const numPrizes = prizes.length;
  const arcSize = (2 * Math.PI) / numPrizes;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = centerX - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numPrizes; i++) {
    const angle = i * arcSize;

    ctx.beginPath();
    ctx.fillStyle = prizes[i].color;
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arcSize / 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = prizes[i].textColor;
    ctx.font = '800 13px "Poppins", sans-serif';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    const textRadius = radius / 1.55; 
    const formattedText = prizes[i].text.toUpperCase();
    
    ctx.fillText(formattedText, textRadius, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 8;
  ctx.stroke();
}

function spin() {
  if (isSpinning) return;
  if (!isAdminMode && hasSpun) {
    alert("Kesempatan spin Anda sudah habis!");
    return;
  }

  isSpinning = true;
  if (spinBtn) spinBtn.disabled = true;

  const numPrizes = prizes.length;
  const degreesPerSegment = 360 / numPrizes;

  // targetIndex = 0 (ZONK)
  const targetIndex = 0; 

  // Kalkulasi akurat agar jarum atas menunjuk ke tengah segmen Index 0 (ZONK)
  const segmentCenter = (targetIndex * degreesPerSegment) + (degreesPerSegment / 2);
  const targetDegree = 360 - segmentCenter - 90;
  
  const fullRotations = 360 * 5; // Putar 5 kali putaran penuh
  let nextRotation = currentRotation + fullRotations + ((targetDegree - (currentRotation % 360) + 360) % 360);
  
  currentRotation = nextRotation;
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  if (!isAdminMode) {
    hasSpun = true;
    localStorage.setItem('has_spun_user', 'true');
    spinsLeft = 0;
  }

  setTimeout(() => {
    isSpinning = false;
    showReward(prizes[targetIndex].text);
    updateUI();
  }, 5000);
}

function showReward(prize) {
  if (prizeText) prizeText.textContent = prize;
  if (rewardModal) rewardModal.style.display = 'flex';
}

// Admin Trigger (Klik 5x pada Judul)
let clickCount = 0;
let clickTimer;

if (secretAdminTrigger) {
  secretAdminTrigger.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount >= 5) {
      openAdminLogin();
      clickCount = 0;
    } else {
      clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
    }
  });
}

function openAdminLogin() {
  const pass = prompt("Masukkan Kata Sandi Admin:");
  if (pass === ADMIN_PASSWORD) {
    if (adminModal) adminModal.style.display = 'flex';
  } else if (pass !== null) {
    alert("Kata sandi salah!");
  }
}

if (resetSpinUserBtn) {
  resetSpinUserBtn.addEventListener('click', () => {
    localStorage.removeItem('has_spun_user');
    hasSpun = false;
    spinsLeft = isAdminMode ? '∞' : 1;
    updateUI();
    alert("Status spin user di browser ini telah di-reset!");
  });
}

if (claimBtn) claimBtn.addEventListener('click', () => rewardModal.style.display = 'none');
if (closeAdminBtn) closeAdminBtn.addEventListener('click', () => adminModal.style.display = 'none');
if (spinBtn) spinBtn.addEventListener('click', spin);

drawWheel();
updateUI();
