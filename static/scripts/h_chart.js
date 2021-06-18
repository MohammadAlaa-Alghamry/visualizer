function h_chart(data, chart_info)
{

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CHART TITLE: 
    // --------------
    // add title to page then add url to title:
    // ---------------------------------------
    d3.select("#chart-title")
            .attr("href", chart_info.url)
            .html(chart_info.acc_name);
    // ----------------------------------------------------------------------------------------------------

    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // DATA SECTION: 
    // --------------
    // check and format data:
    // ----------------------
    data = JSON.parse(data);
    
    // load values from data:
    // ----------------------
    var debits = [];
    for (var i = 0; i < data.length; i++) {
        debits.push(Number(data[i].debit));
    }

    // load values from data:
    // ----------------------
    var credits = [];
    for (var i = 0; i < data.length; i++) {
        credits.push(Number(data[i].credit));
    }
    
    // load account names from data:
    // -----------------------------
    var acc_names = [];
    for (var i = 0; i < data.length; i++) {
        acc_names.push(data[i].acc_name);  // .substring(-1, 10));
    }
    // ----------------------------------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CONTAINER POINTER AND DIMENSIONS: 
    // ---------------------------------
    var container = d3.select("#whole-charts-container")
                            .append("div")
                                .attr("class", "h-charts-container")
                                .attr("width", "1050")
                                .attr("height", "10000");
    // ----------------------------------------------------------------------------------------------------

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CHART INFO: 
    // --------------
    // *****************************************************************************************************
    // create div for info above chart:
    // --------------------------------
    var info_rect = container.append("div")
                                    .attr("class", "info")
                                    .attr("width", 300)
                                    .attr("height", 150)
                                    .attr("fill", "black");

    // set a function for formatting money values:
    // -------------------------------------------
    var format_num = d3.format(",.0f");

    // add acc_name and page url to title:
    // -----------------------------------
    d3.select("#chart-title")
            .attr("href", chart_info.url)
            .html(chart_info.acc_name);

    // calculate totals and append to info div:
    // ----------------------------------------
    var chart_total_debit = info_rect.append("h1")
                                    .attr("class", "chart-debit-total")
                                    .html(format_num(0 - d3.sum(debits)) + "<span style='color: goldenrod;'> USD</span>");

    var chart_total_credit = info_rect.append("h1")
                                        .attr("class", "chart-credit-total")
                                        .html(format_num(d3.sum(credits)) + "<span style='color: goldenrod;'> USD</span>");

    // var name_text = info_rect.append("h1")
    //                 .attr("class", "acc_name")
    //                 .html("-");

    // var value_text = info_rect.append("h1")
    //                 .attr("class", "acc_value")
    //                 .html("-");
    // ----------------------------------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CHART SECTION: 
    // --------------
    // *****************************************************************************************************
    // set dimensions:
    // ---------------
    var barHeight = 35;
    var barPadding = 3;
    var barStart = 320;
    var chartWidth = "100%";
    var chartHeight = 10000;

    // set a pointer to chart and append it to container
    var h_chart = container.append("svg")
                                .attr("class", "h_chart")
                                .attr("width", chartWidth)
                                .attr("height", chartHeight);
    
    // set scales:
    // ----------
    var xScale = d3.scaleLinear()
                        .range([0, container.attr("width") - barStart])
                        .domain([d3.min(debits), d3.max(debits)]);




    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BARS SECTION: 
    // -------------
    // *****************************************************************************************************
    //
    // add debit bars to chart:
    // ------------------------
    var debit_bars = h_chart.append("g").attr("class", "h-bars-debit-g")
                                .selectAll("rect")
                                    .data(data).enter()
                                    .append("rect")
                                        .attr("class", "h-bars-debit")
                                        .attr("x", barStart)
                                        .attr("y", function(d, i)
                                        {
                                            return i * barHeight;
                                        })
                                        .attr("width", function(d)
                                        {
                                            return xScale(d.debit);
                                        })
                                        .attr("height", barHeight - barPadding)
                                        .attr("fill", "rgb(219, 43, 43)");
    // ----------------------------------------------------------------------------------------------------
    
    // add credit bars:
    // ----------------
    var credit_bars = h_chart.append("g").attr("class", "h-bars-credit-g")
                                    .selectAll("rect")
                                        .data(data).enter()
                                        .append("rect")
                                            .attr("class", "h-bars-credit")
                                            .attr("x", barStart)
                                            .attr("y", function(d, i) {
                                                return i * barHeight;
                                            })
                                            .attr("width", function(d) {
                                                return xScale(d.credit);
                                            })
                                            .attr("height", barHeight - barPadding); // - barHeight / 2.3)
    // ----------------------------------------------------------------------------------------------------

    // include names and values into debit and credit bars in text nodes:
    // ------------------------------------------------------------------
    // *** 1 -> add acc_names:
    // -------------------

    // to debit bars:
    // --------------
    add_acc_name(debit_bars, data, "acc_name")

    // to credit bars:
    // ---------------
    add_acc_name(credit_bars, data, "acc_name")

    // *** 2 -> add values:
    // ----------------
    
    // to debit bars:
    // --------------
    debit_bars.append("text")
                    .attr("class", "value")
                    .text(function(d) {
                        return "$ " + format_num(d.debit);
                    });

    // to credit bars:
    // ---------------
    credit_bars.append("text")
                    .attr("class", "value")
                    .text(function(d) {
                        return "$ " + format_num(d.credit);
                    });
    // add_value(debit_bars, data, "debit")  //////// this function still under construction at the FUNCTIONS SECTION
    // ----------------------------------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CHART INFO: 
    // --------------
    // *****************************************************************************************************
    // add ylabels:
    // ------------
    h_chart.append("g")
    .attr("class", "h-chart-ylabels-g")
    .selectAll("text")
        .data(data).enter()
        .append("text")
            .attr("class", "h-chart-ylabels")
            .text(function(d) {
                return d.acc_name;
            })
            .attr("y", function(d, i) {
                return i * barHeight + barHeight / 2;
            })
            .attr("x", barStart - 10)
            .attr("text-anchor", "end");
    // ----------------------------------------------------------------------------------------------------

    // add status labels to h_bars:
    // ----------------------------
    h_chart.append("g").attr("class", "h-bars-status-labels-g")
                .selectAll("text")
                .data(data).enter()
                .append("text").attr("class", "h-bars-status-labels")
                    .text(function(d) {
                        return format_num(d.credit - d.debit);
                    })
                    .attr("fill", function(d) {
                        if (d.debit > d.credit){
                            return "rgb(219, 43, 43)";
                        } else {
                            // return "green";
                            return "#1b61c2";
                        }
                    })
                    .attr("y", function(d, i) {
                        return i * barHeight + barHeight / 2;
                    })
                    .attr("x", function(d) {
                        return xScale(Math.max(d.debit, d.credit)) + barStart + 10;
                    })
                    .attr("text-anchor", "start");
    // ----------------------------------------------------------------------------------------------------    


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EVENTS SECTION: 
    // --------------  
    // display included text values on "mouseover":
    // --------------------------------------------
    
    // to debit_bars:
    // --------------
    display_bar_info_mouse(debit_bars, "rgb(219, 43, 43)", "Credit");
    
    // to credit_bars:
    // ---------------
    display_bar_info_mouse(credit_bars, "#1b61c2", "Debit");
    
    // clear displayed data on "mouseout":
    // --------------------
    
    // from debit_bars:
    // ----------------
    clear_bar_info(debit_bars);

    // from credit_bars:
    // -----------------
    clear_bar_info(credit_bars);
    // ----------------------------------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS SECTION:
    // ----------------------------------------------------------------------------------------------------       
    // 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----------------------------------------------------------------------------------------------------
    // define a function:
    // displays acc_name and value of each bar at top right corner above the chart
    function display_bar_info_mouse(elm, color, acc_type)
    {
        elm.on("mouseover", function()
        {
            current = d3.select(this);
            cur_text = current.select(".acc_name").text();
            cur_value = current.select(".value").text();
            cur_width = Number(current.attr("width"));
            // console.log("cur_text: ", cur_text);

            current.attr("fill", "red")
                        .attr("opacity", "0.5");

            // // add acc_name on top left of chart
            // name_text.html(cur_text);
            //                 // .style("color", "black");
            // // add value on top left of chart
            // value_text.html("<span style='color:" + color + "'> " + cur_value + " </span>");
            //                 // .style("color", "green");

            h_chart.append("rect").attr("class", "temp-rect")
                        .attr("height", 170)
                        .attr("width", 600)
                        .attr("y", function() {
                            return Number(current.attr("y")) + barHeight - barPadding;
                        })
                        .attr("x", function() {
                            return cur_width + barStart - cur_width / 1.7;
                        });
            
            h_chart.append("text").attr("class", "temp-text").attr("id", "temp-text-acc_type")
                        .text(acc_type)
                            .attr("fill", color)
                            .attr("x", function() {
                                return cur_width + barStart - cur_width / 1.7 + 570;
                            })
                            .attr("y", Number(current.attr("y")) + barHeight + 35)

            h_chart.append("text").attr("class", "temp-text").attr("id", "temp-text-acc_name")
                    .text(cur_text)
                        .attr("x", function() {
                            return cur_width + barStart - cur_width / 1.7 + 570;
                        })
                        .attr("y", Number(current.attr("y")) + barHeight + 80)

            h_chart.append("text").attr("class", "temp-text").attr("id", "temp-text-value")
                    .text(cur_value)
                        .attr("fill", color)
                        .attr("x", function() {
                            return cur_width + barStart - cur_width / 1.7 + 570;
                            // return cur_width + barStart - cur_width / 1.7;
                        })
                        .attr("y", Number(current.attr("y")) + barHeight + 130)
            });
    }
    // end definition.
    // ------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----------------------------------------------------------------------------------------------------
    // define a function:
    // displays the acc_name and value of each bar at top right corner above the chart:
    // --------------------------------------------------------------------------------
    function display_tick_info_mouse(ticks)
    {
        ticks.on("mouseover", function()
        {
            current = d3.select(this);
            cur_text = current.select(".acc_name").text();
            cur_value = current.select(".value").text();
            // console.log("cur_text: ", cur_text);

            current.select(".x_labels")
                    .attr("fill", "red")
                        .attr("opacity", "0.7");

            // add acc_name on top left of chart
            name_text.html(cur_text);
                            // .style("color", "black");
            // add value on top left of chart
            value_text.html("USD " + format_num(cur_value));
                            // .style("color", "green");
            });
    }
    // end definition.
    // ------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----------------------------------------------------------------------------------------------------
    // define fuction:
    // remove info from info rect. and restore original state of element that has the event
    function clear_bar_info(bars)
    {
        bars.on("mouseout", function()
        {
            d3.select(this)
                    .attr("fill", "#1c1c33")
                    .attr("opacity", "1");
                    // .attr("width", function(){
                    //     return barWidth - barPadding;
                    // });

            d3.selectAll(".temp_text")
                    .remove();

            // remove values from top right of chart
            // name_text.html("-");
            // value_text.html("-");

            d3.selectAll(".temp-rect").remove();
            d3.selectAll(".temp-text").remove();
        });
    }
    // end definition.
    // ------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----------------------------------------------------------------------------------------------------
    // define fuction:
    // removes info from info rect. and restore original state of element that has the event:
    // --------------------------------------------------------------------------------------
    function clear_tick_info(ticks)
    {
        ticks.on("mouseout", function()
        {
            d3.select(this)
                    .select(".x_labels")
                    .attr("fill", "black")
                    .attr("opacity", "1");
                    // .attr("width", function(){
                    //     return barWidth - barPadding;
                    // });

            d3.selectAll(".temp_text")
                    .remove();

            // remove values from top right of chart
            name_text.html("-");
            value_text.html("-");
        });
    }
    // end definition.
    // ------------------------------------------------------------------------


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----------------------------------------------------------------------------------------------------
    // define fuction:
    // include account names into bars
    function add_acc_name(elm, data, key)
    {
        elm.append("text")
                .attr("class", "acc_name")
                .text(function(d) {
                    return d[key];
                });
    }
    // end definition.
    // ------------------------------------------------------------------------
                    

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----------------------------------------------------------------------------------------------------
    // define fuction:
    // include values into bars
    // function add_value(elm, data, key)
    // {
    //     elm.append("g")
    //             .attr("class", "value-g")
    //             .selectAll("text").data(data).enter()
    //             .append("text")
    //                 .attr("class", "value")
    //                 .text(function(d) {
    //                     return "$ " + format_num(d[key]);
    //                 });
    // }


}












    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BARS SECTION: 
    // *****************************************************************************************************
    //
    // add debits bars labels
    // h_chart.append("g")
    //             .attr("class", "h-bars-labels-g")
    //             .selectAll("text")
    //             .data(values).enter()
    //             .append("text")
    //                 .attr("class", "h-bars-val-labels")
    //                 .text(function(d)
    //                 {
    //                     return format_num(d);
    //                 })
    //                 .attr("y", function(d, i)
    //                 {
    //                     return i * barHeight + barHeight / 1.3;
    //                 })
    //                 .attr("x", function(d)
    //                 {
    //                     return xScale(d) + barStart + 10;
    //                 })
    //                 .attr("text-anchor", "start");
    
    // add credit bars labels
    // h_chart.append("g")
    //             .attr("class", "h-bars-labels-g")
    //             .selectAll("text")
    //             .data(credit).enter()
    //             .append("text")
    //                 .attr("class", "h-bars-credit-labels")
    //                 .text(function(d)
    //                 {
    //                     return format_num(d);
    //                 })
    //                 .attr("y", function(d, i)
    //                 {
    //                     return i * barHeight + barHeight / 3;
    //                 })
    //                 .attr("x", function(d)
    //                 {
    //                     return xScale(d) + barStart + 10;
    //                 })
    //                 .attr("text-anchor", "start")
    //                 .attr("fill", "black");
    ///////////////////////////////////////////////////////////////////////////////////////////
    // testing h_chart events
    // ----------------------
    // d3.select(".h-bars-pay")
    //         .on("mouseover", function(){
    //             h_chart.append
    //         })
    ///////////////////////////////////////////////////////////////////////////////////////////