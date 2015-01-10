var generateChart = function(id, data){
    var chartContainer = null,
        has_nav = false,
        chartInterval = null,
        chart = null,
        c3Options = {
            bindto: id,

            grid: {
                y: {
                    lines: [{value: 0}]
                }
            }
        },
        dataObj = {
            type: data.type,

            labels: true
        };
    
    if(data.hasOwnProperty("url")){
        dataObj.url = data.url;
        dataObj.mimeType = data.mimeType;
    }else{
        dataObj.columns = data.data;
    }

    c3Options.data = dataObj;

    var refreshChart = function(chart, options){
        chart.load(options);
    };

    var clearChartInterval = function(){
        if(!!chartInterval){
            clearInterval(chartInterval);
            chartInterval = null;
        }
    };

    var chartSetInterval = function(){
        clearChartInterval();
        chartInterval = setInterval(function(){
            refreshChart(chart, {
                url: c3Options.data.url,
                mimeType: "json"
            });
        }, data.refresh_interval);

    };

    var redrawChart = function(url){
        c3Options.data.url = url;

        refreshChart(chart, c3Options);
        chartSetInterval();
    };

    for(var key in data){
        switch(key){
            case "x": {
                c3Options.data[key] = data[key];
            };
            break;
            case "axis":  {
                c3Options[key] = data[key];
            };
            break;
            default: {
                //Think of something
            }
        };
    };

    if(data.hasOwnProperty("colors")){
        c3Options.data["colors"] = data.colors;
    }

    if(data.hasOwnProperty("color")){
        c3Options.data["color"] = data.color;
    }

    if(data.hasOwnProperty("onclick")){
        var onclickOptions = data.onclick;

        has_nav = onclickOptions.hasOwnProperty("navigation") && !!onclickOptions.navigation;

        var callback = function(d){

            refreshChart(this, {
                url: onclickOptions.url,

                mimeType: onclickOptions.mimeType,
                
                type: onclickOptions.type
            });

            if(has_nav){
                chartContainer = d3.select(data.onclick.navigation.container);

                var legend = chartContainer
                    .insert("div", onclickOptions.navigation.id)
                        .attr("class", "navigation-legend");

                legend.append("span").attr("class", "navigation-legend-label").html(onclickOptions.navigation.label);
            }

            if(!!onclickOptions.dropdown_selector){
                var dropdown = chartContainer
                    .insert("div", onclickOptions.navigation.id)
                        .attr("class", "change-timeline-container")
                        .append("select").attr("class", "change-timeline");

                dropdown.append("option").attr("selected", "selected")
                    .attr("value", "js/data/ea_hist_2_w.json").html("1 Week");
                dropdown.append("option").attr("value", "js/data/ea_hist_2_m.json").html("1 Month");
            }
        };

        c3Options.data.onclick = callback;
    }

    chart = c3.generate(c3Options);

    if(has_nav){
        chartContainer[0][0].addEventListener("click", function(event){
            if(event.target && (event.target.className === "navigation-legend" || 
                event.target.className === "navigation-legend-label")){
                chart.load(c3Options.data);

                event.target.className === "navigation-legend-label" ? event.target.remove() :
                    event.target.parentNode.remove();

                d3.select(".change-timeline-container").remove();
            }
        });
        chartContainer[0][0].addEventListener("change", function(event){
            if(event.target && (event.target.className === "change-timeline")){
                refreshChart(chart, {
                    url: event.target.value,
                    mimeType: "json"
                });
            }
        });
    }

    if(data.hasOwnProperty("refresh_interval")){
        chartSetInterval();
    }

    return {
        chart: chart,
        redrawChart: redrawChart
    };
};