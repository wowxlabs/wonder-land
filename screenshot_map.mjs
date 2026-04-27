import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--enable-webgl', '--use-gl=swiftshader', '--ignore-gpu-blocklist',
         '--enable-gpu-rasterization', '--no-sandbox']
});
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });
await page.goto('http://localhost:3000');
await page.waitForTimeout(14000); // wait for all GLTF to load

// Bird's eye overview
await page.screenshot({ path: '/tmp/grass_overview.png' });

// Enable navigation mode (click Bird-eye button to allow orbit controls)
await page.locator('button', { hasText: /bird.eye/i }).click();
await page.waitForTimeout(1000);

// Zoom in with scroll wheel over the island (centre of viewport)
const cx = 700, cy = 450;
await page.mouse.move(cx, cy);
for (let i = 0; i < 18; i++) {
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/grass_zoomed.png' });

// Tilt view down a bit and pan to southern terrain
await page.mouse.move(cx, cy);
await page.mouse.down({ button: 'right' });
await page.mouse.move(cx, cy - 120, { steps: 20 });
await page.mouse.up({ button: 'right' });
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/grass_tilted.png' });

await browser.close();
console.log('Done');
