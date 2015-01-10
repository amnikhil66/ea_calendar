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
            return new Date(time_string);
        };

        var request = function(url, data_type){
            return $.ajax({
                url: url,
                dataType: data_type
            });
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
                $detailsRow.append("<td class='chart-container' colspan='8'><div id='" + chart_id + "'></div></td>");

                var deleteRow = function(){
                    $detailsRow.remove();
                };

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

                    return generateChart("#" + chart_id, currencyPairsData);
                };

                var sortData = function(data){
                    detailsRow.data = {
                        "Pairs": [],
                        "PiPs": [
                            Math.min.apply(null, data["PiPs"]),
                            Math.max.apply(null, data["PiPs"])  
                        ]
                    };
                    data["Pairs"] = [
                        data["Pairs"][data["PiPs"].indexOf(temp["PiPs"][0])],
                        data["Pairs"][data["PiPs"].indexOf(temp["PiPs"][1])]
                    ];

                    // Figure out a way to maintain the chart object
                    $detailsRow.chart = appendChart(temp);
                };

                var getData = function($ele){
                    var $prev = $ele.prev(),
                        currency = $prev.find("td:nth-child(2)").text().trim().toUpperCase(),
                        url = "/tools/widgets/cc_2_" + currency + "1440";

                        request(url, "json").done(sortData);
                };

                var updateCalendar = function(){
                    request(options.events_url, "json").done(processUpdate);
                };

                var processUpdate = function(data){
                    var $prev = $ele.prev(),
                        event_name = $prev.find("td:nth-child(3)").text().trim().toUpperCase(),
                        $actual = $prev.find("td:nth-child(5)"),
                        event = $.grep(data, function(e){
                            return !!e["Event"].trim().toUpperCase() === event_name;
                        });

                        if(!!event && !jQuery.isEmptyObject(event)){
                            if(parseFloat(event["Actual"]) > parseFloat(event["Previous"])){
                                $detailsRow.chart.load({
                                    "Pairs": [$detailsRow.data["Pairs"][1]],
                                    "PiPs": [$detailsRow.data["PiPs"][1]]
                                });
                            }else{
                                $detailsRow.chart.load({
                                    "Pairs": [$detailsRow.data["Pairs"][0]],
                                    "PiPs": [$detailsRow.data["PiPs"][0]]
                                });
                            }
                        }
                };

                var appendNewTime = function(){
                    var $timer = $detailsRow.find(".countdown_timer"),
                        time = $timer.text(),
                        mins = parseInt(time.match(/^\d*/)[0]),
                        secs = parseInt(time.match(/\d*$/)[0]) - 1;

                    if(mins < 15){
                        $detailsRow.removeClass("hidden");
                        getData($detailsRow);
                    }

                    if(secs === 0){
                        mins !== 0 ? mins-- : mins;

                        if(mins === 0){
                            clearInterval(triggerInterval);
                            updateCalendar();
                            setTimeout(deleteRow, 3600000);
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
                    date = getDate(event["Date"]);

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

            request(options.events_url, "json").done(loadEvents);
        };

        request(options.calendar_keys_url, "json").done(loadCalendarKeys);
    };
})(jQuery);