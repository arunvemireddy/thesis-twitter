var svgRet = _createSVG(1200, 1000)
var radius = ['3', '5', '7', '9', '11'];
var colors = ['black', 'blue', 'green', 'red'];
var svg;
var simulation;
var link;
var node;

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

    

    node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .on("mouseenter",(event,d)=>{
            link.attr("display","none")
        });

    node.attr("fill", function (d) {
        return colors[d.cluster];
    }).attr("r", d => {
        if (d.radius > 0 & d.radius <= 10) {
            return radius[0]
        }
        if (d.radius > 10 & d.radius <= 25) {
            return radius[1]
        }
        if (d.radius > 25 & d.radius <= 50) {
            return radius[2]
        }
        if (d.radius > 50) {
            return radius[3]
        }
    })

    link = svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .attr('z-index', '5');

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

       

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on("mouseenter",(event,d)=>{
            link.attr("display","none")
            .filter(l=>l.source.id===d.id || l.target.id === d.id)
            .attr("display","block");
        })
        .on("mouseleave",event=>{
            link.attr("display","block");
        }).on("mousedown",(event,d)=>{
            window.open('https://twitter.com/i/user/' + d.userid, '_blank');
        })

        link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("marker-end", function (d) {
            if (d.radius > 0 && d.arrow!=false) {
                return 'url(#arrowhead)'
            }
        })
    }

    return Object.assign(svg.node(), {
        update({ nodes, links }) {
            const old = new Map(node.data().map(d => [d.id, d]));
            nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
            links = links.map(d => Object.assign({}, d));

            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.alpha(1).restart();

            node = node
                .data(nodes, d => d.id)
                .join(enter => enter.append("circle"))
            node.attr("fill", function (d) {
                return colors[d.cluster];
            })
                .attr("r", d => {
                    if (d.radius > 0 & d.radius <= 10) {
                        return radius[0]
                    }
                    if (d.radius > 10 & d.radius <= 25) {
                        return radius[1]
                    }
                    if (d.radius > 25 & d.radius <= 50) {
                        return radius[2]
                    }
                    if (d.radius > 50) {
                        return radius[3]
                    }
                })

            node.append("title")
                .text(function (d) {
                    console.log(d);
                    let userid = d['userid'];
                    let followers = d['followers'];
                    let unfollowers = d['unfollowers'];
                    let newfollowers = d['newfollowers'];
                    return 'userid ' + userid + '\n' + 'followers ' + followers + '\n' + 'unfollowers ' + unfollowers + '\n' + 'newfollowers ' + newfollowers;
                });
            link = link
                .data(links, d => `${d.source.id}\t${d.target.id}`)
                .join("line");
                link.attr('stroke', function (d) {
                    if (d.arrow == false && d.radius > 0) {
                        return 'rgb(250, 2, 229)';
                    }else if(d.radius > 0){
                        return 'black';
                    }else{
                        return 'white';
                    }
                })
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
                    tedge['arrow']=false
                    tedge['cluster'] = 1;
                    tedges.push(tedge);
                }
            }
            )
        }
    }
    let graph = { "nodes": tnodes, "links": tedges }
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

