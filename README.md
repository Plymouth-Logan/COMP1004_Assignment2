# COMP1004_Assignment2
This project is a time management tool. It allows for the creation of activities, which will then count down in real time, allowing users to select an activity and see how long they have left to complete it. Users can also make activities that will happen in the future, and delete activities they didn't mean to create.

This project was started as many people often have trouble managing their time effectively, procrastinating or forgetting things that they should be doing. This tool will help combat this by reminding them of what they should be doing and how long they have left to do it.

This project contains mostly javascript functions, handling how activites are created/deleted/moved.

The STORAGE object handles most methods involving activity loading (LoadActivity()) and deletion (EndActivity) from LocalStorage. It also handles validity checking for an activity (ActivityLoader()) and what to do with an activity (CheckActivity()).

ShowTimeLeft() allows for ongoing activities to become slected activities, showing their time left within the progressbar at the top of the page. it also begins an interval TimerTick().

CheckSameWeek() is used by tag checking elements to see if two dates are within 7 days of one another.

DeleteElement() helps to physically delete the div off the page, as well as call EndActivity() to delete an activity from LocalStorage.

CheckOngoingActivities() is a method put on a timer to handle the countdown of all non-selected activities, with them being deleted when time runs out. CheckUpcomingActivites() does the same thing, but instead moves activities into ongoing when time runs out.

InsertIntoDiv() handles creating div elements for activites, structuring their data so that they will fit in either the ongoing or upcmoing displays depending on the parameters passed into it. It also handles inputting the elemnts into the correct place within a display, sorting them by their starting times.

TimerTick() handles the currently displayed actvity, updating the progrewssbar with the time it has left, and dynamically changing aspects about the bar (such as its colour), based on the % time remaining the activity has.

activityLogger handles the currently selected activity, as well as the number of activities ongoing. This is important for logic within other functions that relies on the currently selected activity or number of activities.

upcomingLogger holds the tag for upcoming activities to be displayed for (this day, this week, this month). It is important for the upcoming button's funcitonality, allwoing activities to be shown/hidden based on the clicked button.

Comments include many loggers for functions. Functionality for a Node JS server is also commented out, mainly due to lack of time remaining to finish it.
