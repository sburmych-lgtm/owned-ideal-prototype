const { chromium } = require("playwright");
const path = require("path");

const dest = path.join(
  "G:",
  "Вебдизайн",
  "Нова Ера сайту салону",
  "docs",
  "screenshots"
);

async function shot(page, url, file, size) {
  await page.setViewportSize(size);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(dest, file), fullPage: false });
  console.log("saved", file);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const local = "http://localhost:4173/";
  const live = "https://web-production-f6d11.up.railway.app/";
  const owned = "https://web-production-f6bf3.up.railway.app/final/";
  const laser = "https://laserandme.com/";

  await shot(page, local, "proto-mobile-hero.png", { width: 390, height: 844 });
  await shot(page, local, "proto-desktop-hero.png", {
    width: 1440,
    height: 900,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(local, { waitUntil: "domcontentloaded" });
  await page.evaluate(() =>
    document.querySelector("#results")?.scrollIntoView({ block: "start" })
  );
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(dest, "proto-desktop-results.png"),
    fullPage: false,
  });
  console.log("saved proto-desktop-results.png");

  await shot(page, live, "live-mobile-hero.png", { width: 390, height: 844 });
  await shot(page, live, "live-desktop-hero.png", {
    width: 1440,
    height: 900,
  });
  await shot(page, owned, "owned-current-mobile-hero.png", {
    width: 390,
    height: 844,
  });
  await shot(page, owned, "owned-current-desktop-hero.png", {
    width: 1440,
    height: 900,
  });
  await shot(page, laser, "laser-mobile-hero.png", {
    width: 390,
    height: 844,
  });
  await shot(page, laser, "laser-desktop-hero.png", {
    width: 1440,
    height: 900,
  });

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
