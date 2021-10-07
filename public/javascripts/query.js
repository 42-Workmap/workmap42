let map = document.getElementById("map");

function querySearchDB() {
	let keyword = $("#keyword").val();
	console.log(keyword);
	onSearchDB(keyword);
};

function onSearchDB(keyword) {
	console.log("onSearchDB");
	$.ajax({
		url:`/location/query/${keyword}`,
		data:{keyword}, 
		type:"GET",
	}).done((response) => {
		displayPlaces(response.data);
		console.log("data request successed");
	}).fail((error) => {
		console.log("데이터 요청 실패");
	})
}

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