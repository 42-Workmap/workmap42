// axios.js
// node axios.js로 실행
const axios = require('axios');
const cheerio = require('cheerio');

const getHtml = async() => {
	try {
		return await axios.get("https://place.map.kakao.com/1620604813");
	} catch (error) {
		console.error(error);
	}	
}

getHtml().then(html => {
	const $ = cheerio.load(html.data);
	console.log(html.data);
})