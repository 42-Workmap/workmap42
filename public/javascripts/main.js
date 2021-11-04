var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

let markerList = [];
let infowindowList = [];
let overlayList = [];
let clusterList = [];
let favsList = [];

var list = []
var listEl = document.getElementById('placesList');

var map = new naver.maps.Map('map', mapOptions);
let flag = 0;

spreadMarkers('');

function querySearchDB() {
	let keyword = $("#keyword").val();
	onSearchDB(keyword);
};

function onSearchDB(keyword) {
	$.ajax({
		url:`/location/query`,
		data:{keyword}, 
		type:"POST",
	}).done((response) => {
		displayMarkers(response, userMarkers);
		console.log("data request successed");
	}).fail((error) => {
		console.log("데이터 요청 실패");
	})
}

function spreadMarkers (groupval) {
	$.ajax({
		url:`/location/${groupval}`,
		type:"GET",
	}).done((response) => {
		flag = 0;
		displayMarkers(response, userMarkers);
	});
};

function clickFavIcon () {
	$.ajax({
		url:`/fav`,
		type:"GET",
	}).done((response) => {
		for (let i = 0; i < response.data.length; i++){
			favsList.push(response.data[i].company_name);
		}
		flag = 1;
		displayMarkers(response, userMarkers);
	});
};

function userMarkers () {
	$.ajax({
		url:`/fav`,
		type:"GET",
	}).done((response) => {
		for (let i = 0; i < response.data.length; i++){
			favsList.push(response.data[i].company_name);
		}
	});
};

function cardClose(i) {
	infowindowList[i].close();
}

function makeOverlay(target, marker){
	/**
		 * 사용자 정의 오버레이 구현하기
		 */
	 var CustomOverlay = function(options) {
		this._element = $(`
				<div style="position:absolute;left:0;top:0;width:auto;height:auto;overflow-x:hidden;line-height:30px;text-align:center;
				background-color:#fff;border:0.1px; border-radius:30px;margin:0px 10px 20px 15px; padding: 0px 20px 0px 20px;">
					${target.company_name}
				</div>
			`);
		this.setPosition(options.position);
		this.setMap(options.map || null);
	};

	// CustomOverlay는 OverlayView를 상속받습니다.
	CustomOverlay.prototype = new naver.maps.OverlayView();
	CustomOverlay.prototype.constructor = CustomOverlay;
	CustomOverlay.prototype.onAdd = function() {
		var overlayLayer = this.getPanes().floatPane;
		
		this._element.appendTo(overlayLayer);
	};
	CustomOverlay.prototype.draw = function() {
		// 지도 객체가 설정되지 않았으면 draw 기능을 하지 않습니다.
		if (!this.getMap()) {
			return;
		}

		// projection 객체를 통해 LatLng 좌표를 화면 좌표로 변경합니다.
		var projection = this.getProjection(),
			position = this.getPosition();
		var pixelPosition = projection.fromCoordToOffset(position);
		this._element.css('left', pixelPosition.x);
		this._element.css('top', pixelPosition.y);
	};

	CustomOverlay.prototype.onRemove = function() {
		this._element.remove();
		// 이벤트 핸들러를 설정했다면 정리합니다.
		this._element.off();
	};

	CustomOverlay.prototype.setPosition = function(position) {
		this._position = position;
		this.draw();
	};

	CustomOverlay.prototype.getPosition = function() {
		return this._position;
	};

	// 오버레이 생성
	var overlay = new CustomOverlay({
		position: marker.getPosition(),
		map: map
	});
	overlayList.push(overlay);
}

function targett(targetName){
	console.log(targetName);
	$.ajax({
		url:`/fav`,
		data:{targetName}, 
		type:"POST",
	}).done((response) => {
		console.log(response);
		console.log("fav data request successed");
	}).fail((error) => {
		console.log("데이터 요청 실패");
	})
}

function makeInfoContent(i, target, imgpath)
{
	const content = `
			<div class="card">
				<div class="img-wrapper">
					<img class="card-img-top" src="${imgpath}" alt="Card image cap">
				</div>
				<div class="card-body">
					<h5 class="card-title">${target.company_name}</h5>
					<hr>
					<p class="card-text">${target.address}</p>
					<a href="${target.homepage}" target="_blank" class="btn btn-outline-info btn-sm">홈페이지</a>
					<button type="button" class="btn btn-outline-info btn-sm float-right" onclick="cardClose(${i});">Close</button>
				</div>
			</div>
		`;
	return content;
}

function favoriteHandler(self, targetName){
	if (self.value === '등록'){
		self.value = '해제';
		self.innerHTML = '해제';
		targett(targetName);
	} else {
		self.value = '등록';
		self.innerText = '등록';
		$.ajax({
			url:`/fav/update`,
			data:{targetName}, 
			type:"PUT",
		}).done((response) => {
			console.log("fav data request successed");
			if(flag === 1){
				clickFavIcon();
			}
		}).fail((error) => {
			console.log("데이터 요청 실패");
		})
	}
}

function loginInfoContent(i, target, imgpath, status)
{
	const content = `
			<div class="card">
				<div class="img-wrapper">
					<img class="card-img-top" src="${imgpath}" alt="Card image cap">
				</div>
				<div class="card-body">
					<h5 class="card-title">${target.company_name}</h5>
					<hr>
					<p class="card-text">${target.address}</p>
					<a href="${target.homepage}" target="_blank" class="btn btn-outline-info btn-sm">홈페이지</a>
					<button type="button" class="btn btn-outline-info btn-sm float-right" value="${status}" onclick="favoriteHandler(this, '${target.company_name}');">${status}</button>
				</div>
			</div>
		`;
	return content;
}

function makeCompanyList(target, marker, infowindow)
{
	let el = document.createElement("div");
		let itemStr = `
			<div class="card">
				<div class="card-body">
					<h6 class="card-title">${target.company_name}</h6>
					<span class="card-text">${target.address}</span>
				</div>`;

		el.innerHTML = itemStr;
		el.className = "item"; 

		listEl.appendChild(el);
		list.push(el);

		el.onclick = function(){
			infowindow.open(map, marker);
			const newlng = new naver.maps.LatLng(target.lat + 0.03, target.lng);
			map.morph(newlng, 12);
		}

		el.onmouseover = function()
		{
			el.querySelector("div").style.backgroundColor="powderblue";
		}

		el.onmouseout = function()
		{
			el.querySelector("div").style.backgroundColor="white";
		}
}

function makeMarkerClustering()
{
	const cluster1 = {
		content: `<div class="cluster1"></div>`,
	};

	const cluster2 = {
		content: `<div class="cluster2"></div>`
	};

	const cluster3 = {
		content: `<div class="cluster3"></div>`
	};

	let markerClustering = new MarkerClustering({
		minClusterSize : 3,
		maxZoom: 12,
		map: map,
		markers: markerList,
		disableClickZoom: false,
		gridSize: 80,
		icons: [cluster1, cluster2, cluster3],
		indexGenerator: [5, 25, 50],
		stylingFunction: (clusterMarker, count) => {
			$(clusterMarker.getElement()).find("div:first-child").text(count);
		}
	});

	clusterList.push(markerClustering);
}

function displayMarkers (response, callback) {
	if (response.message !== "success") return ;
	const data = response.data;

	removeAllChildNodes(listEl);
	removeMarker();
	removeWindows();
	removeClusters();
	let isAuthenticated = $("#isAuthenticated").val();
	console.log(isAuthenticated);
	if (isAuthenticated === 'T'){
		callback();
	}
	

	if (data.length === 0){
		let nodata = document.createElement("div");
		let tmStr = `
			<h5>검색결과가 없습니다. </h5>
		`
		nodata.innerHTML = tmStr;

		listEl.appendChild(nodata);
	}
	
	const getClickHandler = (i) => () => {
		const marker = markerList[i];
		const palces = document.querySelector('#placesList');
		const card = list[i];

		const infowindow = infowindowList[i];
		if (infowindow.getMap()){
			infowindow.close();
		} else {
			infowindow.open(map, marker);
			map.morph(marker.getPosition(), 12);
			card.querySelector("div").scrollIntoView();
		}
	};

	const getClickMap = (i) => () => {
		const infowindow = infowindowList[i];
		if(infowindow){
			infowindow.close();
		}
	};

	const getHoverHandler = (i) => ()  => {
		const target = data[i];
		const marker = markerList[i];
		const card =  list[i];
		
		makeOverlay(target, marker);
		card.querySelector("div").style.backgroundColor="#FFCA28";
	};

	const getMouseOutHandler = (i) => () => {
		card = list[i];

		overlayList[0].setMap(null);
		overlayList.pop();
		card.querySelector("div").style.backgroundColor="white";
	}

	for (let i = 0; i < data.length; i++){
		const target = data[i];
		const latlng = new naver.maps.LatLng(target.lat, target.lng);

		let marker = new naver.maps.Marker({
			map:map, 
			position : latlng,
			icon : {
				content : `<div class='marker' id="${target.group}"></div>`, 
				archor : new naver.maps.Point(7.5, 7.5), 
			},
		});

		const imgpath = encodeURI("img/download/"+target.company_name+"/g_0000.jpg");
		if (isAuthenticated === 'T'){
			if (favsList.includes(target.company_name)){
				content = loginInfoContent(i, target, imgpath, '해제');
			} else {
				content = loginInfoContent(i, target, imgpath, '등록');
			}
		} else {
			content = makeInfoContent(i, target, imgpath);
		}
		
		const infowindow = new naver.maps.InfoWindow({
			content:content, 
			backgroundColor : "#00ff0000", 
			borderColor : "#00ff0000", 
			anchorSize : new naver.maps.Size(0,0), 
		});

		markerList.push(marker);
		infowindowList.push(infowindow);

		makeCompanyList(target, marker, infowindow);
	}


	for (let i = 0, ii = markerList.length; i < ii; i++){
		naver.maps.Event.addListener(map, "click", getClickMap(i));
		naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
		naver.maps.Event.addListener(markerList[i], "mouseover", getHoverHandler(i));
		naver.maps.Event.addListener(markerList[i],"mouseout", getMouseOutHandler(i));
	}
	makeMarkerClustering();
}

function removeAllChildNodes(el) {
	while (el.hasChildNodes()) {
		el.removeChild(el.lastChild);
	}
}

function removeMarker() {
	for (let i = 0; i < markerList.length; i++) {
		markerList[i].setMap(null);	
	}
	markerList = [];
}

function removeWindows() {
	for (let i = 0; i < infowindowList.length; i++) {
		infowindowList[i].close();
	}
	infowindowList = [];
}

function removeClusters() {
	for (let i = 0; i < clusterList.length; i++) {
		clusterList[i].setMap(null);
	}
	clusterList = [];
}

function removeFavs() {
	favsList = [];
}