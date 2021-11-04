jQuery(document).ready(function($) {
	var alterClass = function() {
	  var ww = document.body.clientWidth;
	  if (ww < 992) {
		$('#response').removeClass('btn-group-vertical');
		$('#response').addClass('btn-group');
		$('#response').addClass('d-flex');
		// $('#navbar_alim').removeClass('d-flex');
		var alim = document.getElementById('navbar_alim');
		if (alim && alim.hasChildNodes()){
			alim.removeChild(alim.lastChild);
		}
		$('#lg-row').removeClass('row');
	  } else if (ww >= 992) {
		$('#response').removeClass('btn-group');
		$('#response').removeClass('d-flex');
		$('#response').addClass('btn-group-vertical');
		$('#lg-row').addClass('row');
		var alim = document.getElementById('navbar_alim');
		if (alim && !alim.hasChildNodes()){
			let el = document.createElement("h7");
			let itemStr = `
			즐겨찾기 기능은 로그인 후 이용가능합니다. `;

			el.innerHTML = itemStr;
			el.className = "d-flex justify-content-between ml-auto"; 

			alim.appendChild(el);
		}
	  };
	};
	$(window).resize(function(){
	  alterClass();
	});
	//Fire it when the page first loads:
	alterClass();
  });