const puppeteer = require("puppeteer");

const generatePDF = async (url) => {
  let browser;
  let output;

  try {
    browser = await puppeteer.launch({
      headless: true,
      pipe: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--js-flags=--noexpose_wasm,--jitless"],
      dumpio: true,
      executablePath: process.env.NODE_ENV === "production" ? "google-chrome-stable" : undefined,
    });

    let context = await browser.createIncognitoBrowserContext();
    let page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle0", timeout: 10_000 });

    output = await page.pdf({ printBackground: true });

    await browser.close();
    browser = null;
  } catch (err) {
    console.log(err);
  } finally {
    if (browser) await browser.close();
  }

  return output;
};

module.exports = generatePDF;
