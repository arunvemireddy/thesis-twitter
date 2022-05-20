var svgRet = _createSVG(1200, 1000)
var radius = ['3', '5', '7', '9', '11'];
var in_radius = ['4', '6', '8', '10', '12'];
var out_radius = ['6', '8', '10', '12', '14'];
var colors = ['black', 'blue', 'green', 'red'];
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

        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
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

    function update_previous({nodes, links}){
        const old = new Map(node.data().map(d => [d.id, d]));
        old_node_data = new Map(JSON.parse(JSON.stringify(Array.from(old))));
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
                if (d.arrow === false && d.radius > 0) {
                    return 'rgb(250, 2, 229)';
                } else if (d.radius > 0) {
                    return 'black';
                } else {
                    return 'white';
                }
            })

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
            node.append("title")
                .text(function (d) {
                    let user = d['id'];
                    let followers = d['followers'];
                    let unfollowers = d['unfollowers'];
                    let newfollowers = d['newfollowers'];
                    return 'userid ' + user + '\n' + 'followers ' + followers + '\n' + 'unfollowers ' + unfollowers + '\n' + 'newfollowers ' + newfollowers;
                });
            old_node_data = new Map(JSON.parse(JSON.stringify(Array.from(old))));
        }
    });
}

_callApi(1, true);

function _callApi(week, initial = false) {
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
    if(initial === "previous"){
        svgRet.update_previous(graph);
    }
    svgRet.update(graph);
    if (initial) {
        svgRet.update(graph);
    }
}

export default function define(runtime, observer) {

}

makeSlider("Week", "week", 1, 15, 1);
makeCheckBox("vs Previous Week");

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
            if(w>1 && previousCheckBox){
                console.log('previous set', w-1, ' vs ',w);
                _callApi(w-1, 'previous');
                _callApi(w);
            }else{
                _callApi(w);
            }
            inputbx.attr("value", parseInt(val));
        }
        if (attr === "charge") {
            force.force("charge").strength(val);
            inputbx.attr("value", val);
        }
    });
}

function makeCheckBox(name,defaultSetting = false) {
    d3.select(".sliders").append("label").text(name);
    let checkBox = d3.select(".sliders");

    checkBox.append("input").attr("type", "checkbox").attr('id','previousCheckBox');
    checkBox.on("click", function () {
        if(name === 'vs Previous Week'){
            if(d3.select('#previousCheckBox').property('checked')){
                previousCheckBox = true;
            }else{
                previousCheckBox = false;
            }
        }
    });
}

