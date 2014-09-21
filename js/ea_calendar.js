'use strict';

(function($){
    $.fn.eaCalendar = function(options){
        var __this = this,
            calendar_keys = null,
            events = null,
            $calendarBody = null,
            $calendarHeadRow = null,
            $calendar = $("<table></table>");

        var loadEvents = function(data){
            events = data;
            $calendarBody = $calendar.append("<tbody>").find("tbody");

            $.each(events, function(index, event){
                var $headers = $calendarHeadRow.find("th"),
                    $thisRow = $calendarBody.append("<tr>").find("tr:last-child");

                $.each($headers, function(index, header){
                    debugger;
                    var key = header.textContent.trim();

                    if(event.hasOwnProperty(key)){
                        $thisRow.append("<td>" + event[key] + "</td>");
                    }else{
                        $thisRow.append("<td></td>");
                    };
                });
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