// puppeteer.js
// node puppeteer.js로 실행
const fs = require('fs');
const puppeteer = require('puppeteer');

// puppeteer 동작 이해하는 함수
const learnPuppeteer = async() => {
	const browser = await puppeteer.launch({headless:false});// 개발할떄만 false, 로 화면 띄우고 실제로는 true시켜서 화면을 띄우지 않는다 
	//const browser = await puppeteer.launch({process.env.NODE_ENV === 'production'});// 개발할 떄 true 
	// const page = await browser.newPage(); // no promise ver.
	const [page, page2] = await Promise.all([
		browser.newPage(), 
		browser.newPage()
	]);
	await Promise.all( [
		page.goto('https://naver.com'),
		page2.goto('https://google.com')
	])
	// await page.goto('https://www.naver.com'); // no promise ver.
	await Promise.all([
		page.waitFor(3000), 
		page2.waitFor(2000)
	]);
	await page.close();
	await page2.close();
	await browser.close();
}

// 태그 <body> 안의 모든 html 가져오는 함수
const getAllBodyHTML = async () => {
	try {
		const browser = await puppeteer.launch({headless:false});
		const page = await browser.newPage();
		await page.goto("https://place.map.kakao.com/12835872", {waitUntil:'networkidle0'});
		let bodyHTML = await page.evaluate(() => document.body.innerHTML);
		fs.writeFileSync('full.html', bodyHTML);
		console.log(bodyHTML);
		await page.close();
		await browser.close();
	} catch (e) {
		console.log(e);
		console.log("error");
	}	
}


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