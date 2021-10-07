const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

const crawler = async () => {
	try {
		const browser = await puppeteer.launch({headless:false});
		const page = await browser.newPage();
		await page.goto('https://unsplash.com');
		const result = await page.evaluate(()=>{
			let imgs = [];
			const imgEls = document.querySelectorAll('.oCCRx');
			if (imgEls.length){
				imgEls.forEach((y) => {
					imgs.push(y.src);
					console.log(y.src);
				});	
			};
			return imgs;
		});
		console.log(result);
		await page.close();
		await browser.close();
	} catch(e) {
		console.error(e);
	}
};

crawler();