let ps = new kakao.maps.services.Places();
let search_arr = [];

$("#group").on("keydown", function(e){
	if (e.keyCode === 13){
		$(this).parent.submit();
	}
});

$("#form1").on("keydown", function(e){
	if (e.keyCode === 13){
		let content = $(this).val();
		let content_arr = content.split(',');
		document.getElementById("result").innerText = null;
		document.getElementById("resulturl").innerText = null;
		document.getElementById("resulturl").innerHTML = null;
		for (var i of Array(content_arr.length).keys()){
			ps.keywordSearch(content_arr[i], placeSearchCB);
		}

	}
});


$("#search_button").on("click", function(e) {
	let content = $("#form1").val();
	let content_arr = content.split(',');
	document.getElementById("result").innerText = null;
	document.getElementById("resulturl").innerHTML = null;
	for (var i of Array(content_arr.length).keys()){
		ps.keywordSearch(content_arr[i], placeSearchCB);
	}
});

function printNewTarget(target){
	let output = '';
	for (var key in target) {
		if (key == "lat" || key == "lng") {
			output += key + ': '+ target[key] + ',\n';
		} else {
			output += key + ': "'+ target[key] + "\",\n";
		}
	}
	var parent = document.getElementById("resulturl");
	parent.innerHTML += `<a href=${target["place_url"]} target="_blank">${target["company_name"]}<a><br>`
	document.getElementById("result").innerText += output + "\n";
	return target;
}

function placeSearchCB(data, status, pagination){
	if (status === kakao.maps.services.Status.OK){
		let oldtarget = data[0];
		for (let i = 0; i < data.length; i++){
			if (data[i]['category_name'].indexOf("서비스,산업 > 기업") !== -1 || 
			data[i]['category_name'].indexOf("인터넷") !== -1){
				oldtarget = data[i];
				let {category_group_code, category_group_name, distance, phone, address_name, id, x, y, place_name, ...target} = oldtarget;
				target.lat = y;
				target.lng = x;
				target.company_name = place_name;
				target.address = address_name;
				printNewTarget(target);
				onSubmit(target.company_name, target.address, target.lat, target.lng, target.category_name, target.place_url);
				return ;
			}
		}
		printNewTarget(oldtarget);
		alert("nothing added");
	} else {
		alert("검색결과가 없습니다. ");
	}
}


function onSubmit(company_name, address, lat, lng, category_name, place_url) {
	$.ajax({
		url:"/location",
		data:{company_name, address, lat, lng, category_name, place_url}, 
		type:"POST",
	}).done((response) => {
		console.log("data request successed");
	}).fail((error) => {
		console.log("데이터 요청 실패");
	})
}