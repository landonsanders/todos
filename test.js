function ok(truth, message) {
	var value = (truth)? 'Pass: ' + message: 'Fail: ' +  message;

	console.log(value);
}

function test(description, callback) {
	console.log(description);

	callback();
}


