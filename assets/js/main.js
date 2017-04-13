/*
	Phased by Pixelarity
	pixelarity.com @pixelarity
	License: pixelarity.com/license
*/

(function($) {

	$("#header-wrapper").load("/partials/header.html");
	$("#main-wrapper").load("/partials/ulfa_facebook.html");
 	$("#footer-wrapper").load("/partials/footer.html"); 
	$("#twitter-wrapper").load("/partials/twitter.html");
	$("#instagram-wrapper").load("/partials/instagram.html");

	skel
		.breakpoints({
			desktop: '(min-width: 737px)',
			tablet: '(min-width: 737px) and (max-width: 1200px)',
			mobile: '(max-width: 736px)'
		})
		.viewport({
			breakpoints: {
				tablet: {
					width: 1080
				}
			}
		});

})(jQuery);