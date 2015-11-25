var Notification = window.Notification || window.mozNotification || window.webkitNotification;

Notification.requestPermission(function (permission) {
	// console.log(permission);
});

function showNotification(bodyText, icon, link) {
	var instance = new Notification(
		"Class Added", {
			body: bodyText,
            icon: icon,
		}
	);
	instance.onclick = function () {
		window.location.href = link;
	};
	instance.onerror = function () {
		// Something to do
	};
	instance.onshow = function () {
		// Something to do
	};
	instance.onclose = function () {
		
	};
}
//showNotification("bodyText","",""); for testing notifications