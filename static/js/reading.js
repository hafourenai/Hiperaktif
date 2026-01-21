// Reading Game Logic - FIXED INDONESIAN VOICE
let score = 0;
let currentWord = '';
let currentLetters = [];

// Data kata untuk game dengan path gambar
const wordGames = [
    { word: 'KUCING', image: 'images/kucing.jpg', hint: 'Hewan berkaki empat yang suka minum susu' },
    { word: 'ANJING', image: 'images/anjing.jpg', hint: 'Hewan setia yang suka main lempar bola' },
    { word: 'KUDA', image: 'images/kuda.jpg', hint: 'Biasa ditunggangi' },
    { word: 'APEL', image: 'images/apel.jpg', hint: 'Buah bulat yang berwarna merah atau hijau' },
    { word: 'BUKU', image: 'images/buku.jpg', hint: 'Kita baca ini untuk belajar' },
    { word: 'BUNGA', image: 'images/bunga.jpg', hint: 'Tumbuhan yang wangi dan cantik' }
];

let currentGameIndex = 0;
let voices = [];
let indonesianVoice = null;

// ===== VARIABEL PAGINATION HURUF =====
let currentLetterPage = 0;
const LETTERS_PER_PAGE = 5;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// ====================================

// PERBAIKAN: Load voices dengan cara yang lebih reliable
function initVoices() {
    return new Promise((resolve) => {
        voices = speechSynthesis.getVoices();
        
        if (voices.length > 0) {
            selectIndonesianVoice();
            resolve();
        }
        
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                selectIndonesianVoice();
                resolve();
            };
        }
        
        // Timeout jika voices tidak load
        setTimeout(() => {
            if (voices.length === 0) {
                voices = speechSynthesis.getVoices();
                selectIndonesianVoice();
            }
            resolve();
        }, 1000);
    });
}

// Pilih voice Indonesia terbaik
function selectIndonesianVoice() {
    console.log('=== AVAILABLE VOICES ===');
    voices.forEach((voice, i) => {
        console.log(`${i}: ${voice.name} (${voice.lang}) ${voice.default ? '[DEFAULT]' : ''}`);
    });
    
    // Cari voice Indonesia dengan prioritas
    indonesianVoice = 
        voices.find(v => v.lang === 'id-ID') ||
        voices.find(v => v.lang === 'id') ||
        voices.find(v => v.lang.startsWith('id-')) ||
        voices.find(v => v.name.toLowerCase().includes('indonesia')) ||
        voices.find(v => v.name.toLowerCase().includes('andika')) ||
        voices.find(v => v.name.toLowerCase().includes('damayanti')) ||
        null;
    
    if (indonesianVoice) {
        console.log('✅ Indonesian voice found:', indonesianVoice.name);
    } else {
        console.warn('⚠️ No Indonesian voice found. Will use default voice with id-ID lang.');
    }
}

// PERBAIKAN: Fungsi speak yang lebih reliable
function speakIndonesian(text, rate = 0.8) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            console.error('Speech Synthesis not supported');
            reject('Not supported');
            return;
        }
        
        // Cancel speech sebelumnya
        speechSynthesis.cancel();
        
        // Buat utterance baru
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set bahasa HARUS Indonesia
        utterance.lang = 'id-ID';
        utterance.rate = rate;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        
        // Gunakan voice Indonesia jika ada
        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }
        
        // Event handlers
        utterance.onstart = () => {
            console.log(`🔊 Speaking: "${text}" with voice: ${utterance.voice ? utterance.voice.name : 'default'}`);
        };
        
        utterance.onend = () => {
            console.log('✅ Speech ended');
            resolve();
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event);
            reject(event);
        };
        
        // Speak
        try {
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error speaking:', error);
            reject(error);
        }
    });
}

// ===== FUNGSI PAGINATION HURUF =====

// Generate alphabet grid dengan pagination
function generateAlphabet() {
    const alphabetGrid = document.getElementById('alphabetGrid');
    const paginationContainer = document.getElementById('letterPagination');
    
    // Bersihkan grid dan pagination
    alphabetGrid.innerHTML = '';
    paginationContainer.innerHTML = '';
    
    // Hitung huruf untuk halaman saat ini
    const startIndex = currentLetterPage * LETTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + LETTERS_PER_PAGE, ALPHABET.length);
    const currentLetters = ALPHABET.slice(startIndex, endIndex);
    
    console.log(`📄 Generating letters ${currentLetters} (page ${currentLetterPage + 1})`);
    
    // Buat tombol huruf
    currentLetters.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        btn.addEventListener('click', () => playLetterSound(letter, btn));
        alphabetGrid.appendChild(btn);
    });
    
    // Buat tombol pagination
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '← Sebelumnya';
    prevBtn.addEventListener('click', goToPrevPage);
    
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Huruf ${startIndex + 1}-${endIndex} dari ${ALPHABET.length}`;
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Selanjutnya →';
    nextBtn.addEventListener('click', goToNextPage);
    
    // Nonaktifkan tombol jika sudah di halaman pertama/terakhir
    if (currentLetterPage === 0) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';
    }
    
    const totalPages = Math.ceil(ALPHABET.length / LETTERS_PER_PAGE);
    if (currentLetterPage === totalPages - 1) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
    }
    
    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
}

// Navigasi ke halaman sebelumnya
function goToPrevPage() {
    if (currentLetterPage > 0) {
        currentLetterPage--;
        generateAlphabet();
    }
}

// Navigasi ke halaman berikutnya
function goToNextPage() {
    const totalPages = Math.ceil(ALPHABET.length / LETTERS_PER_PAGE);
    if (currentLetterPage < totalPages - 1) {
        currentLetterPage++;
        generateAlphabet();
    }
}

// ===== AKHIR FUNGSI PAGINATION =====

// PERBAIKAN: Play letter sound dengan pronunciation Indonesia
function playLetterSound(letter, btn) {
    // Animasi
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
    
    // Pelafalan huruf dalam Bahasa Indonesia
    const indonesianLetterPronunciation = {
        'A': 'ah',
        'B': 'bé',
        'C': 'cé',
        'D': 'dé',
        'E': 'é',
        'F': 'èf',
        'G': 'ge',
        'H': 'ha',
        'I': 'e',
        'J': 'jé',
        'K': 'ka',
        'L': 'èl',
        'M': 'èm',
        'N': 'èn',
        'O': 'o',
        'P': 'pé',
        'Q': 'ki',
        'R': 'r',
        'S': 's',
        'T': 'té',
        'U': 'u',
        'V': 'fé',
        'W': 'wé',
        'X': 'èks',
        'Y': 'yé',
        'Z': 'zèt'
    };
    
    const pronunciation = indonesianLetterPronunciation[letter] || letter;
    
    // Speak dengan pronunciation Indonesia
    speakIndonesian(pronunciation, 0.7).catch(err => {
        console.error('Failed to speak:', err);
        // Fallback: tampilkan text saja
        showTemporaryFeedback(`Huruf ${letter}`, 1000);
    });
    
    // Tambah skor
    score += 10;
    updateScore();
    
    // Feedback visual
    showTemporaryFeedback(`Huruf ${letter}! 🎉`);
}

// Update skor
function updateScore() {
    document.getElementById('readingScore').textContent = score;
}

// Show temporary feedback
function showTemporaryFeedback(message, duration = 1500) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback correct';
    feedback.textContent = message;
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.zIndex = '9999';
    feedback.style.padding = '30px';
    feedback.style.fontSize = '32px';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, duration);
}

// Initialize word game
function initWordGame() {
    const game = wordGames[currentGameIndex];
    currentWord = game.word;
    
    // Update hint
    document.getElementById('wordHint').textContent = game.word;
    
    // PERBAIKAN: Update gambar dengan path yang benar
    const targetImage = document.getElementById('targetImage');
    targetImage.src = `/static/${game.image}`;
    targetImage.alt = game.hint;
    targetImage.onerror = function() {
        // Jika gambar tidak ditemukan, tampilkan placeholder
        this.src = 'https://via.placeholder.com/200x200/667eea/ffffff?text=' + game.word;
        console.warn(`Image not found: ${game.image}`);
    };
    
    // Shuffle letters
    currentLetters = game.word.split('');
    shuffleArray(currentLetters);
    
    // Render letter tiles
    renderLetterTiles();
    
    // Clear answer area
    const answerArea = document.getElementById('answerArea');
    answerArea.innerHTML = '';
    
    // Clear feedback
    document.getElementById('wordFeedback').textContent = '';
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Render letter tiles
function renderLetterTiles() {
    const letterTiles = document.getElementById('letterTiles');
    letterTiles.innerHTML = '';
    
    currentLetters.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.index = index;
        tile.addEventListener('click', () => moveToAnswer(tile));
        letterTiles.appendChild(tile);
    });
}

// Move letter to answer area
function moveToAnswer(tile) {
    if (tile.classList.contains('placed')) return;
    
    const answerArea = document.getElementById('answerArea');
    const slot = document.createElement('div');
    slot.className = 'answer-slot';
    slot.textContent = tile.textContent;
    slot.dataset.originalIndex = tile.dataset.index;
    slot.addEventListener('click', () => moveBackToTiles(slot));
    
    answerArea.appendChild(slot);
    tile.classList.add('placed');
}

// Move letter back to tiles
function moveBackToTiles(slot) {
    const letterTiles = document.getElementById('letterTiles');
    const tiles = letterTiles.querySelectorAll('.letter-tile');
    const originalIndex = slot.dataset.originalIndex;
    
    tiles[originalIndex].classList.remove('placed');
    slot.remove();
}

// Check word
function checkWord() {
    const answerArea = document.getElementById('answerArea');
    const slots = answerArea.querySelectorAll('.answer-slot');
    const userWord = Array.from(slots).map(slot => slot.textContent).join('');
    const feedback = document.getElementById('wordFeedback');
    
    if (userWord.length === 0) {
        feedback.textContent = '⚠️ Susun huruf-hurufnya dulu ya!';
        feedback.className = 'feedback';
        return;
    }
    
    if (userWord === currentWord) {
        // Benar!
        score += 100;
        updateScore();
        feedback.textContent = '🎉 Benar sekali! Kamu hebat! 😄';
        feedback.className = 'feedback correct';
        
        // Show confetti
        createConfetti();
        
        // Next word after delay
        setTimeout(() => {
            currentGameIndex = (currentGameIndex + 1) % wordGames.length;
            initWordGame();
        }, 2500);
    } else {
        // Salah
        feedback.textContent = `💪 Belum tepat! Coba lagi ya!`;
        feedback.className = 'feedback wrong';
        
        // Reset after delay
        setTimeout(() => {
            resetWord();
        }, 2000);
    }
}

// Reset word game
function resetWord() {
    const answerArea = document.getElementById('answerArea');
    answerArea.innerHTML = '';
    
    const letterTiles = document.getElementById('letterTiles');
    const tiles = letterTiles.querySelectorAll('.letter-tile');
    tiles.forEach(tile => tile.classList.remove('placed'));
    
    document.getElementById('wordFeedback').textContent = '';
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6ab04c'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// Event listeners
document.getElementById('checkWordBtn').addEventListener('click', checkWord);
document.getElementById('resetWordBtn').addEventListener('click', resetWord);

// Initialize - PENTING: Load voices dulu baru generate alphabet
async function initialize() {
    console.log('🚀 Initializing Reading Page...');
    
    // Load voices terlebih dahulu
    await initVoices();
    
    // Generate alphabet dan word game
    generateAlphabet();
    initWordGame();
    updateScore();
    
    console.log('✅ Reading Page Ready!');
}

// Jalankan initialize saat DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}