var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

var map = new naver.maps.Map('map', mapOptions);

$.ajax({
	url:"/location",
	type:"GET",
}).done((response) => {
	if (response.message !== "success") return ;
	const data = response.data;

	let markerList = [];
	let infowindowList = [];
	var list = []
	var listEl = document.getElementById('placesList');

	const getClickHandler = (i) => () => {
		const marker = markerList[i];
		const infowindow = infowindowList[i];
		if (infowindow.getMap()){
			infowindow.close();
		} else {
			infowindow.open(map, marker);
		}
	};
	// function getClickHandler(i) { return function () {}}

	const getClickMap = (i) => () => {
		const infowindow = infowindowList[i];
		infowindow.close();
	}

	// const displayInfoWindow = (marker, infowindow, lat, lng) => () => {
	// 	let newlat = new naver.maps.LatLng(lat, lng);
	// 	map.morph(newlat, 15);
	// 	infowindow.open(map, marker);
	// }

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
			<div class="infowindow_wrap">
				<div class="infowindow_name">${target.company_name}</div>
				<div class="infowindow_address">${target.address}</div>
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
		<div class=info>
                <div class="info_company">
                 ${target.company_name}
                 </div>
                 <span>${target.address}</span>
            </div>
		`;

		el.innerHTML = itemStr;
		el.className = "item"; 

		el.onclick = function(){
			map.morph(latlng, 15);
			infowindow.open(map, marker);
		}

		listEl.appendChild(el);
		list.push(el);
	}

	for (let i = 0, ii = markerList.length; i < ii; i++){
		naver.maps.Event.addListener(map, "click", getClickMap(i));
		naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
		// naver.maps.Event.addListener(list[i], "click", getClickHandler(i));
	} 

});
