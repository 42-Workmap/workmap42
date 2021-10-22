jQuery(document).ready(function($) {
	var alterClass = function() {
	  var ww = document.body.clientWidth;
	  if (ww < 992) {
		$('#response').removeClass('btn-group-vertical');
		$('#response').addClass('btn-group');
		$('#response').addClass('d-flex');
		$('#lg-row').removeClass('row');
	  } else if (ww >= 992) {
		$('#response').removeClass('btn-group');
		$('#response').removeClass('d-flex');
		$('#response').addClass('btn-group-vertical');
		$('#lg-row').addClass('row');

	  };
	};
	$(window).resize(function(){
	  alterClass();
	});
	//Fire it when the page first loads:
	alterClass();
  });