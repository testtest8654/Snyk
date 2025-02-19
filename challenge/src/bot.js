// required packages
const puppeteer = require("puppeteer");

// navigate
async function goto(url) {
	const browser = await puppeteer.launch({
		headless: "new",
		ignoreHTTPSErrors: true,
		args: [
            "--no-sandbox",
            "--ignore-certificate-errors",
            "--disable-web-security"
        ],
        executablePath: "/usr/bin/chromium-browser"
    });

	const page = await browser.newPage();

	try {
	    await page.goto(url);
	} catch {}

    console.log("[LOG] Closing browser.")
    browser.close();
	return;
}

if (process.argv.length === 2) {
    console.error("No URL provided!");
    process.exit(1);
}

console.log(`[LOG] Opening browser on ${process.argv[2]}.`)
goto(process.argv[2]);
