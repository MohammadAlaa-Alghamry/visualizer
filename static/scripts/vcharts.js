function vchart(data, chart_info)
{
    // check and format data
    console.log("parsed@visualize: ", JSON.parse(data));

    data = JSON.parse(data);
    //console.log("data.length: " + data.length);
    //console.log("data.debit: ", data[0].debit);
    //console.log("data.acc_name: ", data[0].acc_name);

    // load debit values from data
    var debits = [];
    for (var i = 0; i < data.length; i++){
        debits.push(data[i].debit);
    }
    //console.log("debits: ", debits);  // check values

    // load credit values
    var credits = [];
    for (var i = 0; i < data.length; i++){
        credits.push(data[i].credit);
    }
    //console.log("credits: ", credits);  // check values
    
    // get account names from data
    var acc_names = [];
    for (var i = 0; i < data.length; i++)
    {
        acc_names.push(data[i].acc_name);  // .substring(-1, 10));
    }
    //console.log("names: ", acc_names);  // check values
    
    // set up the container for the chart
    var container = d3.select("#whole-charts-container")
                            .append("div")
                            .attr("class", "v-chart-container")
                            .attr("width", 1300);
                            // .append("div")
                            //     .attr("class", "chart-container");

    var info_rect = container.append("div")
                    .attr("class", "info")
                    .attr("width", 300)
                    .attr("height", 150)
                    .attr("fill", "black");
    

    // store a function to format values as money
    var format_num = d3.format(",.2f");
                    
    // add acc_name and page url to title
    d3.select("#chart-title")
            .attr("href", chart_info.url)
            .html(chart_info.acc_name);

    var chart_total = info_rect.append("h1")
                                    .attr("class", "chart-total")
                                    .attr("width", "35%")
                                    .attr("float", "left")
                                    .html(format_num(d3.sum(debits)) + "<span style='color: goldenrod;'> USD</span>");
                                    // .html("جم " + format_num(d3.sum(debits)));

    var name_text = info_rect.append("h1")
                                .attr("class", "acc_name")
                                .html("-")
                                .attr("color", "white");
                    
    var value_text = info_rect.append("h1")
                                .attr("class", "acc_value")
                                .html("-")
                                .attr("color", "white");

    // set up margins around the chart
    var margins = {top: 17, right:20, bottom: 200, left:100};

    //console.log("container width:", container.attr("width"));
    // setting the dimensions of the chart
    var chartWidth = container.attr("width") - margins.left - margins.right,
        chartHeight = 600 - margins.top - margins. bottom,
        barWidth = chartWidth/data.length,
        barPadding = 3;

    // create svg element inside chart-container to the v_chart
    var v_chart = container.append("svg")
                            .attr("class", "v-charts")
                            .attr("width", chartWidth + margins.left + margins.right)
                            .attr("height", chartHeight + margins.top + margins.bottom);

    // configure "yScale"
    var yScale = d3.scaleLinear()
                        .domain([d3.min(debits), d3.max(debits)])
                        .range([0, chartHeight]);
    
    // configure "x_axis_scale" // ******* VERY IMPORTANT: IF THE DATA CONTAINS DUPLICATES IT WILL COMBINE THEM INTO ONE TICK AND MESS UP THE X-TICKS POSITIONS ******* \\
    var x_axis_scale = d3.scaleBand()                       
                        .rangeRound([0, chartWidth])      
                        .domain(acc_names); // ******* VERY IMPORTANT: IF THE DATA CONTAINS DUPLICATES IT WILL COMBINE THEM INTO ONE TICK AND MESS UP THE X-TICKS POSITIONS ******* \\
                        // d3.scaleOrdinal()
                        //         .domain(acc_names)
                        //         .range([0, d3.max(debits)]);
                        

    var x_axis = d3.axisBottom()
                        .scale(x_axis_scale);

    // configure a scale for y_axix
    var y_axis_scale = d3.scaleLinear()
                            .domain([0, d3.max(debits)])
                            .range([chartHeight, 0]);

    var y_axis = d3.axisLeft()
                        .scale(y_axis_scale);
    
    // put y_axis on v_chart
    v_chart.append("g")
            .attr("transform", "translate(" + margins.left + ", " + (margins.top) + ")")
            .attr("class", "y_axis")
            .call(y_axis)
                .selectAll("text")
                    .attr("class", "y_labels");

    // put x_axis on v_chart
    v_chart.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(" + margins.left + ", " + (chartHeight + margins.top) + ")")
            .call(x_axis)
                .selectAll("text")
                    .attr("class", "x_labels")
                    .transition()
                    .duration(2000)
                    .delay(1000)
                    .attr("transform", "rotate(-25)")
                    .style("text-anchor", "end")
            
    // select x axis ticks, link data to them and store them
    var x_ticks = d3.select(".x_axis")
                        .selectAll(".tick")
                        .data(data);
    
    // store full acc_name as text node in each tick
    x_ticks.append("text")
                .attr("class", "acc_name")
                .text(function(d) {
                    return d.acc_name;
                });
    
    // store vales as text nodes in each tick
    x_ticks.append("text")
                .attr("class", "value")
                .text(function(d) {
                    return d.debit;
                })

    // send x_ticks to func:"display_info_mouse"
    display_tick_info_mouse(x_ticks);

    // send x_tick to func:"clear_info"
    clear_tick_info(x_ticks);

    // const promise = clear_info(x_ticks);
    // promise.then(clear_tick());
    
    // function clear_tick(){
    //     x_ticks.attr("fill", "none");
    //     console.log("at clear_tick");
    // }

    // create bars one by one
    var bars = v_chart.append("g").selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                    .attr("class", "vbars")
                    .attr("y", function(d, i) {
                        return chartHeight - yScale(d.debit) + margins.top;
                    })
                    .attr("x", function(d, i) {
                        return (barWidth * i) + margins.left;
                    })
                    .attr("height", function(d) {
                        return yScale(d.debit);
                    })
                    .attr("width", function(d) {
                        return barWidth - barPadding;
                    });


    // testing overlapping bars ////////////////////////////////////////////////////////////////
    //----------------------------------------------------------------
    // var ebars = v_chart.append("g")
    // .selectAll("rect")
    // .data(data)
    // .enter()
    // .append("rect")
    //     .attr("class", "vebars")
    //     .attr("y", function(d, i) {
    //         return chartHeight - yScale(d.debit) + margins.top;
    //     })
    //     .attr("x", function(d, i) {
    //         return (barWidth * i) + margins.left;
    //     })
    //     .attr("width", function(d) {
    //         return barWidth - barPadding;
    //     });
    //     ebars.transition()
    //     .delay(1000)
    //     .duration(2000)
    //     .attr("height", function(d) {
    //         return yScale(d.debit - d.credit);
    //     });

    // // testing remainder
    // // --------------------
    // var rbars = v_chart.append("g")
    // .selectAll("rect")
    // .data(data)
    // .enter()
    // .append("rect")
    //     .attr("class", "vrbars")
    //     .attr("y", function(d, i) {
    //         return chartHeight - yScale(d.debit + d.remain) + margins.top;
    //     })
    //     .attr("x", function(d, i) {
    //         return (barWidth * i) + margins.left;
    //     })
    //     .attr("width", function(d) {
    //         return barWidth - barPadding;
    //     });
    //     rbars.transition()
    //     .duration(2000)
    //     .attr("height", function(d) {
    //         return yScale(d.remain) + 2;
    //     });

    //     display_bar_info_mouse(ebars);
    //     display_bar_info_mouse(rbars);
    //     clear_bar_info(ebars);
    //     clear_bar_info(rbars);
       
    //-------------------------------------------------------------------
    ////////////////////////////////////////////////////////////////////////////////////////////
    
    // append names and values to each bar in a text node
    // 1 -> add acc_names to a text node
    bars.append("text")
            .attr("class", "acc_name")
            .text(function(d) {
                return d.acc_name;
            });

    // 2 -> add values to a text node
    bars.append("text")
            .attr("class", "value")
            .text(function(d) {
                return "<span style='color: #7c7000;'>Balance: </span>" +  
                format_num(d.debit) + "<span style='color: black;'> USD </span>";
            });
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // expenses - names
    // ebars.append("text")
    //         .attr("class", "acc_name")
    //         .text(function(d) {
    //             return d.acc_name + "<span style='color: red;'> : __دائن </span>";
    //         });

    // // remain -name
    // rbars.append("text")
    //         .attr("class", "acc_name")
    //         .text(function(d) {
    //             return d.acc_name + '<span style="color: green;"> : __مدين </span>';
    //         });

    // // expenses - debit
    // ebars.append("text")
    //         .attr("class", "value")
    //         .text(function(d) {
    //             return d.debit - d.credit;
    //         });
    
    // // remain - values
    // rbars.append("text")
    //         .attr("class", "value")
    //         .text(function(d) {
    //             return d.remain;
    //         });
    /////////////////////////////////////////////////////////////////////////////////////////////


    // call display bar info funct to add a "mouseover" event to bars
    display_bar_info_mouse(bars);
    
    // call clear bar info funct to add a "mouseout" event to bars
    clear_bar_info(bars);

    // add bar labels to v_chart
    var bar_labels = v_chart.append("g").selectAll(".text")
                            .data(data)
                            .enter()
                            .append("text")
                                .attr("class", "vbars-labels")
                                .text(function(d) {
                                    return d.debit; // - d.credit; // TODO: add account status
                                })
                                .attr("x", function(d, i) {
                                    return (barWidth * i) + margins.left;
                                })
                                .attr("y", function(d, i) {
                                    return chartHeight - yScale(d.debit) + margins.top - 3;
                                });
                                // .attr("dy", ".3em")
                                // .attr("transform", "rotate(-45)")

    // add a "mouseover" event to bar_labels
    var cur_x, cur_y;
    bar_labels.on("mouseover", function(){
        var current = d3.select(this);
        cur_y = current.attr("y");
        cur_x = current.attr("x");

        current.attr("fill", "red");
    });
    // add a "mouseout" event to bar_labels
    bar_labels.on("mouseout", function(){
            d3.select(this)
            .attr("fill", "green")
            .attr("font-weight", "bolder");
    })

    // ----------------------------------------------------------------------
    // define a function:
    // function for displaying the acc_name and value of each bar at top right corner
    // above the char
    function display_bar_info_mouse(elm)
    {
        elm.on("mouseover", function()
        {
            current = d3.select(this);
            cur_text = current.select(".acc_name").text();
            cur_value = current.select(".value").text();
            // console.log("cur_text: ", cur_text);

            current.attr("fill", "red")
                        .attr("opacity", "0.7");

            // add acc_name on top left of chart
            name_text.html(cur_text);
                            // .style("color", "black");
            // add value on top left of chart
            value_text.html("<span style='color: green'> " + cur_value + " </span>");
                            // .style("color", "green");
            });
    }
    // end definition.
    // ------------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // define a function:
    // function for displaying the acc_name and value of each bar at top right corner
    // above the char
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
            value_text.html("<span style='color:black'>Balance: </span>" + format_num(cur_value) + " USD ");
                            // .style("color", "green");
            });
    }
    // end definition.
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
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
            name_text.html("-");
            value_text.html("-");
        });
    }
    // end definition.
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // define fuction:
    // remove info from info rect. and restore original state of element that has the event
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


} // <-- the closing curley brace of main function.