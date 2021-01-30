function getMeta() {
	let report = [''];
	
	report[0] += '<div class="report_section"><ul>';
	document.head.querySelectorAll('title').forEach(function(elem){
		report[0] += '<li><div class="label">Title</div>'+elem.innerText+'</li>';
	});
	document.head.querySelectorAll('[name=description]').forEach(function(elem){
		report[0] += '<li><div class="label">Description</div>'+elem.getAttribute('content')+'</li>';
	});
	document.head.querySelectorAll('[name=robots]').forEach(function(elem){
		report[0] += '<li><div class="label">Robots</div>'+elem.getAttribute('content')+'</li>';
	});
	report[0] += '</ul></div>';
	
	return report;
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
		}
	});
}

document.querySelector('#tab-meta').addEventListener('click', () => {
	document.querySelector('#report-meta').style.display = 'block';
	document.querySelector('#tab-meta').classList.add('active');
});

document.querySelector('#refresh').addEventListener('click', () => {
	generateReport();
});

window.onload = function() {
	generateReport();
};