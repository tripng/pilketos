import { chromium } from 'playwright-core';

const URL = 'http://127.0.0.1:8194/live';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { execSync } = await import('node:child_process');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });

  const readVotes = async () =>
    page.locator('.tabular-nums').allTextContents();

  const before = await readVotes();
  console.log('ANGKA sebelum:', before);

  // Inject 5 vote
  execSync('VOTE_COUNT=5 php artisan tinker /tmp/gen_votes.php', { cwd: '/home/tripng/Projects/pilketos' });

  // Polling tiap 3s; cek berkala apakah angka naik & confetti muncul
  let sawConfetti = 0;
  let sawRing = 0;
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    const nums = await readVotes();
    const conf = await page.locator('.animate-spark').count();
    const ring = await page.locator('[class*="ring-amber-400"]').count();
    sawConfetti = Math.max(sawConfetti, conf);
    sawRing = Math.max(sawRing, ring);
    if (i % 2 === 0) console.log(`t=${i + 1}s angka=${nums} confetti=${conf} ring=${ring}`);
  }
  const after = await readVotes();
  console.log('ANGKA sesudah:', after);

  console.log('HASIL:', sawConfetti > 0 ? 'ANIMASI OK (confetti muncul)' : 'ANIMASI TIDAK MUNCUL');
  await browser.close();
})();
