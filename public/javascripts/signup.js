
const signupForm = document.getElementById('signup'),
	usernameField = document.getElementsByName('username')[0],
	emailField = document.getElementsByName('email')[0];

function checkAvailability() {
	const field = this,
		fieldName = this.name,
		fieldValue = encodeURIComponent(this.value);

	if (!fieldValue || fieldValue.length == 0) {
		return true;
	}

	field.classList.remove('success', 'error');

	return new Promise( r => Promise.all([
		fetch(`users/checkAvailability/${fieldName}/${fieldValue}`)
			.then(response => response.json())
			.then(result => {
				if (result) {
					field.classList.add('success');
				} else {
					field.classList.add('error');
				}
			}),

	]) );
}
usernameField.addEventListener('change', checkAvailability);
emailField.addEventListener('change', checkAvailability);

signupForm.addEventListener('submit', function(e) {
	const bodyJSON = JSON.stringify([ 'username', 'email', 'emailConfirm', 'password', 'passwordConfirm' ].reduce((obj, key) => {
		obj[key] = this[key].value;
		return obj;
	}, {}));
	fetch(`/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: bodyJSON
	})
	.then( response => {
		console.log("got response: ", response);
		return response.json();
	})
	.then( result => {
		if (result.ok) {
			window.location = "/";
			console.log("Sucess! Redirect");
		} else {
			// TODO: implement flash
			console.log(`Fail! Flash message '${result.message}'`);
		}
	})
	.catch( err => console.log("Error:", err) );

	e.preventDefault();
});
