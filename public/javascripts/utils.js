let map;
let marker_list = []; // Define marker list globally so each function can use it

/////////////////////////////////////////////////////////////////////
/* || INITIALIZE THE MAP AND MARKERS                               */
/////////////////////////////////////////////////////////////////////

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 44.9727, lng: -93.23540000000003 },
        zoom: 11,
    });
    fetch("/shops/get_shop_info")
            .then(response => response.json())
            .then(data => add_shop_markers(map, data));
    
}

function add_shop_markers(resultsMap, data) {
	data_length = data.length;
    let infowindow = new google.maps.InfoWindow();
  	for (let i = 0; i < data_length; i++) {
		let shop_address = data[i].address;
		let shop_name = data[i].name;
		let shop_website = data[i].website;

		const marker = new google.maps.Marker({
			map: resultsMap,
	  		position: data[i].latlng,
			icon: "images/cream.png",
	  	});
		marker_list.push(marker);

		let info_content = shop_name + "<br>" + "<a href='" + shop_website + "'>Website</a><br>" + "Address: " + shop_address;
		attach_info_window(marker, infowindow, info_content, shop_name, data[i].reviews);

	}

	return marker_list;

}

/////////////////////////////////////////////////////////////////////
/* || FUNCTIONS TO ATTACH INFO WINDOWS TO MARKERS                  */
/////////////////////////////////////////////////////////////////////

function attach_info_window(marker, infowindow, info_content, shop_name, reviews) {

	marker.addListener("click", () => {
        console.log(reviews);
		document.getElementById("review-title").innerHTML = `	
																<div class="col-md-12">
																	<h3>Reviews for ${shop_name}</h3>
																</div>
															` 
		document.getElementById("review-container").style.display="block";
		display_reviews(reviews);
        infowindow.setContent(info_content);
		infowindow.open(marker.get("map"), marker);
	});
}

/////////////////////////////////////////////////////////////////////
/* || FUNCTIONS DISPLAY ALL OF THE REVIEWS                         */
/////////////////////////////////////////////////////////////////////

function display_reviews(reviews) {
	num_reviews = reviews.length
	html = `<div class="fluid-container"><div class="row">`
	for(let i = 0; i < num_reviews; i++) {
		if (reviews[i].reviewer) {
			reviewer = reviews[i].reviewer;
		} else {
			reviewer = "Unknown";
		}
		reviewer = reviews[i].reviewer 
		html_to_add = `
						<div class="col-xl-6">
							<div class="card review-card">
								<div class="card-header d-inline" style="background-color: #396AC3;">
									<h5 class="card-title text-white"> Reviewer: ${reviewer} </h5>
									<h5 class="card-title text-white"> Date: ${reviews[i].review_date} </h5>
								</div>
								<div class="card-body">			
									<div class="container-fluid">
										<div class="row">
											<div class="col-lg-3 text-left">
												<p class="card-text"> Flavors: ${reviews[i].flavors_tried} <br> Cone: ${reviews[i].cone_tried} <p>
											</div>
											<div class="col-md-3 text-center">
												<p> Flavor Score <br> ${reviews[i].flavor_score} / 10 </p>
											</div>
											<div class="col-md-3 text-center">
												<p> Texture Score <br> ${reviews[i].texture_score} / 10 </p>
											</div>
											<div class="col-md-3 text-center">
												<p> Overall Score <br> ${reviews[i].overall_score} / 10 </p>
											</div>
											<div class="col-md-12 text-left">
												<p> Comments: ${reviews[i].comments} </p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						`
		html += html_to_add
	}
	html += "</div></div>"
	document.getElementById("reviews").innerHTML = html;
}

/////////////////////////////////////////////////////////////////////
/* || FUNCTION TO HANDLE THE AUTOCOMPLETE FEATURE                  */
/////////////////////////////////////////////////////////////////////

$(document).ready(function () {
	$("#shop_name_input").autocomplete({
		source: async function(request, response) {
			let data = await fetch(`/reviews/shop_name_autocomplete?query=${request.term}`)
				.then(results => results.json())
				.then(results => results.map(result => {
					return { label: result.name, value: result.name, id: result._id};
				}));
			response(data);
		},
		minlength: 2
	});
});