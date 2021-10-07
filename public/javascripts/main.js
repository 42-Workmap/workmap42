var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

let markerList = [];
let infowindowList = [];
let title = [];
	
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
		const infowindow = infowindowList[i];
		if (infowindow.getMap()){
			infowindow.close();
		} else {
			infowindow.open(map, marker);
		}
	};

	const getClickMap = (i) => () => {
		const infowindow = infowindowList[i];
		infowindow.close();
	};

	const getHoverHandler = (i) => ()  => {
		const target = data[i];
		const marker = markerList[i];
	
		const content = `<div class='hover_wrap'>
		<div class='hover_title'>${target.company_name}</div>
		</div>`;
	
		const titleWindow = new naver.maps.InfoWindow({
			content: content, 
			backgroundColor: '#ffffffff',
			borderColor : '#00ff0000',
			anchorSize: new naver.maps.Size(0,0)
		});
	
		titleWindow.open(map, marker);

		title.push(titleWindow);
	};

	const getMouseOutHandler = (i) => () => {
		title[0].close();
		title.pop();
	}

	for (let i = 0; i < data.length; i++){
		const target = data[i];
		const latlng = new naver.maps.LatLng(target.lat, target.lng);

		let marker = new naver.maps.Marker({
			map:map, 
			position : latlng,
			icon : {
				content : `<div class='marker'></div>`, 
				archor : new naver.maps.Point(7.5, 7.5), 
			},
		});

		const content = `
			<div class="card">
				<div class="card-body">
					<h5 class="card-title">${target.company_name}</h5>
					<hr>
					<p class="card-text">${target.address}</p>
					<a href="#" class="btn btn-outline-info btn-sm">홈페이지</a>
					<button type="button" class="btn btn-outline-info btn-sm">Close</button>
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
				</div>
			</div>
		`;

		el.innerHTML = itemStr;
		el.className = "item"; 

		listEl.appendChild(el);
		list.push(el);

		el.onclick = function(){
			map.morph(latlng, 12);
			infowindow.open(map, marker);
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