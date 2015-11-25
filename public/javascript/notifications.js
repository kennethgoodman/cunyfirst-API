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
showNotification("This Class","http://icons.iconarchive.com/icons/icons8/android/256/Very-Basic-Checkmark-icon.png","/account");
//showNotification("bodyText","",""); for testing notifications