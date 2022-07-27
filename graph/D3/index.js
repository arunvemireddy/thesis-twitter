var svgRet = _createSVG(1200, 1000)
var radius = ['3', '5', '7', '9', '11'];
var colors = ['black', 'blue', 'green', 'red'];
var color = d3.scaleOrdinal(d3.schemeCategory10);
var scaleFactor = 1;
var svg,simulation,link,node,groupIds,groups,paths,polygon,centroid,valueline,graph;



function _createSVG(width, height) {
    

    svg = d3.select('#svg').append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-20))
        .force("link", d3.forceLink().id(d => d.id).distance(30))
        // .force('center', d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    valueline = d3.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .curve(d3.curveCatmullRomClosed);

    // create groups
    groups = svg.append('g').attr('class', 'groups');

    // create nodes
    node = svg.append("g").selectAll("circle")
     
    // create links
    link = svg.append("g").selectAll("line");

    function ticked() { // this is the function that being called every frame!
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


        //position of nodes
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y)
            // .on("mouseenter", (event, d) => {
            //     link.attr("display", "none")
            //         .filter(l => l.source.id === d.id || l.target.id === d.id)
            //         .attr("display", "block");
            // })
            // .on("mouseleave", event => {
            //     link.attr("display", "block");
            // })
            /*.on("mousedown", (event, d) => {
                window.open('https://twitter.com/i/user/' + d.userid, '_blank');
            })*/

        //position of links
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            .attr("marker-end", d => (d.radius > 0 & d.arrow != false) ? 'url(#arrowhead)' : NaN);  

      //  updateGroups();
    }

    return Object.assign(svg.node(), {
        update({ nodes, links }) {
            const old = new Map(node.data().map(d => [d.id, d]));
            nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
            links = links.map(d => Object.assign({}, d));

            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.alpha(1).restart();

            node = node.data(nodes, d => d.id).join(enter => enter.append("circle"));
            link = link.data(links, d => `${d.source.id}\t${d.target.id}`).join("line");

            
            

            node.attr("r", d => (d.radius > 0 && d.radius <= 10) ? radius[0] : (d.radius > 10 && d.radius <= 25) ? radius[1] : (d.radius > 25 && d.radius <= 50) ? radius[2] : d.radius > 50 ? radius[3] : null)
                .attr("id", d => "n" + d.id)
                .attr("fill", d=> colors[d.cluster])
                .append("title")
                .text(function (d) {
                    let userid = d['userid'];
                    let followers = d['followers'];
                    let unfollowers = d['unfollowers'];
                    let newfollowers = d['newfollowers'];
                    return 'userid ' + userid + '\n' + 'followers ' + followers + '\n' + 'unfollowers ' + unfollowers + '\n' + 'newfollowers ' + newfollowers;
                });

            
            link.attr('stroke',function(d){
                d.source.groupid=undefined;
                d.target.groupid=undefined;
                d3.select("#n" + d.source.id).attr("class", '');
                d3.select("#n" + d.target.id).attr("class", '');
                return 'none';
            })
            link.attr('stroke', function (d) {
               // console.log(d);
                if (d.radius > 0) {   
                    let groupid = (d.source.groupid==undefined)?d.target.groupid:d.source.groupid;
                    if(groupid==undefined){
                        groupid=d.source.id;
                    }
                    d.source.groupid=d.target.groupid=groupid;
                    d3.select("#n" + d.source.id).attr("class", d.source.groupid);
                    d3.select("#n" + d.target.id).attr("class", d.target.groupid);
                    
                    if(d.arrow==false){
                        return 'rgb(250,2,229)';
                    }else{
                        return 'black';
                    }
                }else {
                    return 'none';
                }
            })
            
            
            for(let i=0;i<nodes.length;i++){
                
                if (d3.select("#n"+nodes[i]['id']).attr("class")!=undefined){
                    nodes[i]['group']=d3.select("#n"+nodes[i]['id']).attr("class");
                }
            }

            let groupIds = d3.set(nodes.map(function (n) { return +n.group; }))
                .values()
                .map(function (groupId) {
                    return {
                        groupId: groupId,
                        count: nodes.filter(function (n) { return +n.group == groupId; }).length
                    };
                })
                .filter(function (group) { console.log(group.count,group); return  group.count > 4; })
                .map(function (group) { return group.groupId; });
            
            console.log(groupIds);

            for(let i=0;i<nodes.length;i++){
                if (d3.select("#n"+nodes[i]['id']).attr("class")!=undefined){
                   let x= d3.select("#n"+nodes[i]['id']).attr("class");
                   x=x.toString();
                   if(groupIds.includes(x)){
                       d3.select("#n"+nodes[i]['id']).attr("fill","lime")
                   }
                }
            }

          

            paths = groups.selectAll('.path_placeholder')
                .data(groupIds, function (d) { return +d; })
                .enter()
                .append('g')
                .attr('class', 'path_placeholder')
                .append('path')
                .attr('stroke', function (d) { return color(d); })
                .attr('fill', function (d) { return color(d); })
                .attr("opacity", 0)

            paths.transition()
                .duration(2000)
                .attr("opacity", 1);

            

            // create polygon around cluster
            function polygonGenerator(groupId) {
                

                var node_coords = node
                    .filter(function (d) { return d.group == groupId; })
                    .data()
                    .map(function (d) { return [d.x, d.y]; });

                return d3.polygonHull(node_coords);
            };

          //updateGroups();
            function updateGroups() {
                groupIds.forEach(function (groupId) {
                    var path = paths.filter(function (d) {return d == groupId;})
                        .attr('transform', 'scale(1) translate(0,0)')
                        .attr('d', function (d) {
                            polygon = polygonGenerator(d);
                            centroid = d3.polygonCentroid(polygon);
                            return valueline(
                                polygon.map(function (point) {
                                    return [point[0] - centroid[0], point[1] - centroid[1]];
                                })
                            );
                        });
                    d3.select(path.node().parentNode).attr('transform', 'translate(' + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')');
                })
            }


        }
    });
}






_callApi(1);
function _callApi(week) {
    let finaldata = [];
    $.ajax({
        method: "post",
        url: "/getefd",
        data: JSON.stringify({ 'week': week }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            finaldata = data;
            loadagain(data, 1);
        }
    })
}

function loadagain(finaldata, week) {
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
                    tedge['arrow'] = false;
                    tedge['cluster'] = 1;
                    tedges.push(tedge);
                }
            }
            )
        }
    }
    graph = { "nodes": tnodes, "links": tedges }
    svgRet.update(graph);
}

export default function define(runtime, observer) {

}

makeSlider("Week", "week", 1, 15, 1);

function makeSlider(name, attr, min, max, defaultValue) {
    d3.select(".sliders").append("label").text(name);
    var inputbx = d3.select(".sliders").append("input").attr("value", defaultValue).attr('id', attr);
    var slider = d3.select(".sliders").append("input");
    slider
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 1000)
        .attr("value", (defaultValue - min) / (max - min) * 1000)
    slider.on("input", () => {
        var val = +slider.property("value");
        var d = val / 1000 * (max - min) + min;
        if (attr == "week") {
            let w = parseInt(d);
            _callApi(w);
            inputbx.attr("value", parseInt(d));
        }
        if (attr == "charge") {
            force.force("charge").strength(d);
            inputbx.attr("value", d);
        }
    });
}

