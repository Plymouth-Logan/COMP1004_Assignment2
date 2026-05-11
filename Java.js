var interval = 0;
var timeout = 0;

//const currentIntervals = {};

const activityLogger = { //Holds selected activity and number of activities for logic
    selectedActivity: "N/A",
    activityAmount: 0,

    get ActivityNoGet() {
        return this.activityAmount;
    },

    set ActivityNoSet(number) {
        this.activityAmount = number;
    },

    get CurrentActivityGet() {
        return this.selectedActivity;
    },

    set CurrentActivitySet(actname) {
        this.selectedActivity = actname;
    }
}

const upcomingLogger = { //Holds current tag for upcoming display
    currentupcomingDisplayed: "This-Day",

    get UpcomingDisplayedTagGet() {
        return this.currentupcomingDisplayed;
    },

    set UpcomingDisplayedTagSet(tagname) {
        this.currentupcomingDisplayed = tagname;
        //console.log("Tag changed to: " + tagname);
    }
    //Use tagname and change logic to give classes instead of IDs on task creation.
    //Can then get all through elmentsbyclass or queryselectorall
}

/*
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        //console.log(entry);
        if (entry.isIntersecting) { //IsIntersecting == Is on Viewport (What user can see)
            entry.target.classList.add('show');
        }
        else {
            entry.target.classList.remove('show');
        }
    });
});


const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));
*/ //No longer used, may re-implement

const popup = document.getElementById("popup-wrapper");

document.getElementById("open-popup").addEventListener("click", () => { //Allows for activity creation popup
    popup.style.display = "block";
})

document.getElementById("close-popup").addEventListener("click", () => {
    popup.style.display = "none";
})
/*
const register = document.getElementById("register-wrapper");

document.getElementById("open-register").addEventListener("click", () => {
    register.style.display = "block";
})

document.getElementById("close-register").addEventListener("click", () => {
    register.style.display = "none";
})

const login = document.getElementById("login-wrapper");

document.getElementById("open-login").addEventListener("click", () => {
    login.style.display = "block";
})

document.getElementById("close-login").addEventListener("click", () => {
    login.style.display = "none";
})
*/ //Temporarily disabled as login feature not finished

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

const STORAGE = { /* Holds most code to do with LocalStorage and activities */
    //keybase: "Activity-",
    keys: [],
    init() { //Runs on page load
        document.getElementById("btnCreate").addEventListener("click", STORAGE.SaveActivity); //Call the Save function when clicking the Create Activity Button
        setInterval(() => CheckUpcomingActivities(), 1000);
        setInterval(() => CheckOngoingActivities(), 1000);
    },
    SaveActivity() { //Save activity to localstorage
        let activity = document.getElementById("activity-input").value.trim();
        let startTime = document.getElementById("calendar").value.trim();
        let endTime = document.getElementById("duration").value.trim();
        if (activity && startTime && endTime) { //If there is a valid activity and date
            let key = activity + "," + startTime + "," + endTime;
            let storage = localStorage.getItem(key);
            let chars = [];
            if (storage) {
                chars = JSON.parse(storage);
            }
            //Might make only one activity available for any given date
            chars.push(activity);
            chars.push(startTime);
            chars.push(endTime);
            //Need to also add a time inptu for the length of the activity
            chars = Array.from(new Set(chars));
            localStorage.setItem(key, JSON.stringify(chars));
            STORAGE.ActivityLoader(); //In case the user sets an activity to happen now
        }
    },

    ActivityLoader() {
        let storageitemNo = localStorage.length; //Gets all data in LocalStorage
        if (storageitemNo) { 
            //STORAGE.keys = []; //Reset array, not used here
            const ongoingactivities = document.getElementsByClassName("sidebar-activity");
            const ongoingselectedactivity = document.querySelector(".sidebar-activity-selected");
            const upcomingactivities = document.getElementsByClassName("upcoming-activity");
            for (let i = 0; i < storageitemNo; i++) { //Loop through data for each localstorage item
                let valid = true;
                //console.log(i);
                let valuekey = localStorage.key(i);
                let values = localStorage.getItem(valuekey);
                let valuelist = JSON.parse(values);
                //console.log(ongoingactivities);
                for (let j = 0; j < ongoingactivities.length; j++) { //Check if key is the same as any ongoing
                    const activitykey = ongoingactivities[j].id;

                    if (activitykey) {
                        if (valuekey == activitykey) {
                            valid = false;
                        }
                    }
                }
                for (let k = 0; k < upcomingactivities.length; k++) { //Check if the key is the same as any upcoming
                    const upcomingkey = upcomingactivities[k].id;

                    if (upcomingkey) {
                        if (valuekey == upcomingkey) {
                            valid = false;
                        }
                    }
                }
                if (ongoingselectedactivity) {
                    if (valuekey == ongoingselectedactivity.id) { //Check if key is the same as selected activity
                        valid = false;
                    }
                }
                //console.log(valid);
                if (valid) { //If key is not the same as any of those
                    //console.log(valuelist);
                    STORAGE.CheckActivity(valuekey, valuelist, i);
                }
            } 
        }
    },

    CheckActivity(key, val, arraynum) { //Gets Activity Data and Either Loads It onto Page or sets a delay to load it
        var currentTime = new Date().getTime();
        let start = val[1];
        let activityStart = Date.parse(start);
        let end = val[2];
        let activityEnd = Date.parse(end);
        let text = val[0];
        //console.log("Check Activity Values: ");
        //console.log(key);
        //console.log(val);
        //console.log(activityStart);
        //console.log(activityEnd);
        if (activityStart <=  currentTime && activityEnd > currentTime) { //Within Activity Bounds
            //console.log("in activity bounds");
            document.getElementById("current-activity-title").innerHTML = text;
            document.getElementById("default-activity-message").style.display = "none";
            InsertIntoDiv(text, activityStart, activityEnd, "sidebar-activity", "activity-sidebar", "div", arraynum);
            if (activityLogger.ActivityNoGet == 0) { //If this is the first activity being added
                console.log("In logger func");
                var currentActivity = document.getElementsByClassName("sidebar-activity");
                currentActivity[1].className = "sidebar-activity-selected";
                activityLogger.CurrentActivitySet = text;
                if (interval) {
                    clearInterval(interval);
                }
                console.log("timerticking...");
                interval = setInterval(() => TimerTick(activityEnd, activityStart, arraynum), 1000);
                //console.log(activityLogger.CurrentActivityGet);
            }
            activityLogger.ActivityNoSet = activityLogger.ActivityNoGet + 1;
            console.log(activityLogger.ActivityNoGet);
            //console.log(activityLogger.ActivityNoGet);
        }
        else if (activityStart > currentTime) { //Before Activity
            //NEED TO ADD LOGIC TO PREVENT FROM DISPLAYING TWICE (already doesn't save in localstorage twice)
            console.log("display in Upcoming");
            InsertIntoDiv(text, activityStart, activityEnd, "upcoming-activity", "calendar-display", "div", arraynum);
        }
        else if (activityEnd < currentTime) {//Activity has overrun boundaries
            //console.log("activity has already passed");
            STORAGE.EndActivity(key, null);
        }
        else { //Do nothing
            console.log("Error with Checking Activity");
        }
    },

    EndActivity(activityKey, element) { //Delete Finished Activity from LocalStorage
        localStorage.removeItem(activityKey);
        activityLogger.ActivityNoSet = activityLogger.ActivityNoGet - 1;
        console.log(activityLogger.ActivityNoGet);
        var activityNo = activityLogger.ActivityNoGet;
        var selected = false;
        var isSelectedActivity = document.getElementsByClassName("sidebar-activity-selected");
        if (isSelectedActivity) {
            selected = true;
        }
        console.log(element);
        if(element) {
            element.remove();
        }
        if (activityNo == 0) { //If there are no activities left
            document.getElementById("default-activity-message").style.display = "block";

            document.getElementById("current-activity-title").innerHTML = "N/A";

            document.getElementById("time-left-display").innerHTML = "N/A";
    
            document.getElementById("activity-display").style.setProperty("--progress", 0 + "%");
        
            document.getElementById("time-left-display").style.color = "black";
            document.getElementById("activity-display").style.setProperty("--color", "green");
        }
        else if (activityNo > 0 && !selected) { //If last activity isn't the selected one
            //Start another activity
            var upcomingactivities = document.getElementsByClassName("sidebar-activity");
            upcomingactivities[1].className = "sidebar-activity-selected";
            console.log(upcomingactivities);
            //console.log(upcomingactivities[1]);
            var activity = upcomingactivities[1].id;
            var checkedactivityClasses = activity.split(",", 3);
            activityStart = new Date(checkedactivityClasses[1]);
            activityEnd = new Date(checkedactivityClasses[2]);
            text = checkedactivityClasses[0];
            activityLogger.CurrentActivitySet = text;
            if (interval) {
                clearInterval(interval);
            }
            console.log("timerticking...");
            interval = setInterval(() => TimerTick(activityEnd, activityStart, arraynum), 1000);
        }
        if (activityLogger.ActivityNoGet == 1) { //Only one activity left
            console.log("In logger func upcoming");
            var currentActivity = document.getElementsByClassName("sidebar-activity");
            var theid = currentActivity[1].id;
            keyvalue = theid.split(",", 3);
            let activityStart = new Date(keyvalue[1]);
            let activityEnd = new Date(keyvalue[2]);
            currentActivity[1].className = "sidebar-activity-selected";
            activityLogger.CurrentActivitySet = text;
            if (interval) {
                clearInterval(interval);
            }
            console.log(currentActivity);
            interval = setInterval(() => TimerTick(activityEnd, activityStart, 0), 1000);
            //console.log(activityLogger.CurrentActivityGet);
        }
        STORAGE.ActivityLoader();
    }
}

function ShowTimeLeft(event, startact, endact, arraynum) { //Starts timer for activity progress display
    const element =  event.currentTarget;
    //console.log(element);
    var elementparent = element.parentElement;
    const previousselection = document.querySelector(".sidebar-activity-selected");
    elementparent.className = "sidebar-activity-selected";
    if (previousselection) {
        //console.log("changing class");
        previousselection.className = "sidebar-activity";
    }
    if (interval) {
        //console.log("interval being cleared");
        clearInterval(interval);
    }
    document.getElementById("current-activity-title").innerHTML = element.querySelector(".activity-sidebar-text").innerHTML;

    interval = setInterval(() => TimerTick(endact, startact, arraynum), 1000);
    console.log("interval here in Showtimeleft");

}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

function CheckSameWeek(dayone, daytwo) { //Checks if activity is in the same week as current day
    var diff1 = 0;
    var diff2 = 0;
    if(dayone.getDay() == 0) {                           //Need diffs as date - date gives the SUNDAY that they happen, 
        diff1 = dayone.getDate() - (dayone.getDay() + 7);//(as sunday = 0 using getDay) thus sundays will always be in         
    }                                                    //the week ahead of the one they should be comparing to.
    else { 
        //console.log("else");
        diff1 = dayone.getDate() - (dayone.getDay());
    }                          
    if (daytwo.getDay() == 0) {
        diff2 = daytwo.getDate() - (daytwo.getDay() + 7);
    }
    else {
        //console.log("else 2");
        diff2 = daytwo.getDate() - (daytwo.getDay());
    }
    //console.log(diff1);
    //console.log(diff2);
    var date1 = new Date(dayone.getFullYear(), dayone.getMonth(), diff1);
    var date2 = new Date(daytwo.getFullYear(), daytwo.getMonth(), diff2);
    //console.log(date1);
    //console.log(date2);
    if (date1.getTime() == date2.getTime()) {
        //console.log("SameWeek: true");
        return true;
    }
    else {
        //console.log("SameWeek: false");
        return false;
    }
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

function ChangeTag(ChangeTo) { //Change tag being displayed (today, this week, this month)
    upcomingLogger.UpcomingDisplayedTagSet = ChangeTo;
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

function DeleteElement(Element) { //Called from delete buttons on elements
    console.log(Element);
    const wrapper = Element.parentElement;
    const activity = wrapper.parentElement;
    const key = activity.id;

    //Only one interval needs to be handled, that is if current one being deleted is 
    //the activity selected
    //console.log(activity.classList[0]);
    if (activity.classList[0] == "sidebar-activity-selected") { //If currently counting down, delete interval
        console.log(interval);
        if (interval) {
            clearInterval(interval);
            console.log("Clearing interval in DeleteElement....");
            interval = 0;
        }
    }

    if(key) {
        STORAGE.EndActivity(key, activity);
    }

}


//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

function InsertIntoDiv(activityname, activitystartTime, activityendTime, activityclassName, divID, wrapperType, arraynum) {

    //Need to add functionality to potentially make an activity the selected activity in

    //Only creates an activity, doesn't add any timer to upcoming activities (only ongoing)
    console.log("Inserting into Div...");


    var startingtime = new Date(activitystartTime);

    var endingtime = new Date(activityendTime);

    const theactivitywrapper = document.createElement(wrapperType);

    //console.log("arraynum: " +arraynum);
    let thekey = localStorage.key(arraynum);
    let values = localStorage.getItem(thekey);
    let valuelist = JSON.parse(values);
    //console.log(valuelist);
    let createdkey = valuelist[0] + "," + valuelist[1] + "," + valuelist[2];
    
    //console.log(divID);

    theactivitywrapper.id = createdkey;

    const theactivity = document.createElement("p");

    const timewrapper = document.createElement("button");
    
    theactivity.innerHTML = activityname;

    timewrapper.appendChild(theactivity);

    theactivitywrapper.classList.add(activityclassName);

    timewrapper.classList.add(activityclassName + "-button");

    const timeleft = document.createElement("p");

    if (divID === "calendar-display") { //Add upcoming classes and tag

        const defaultupcoming = document.getElementById("default-upcoming-message");

        defaultupcoming.style.display = "none";

        var tagtype = "none";

        var upcomingtag = new Date();

        if (upcomingtag.getMonth() == startingtime.getMonth()) {
            tagtype = "This-Month";
            if (CheckSameWeek(upcomingtag, startingtime)) {
                tagtype = "This-Week";
                if (upcomingtag.getDate() == startingtime.getDate()) {
                    tagtype = "This-Day";
                }
            }
        }
        if (tagtype === upcomingLogger.UpcomingDisplayedTagGet) {
            theactivitywrapper.display = "block";
        }
        else {
            theactivitywrapper.display = "none";
        }

        theactivitywrapper.classList.add(tagtype);

        theactivity.classList.add("activity-upcoming-text");




        timeleft.classList.add("activity-upcoming-timeleft");

        timeleft.innerHTML = startingtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + endingtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (divID === "activity-sidebar") { //Add ongoing classes and events 
        
        timewrapper.addEventListener("click", (e) => {
            ShowTimeLeft(e, activitystartTime, activityendTime, arraynum);
        });
    
        theactivity.classList.add("activity-sidebar-text");
    
        timeleft.classList.add("activity-sidebar-timeleft");

        timeleft.innerHTML = startingtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + endingtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    timewrapper.appendChild(timeleft);  //Add delete button and then form element

    theactivitywrapper.appendChild(timewrapper);

    const deletewrapper = document.createElement("div");

    deletewrapper.classList.add("activity-end-button-wrapper");

    const deletebutton = document.createElement("button");

    deletebutton.innerHTML = "X";

    deletebutton.classList.add("activity-end-button");

    deletebutton.addEventListener("click", () => DeleteElement(deletebutton));

    deletewrapper.appendChild(deletebutton);

    theactivitywrapper.appendChild(deletewrapper);
    

    var display = document.getElementById(divID);

    //console.log(activityclassName);

    var currentelements = document.getElementsByClassName(activityclassName);
    if (activityclassName == "sidebar-activity") {
        currentelements = document.querySelectorAll("."+activityclassName+ ", .sidebar-activity-selected");
    }
    //console.log("Current Elements: ");
    //console.log(currentelements);
    var placed = false;
    if (currentelements.length > 1) { //Place element in correct position
        for (var i = 1; i < currentelements.length; i++) {
            let keyvalue = currentelements[i].id;
            keyvalue = keyvalue.split(",", 3);
            let comparedateStart = new Date(keyvalue[1]);
            let comparedateEnd = new Date(keyvalue[2]);
            if (startingtime < comparedateStart) { //Start date before element being checked against
                console.log("Start date before");
                console.log("Adding activity: " + activityname);
                display.insertBefore(theactivitywrapper, currentelements[i]);
                placed = true;
                break;
            }
            else if (startingtime == comparedateStart) { //Same start date
                console.log("Same start Date");
                if (endingtime < comparedateEnd) { //Ends Earlier
                    display.insertBefore(theactivitywrapper, currentelements[i]);
                    placed = true;
                    break;
                }
                if (endingtime === comparedateEnd) { //Ends Same Time
                    if (activityname.length <= keyvalue[0].length) {
                        display.insertBefore(theactivitywrapper, currentelements[i]);
                        placed = true;
                    }
                    else if (activityname.length > keyvalue[0].length ) {
                        display.appendChild(theactivitywrapper);
                        placed = true;
                    }
                    break;
                }
                if (endingtime > comparedateEnd) { //Ends Later
                    console.log("Ends Later");
                    display.appendChild(theactivitywrapper);
                    placed = true;
                    break;
                }
            }
            else if (startingtime > comparedateStart) { //Start date after element being checked against
                console.log("Nothing");
                continue;
            }
        }
    }
    else if (currentelements.length <= 1) { //If no other elements present, just insert into the divs.
        display.appendChild(theactivitywrapper);
    }
    if (placed === false) {
        display.appendChild(theactivitywrapper);
    }
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

function CheckUpcomingActivities() {
    
    var now = new Date().getTime();

    var upcomingtag = new Date();
        
    var activityNumber = document.getElementsByClassName("upcoming-activity");
    var arraynum = 0;
    //console.log(activityNumber);
    if (activityNumber) { //Look at all upcoming that aren't the default message
        for (var i = 1; i < activityNumber.length; i++) {
            var checkedActivity = activityNumber[i];
            //console.log(i);
            //console.log(checkedActivity);

            var checkedactivityClasses = checkedActivity.id.split(",", 3);
            text = checkedactivityClasses[0];
            startingtime = new Date(checkedactivityClasses[1]);
            endingtime = new Date(checkedactivityClasses[2]);

            if (upcomingtag.getMonth() == startingtime.getMonth()) { //Change tag if timeleft moves into different category
                tagtype = "This-Month";
                if (CheckSameWeek(upcomingtag, startingtime)) {
                    tagtype = "This-Week";
                    if (upcomingtag.getDate() == startingtime.getDate()) {
                        tagtype = "This-Day";
                    }
                }
            }

            if (checkedActivity.classList[1] != upcomingLogger.UpcomingDisplayedTagGet) { //Classlist indexes classes 
                //console.log("No " + checkedActivity.classList[1]);
                checkedActivity.style.display = "none";
            }
            if (checkedActivity.classList[1] === upcomingLogger.UpcomingDisplayedTagGet) { //Classlist indexes classes 
                //console.log("Yes " + checkedActivity.classList[1]);
                checkedActivity.style.display = "block";
            }

            var timeRemaining = startingtime - now;

            var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) { //If no time left before activity should start, turn it into an ongoing activity
                console.log("Time up");

                for (var i = 0; i < localStorage.length; i++) {
                    if (localStorage.key(i) === checkedActivity.id) {
                        arraynum = i;
                    }
                }
                console.log("Removing...");
                checkedActivity.remove();
                activityLogger.ActivityNoSet = activityLogger.ActivityNoGet + 1;
                if (activityLogger.ActivityNoGet > 0) {
                    document.getElementById("default-activity-message").style.display = "none";
                }
                InsertIntoDiv(text, startingtime, endingtime, "sidebar-activity", "activity-sidebar", "div", arraynum);
            }
        }
    }
}

//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------

function CheckOngoingActivities() {
        //console.log("Checking Ongoing");
        activityNumber = document.getElementsByClassName("sidebar-activity");
        var now = new Date().getTime();
        //console.log(activityNumber);
        if (activityNumber) { //Look at all ongoing activities that are NOT the default message
            for (var i = 1; i < activityNumber.length; i++) {
                var checkedActivity = activityNumber[i];
                //console.log(i);
                //console.log(checkedActivity);

                var checkedactivityClasses = checkedActivity.id.split(",", 3);
                startingtime = new Date(checkedactivityClasses[1]);
                endingtime = new Date(checkedactivityClasses[2]);

                var timeRemaining = endingtime - now;

                var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                //console.log(days);
                //console.log(seconds);

                if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) { //If activity is due to finish and isn't selected, end it anyway
                    console.log("Time up Ongoing");

                    STORAGE.EndActivity(checkedActivity.id, checkedActivity)
                }
            }
        }

}

//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------

function TimerTick(targetDate, startDate, arraynumber) { //Timer for currently displayed activity
    var now = new Date().getTime();

    var overallTime = targetDate - startDate;

    var elapsedTime = Math.round(now - startDate); //Need round as otherwise get large decimal 

    //elapsedTime = elapsedTime / 1000;

    var progval = Math.round((elapsedTime/ overallTime) * 100); //Rounding

    //console.log(progval);

    //console.log(elapsedTime);

    //console.log(overallTime);

    document.getElementById("activity-display").style.setProperty("--progress", progval + "%"); //Change Progress Bar percentage

    console.log("Progress: ", + progval + "%");

    var timeRemaining = targetDate - now;

    //console.log(timeRemaining);

    if (progval < 100) { //Change color of text and progress bar based on how far along the activity is, and get values for time left
        if (progval >= 0 && progval < 50) {
            document.getElementById("time-left-display").style.color = "green";
            document.getElementById("activity-display").style.setProperty("--color", "green");
        }
        if (progval >= 50 && progval < 75) {
            document.getElementById("time-left-display").style.color = "orange";
            document.getElementById("activity-display").style.setProperty("--color", "orange");
        }
        if (progval >= 75 && progval < 100) {
            document.getElementById("time-left-display").style.color = "red";
            document.getElementById("activity-display").style.setProperty("--color", "red");
        }
        var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    }

    if (progval >= 100) { //When activity finishes
        var days = 0;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        document.getElementById("time-left-display").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";
        clearInterval(interval);
        const element = document.querySelector(".sidebar-activity-selected");
        STORAGE.EndActivity(element.id, element); //Ends + Deletes activity
    }

    document.getElementById("time-left-display").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s "; //Display time left
}

document.addEventListener("DOMContentLoaded", STORAGE.init); //init when loading up
document.addEventListener("DOMContentLoaded", STORAGE.ActivityLoader); //Load activities when loading up


//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

//Node.js Stuff

/*
const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

*/ //Unimplemented for now