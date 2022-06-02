var svgRet = _createSVG(1200, 1000)
var radius = ['3', '5', '7', '9', '11'];
var in_radius = ['4', '6', '8', '10', '12'];
var out_radius = ['6', '8', '10', '12', '14'];
var colors = ['black', 'blue', 'green', 'red'];
var max_week = 15;
var svg;
var simulation;
var link;
var node;
var node_previous_followers;
var node_previous_newfollowers;
var node_previous_unfollowers;
var node_new_popup;
var old_node_data = new Map();

var previousCheckBox = false;

var allData = {};
var allData_loaded = false;

var dataForPanel = {};

var currentWeek = 1;
var previousWeek = 1;

function _createSVG(width, height) {
    svg = d3.select('#div').append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-20))
        .force("link", d3.forceLink().id(d => d.id).distance(30))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    link = svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .attr('z-index', '5');

    node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle");

    node_previous_followers = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        // .selectAll("#path_followers");
        .selectAll("path");

    node_previous_newfollowers = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        // .selectAll("#path_newfollowers");
        .selectAll("path");

    node_previous_unfollowers = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        .selectAll("path");

    node_new_popup = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        .selectAll("path");

    node.attr("fill", function (d) {
        return colors[d.cluster];
    }).attr("r", d => {
        if (d.radius > 0 && d.radius <= 10) {
            return radius[0]
        }
        if (d.radius > 10 && d.radius <= 25) {
            return radius[1]
        }
        if (d.radius > 25 && d.radius <= 50) {
            return radius[2]
        }
        if (d.radius > 50) {
            return radius[3]
        }
    })

    function ticked() {

        svg.append('defs').append('marker')
            .attrs({
                'id': 'arrowhead',
                'viewBox': '-0 -5 10 10',
                'refX': 13,
                'refY': 0,
                'orient': 'auto',
                'markerWidth': 5,
                'markerHeight': 5,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', 'black')
            .style('stroke', 'black');
        svg.append('defs').append('marker')
            .attrs({
                'id': 'panelarrowhead',
                'viewBox': '-0 -5 10 10',
                'refX': 0,
                'refY': 0,
                'orient': 'auto',
                'markerWidth': 5,
                'markerHeight': 5,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-3 L 5 ,0 L 0,3')
            .attr('fill', 'black')
            .style('stroke', 'black');
        link.attr("x1", d => d.target.x)
            .attr("y1", d => d.target.y)
            .attr("x2", d => d.source.x)
            .attr("y2", d => d.source.y)
            // .attr("x1", d => d.source.x)
            // .attr("y1", d => d.source.y)
            // .attr("x2", d => d.target.x)
            // .attr("y2", d => d.target.y)
            .attr("marker-end", function (d) {
                if (d.radius > 0 && d.arrow !== false) {
                    return 'url(#arrowhead)'
                }
            })

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('fill', d => {
                return colors[d.cluster];
            });

        node_previous_followers
            .attr('transform', d => {
                return 'translate(' + d.x + ',' + d.y + ')'
            });

        node_previous_newfollowers
            .attr('transform', d => {
                return 'translate(' + d.x + ',' + d.y + ')'
            });

        node_previous_unfollowers
            .attr('transform', d => {
                return 'translate(' + d.x + ',' + d.y + ')'
            });

        node_new_popup
            .attr('transform', d => {
                return 'translate(' + d.x + ',' + d.y + ')'
            });
    }

    return Object.assign(svg.node(), {
        update({nodes, links}) {
            const old = new Map(node.data().map(d => [d.id, d]));
            nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
            links = links.map(d => Object.assign({}, d));

            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.alpha(1).restart();

            node = node
                .data(nodes, d => d.id)
                .join(enter => enter.append("circle"));
            node
                .attr("fill", function (d) {
                    return colors[d.cluster];
                })
                .attr('stroke-width', 0)
                .attr("r", d => {
                    if (d.radius > 0 && d.radius <= 10) {
                        return radius[0];
                    }
                    if (d.radius > 10 && d.radius <= 25) {
                        return radius[1];
                    }
                    if (d.radius > 25 && d.radius <= 50) {
                        return radius[2];
                    }
                    if (d.radius > 50) {
                        return radius[3];
                    }
                    return 0;
                });

            link = link
                .data(links, d => `${d.source.id}\t${d.target.id}`)
                .join("line");
            link.attr('stroke', function (d) {
                d3.select(this).attr('stroke-width', 1.5);
                if (d.arrow === false && d.radius > 0) {
                    return 'rgb(250, 2, 229)';
                } else if (d.radius > 0) {
                    return 'black';
                } else {
                    d3.select(this).attr('stroke-width', 0);
                }
            });

            node_previous_followers = node_previous_followers
                .data(nodes, d => d.id)
                .join(enter => enter.append("path"));
            node_previous_followers
                // .attr('id',"path_followers")
                .attr("d", d => {
                    let innerRadius = 0;
                    let outerRadius = 0;
                    if (old.size !== 0 && old_node_data.size !== 0 && d.cluster === 0) {
                        if (old.get((parseInt(d.id) + 1).toString()).radius === 0
                            && old_node_data.get((parseInt(d.id) + 1).toString()).radius !== 0) {

                            let value = old.get(d.id).radius;
                            if (value !== 0) {
                                if (value > 0 && value <= 10) {
                                    innerRadius = in_radius[0];
                                    outerRadius = out_radius[0];
                                }
                                if (value > 10 && value <= 25) {
                                    innerRadius = in_radius[1];
                                    outerRadius = out_radius[1];
                                }
                                if (value > 25 && value <= 50) {
                                    innerRadius = in_radius[2];
                                    outerRadius = out_radius[2];
                                }
                                if (value > 50) {
                                    innerRadius = in_radius[3];
                                    outerRadius = out_radius[3];
                                }
                            }
                        }
                    }
                    return d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(0).endAngle(1)();
                })
                .attr('fill', colors[1])
                .attr('stroke-width', 0);

            node_previous_newfollowers = node_previous_newfollowers
                .data(nodes, d => d.id)
                .join(enter => enter.append("path"));
            node_previous_newfollowers
                // .attr('id',"path_newfollowers")
                .attr("d", function (d) {
                    let innerRadius = 0;
                    let outerRadius = 0;
                    if (old.size !== 0 && old_node_data.size !== 0 && d.cluster === 0) {
                        if (old.get((parseInt(d.id) + 3).toString()).radius === 0
                            && old_node_data.get((parseInt(d.id) + 2).toString()).radius !== 0) {
                            let value = old_node_data.get(d.id).radius;
                            if (value !== 0) {

                                if (value > 0 && value <= 10) {
                                    innerRadius = in_radius[0];
                                    outerRadius = out_radius[0];
                                }
                                if (value > 10 && value <= 25) {
                                    innerRadius = in_radius[1];
                                    outerRadius = out_radius[1];
                                }
                                if (value > 25 && value <= 50) {
                                    innerRadius = in_radius[2];
                                    outerRadius = out_radius[2];
                                }
                                if (value > 50) {
                                    innerRadius = in_radius[3];
                                    outerRadius = out_radius[3];
                                }
                            }
                        }
                    }
                    return d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(1).endAngle(2)();

                })
                .attr('fill', colors[2])
                .attr('stroke-width', 0);

            node_previous_unfollowers = node_previous_unfollowers
                .data(nodes, d => d.id)
                .join(enter => enter.append("path"));
            node_previous_unfollowers.attr("d", function (d) {
                let innerRadius = 0;
                let outerRadius = 0;
                if (old.size !== 0 && old_node_data.size !== 0 && d.cluster === 0) {
                    if (old.get((parseInt(d.id) + 3).toString()).radius === 0
                        && old_node_data.get((parseInt(d.id) + 3).toString()).radius !== 0) {
                        let value = old_node_data.get(d.id).radius;
                        if (value !== 0) {

                            if (value > 0 && value <= 10) {
                                innerRadius = in_radius[0];
                                outerRadius = out_radius[0];
                            }
                            if (value > 10 && value <= 25) {
                                innerRadius = in_radius[1];
                                outerRadius = out_radius[1];
                            }
                            if (value > 25 && value <= 50) {
                                innerRadius = in_radius[2];
                                outerRadius = out_radius[2];
                            }
                            if (value > 50) {
                                innerRadius = radius[3];
                                outerRadius = out_radius[3];
                            }
                        }
                    }
                }
                return d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(2).endAngle(3)();
            })
                .attr('fill', colors[3])
                .attr('stroke-width', 0);

            node_new_popup = node_new_popup
                .data(nodes, d => d.id)
                .join(enter => enter.append("path"));
            node_new_popup
                .attr("d", function (d) {
                    let innerRadius = 0;
                    let outerRadius = 0;
                    if (old.size !== 0 && old_node_data.size !== 0 && d.cluster !== 0) {
                        if (old_node_data.get(d.id).radius === 0) {
                            let value = old.get(d.id).radius;
                            if (value !== 0) {
                                if (value > 0 && value <= 10) {
                                    innerRadius = in_radius[0];
                                    outerRadius = out_radius[0];
                                }
                                if (value > 10 && value <= 25) {
                                    innerRadius = in_radius[1];
                                    outerRadius = out_radius[1];
                                }
                                if (value > 25 && value <= 50) {
                                    innerRadius = in_radius[2];
                                    outerRadius = out_radius[2];
                                }
                                if (value > 50) {
                                    innerRadius = in_radius[3];
                                    outerRadius = out_radius[3];
                                }
                            }
                        }
                    }
                    return d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(0).endAngle(6.28)();

                })
                .attr('fill', 'magenta')
                .attr('stroke-width', 0);
            node.selectAll("title").remove(); // Without this, there are multiple title element exist and show the first(week1) data only
            node.append("title")
                .text(function (d) {
                    let user = d['id'];
                    let followers = d['followers'];
                    let unfollowers = d['unfollowers'];
                    let newfollowers = d['newfollowers'];
                    return 'userid ' + user + '\n' + 'followers ' + followers + '\n' + 'unfollowers ' + unfollowers + '\n' + 'newfollowers ' + newfollowers;
                });

            node.on("mouseover", function (d) {
                makeInfoPanel(currentWeek, previousWeek, d.target['__data__'])
                console.log(d, d.target, d.target['__data__']['id'], d['id'], d['followers'], d['unfollowers'], d['newfollowers']);
            })
            old_node_data = new Map(JSON.parse(JSON.stringify(Array.from(old))));
        }
    });
}

_callApi(1, true);
_callAllData();

function _callApi(week, initial = false) {
    if (allData_loaded) {
        loadagain(allData[week], week, initial);
    } else {
        let finaldata = [];
        $.ajax({
            method: "post",
            url: "/getefd",
            data: JSON.stringify({'week': week}),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                finaldata = data;
                loadagain(data, week, initial);
            }
        })
    }
}

function _callAllData() {
    for (let i_week = 0; i_week < max_week; i_week++) {
        $.ajax({
            method: "post",
            url: "/getefd",
            data: JSON.stringify({'week': i_week + 1}),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                allData[i_week + 1] = data;
                dataForPanel[i_week + 1] = {};
                for (let i = 0; i < data.length; i++) {
                    dataForPanel[i_week + 1][data[i].user] = {};
                    dataForPanel[i_week + 1][data[i].user]['followers'] = data[i].followers;
                    dataForPanel[i_week + 1][data[i].user]['newfollowers'] = data[i].newfollowers;
                    dataForPanel[i_week + 1][data[i].user]['unfollowers'] = data[i].unfollowers;
                }
            }
        })
    }
    allData_loaded = true;
}

function loadagain(finaldata, week, initial = false) {
    console.log(week);
    let tnodes = [];
    let tedges = [];
    let users = [];
    let user_dic = {};
    finaldata.forEach(function (d, i) {
        users.push(d.user);
        user_dic[d.user] = i * 4;
    });
    let follower_status = ["followers", "newfollowers", "unfollowers"];
    let follower_list = ["follower_list", "newfollower_list", "unfollower_list"];


    for (let i = 0; i < finaldata.length; i++) {
        let tnode = {};
        tnode['id'] = (user_dic[finaldata[i].user]).toString();
        tnode['cluster'] = 0;
        tnode['radius'] = 11;
        tnode['week'] = week;
        tnode['followers'] = finaldata[i].followers;
        tnode['newfollowers'] = finaldata[i].newfollowers;
        tnode['unfollowers'] = finaldata[i].unfollowers;
        tnode['userid'] = finaldata[i].user;
        tnodes.push(tnode);
        for (let j = 1; j < 4; j++) {
            let tnode2 = {};
            tnode2['id'] = (user_dic[finaldata[i].user] + j).toString();
            tnode2['cluster'] = j;
            tnode2['radius'] = finaldata[i][follower_status[j - 1]];
            tnode2['week'] = week;
            tnodes.push(tnode2);


            let tedge = {};
            tedge['source'] = user_dic[finaldata[i].user].toString();
            tedge['target'] = (user_dic[finaldata[i].user] + j).toString();
            tedge['radius'] = finaldata[i][follower_status[j - 1]];
            tedges.push(tedge);

            finaldata[i][follower_list[j - 1]].forEach(function (d) {
                    if (users.includes(d)) {
                        let tedge = {};
                        tedge['source'] = user_dic[d].toString();
                        tedge['target'] = (user_dic[finaldata[i].user] + j).toString();
                        tedge['radius'] = 1;
                        tedge['arrow'] = false
                        tedge['cluster'] = 1;
                        tedges.push(tedge);
                    }
                }
            )
        }
    }
    let graph = {"nodes": tnodes, "links": tedges}
    svgRet.update(graph);
    if (initial) {
        svgRet.update(graph);
    }
}

export default function define(runtime, observer) {

}

makeSlider("Week", "week", 1, max_week, 1);
makeCheckBox("vs Previous Week");
makeInfoPanel();

function makeSlider(name, attr, min, max, defaultValue) {
    d3.select(".sliders").append("label").text(name);
    var inputbx = d3.select(".sliders").append("input").attr("value", defaultValue).attr('id', attr);
    var slider = d3.select(".sliders").append("input");
    slider
        .attr("type", "range")
        .attr("min", min)
        .attr("max", max)
        .attr("value", defaultValue);
    slider.on("input", () => {
        var val = +slider.property("value");
        if (attr === "week") {
            let w = parseInt(val);
            console.log('checkBox = ', previousCheckBox);
            if (previousCheckBox) {
                if (w > 1) {
                    console.log('previous set', w - 1, ' vs ', w);
                    previousWeek = w-1;
                    currentWeek = w;
                    _callApi(w - 1);
                    _callApi(w);
                } else {
                    previousWeek = currentWeek;
                    currentWeek = w;
                    _callApi(w, true);
                }

            } else {
                previousWeek = currentWeek;
                currentWeek = w;
                _callApi(w);
            }
            inputbx.attr("value", parseInt(val));
            makeInfoPanel(currentWeek, previousWeek);
        }
        if (attr === "charge") {
            force.force("charge").strength(val);
            inputbx.attr("value", val);
        }
    });
}

function makeCheckBox(name, defaultSetting = false) {
    d3.select(".sliders").append("label").text(name);
    let checkBox = d3.select(".sliders");

    checkBox.append("input").attr("type", "checkbox").attr('id', 'previousCheckBox');
    checkBox.on("click", function () {
        if (name === 'vs Previous Week') {
            if (d3.select('#previousCheckBox').property('checked')) {
                previousCheckBox = true;
            } else {
                previousCheckBox = false;
            }
        }
    });
}

function makeInfoPanel(current_week, previous_week, node_data = {'cluster': -1}) {
    d3.select("#panelTitle").remove();
    d3.select("#panelPlot").remove();

    let height = 200;
    let width = document.querySelector('#slide').offsetWidth;

    let panelSvg = d3.select(".sliders").append("svg").attr('height',height).attr("width", width).attr('id', 'panelPlot');


    panelSvg.append("rect").attr('id', 'panelPlot')
        .attr('x', 0)
        .attr('y', 0)
        .attr('stroke-width', 1)
        .attr('fill-opacity', 0)
        .attr('width', "100%").attr('height', height).attr('stroke', 'black')

    if (node_data['cluster'] === 0) {
        let data = getUserLog(node_data);
        console.log(data[0],Math.max(...data[0]));
        let panelPlot_x = d3.scaleLinear().domain([0, max_week]).range([40,width - 10]);//x-axis
        let panelPlot_y = d3.scaleLinear().domain([0,Math.max(...data[0])*1.1]).range([150,0]);//y-axis

        panelSvg.append('g')
            .attr('transform', 'translate(0,' + (height - 25) + ')')
            .call(d3.axisBottom(panelPlot_x));
        panelSvg.append('g')
            .attr('transform', 'translate(40,'+(height - 175)+')')
            .call(d3.axisLeft(panelPlot_y));

        //For Follower
        panelSvg.select('g')
            .selectAll('dot')
            .data(data[0])
            .enter()
            .append('circle')
            .attr('cx',function (d,i){return panelPlot_x(i+1);})
            .attr('cy',function (d){return panelPlot_y(d)-150;})
            .attr('r',3)
            .attr('fill','blue');

        panelSvg.select('g').append("path")
            .datum(data[0])
            .attr("stroke",'blue')
            .attr('stroke-width',1.5)
            .attr('d',d3.line()
                .x(function (d, i){return panelPlot_x(i+1);})
                .y(function (d){return panelPlot_y(d)-150;}));

        //For newFollower
        panelSvg.select('g')
            .selectAll('dot')
            .data(data[1])
            .enter()
            .append('circle')
            .attr('cx',function (d,i){return panelPlot_x(i+1);})
            .attr('cy',function (d){return panelPlot_y(d)-150;})
            .attr('r',3)
            .attr('fill','green');

        panelSvg.select('g').append("path")
            .datum(data[1])
            .attr("stroke",'green')
            .attr('stroke-width',1.5)
            .attr('d',d3.line()
                .x(function (d, i){return panelPlot_x(i+1);})
                .y(function (d){return panelPlot_y(d)-150;}));

        //For unFollower
        panelSvg.select('g')
            .selectAll('dot')
            .data(data[2])
            .enter()
            .append('circle')
            .attr('cx',function (d,i){return panelPlot_x(i+1);})
            .attr('cy',function (d){return panelPlot_y(d)-150;})
            .attr('r',3)
            .attr('fill','red');

        panelSvg.select('g').append("path")
            .datum(data[2])
            .attr("stroke",'red')
            .attr('stroke-width',1.5)
            .attr('d',d3.line()
                .x(function (d, i){return panelPlot_x(i+1);})
                .y(function (d){return panelPlot_y(d)-150;}));

        //Week red line
        panelSvg.select('g')
            .append('rect')
            .attr('stroke','black')
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray',('2,3'))
            .attr('fill-opacity',0)
            .attr('width',20)
            .attr('height',180)
            .attr('x',panelPlot_x(previous_week)-10)
            .attr('y',-160);

        panelSvg.select('g')
            .append('rect')
            .attr('stroke','red')
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray',('2,3'))
            .attr('fill-opacity',0)
            .attr('width',20)
            .attr('height',180)
            .attr('x',panelPlot_x(current_week)-10)
            .attr('y',-160);

        if(current_week !== previous_week){
            panelSvg.select('g')
                .append('line')
                .attr("stroke",'black')
                .attr('stroke-width',3.5)
                .attr('x1',panelPlot_x(previous_week))
                .attr('y1',-150)
                .attr('x2',panelPlot_x(current_week)-10)
                .attr('y2',-150)
                .attr("marker-end",'url(#panelarrowhead');
        }



    } else {
        if(previous_week !== undefined && current_week !== undefined && previous_week !== current_week){
            panelSvg.append("text")
                .attr('x', 20)
                .attr('y', 75)
                .text('week ' + previous_week + ' vs week ' + current_week);
            // .text("Please Select User Node (Black Circle)");
        }
    }
}

function getUserLog(node_data) {
    let userID = node_data['userid'];
    let followers = [];
    let unfollowers = [];
    let newfollowers = [];
    for (let i_week = 0; i_week < max_week; i_week++) {
        followers.push(dataForPanel[i_week + 1][userID]['followers']);
        unfollowers.push(dataForPanel[i_week + 1][userID]['unfollowers']);
        newfollowers.push(dataForPanel[i_week + 1][userID]['newfollowers']);
    }
    return [followers,newfollowers,unfollowers];
}