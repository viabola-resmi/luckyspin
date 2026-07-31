const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const spinCountEl = document.getElementById('spinCount');
const rewardModal = document.getElementById('rewardModal');
const prizeText = document.getElementById('prizeText');
const claimBtn = document.getElementById('claimBtn');

// Elemen Admin Rahasia
const secretAdminTrigger = document.getElementById('secretAdminTrigger');
const adminModal = document.getElementById('adminModal');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const unlimitedModeToggle = document.getElementById('unlimitedModeToggle');
const prizeInputList = document.getElementById('prizeInputList');
const forcedPrizeSelect = document.getElementById('forcedPrizeSelect');
const saveAdminSettingsBtn = document.getElementById('saveAdminSettingsBtn');
const resetSpinUserBtn = document.getElementById('resetSpinUserBtn');
const adminBadge = document.getElementById('adminBadge');

// CONFIG & STATE DEFAULT
const ADMIN_PASSWORD = "dionbau"; // Kata sandi admin
let isAdminMode = localStorage.getItem('spin_admin_mode') === 'true';

let defaultPrizes = [
  'Rp 50.000', 'Zonk / Coba Lagi', 'E-Gold 0.1g', 'Voucher 50%', 
  'Rp 100.000', 'Misteri Box', 'Jackpot Rp 500k', 'Voucher 10%'
];

let prizeList = JSON.parse(localStorage.getItem('spin_prizes')) || defaultPrizes;
let prizes = buildPrizeObjects(prizeList);

// Settingan Hadiah
let forcedIndex = parseInt(localStorage.getItem('forced_prize_index') ?? '-1');

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
  spinCountEl.textContent = spinsLeft;
  if (!isAdminMode && hasSpun) {
    spinBtn.disabled = true;
    spinBtn.innerText = "HABIS";
  } else {
    spinBtn.disabled = false;
    spinBtn.innerHTML = "<span>SPIN</span>";
  }

  if (isAdminMode) {
    adminBadge.style.display = 'inline-block';
  } else {
    adminBadge.style.display = 'none';
  }
}

// Menggambar Roda Spin dengan Teks Tepat di Tengah & Font Premium
function drawWheel() {
  const numPrizes = prizes.length;
  const arcSize = (2 * Math.PI) / numPrizes;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = centerX - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numPrizes; i++) {
    const angle = i * arcSize;

    // 1. Gambar Segmen Warna
    ctx.beginPath();
    ctx.fillStyle = prizes[i].color;
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Garis Pemisah
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Gambar Teks Pas di Tengah Segmen
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

  // Ring Luar Emas
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 8;
  ctx.stroke();
}

// Fungsi Putar Roda Presisi
function spin() {
  if (isSpinning) return;
  if (!isAdminMode && hasSpun) {
    alert("Kesempatan spin Anda sudah habis!");
    return;
  }

  isSpinning = true;
  spinBtn.disabled = true;

  const numPrizes = prizes.length;
  const degreesPerSegment = 360 / numPrizes;

  let winningIndex;
  if (forcedIndex >= 0 && forcedIndex < numPrizes) {
    winningIndex = forcedIndex;
  } else {
    winningIndex = Math.floor(Math.random() * numPrizes);
  }

  const centerOfWinningSegment = (winningIndex * degreesPerSegment) + (degreesPerSegment / 2);
  const targetDegree = 270 - centerOfWinningSegment;
  const fullRotations = 360 * 5;
  
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
    showReward(prizes[winningIndex].text);
    updateUI();
  }, 5000);
}

function showReward(prize) {
  prizeText.textContent = prize;
  rewardModal.style.display = 'flex';

  if (typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}

// ==========================================
// RAHASIA ADMIN (SECRET TRIGGER)
// ==========================================
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

let typedKeys = '';
window.addEventListener('keydown', (e) => {
  typedKeys += e.key;
  if (typedKeys.length > 10) typedKeys = typedKeys.substring(1);
  if (typedKeys.includes('admin123')) {
    openAdminLogin();
    typedKeys = '';
  }
});

function openAdminLogin() {
  const pass = prompt("Masukkan Kata Sandi Admin:");
  if (pass === ADMIN_PASSWORD) {
    unlimitedModeToggle.checked = isAdminMode;
    prizeInputList.value = prizeList.join(', ');
    populateForcedSelect();
    adminModal.style.display = 'flex';
  } else if (pass !== null) {
    alert("Kata sandi salah!");
  }
}

function populateForcedSelect() {
  if (!forcedPrizeSelect) return;
  forcedPrizeSelect.innerHTML = '<option value="-1">🎲 ACAK (Sesuai Keberuntungan)</option>';
  prizes.forEach((prize, index) => {
    const selected = (index === forcedIndex) ? 'selected' : '';
    forcedPrizeSelect.innerHTML += `<option value="${index}" ${selected}>🎯 Paksa Dapat: ${prize.text}</option>`;
  });
}

if (saveAdminSettingsBtn) {
  saveAdminSettingsBtn.addEventListener('click', () => {
    isAdminMode = unlimitedModeToggle.checked;
    localStorage.setItem('spin_admin_mode', isAdminMode ? 'true' : 'false');

    if (forcedPrizeSelect) {
      forcedIndex = parseInt(forcedPrizeSelect.value);
      localStorage.setItem('forced_prize_index', forcedIndex.toString());
    }

    const rawPrizes = prizeInputList.value.split(',');
    if (rawPrizes.length >= 2) {
      prizeList = rawPrizes.map(p => p.trim()).filter(p => p.length > 0);
      localStorage.setItem('spin_prizes', JSON.stringify(prizeList));
      prizes = buildPrizeObjects(prizeList);
      drawWheel();
    }

    spinsLeft = isAdminMode ? '∞' : (hasSpun ? 0 : 1);
    updateUI();
    adminModal.style.display = 'none';
    alert("Pengaturan Admin Berhasil Disimpan!");
  });
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

// Render Awal
drawWheel();
updateUI();
