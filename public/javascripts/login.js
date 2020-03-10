
const loginForm = document.getElementById('login');

loginForm.addEventListener('submit', function(e) {

	e.preventDefault();

	fetch(`/users/${this.username.value}/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			username: this.username.value,
			password: this.password.value
		})
	})
	.then( response => {
		console.log("got response: ", response);
		return response.json();
	})
	.then( result => {
		if (result.success) {
			window.location = "/";
		} else {
			// TODO: implement flash
			console.log(`Fail! Flash message '${result.message}'`);
		}
	})
	.catch( err => console.log("Error:", err) );

});
