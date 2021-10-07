// puppeteer.js
// node puppeteer.js로 실행
const fs = require('fs');
const puppeteer = require('puppeteer');

// [최종] 원하는 태그 .link_homepage가 보일때까지 기다리는 함수
const crawler = async () => {
	try {
		const browser = await puppeteer.launch({headless:false});
		const page = await browser.newPage();
		await page.goto("https://place.map.kakao.com/12835872");
		await page.waitForSelector('.link_homepage');
		while (await page.$('.link_homepage') !== null){
			fs.writeFileSync('new.html', await page.evaluate(() => document.querySelector('.link_homepage').textContent));
			break ;
		};
		await page.close();
		await browser.close();
	} catch (e) {
		console.log(e);
		console.log("error");
	}
}

crawler();