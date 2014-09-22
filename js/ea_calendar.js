'use strict';

(function($){
    $.fn.eaCalendar = function(options){
        var __this = this,
            calendar_keys = null,
            events = null,
            $calendarBody = null,
            $calendarHeadRow = null,
            $calendar = $("<table></table>");

        var getDate = function(time_string){
            var date = new Date(),
                time = time_string.replace(/:/g, "");

            date.setHours(parseInt(time.substring(0,2)),
                    parseInt(time.substring(2,4)),
                    parseInt(time.substring(4,6)));

            return date;
        };

        var addDetailedView = function(date){
            var now = new Date(),
                time_difference = ((date - now) / (1000 * 60)).toFixed(2),
                mins = time_difference >= 10 ? time_difference : "0" + Math.floor(time_difference),
                secs = Math.floor((time_difference % 1) * 60),
                triggerInterval = null;

                secs = secs >= 10 ? secs : "0" + secs;

            if(time_difference >= 0 && time_difference <= 15){
                var $detailsRow = $calendarBody.append("<tr>").find("tr:last-child"),
                    counter = (time_difference >= 15) ? "14:59" : mins + ":" + secs;

                $detailsRow.append("<td class='countdown_timer'>"
                    + counter + "</td>");

                var appendNewTime = function(){
                    var $timer = $detailsRow.find(".countdown_timer"),
                        time = $timer.text(),
                        mins = parseInt(time.match(/^\d*/)[0]),
                        secs = parseInt(time.match(/\d*$/)[0]) - 1;

                    debugger;

                    if(secs === 0){
                        mins != 0 ? mins-- : mins;

                        if(mins === 0){
                            clearInterval(triggerInterval);
                        }else{
                            secs = 59;
                        };
                    };

                    if(mins < 10){
                        mins = "0" + mins;
                    };

                    if(secs < 10){
                        secs = "0" + secs;
                    };

                    

                    $timer.text(mins + ":" + secs)
                };

                triggerInterval = setInterval(appendNewTime, 1000);
            };
        };

        var loadEvents = function(data){
            events = data;
            $calendarBody = $calendar.append("<tbody>").find("tbody");

            $.each(events, function(index, event){
                var $headers = $calendarHeadRow.find("th"),
                    $thisRow = $calendarBody.append("<tr>").find("tr:last-child"),
                    date = getDate(event["Time"]);

                $.each($headers, function(index, header){
                    var key = header.textContent.trim();

                    if(event.hasOwnProperty(key)){
                        $thisRow.append("<td>" + event[key] + "</td>");
                    }else{
                        $thisRow.append("<td></td>");
                    };
                });

                addDetailedView(date);
            });

            __this.append($calendar);
        };

        var loadCalendarKeys = function(data){
            calendar_keys = data;			
            $calendarHeadRow = $calendar.append("<thead><tr></tr></thead>").find("thead tr");

            $.each(calendar_keys, function(index, key){
                $calendarHeadRow.append("<th>" + key +"</th>");
            });

            $.ajax({
                url: options.events_url,
                dataType: "json"
            }).done(loadEvents);
        };

        $.ajax({
            url: options.calendar_keys_url,
            dataType: "json"
        }).done(loadCalendarKeys);
    };
})(jQuery);


jQuery("#ea_calendar").eaCalendar({
    calendar_keys_url: "js/data/calendar_keys.json",
    events_url: "js/data/calendar_events.json"
});