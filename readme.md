1. Teknologi Frontend
Frontend aplikasi ini dibangun tanpa menggunakan framework JavaScript berat (seperti React/Vue), melainkan menggunakan teknologi web standar yang dioptimalkan untuk performa dan kemudahan akses:

HTML5 & Jinja2: Menggunakan template engine Jinja2 (bawaan Flask) untuk merender halaman secara dinamis.
Vanilla CSS: Seluruh desain menggunakan CSS murni dengan pendekatan modern UI (gradient, glassmorphism, dan responsif) agar tampilan menarik bagi anak-anak.
Vanilla JavaScript: Digunakan untuk logika permainan di sisi klien, seperti animasi confetti, manipulasi DOM saat menyusun kata, dan pengelolaan skor.
Web Speech API: Memanfaatkan fitur Text-to-Speech (TTS) bawaan browser yang diprogram khusus untuk mengenali pelafalan Bahasa Indonesia (misal: melafalkan huruf "A" sebagai "ah", "C" sebagai "ce").
2. Teknologi Backend (Framework)
Aplikasi ini menggunakan framework Flask (Python) sebagai otak di sisi server.

Framework: Flask (Python).
Alasan: Flask dipilih karena ringan, cepat untuk dikembangkan, dan sangat stabil dalam melayani permintaan API serta file statis (gambar/suara).
Routing: Flask mengelola navigasi antar halaman (/, /math, /reading, /games) dan menyediakan layanan API untuk sinkronisasi data.
3. Logika Pembuatan Soal
Pembuatan soal dilakukan dengan kombinasi logika di Backend dan Frontend:

A. Matematika (Backend Logic)
Logika dijalankan pada file 
app.py
 melalui endpoint /api/math/generate:

Randomisasi: Server menghasilkan dua angka acak antara 1 sampai 10 menggunakan modul random Python.
Operasi Acak: Memilih secara acak antara penjumlahan (+) atau pengurangan (-).
Proteksi Hasil Negatif: Pada operasi pengurangan, jika angka pertama lebih kecil dari angka kedua (num1 < num2), sistem akan menukar posisi keduanya agar hasilnya selalu positif dan sesuai untuk tahap belajar anak-anak.
B. Membaca & Menyusun Kata (Frontend Logic)
Logika dijalankan pada 
reading.js
:

Bank Kata: Terdapat kumpulan data objek berisi kata (misal: "KUCING"), hint (hewan berkaki empat), dan path gambar terkait.
Acak Huruf (Fisher-Yates Shuffle): Huruf-huruf dari kata target dipecah dan diacak posisinya sebelum ditampilkan sebagai kotak-kotak yang bisa diklik.
Validasi: Saat anak menyusun huruf, JS akan membandingkan string yang disusun dengan kata asli di database untuk menentukan apakah jawabannya benar atau salah.
4. Sistem Integrasi Game
Aplikasi memiliki fitur Autodiscovery untuk game HTML5:

Backend Flask secara otomatis memindai folder static/games/.
Jika folder game baru ditambahkan (yang memiliki file index.html), sistem akan otomatis menambahkannya ke daftar menu di halaman "Main Game" tanpa perlu mengubah kode secara manual.
Struktur Folder Utama:
app.py: Server Backend (Flask).
templates/: File HTML (Struktur UI).
static/js/: Logika Interaktif (Math & Reading logic).
static/css/: Desain Visual & Tema.
static/images/ & static/sounds/: Asset multimedia pendukung pembelajaran.

File 
math.js
 adalah file yang menangani semua logika interaktif pada halaman Belajar Matematika. File ini bertanggung jawab atas dua fitur utama:

1. Pengenalan Angka (Number Recognition)
Bagian ini membantu anak mengenal angka 0-10 melalui suara dan visual:

Grid Angka: Menghasilkan tombol angka secara otomatis di layar.
Text-to-Speech (TTS): Saat tombol angka diklik, script ini akan memicu suara dalam Bahasa Indonesia (menggunakan objek numberPronunciation seperti "satu", "dua", dst.).
Popup Visual: Menampilkan angka berukuran besar di layar saat diklik untuk memperkuat ingatan visual anak.
Sistem Skor: Memberikan poin setiap kali anak mengeksplorasi angka baru.
2. Permainan Matematika (Math Game)
Bagian ini mengelola kuis matematika interaktif dengan logika berikut:

Variasi Operasi: Mendukung soal Penjumlahan (+), Pengurangan (-), Perkalian (×), dan Pembagian (÷).
Batas Angka (Safeguard): Memastikan soal yang dihasilkan tetap mudah untuk anak-anak (maksimal hasil adalah 15).
Validasi Jawaban: Memeriksa apakah input anak sudah benar atau belum.
Umpan Balik (Feedback):
Jika Benar: Menampilkan pesan motivasi ("Hebat!", "Luar biasa!"), memutar suara kemenangan, dan memunculkan efek confetti.
Jika Salah: Memberikan petunjuk halus (Hint) sesuai jenis operasinya (misal: "Ingat, perkalian adalah penjumlahan berulang") dan memberitahu jawaban yang benar agar anak bisa belajar dari kesalahan.
3. Perbaikan Aksesibilitas (Accessibility Fixes)
Menariknya, di dalam file ini terdapat banyak fungsi "FIX" (seperti 
fixInputFieldAccessibility
) yang memastikan:

Input keyboard tetap bisa muncul di perangkat mobile (tablet/HP).
Mencegah bug di mana kotak jawaban tidak bisa diklik setelah anak mengklik tombol angka lainnya.
Memastikan sinkronisasi antara input Enter di keyboard dengan tombol "Cek" di layar.
Singkatnya, jika 
app.py
 adalah server yang mengirimkan data, maka 
math.js
 adalah "asisten guru" yang membuat halaman matematika menjadi hidup, bisa berbicara, dan bisa merespons tindakan anak secara real-time.