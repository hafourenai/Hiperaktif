// ========================================
// NUMBER RECOGNITION SECTION
// ========================================

let recognitionScore = 0;

// Pelafalan angka dalam Bahasa Indonesia
const numberPronunciation = {
  0: "nol",
  1: "satu",
  2: "dua",
  3: "tiga",
  4: "empat",
  5: "lima",
  6: "enam",
  7: "tujuh",
  8: "delapan",
  9: "sembilan",
  10: "sepuluh",
};

// Generate number grid 0-9
function generateNumberGrid() {
  const numberGrid = document.getElementById("numberGrid");
  if (!numberGrid) return;

  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className = "number-btn";
    btn.textContent = i;
    btn.addEventListener("click", () => playNumberSound(i, btn));
    numberGrid.appendChild(btn);
  }
}

// Play number sound dengan pronunciation Indonesia
function playNumberSound(number, btn) {
  // Play click sound
  if (window.playClickSound) {
    window.playClickSound();
  }

  // Animate button
  btn.classList.add("clicked");
  setTimeout(() => {
    btn.classList.remove("clicked");
  }, 600);

  // Show popup angka
  showNumberPopup(number);

  // Speak number dalam Bahasa Indonesia
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();

    const textToSpeak = numberPronunciation[number];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "id-ID";
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (voice) => voice.lang === "id-ID" || voice.lang.startsWith("id")
    );

    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => console.log("Speaking:", textToSpeak);
    utterance.onerror = (e) => console.error("Speech error:", e);

    speechSynthesis.speak(utterance);
  }

  // Tambah skor
  recognitionScore += 10;
  updateRecognitionScore();

  // Show temporary feedback
  showNumberFeedback(`Angka ${number}! (${numberPronunciation[number]}) 🎉`);
  
  // ✅ FIX: Pastikan input field tetap bisa diakses setelah klik tombol angka
  setTimeout(fixInputFieldAccessibility, 100);
}

// Show number popup
function showNumberPopup(number) {
  // Create popup if not exists
  let popup = document.getElementById("numberPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "numberPopup";
    popup.className = "number-popup";
    document.body.appendChild(popup);
  }

  popup.textContent = number;
  popup.classList.add("show");
  popup.classList.remove("hide");

  setTimeout(() => {
    popup.classList.remove("show");
    popup.classList.add("hide");
  }, 1000);
}

// Update recognition score
function updateRecognitionScore() {
  const scoreEl = document.getElementById("recognitionScore");
  if (scoreEl) {
    scoreEl.textContent = recognitionScore;
    // Animate score
    scoreEl.style.transform = "scale(1.3)";
    setTimeout(() => {
      scoreEl.style.transform = "scale(1)";
    }, 300);
  }
}

// Show temporary feedback untuk number recognition
function showNumberFeedback(message) {
  const feedback = document.createElement("div");
  feedback.className = "feedback correct";
  feedback.textContent = message;
  feedback.style.position = "fixed";
  feedback.style.top = "30%";
  feedback.style.left = "50%";
  feedback.style.transform = "translate(-50%, -50%)";
  feedback.style.zIndex = "999";
  feedback.style.padding = "25px 40px";
  feedback.style.fontSize = "24px";
  feedback.style.maxWidth = "400px";
  feedback.style.textAlign = "center";

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.opacity = "0";
    setTimeout(() => feedback.remove(), 300);
  }, 1500);
}

// ========================================
// MATH GAME SECTION - SEMUA OPERASI (MAKSIMAL 15)
// ========================================

let currentAnswer = 0;
let correctCount = 0;
let wrongCount = 0;
let currentOperation = 'random';
let operationSymbols = {
  '+': '➕',
  '-': '➖',
  '×': '✖️',
  '÷': '➗'
};

// Elemen DOM
const num1El = document.getElementById("num1");
const num2El = document.getElementById("num2");
const operationEl = document.getElementById("operation");
const answerInput = document.getElementById("answerInput");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const feedbackEl = document.getElementById("feedback");
const correctScoreEl = document.getElementById("correctScore");
const wrongScoreEl = document.getElementById("wrongScore");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

// ✅ FIX: Function khusus untuk memperbaiki aksesibilitas input field
function fixInputFieldAccessibility() {
  const answerInput = document.getElementById('answerInput');
  if (!answerInput) return;
  
  console.log('🔧 Fixing input field accessibility...');
  
  // Pastikan input tidak disabled
  answerInput.disabled = false;
  
  // Reset semua properti CSS yang mungkin memblokir
  answerInput.style.pointerEvents = 'auto';
  answerInput.style.cursor = 'text';
  answerInput.style.zIndex = '100';
  answerInput.style.position = 'relative';
  
  // Hapus event listener yang mungkin memblokir
  answerInput.onclick = null;
  answerInput.onmousedown = null;
  answerInput.ontouchstart = null;
  
  // Force reflow untuk memastikan perubahan diterapkan
  answerInput.offsetHeight;
  
  console.log('✅ Input field should be accessible now');
}

// Function untuk memilih operasi secara acak
function getRandomOperation() {
  const operations = ['+', '-', '×', '÷'];
  return operations[Math.floor(Math.random() * operations.length)];
}

// Function untuk membuat selector operasi
function createOperationSelector() {
  const operationSelector = document.getElementById('operationSelector');
  if (!operationSelector) return;
  
  const operations = [
    { symbol: 'random', name: 'Semua Soal', emoji: '🎲', desc: 'Campuran semua operasi' },
    { symbol: '+', name: 'Penjumlahan', emoji: '➕', desc: 'Tingkat dasar' },
    { symbol: '-', name: 'Pengurangan', emoji: '➖', desc: 'Kurangkan angka' },
    { symbol: '×', name: 'Perkalian', emoji: '✖️', desc: 'Tingkat lanjut' },
    { symbol: '÷', name: 'Pembagian', emoji: '➗', desc: 'Bagi angka' }
  ];
  
  operations.forEach(op => {
    const btn = document.createElement('button');
    btn.className = 'operation-btn';
    if (op.symbol === 'random') {
      btn.classList.add('active'); // Set default active
    }
    btn.innerHTML = `
      <div class="emoji">${op.emoji}</div>
      <div class="text">${op.name}</div>
      <div class="desc">${op.desc}</div>
    `;
    btn.addEventListener('click', () => {
      // Hapus active class dari semua button
      document.querySelectorAll('.operation-btn').forEach(b => {
        b.classList.remove('active');
      });
      // Tambah active class ke button yang diklik
      btn.classList.add('active');
      
      currentOperation = op.symbol;
      generateQuestion();
    });
    operationSelector.appendChild(btn);
  });
}

// Generate soal dengan semua operasi matematika (maksimal 10)
function generateQuestion() {
  let num1, num2;
  
  const selectedOp =
    currentOperation === 'random'
      ? getRandomOperation()
      : currentOperation;

  switch (selectedOp) {

    // PENJUMLAHAN
    case '+':
      num1 = Math.floor(Math.random() * 10) + 1; // 1–10
      num2 = Math.floor(Math.random() * (11 - num1)) + 1; // agar hasil ≤ 10
      currentAnswer = num1 + num2;
      break;

    // PENGURANGAN
    case '-':
      num1 = Math.floor(Math.random() * 10) + 1; // 1–10
      num2 = Math.floor(Math.random() * num1) + 1; // num2 ≤ num1
      currentAnswer = num1 - num2;
      break;

    // PERKALIAN
    case '×':
      const multiplicationPairs = [];

      for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= 10; b++) {
          if (a * b <= 10) {
            multiplicationPairs.push([a, b]);
          }
        }
      }

      const pair =
        multiplicationPairs[
          Math.floor(Math.random() * multiplicationPairs.length)
        ];

      num1 = pair[0];
      num2 = pair[1];
      currentAnswer = num1 * num2;
      break;

    // PEMBAGIAN
    case '÷':
      num2 = Math.floor(Math.random() * 9) + 1; // 1–9
      currentAnswer = Math.floor(Math.random() * 10) + 1; // hasil 1–10
      num1 = num2 * currentAnswer;

      // Pastikan num1 ≤ 10
      while (num1 > 10) {
        num2 = Math.floor(Math.random() * 5) + 1;
        currentAnswer = Math.floor(Math.random() * 5) + 1;
        num1 = num2 * currentAnswer;
      }
      break;
  }

  // soal
  num1El.textContent = num1;
  num2El.textContent = num2;
  operationEl.textContent = operationSymbols[selectedOp];

  // Reset input & feedback
  answerInput.value = "";
  answerInput.disabled = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.style.display = "none";
  checkBtn.style.display = "inline-block";

  setTimeout(fixInputFieldAccessibility, 50);

  console.log(`Soal: ${num1} ${selectedOp} ${num2} = ${currentAnswer}`);
}


// Cek jawaban
function checkAnswer() {
  const userAnswer = parseInt(answerInput.value);

  if (isNaN(userAnswer)) {
    feedbackEl.textContent = "⚠️ Masukkan angka dulu ya!";
    feedbackEl.className = "feedback";
    return;
  }

  answerInput.disabled = true;
  checkBtn.style.display = "none";

  if (userAnswer === currentAnswer) {
    // Jawaban benar
    correctCount++;
    correctScoreEl.textContent = correctCount;
    
    // Feedback berbeda berdasarkan operasi
    const feedbackMessages = {
      '+': "🎉 Hebat! Penjumlahanmu tepat!",
      '-': "🎉 Luar biasa! Penguranganmu benar!",
      '×': "🎉 Wow! Perkalianmu akurat!",
      '÷': "🎉 Mantap! Pembagianmu tepat!"
    };
    
    feedbackEl.textContent = feedbackMessages[currentOperation] || "🎉 Hebat! Kamu pintar banget! 😄";
    feedbackEl.className = "feedback correct";

    // Play sound jika ada
    if (correctSound) {
      correctSound.play().catch((e) => console.log("Sound play failed"));
    }

    // Animasi celebrasi
    createConfetti();
  } else {
    // Jawaban salah
    wrongCount++;
    wrongScoreEl.textContent = wrongCount;
    
    // Beri petunjuk berdasarkan operasi
    let hint = "";
    switch(currentOperation) {
      case '+':
        hint = "Coba hitung lagi penjumlahannya!";
        break;
      case '-':
        hint = "Ingat, kurangkan bilangan kedua dari bilangan pertama!";
        break;
      case '×':
        hint = "Perkalian adalah penjumlahan berulang!";
        break;
      case '÷':
        hint = "Pembagian adalah pengurangan berulang!";
        break;
      default:
        hint = "Coba hitung lagi dengan teliti!";
    }
    
    feedbackEl.textContent = `💪 ${hint} Jawabannya ${currentAnswer}. Kamu pasti bisa!`;
    feedbackEl.className = "feedback wrong";

    // Play sound jika ada
    if (wrongSound) {
      wrongSound.play().catch((e) => console.log("Sound play failed"));
    }
  }

  nextBtn.style.display = "inline-block";
}

// Buat efek confetti
function createConfetti() {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6ab04c"];
  const confettiCount = 30;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-10px";
    confetti.style.borderRadius = "50%";
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "9999";

    document.body.appendChild(confetti);

    const animation = confetti.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        {
          transform: `translateY(${window.innerHeight}px) rotate(${
            Math.random() * 720
          }deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 2000 + Math.random() * 1000,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }
    );

    animation.onfinish = () => confetti.remove();
  }
}

// ========================================
// INITIALIZATION & FIXES
// ========================================

// Initialize number recognition saat page load
document.addEventListener("DOMContentLoaded", () => {
  generateNumberGrid();
  
  // Buat operation selector jika ada
  createOperationSelector();

  // ✅ FIX: Inisialisasi perbaikan aksesibilitas
  setTimeout(() => {
    fixInputFieldAccessibility();
  }, 1000);

  // Load voices untuk speech synthesis
  if ("speechSynthesis" in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();
      console.log("Voices loaded:", voices.length);
    };
  }
});

// ✅ FIX: Event listener untuk debug dan memastikan input bisa diklik
document.addEventListener('click', function(e) {
  const answerInput = document.getElementById('answerInput');
  
  // Debug info ketika user mencoba klik input
  if (e.target === answerInput) {
    console.log('🎯 User clicked on answer input');
  }
});

// ✅ FIX: Force enable input ketika user mencoba berinteraksi
answerInput.addEventListener('mousedown', function(e) {
  console.log('🖱️ Mouse down on input');
  fixInputFieldAccessibility();
});

answerInput.addEventListener('touchstart', function(e) {
  console.log('📱 Touch start on input');
  fixInputFieldAccessibility();
});

// Event listeners untuk math game
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", generateQuestion);

answerInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (checkBtn.style.display !== "none") {
      checkAnswer();
    } else {
      generateQuestion();
    }
  }
});

// Generate soal pertama saat halaman dimuat
generateQuestion();

// ✅ FIX: Periodic check untuk memastikan input tetap accessible
setInterval(() => {
  const answerInput = document.getElementById('answerInput');
  if (answerInput && !answerInput.disabled) {
    // Reset properti CSS secara periodic
    answerInput.style.pointerEvents = 'auto';
    answerInput.style.cursor = 'text';
  }
}, 3000);