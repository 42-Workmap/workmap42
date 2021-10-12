var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

let markerList = [];
let infowindowList = [];
let overlayList = [];

var list = []
var listEl = document.getElementById('placesList');

var map = new naver.maps.Map('map', mapOptions);

spreadMarkers("");


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
		displayMarkers(response);
		console.log("data request successed");
	}).fail((error) => {
		console.log("데이터 요청 실패");
	})
}


function spreadMarkers (groupval) {
	$.ajax({
		url:`/location/${groupval}`,
		type:"GET",
	}).done((response) => displayMarkers(response));
};


function cardClose(i) {
	infowindowList[i].close();
}

function displayMarkers (response) {
	if (response.message !== "success") return ;
	const data = response.data;

	removeAllChildNodes(listEl);
	removeMarker();
	removeWindows();
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
			card.querySelector("div").scrollIntoView();
		}
	};

	const getClickMap = (i) => () => {
		const infowindow = infowindowList[i];
		infowindow.close();
	};

	const getHoverHandler = (i) => ()  => {
		const target = data[i];
		const marker = markerList[i];
		const card =  list[i];
		
		card.querySelector("div").style.backgroundColor="#FFCA28";

		/**
		 * 사용자 정의 오버레이 구현하기
		 */
		var CustomOverlay = function(options) {
			this._element = $(`
					<div style="position:absolute;left:0;top:0;width:auto;height:30px;line-height:30px;text-align:center;
					background-color:#fff;border:0.1px; border-radius:30px;margin:0px 10px 20px 15px; padding: 0px 20px 0px 20px;">${target.company_name}</div>
				`);
			this.setPosition(options.position);
			this.setMap(options.map || null);
		};

		// CustomOverlay는 OverlayView를 상속받습니다.
		CustomOverlay.prototype = new naver.maps.OverlayView();
		CustomOverlay.prototype.constructor = CustomOverlay;
		CustomOverlay.prototype.onAdd = function() {
			var overlayLayer = this.getPanes().overlayLayer;
			
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

		const content = `
			<div class="card">
				<div class="card-body">
					<h5 class="card-title">${target.company_name}</h5>
					<hr>
					<p class="card-text">${target.address}</p>
					<a href="${target.homepage}" target="_blank" class="btn btn-outline-info btn-sm">홈페이지</a>
					<button type="button" class="btn btn-outline-info btn-sm float-right" onclick="cardClose(${i});">Close</button>
				</div>
			</div>
		`;

		const infowindow = new naver.maps.InfoWindow({
			content:content, 
			backgroundColor : "#00ff0000", 
			borderColor : "#00ff0000", 
			anchorSize : new naver.maps.Size(0,0), 
		});

		markerList.push(marker);
		infowindowList.push(infowindow);

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
			map.morph(latlng, 12);
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

	for (let i = 0, ii = markerList.length; i < ii; i++){
		naver.maps.Event.addListener(map, "click", getClickMap(i));
		naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
		naver.maps.Event.addListener(markerList[i], "mouseover", getHoverHandler(i));
		naver.maps.Event.addListener(markerList[i],"mouseout", getMouseOutHandler(i));
	} 
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
