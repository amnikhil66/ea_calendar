(function($){
    "use strict";

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
                mins = time_difference >= 10 ? Math.floor(time_difference) : "0" + Math.floor(time_difference),
                secs = Math.floor((time_difference % 1) * 60),
                triggerInterval = null;

            secs = secs >= 10 ? secs : "0" + secs;

            if(time_difference >= 0){
                var $detailsRow = $calendarBody.append("<tr>").find("tr:last-child"),
                    chart_id = "cc_chart_" + (Math.floor(Math.random() * secs)),
                    counter = mins + ":" + secs;

                $detailsRow.addClass("additional-details-container").append("<td class='countdown_timer'>" +
                    counter + "</td>");
                $detailsRow.append("<td class='random-text'>Random Text</td>");
                $detailsRow.append("<td class='chart-container'><div id='" + chart_id + "'></div></td>");

                var appendChart = function(){
                    var currencyPairsData = {
                        x: "Pairs",
                        url: "js/data/cc_2_EUR_1.json",
                        mimeType: "json",
                        type: "bar",
                        color: function(color, d){
                            return !!d.value ? (d.value > 0 ? "#1bc45b" : "#ec3232") : color;
                        },
                        refresh_interval: 2000,
                        axis: {
                            x: {
                                type: "category",
                                label: "Currency"
                            },
                            y: {
                            label: "PiPs",
                                min: -5,
                                max: 5
                            }
                        }
                    };

                    generateChart("#" + chart_id, currencyPairsData);
                };

                var appendNewTime = function(){
                    var $timer = $detailsRow.find(".countdown_timer"),
                        time = $timer.text(),
                        mins = parseInt(time.match(/^\d*/)[0]),
                        secs = parseInt(time.match(/\d*$/)[0]) - 1;

                    if(mins < 15){
                        $detailsRow.removeClass("hidden");
                    }

                    if(secs === 0){
                        mins !== 0 ? mins-- : mins;

                        if(mins === 0){
                            clearInterval(triggerInterval);
                            appendChart();
                        }else{
                            secs = 59;
                        }
                    }

                    if(mins < 10){
                        mins = "0" + mins;
                    }

                    if(secs < 10){
                        secs = "0" + secs;
                    }

                    $timer.text(mins + ":" + secs);
                };

                if(time_difference > 15){
                    $detailsRow.addClass("hidden");
                }

                triggerInterval = setInterval(appendNewTime, 1000);
            }
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
                    }
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