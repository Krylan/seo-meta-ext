function getMeta() {
	let report = ['',''];
	let category = ['','',''];
	
	// META TAGS | CATEGORY 0
	document.head.querySelectorAll('title').forEach(function(elem){
		category[0] += '<li><div><div class="label left">Title</div><div class="label right grey">Length: '+elem.innerText.length+'</div><br style="clear:both;"/></div>'+elem.innerText+'</li>';
	});
	document.head.querySelectorAll('meta[name=description]').forEach(function(elem){
		category[0] += '<li><div><div class="label left">Description</div><div class="label right grey">Length: '+elem.getAttribute('content').length+'</div><br style="clear:both;"/></div>'+elem.getAttribute('content')+'</li>';
	});
	document.head.querySelectorAll('meta[name=robots]').forEach(function(elem){
		let robots_index = '<div class="label right green">Index</div>';
		let robots_follow = '<div class="label right green">Follow</div>';
		if(elem.getAttribute('content').includes("noindex")){
			robots_index = '<div class="label right red">Noindex</div>';
		}
		if(elem.getAttribute('content').includes("nofollow")){
			robots_follow = '<div class="label right red">Nofollow</div>';
		}
		category[0] += '<li><div><div class="label left">Robots</div>'+robots_follow+robots_index+'<br style="clear:both;"/></div>'+elem.getAttribute('content')+'</li>';
	});
	
	report[0] += '<div class="report_section">';
	if(category[0].length > 0){
		report[0] += '<ul>'+category[0]+'</ul>';
	}else{
		report[0] += '<div class="info-alert">There are no meta tags to display</div>';
	}
	report[0] += '</div>';
	
	// LINK REL | CATEGORY 1
	document.head.querySelectorAll('link[rel=canonical]').forEach(function(elem){
		let canonical_self = '';
		if(elem.getAttribute('href') == window.location.href){
			canonical_self = '<div class="label right blue">Self-referencing</div>';
		}
		category[1] += '<li><div><div class="label left">Canonical</div>'+canonical_self+'<br style="clear:both;"/></div>'+elem.getAttribute('href')+'</li>';
	});
	
	report[0] += '<div class="report_section">';
	if(category[1].length > 0){
		report[0] += '<ul>'+category[1]+'</ul>';
	}else{
		report[0] += '<div class="info-alert">There are no link tags to display</div>';
	}
	report[0] += '</div>';
	
	report[0] += '<div id="get-http-response" class="button">Get HTTP Response Headers</div>';
	
	// OPEN GRAPH TAGS | CATEGORY 2
	document.head.querySelectorAll('meta[property="og:title"]').forEach(function(elem){
		category[2] += '<li><div class="label">OG:title</div>'+elem.getAttribute('content')+'</li>';
	});
	document.head.querySelectorAll('meta[property="og:type"]').forEach(function(elem){
		category[2] += '<li><div class="label">OG:type</div>'+elem.getAttribute('content')+'</li>';
	});
	document.head.querySelectorAll('meta[property="og:image"]').forEach(function(elem){
		category[2] += '<li><div class="label">OG:image</div>'+elem.getAttribute('content')+'<br /><img src="'+elem.getAttribute('content')+'" style="max-width:100%;max-height:150px;" /></li>';
	});
	document.head.querySelectorAll('meta[property="og:url"]').forEach(function(elem){
		category[2] += '<li><div class="label">OG:url</div>'+elem.getAttribute('content')+'</li>';
	});
	document.head.querySelectorAll('meta[property="og:description"]').forEach(function(elem){
		category[2] += '<li><div class="label">OG:description</div>'+elem.getAttribute('content')+'</li>';
	});
	
	report[1] += '<div class="report_section">';
	if(category[2].length > 0){
		report[1] += '<ul>'+category[2]+'</ul>';
	}else{
		report[1] += '<div class="info-alert">There are no Open Graph tags to display</div>';
	}
	report[1] += '</div>';
	
	return report;
}

function fetchHeaders(){
	fetch(window.location.href).then(function(response) {
		let report = [''];
		report[0] += '<div class="report_section"><ul>';
		if(response.headers.get('X-Robots-Tag') != null){
		  let robots_index = '<div class="label right green">Index</div>';
		  let robots_follow = '<div class="label right green">Follow</div>';
		  if(response.headers.get('X-Robots-Tag').includes("noindex")){
			robots_index = '<div class="label right red">Noindex</div>';
		  }
		  if(response.headers.get('X-Robots-Tag').includes("nofollow")){
			robots_follow = '<div class="label right red">Nofollow</div>';
		  }
		  report[0] += '<li><div><div class="label left">HTTP X-Robots-Tag</div>'+robots_follow+robots_index+'<br style="clear:both;"/></div>'+response.headers.get('X-Robots-Tag')+'</li>';
		}else{
		  report[0] += '<li class="no-header"><div><div class="label left">HTTP X-Robots-Tag</div><br style="clear:both;"/></div>No header</li>';
		}
		if(response.headers.get('link') != null){
		  report[0] += '<li><div><div class="label left">HTTP Link</div><br style="clear:both;"/></div>'+response.headers.get('link')+'</li>';
		}else{
		  report[0] += '<li class="no-header"><div><div class="label left">HTTP Link</div><br style="clear:both;"/></div>No header</li>';
		}
		report[0] += '</ul></div>';
		
		return report;
	}).then(function(result){
		chrome.runtime.sendMessage({ success: true, report: result });
	});
}

function httpHeadersReport(){
	document.querySelector('#get-http-response').classList.add('disabled');
	document.querySelector('#get-http-response').innerText = 'Fetching...';
	chrome.tabs.executeScript(
    { code: '( '+fetchHeaders+' )()' }, 
	() => {
		chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {
			document.querySelector('#get-http-response').remove();
			document.querySelector('#report-meta').innerHTML += request.report[0];
		  }
		);
	});
}

function generateReport(){
	chrome.tabs.executeScript({
		code: '(' + getMeta + ')();'
	}, (results) => {
		if(results === undefined){
			document.querySelector('#error').style.display = 'block';
		}else{
			document.querySelector('#error').style.display = 'none';
			document.querySelector('#report-meta').innerHTML = results[0][0];
			document.querySelector('#report-og').innerHTML = results[0][1];
			
			document.querySelector('#get-http-response').addEventListener('click', () => {
				httpHeadersReport();
			});
		}
	});
}

document.querySelector('#tab-meta').addEventListener('click', () => {
	document.querySelector('#report-meta').style.display = 'block';
	document.querySelector('#report-og').style.display = 'none';
	document.querySelector('#tab-meta').classList.add('active');
	document.querySelector('#tab-og').classList.remove('active');
});

document.querySelector('#tab-og').addEventListener('click', () => {
	document.querySelector('#report-og').style.display = 'block';
	document.querySelector('#report-meta').style.display = 'none';
	document.querySelector('#tab-og').classList.add('active');
	document.querySelector('#tab-meta').classList.remove('active');
});

document.querySelector('#refresh').addEventListener('click', () => {
	generateReport();
});

window.onload = function() {
	generateReport();
};