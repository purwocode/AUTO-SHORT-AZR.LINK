const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

// Membuat interface untuk menerima input dari console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fungsi untuk meminta input dari console
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

(async () => {
  // Meminta URL dari pengguna
  const inputUrl = await askQuestion('Masukkan URL yang ingin dipersingkat: ');

  // Meminta jumlah iterasi dari pengguna
  const iterations = parseInt(await askQuestion('Masukkan jumlah iterasi: '), 10);

  // Menutup readline interface setelah mendapatkan input
  rl.close();

  if (isNaN(iterations) || iterations <= 0) {
    console.log('Jumlah iterasi tidak valid. Harap masukkan angka positif.');
    return;
  }

  for (let i = 0; i < iterations; i++) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Membuka halaman URL
    await page.goto('https://azr.link/', { waitUntil: 'networkidle2' });

    // Mengetikkan URL yang diterima dari input console
    await page.type('#inputUrl', inputUrl);

    // Mengklik tombol shorten
    await page.click('#shorten');

    // Menunggu beberapa saat agar proses shortening selesai
    await page.waitForSelector('#shorten-div > pre');

    // Mengambil data dari elemen #shorten-div > pre
    const resultText = await page.$eval('#shorten-div > pre', el => el.textContent);

    // Parsing data JSON yang diambil dari elemen
    const resultJson = JSON.parse(resultText);

    // Mengambil nilai shortUrl
    const shortUrl = resultJson.shortUrl;

    // Menyimpan shortUrl ke dalam file short.txt dengan metode append
    fs.appendFile('short.txt', shortUrl + '\n', (err) => {
      if (err) throw err;
      console.log(`Shortened URL ke-${i + 1} disimpan ke short.txt:`, shortUrl);
    });

    // Menutup browser
    await browser.close();
  }
})();
