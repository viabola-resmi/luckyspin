const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-btn");
const popup = document.getElementById("popup");
const prizeText = document.getElementById("prize-text");
const closeBtn = document.getElementById("close-btn");

// 🎁 DAFTAR HADIAH & WARNA (Kamu bisa ubah teks hadiahnya di sini)
const prizes = [
    { text: "Diskon 10%", color: "#1e90ff" },
    { text: "Zonk 😢", color: "#ced6e0" },
    { text: "Kaos Keren", color: "#2ed573" },
    { text: "Diskon 50%", color: "#ffa502" },
    { text: "E-Wallet 50k", color: "#ff4757" },
    { text: "Free Kopi", color: "#9b59b6" }
];

const numSegments = prizes.length;
const segmentAngle = (2 * Math.PI) / numSegments;
let currentRotation = 0;
let isSpinning = false;

// 1. Fungsi menggambar roda di layar
function drawWheel() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    prizes.forEach((prize, i) => {
        const angle = i * segmentAngle;
        
        // Menggambar segmen/potongan roda
        ctx.beginPath();
        ctx.fillStyle = prize.color;
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, angle, angle + segmentAngle);
        ctx.lineTo(radius, radius);
        ctx.fill();
        ctx.stroke();

        // Menggambar teks hadiah di dalam roda
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = i === 1 ? "#2f3542" : "#ffffff"; // Teks zonk dibuat agak gelap biar kontras
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(prize.text, radius - 30, 10);
        ctx.restore();
    });
}

// 2. Fungsi logika putaran roda
function spin() {
    if (isSpinning) return; // Mencegah klik ganda saat roda masih berputar
    isSpinning = true;

    // Menentukan putaran acak (minimal 5 putaran penuh + sudut acak)
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalSpinDegrees = 1800 + extraDegrees; 
    currentRotation += totalSpinDegrees;

    // Menjalankan animasi putaran lewat CSS
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    // Menghitung hadiah setelah animasi selesai (4 detik)
    setTimeout(() => {
        isSpinning = false;
        
        // Rumus matematika untuk menentukan segmen mana yang ditunjuk jarum atas
        const actualDegrees = currentRotation % 360;
        const normalizedAngle = (360 - actualDegrees + 270) % 360;
        const winningIndex = Math.floor(normalizedAngle / (360 / numSegments));
        
        // Memunculkan hasil pop-up
        prizeText.innerText = prizes[winningIndex].text;
        popup.classList.remove("hidden");
    }, 4000);
}

// Menghubungkan fungsi ke tombol
spinBtn.addEventListener("click", spin);
closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

// Jalankan fungsi gambar roda pertama kali
drawWheel();
