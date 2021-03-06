/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    dashcode.setupParts();
	loadPrefs();
	versionCheck();
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    // widget.setPreferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
	erasePrefs();
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop any timers to prevent CPU usage
	savePrefs();
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
    // Restart any timers that were stopped on hide
}

//
// Function: sync()
// Called when the widget has been synchronized with .Mac
//
function sync()
{
    // Retrieve any preference values that you need to be synchronized here
    // Use this for an instance key's value:
    // instancePreferenceValue = widget.preferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
    //
    // Or this for global key's value:
    // globalPreferenceValue = widget.preferenceForKey(null, "your-key");
}

//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget
//
// event: onClick event from the done button
//
function showFront(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
		updatePrefs();
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}

// Begin app-specific functions
// api, app, event, note, priority

var wid = widget.identifier;
var prefAPI = loadPref(wid+"api","");
var prefApp = loadPref(wid+"app","Prowler");
var prefPriority = loadPref(wid+"priority",2);

// Preference Saving

function loadPref(key,value) {
	var string = widget.preferenceForKey(key);
	if (string != null) {
		return string;
	} else {
		widget.setPreferenceForKey(value,key);
		return value;
	}
}

function loadPrefs() {
	document.getElementById("api").value = prefAPI;
//	document.getElementById("app").object.setSelectedIndex(prefApp);
	document.getElementById("priority").object.setSelectedIndex(prefPriority);
}

function savePref(key,value) {
	if (window.widget) {
		widget.setPreferenceForKey(value,wid+key);
	}
}

function updatePrefs() {
	if (window.widget) {
		widget.setPreferenceForKey(prefAPI,wid+"api");
		widget.setPreferenceForKey(prefApp,wid+"app");
		widget.setPreferenceForKey(prefPriority,wid+"priority");
	}
}

function erasePrefs() {
	if (window.widget) {
		widget.setPreferenceForKey(null,wid+"api");
		widget.setPreferenceForKey(null,wid+"app");
		widget.setPreferenceForKey(null,wid+"priority");
	}
}

// Basic Functions

function updatePriority(event) {
//	var priority = document.getElementById("priority");
//	prefPriority = parseInt(priority.value);
	prefPriority = document.getElementById("presets").object.getSelectedIndex();
	updatePrefs();
}

function updateApi(event) {
	prefAPI = api.value;
}

// Push to iPhone via Prowl.pl

function push(event) {
	publish();
}

function publish(api,app,event,note,priority){
	api = api || document.getElementById("api").value;
	app = app || "Prowler";
	event = event || document.getElementById("event").value;
	note = note || description.value;
	priority = priority || document.getElementById("priority").object.getValue();
	app = escapeCareful(app);
	event = escapeCareful(event);
	note = escapeCareful(note);

	var request = new XMLHttpRequest();
	var address = "https://prowl.weks.net/publicapi/add?apikey="+api+"&priority="+priority+"&application="+app+"&event="+event+"&description="+note;
	request.open("POST", address, false);
	request.send(null);
	return response(request.responseText);
}

function response(event) {
	if (event.match("code=\"200")){
//		document.getElementById("successText").innerHTML = event;
		showSuccess();
	} else if (event.match("code=\"500")){
		document.getElementById("failText").innerHTML = event;
		showFail();
	} else {
		document.getElementById("wrongText").innerHTML = event;
		showWrong();
	}
}

function escapeCareful(event) {
	return event.replace(/\"/gi,"\\\"");
}

// Key listeners

function selectIt(event) {
	if (event.target) {
		event = event.target
	}
//	event.focus();
	event.select();
}

// CurrentView animations

function showMain(event) {
	document.getElementById("stack").object.setCurrentView("main", false, true);
}

function showSuccess(event) {
	document.getElementById("stack").object.setCurrentView("success", true, true);
}

function showFail(event) {
	document.getElementById("stack").object.setCurrentView("fail", true, true);
}

function showWrong(event) {
	document.getElementById("stack").object.setCurrentView("wrong", true, true);
}

function showUpdate(event) {
	document.getElementById("stack").object.setCurrentView("update", true, true);
}

// Get Key Value

function getKeyValue(plist, key) {
	var infoPlist = new XMLHttpRequest();
	infoPlist.open("GET", plist, false);
	infoPlist.send(null);
	infoPlist = infoPlist.responseText.replace(/(<([^>]+)>)/ig,"").replace(/\t/ig,"").split("\n");
	for (var i=0; i<infoPlist.length; i++)
		if (infoPlist[i] == key) return infoPlist[i+1];
	return false;
}

// Auto Update

function versionCheck(event) {
	var request = new XMLHttpRequest();
	var address = "http://iaian7.com/files/dashboard/prowler/version.php?RandomKey=" + Date.parse(new Date());
	request.open("GET", address,false);
	request.send(null);
	var versions = request.responseText.split("\n");

	var bundleVersion = getKeyValue("Info.plist", "CFBundleVersion"); 
	var websiteVersion = versions[0];
//	alert("bundleVersion: "+bundleVersion);
//	alert("websiteVersion: "+websiteVersion);

	if (websiteVersion != bundleVersion) {
		document.getElementById("newVersion").innerHTML = "version "+versions[0]+"<br/>"+versions[1];
		showUpdate();
	} else {
		alert("you have an up to date version, or there's been an error");
	}
}

// Download File

function versionDownload() {
	widget.openURL("http://iaian7.com/files/dashboard/prowler/Prowler.zip");
	showMain();
}

// Visit the website

function iaian7(event)
{
	widget.openURL("http://iaian7.com/dashboard/prowler");
}