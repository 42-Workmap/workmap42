const mapContainer = document.getElementById("map");
const mapOption = {
	center: new daum.maps.LatLng(37.554477, 126.970419),
	level:3,
};

let map= new daum.maps.Map(mapContainer, mapOption);

let infowindow = new daum.maps.InfoWindow({
	zIndex : 1,
});

let markerList = [];

let ps = new daum.maps.services.Places();

searchPlaces();

function searchPlaces() {
	let keyword = $("#keyword").val();
	ps.keywordSearch(keyword, placesSearchCB);
};

function placesSearchCB(data, status, pagination) {
	if (status === daum.maps.services.Status.OK) {
		displayPlaces(data);
	} else if (status === daum.maps.services.Status.ZERO_RESULT) {
		alert("검색 결과가 존재하지 않습니다.");
		return ;
	} else if (status === daum.maps.services.Status.ERROR) {
		alert("오류가 발생했습니다.");
		return ;
	};
};

function displayPlaces(data) {
	let listEl = document.getElementById("placesList");
	let bounds = new daum.maps.LatLngBounds(); // 해당 영역을 보여주는 함수 이후 사용 예정 행정구역 처럼 
	removeAllChildNodes(listEl);
	removeMarker();
	let redata;

	for (let i = 0; i < data.length; i++)  {
		let {place_name:company_name, address_name, y:lat, x:lng, category_name, place_url} = data[i];
		redata = [company_name, address_name, lat, lng, category_name, place_url];

		// alltheinfo = {company_name, address_name, lat, lng, category_name, place_url}
		const placePosition = new daum.maps.LatLng(lat, lng);
		bounds.extend(placePosition);

		let marker = new daum.maps.Marker({
			position : placePosition, 
		});

		marker.setMap(map);
		markerList.push(marker);

		const el = document.createElement("div");
		const itemStr = `
		<div class="info">
			<div class="info_company">
				${company_name}
			</div>
			<span>${address_name}</span>
		</div>
		`;

		el.innerHTML = itemStr;
		el.className = "item";

		daum.maps.event.addListener(marker, "click", function () {
			infowindow.close();
			displayInfowindow(marker, company_name, address_name, lat, lng, category_name, place_url);
			let placePos = new daum.maps.LatLng(lat, lng);
			map.panTo(placePos);
		});

		daum.maps.event.addListener(map, "click", function () {
			infowindow.close();
		});

		el.onclick = function () {
			displayInfowindow(marker, company_name, address_name, lat, lng, category_name, place_url);
		}
		listEl.appendChild(el);
	}
	map.setBounds(bounds);
}


function displayInfowindow(marker, company_name, address_name, lat, lng, category_name, place_url) {
	let content = `
			<div class="infowindow_wrap">
				<div class="infowindow_name">${company_name}</div>
				<div class="infowindow_address">${address_name}</div>
				<button class="btn btn-outline-success btn-sm" onClick="onSubmit('${company_name}','${address_name}',${lat},${lng}, '${category_name}', '${place_url}');">등록</button>
			</div>
		`;
	let placePos = new daum.maps.LatLng(lat, lng);
	map.panTo(placePos);
	infowindow.setContent(content);
	// infowindow.setPosition(placePos);
	infowindow.open(map,marker);
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

function onSubmit(company_name, address, lat, lng, category_name, place_url) {
	$.ajax({
		url:"/location",
		data:{company_name, address, lat, lng, category_name, place_url}, 
		type:"POST",
	}).done((response) => {
		console.log("data request successed");
		alert("성공");
	}).fail((error) => {
		console.log("데이터 요청 실패");
		alert("실패");
	})
}