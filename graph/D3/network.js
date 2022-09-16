import { count, temp, setCount, svgId, setSvgId, setTemp, visdiv, obj, setObj, select, cluster, setCluster, radius, color, scaleFactor, colors, refresh, add } from "./index.js";

var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;

let svgRet = new _createSVG(innerWidth, innerHeight);
setObj(0, svgRet);  // storing in object
setTemp(0);

var users = [];

let valueline = d3.line()    // curve type
    .x(function (d) { return d[0]; })
    .y(function (d) { return d[1]; })
    .curve(d3.curveCatmullRomClosed);


/** refresh button */
refresh.on("click", function () {
    setCluster(undefined);
    users = [];
    let x = _call(1, users);
    x.then(function (data) {
        obj.forEach(function (m, n) {
            d3.selectAll(".weekText").text("week" + 1);  // reset week text to 1
            d3.selectAll(".slider").attr("value", "1");  // reset slider
            setTemp(n);
            m['graph'].update(Gr);
        });
    });
})

/** + button */
add.on("click", () => {
    let x = _call(1, users);
    x.then(function (data) {
        let svgRet = new _createSVG(innerWidth, innerHeight);
        setObj(count, svgRet, true);
        svgRet.init(Gr);
    });
})



function addSlider(vis_div) {

    let div = vis_div.append("div")
        .attr("class", "svgMenu")

    let weekno = div.append("text")
        .attr("class", "weekText")
        .attr("id", "weeks" + svgId)
        .text("week " + 1)
        .attr("value", "week" + 1)

    let slider = div.append("input")
        .attr("id", "week" + svgId)
        .attr("type", "range")
        .attr("class", "slider")
        .attr("min", 1)
        .attr("max", 15)
        .attr("value", 1)
        .attr("step", 1)
        .on("change", function () {
            setTemp(d3.select(this).attr('id').replace('weeksvg', ''));
            let val = +d3.select(this).property("value");
            d3.select(this).attr("value", val);
            d3.select(this).attr("defaultValue", val);
            weekno.text("week" + val);
            _callApi(val, users);
        })

    let close = div.append("button")
        .attr("class", "button closeBtn")
        .attr("id", "close" + svgId)
        .text("X")
        .on("click", function () {
            let temp = d3.select(this).attr('id').replace('closesvg', '');
            setTemp(temp);
            obj.forEach(function (m, n) {
                if (m['i'] == temp) {
                    obj.splice(n, 1);
                }
            })
            d3.select("#dsvg" + temp).remove();
            console.log(obj);
        })
}

function _createSVG(width, height) {
    var polygon, centroid;
    let info_labels = ["Users", "Followers", "New Followers", "Unfollowers","Clusters"];
    let info_labels_text = ["Users", "Followers", "New Followers", "Unfollowers"];

    /**force simulation */
    let simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-60))
        .force("link", d3.forceLink().id(d => d.id).distance(30))
        .force("x", d3.forceX())
        .force("y", d3.forceY())


    count == undefined ? setCount(0) : setCount(count + 1);
    setSvgId("svg" + count);  // set svgId
    setTemp(count);  // set temp value

    let div = visdiv.append("div")
        .attr("id", "d" + svgId)
        .style("width", width)
        .style("height", height)
        .style("background", "azure");

    addSlider(div);

    let info_btn = div.append("button")
        .attr("class", "button info_btn")
        .text("Info")

    let info_panel = div.append("div")
        .attr("class", "info_panel")

    let info_panel_para = info_panel.append("p");

    let user_info_panel = div.append("div")
        .attr("class", "user_info_panel");

    let user_info_panel_para = user_info_panel.append("p");

    let user_info_labels = ["User Id","followers", "newfollowers", "unfollowers"];
    let user_info_labels_text = ["userid","followers", "newfollowers", "unfollowers"];

    for(let i=0;i<user_info_labels.length;i++){
        user_info_labels_text[i] = user_info_panel_para.append("text").text(user_info_labels[i] + " ");
        user_info_labels_text[i].append("br");
    }

    info_btn.on("click", () => {
        info_panel.style("display") == "block" ? info_panel.style("display", "none") : info_panel.style("display", 'block')
    })

    let svg_root = div // create svg
        .append("svg")
        .style("display", "block")
        .style("margin", "auto")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("id", svgId)
        .attr("z-index", -1)
        .attr("position", "relative")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
       
    let svg = svg_root.append("g")
        .attr("id", "g" + svgId)
        .attr("class","svgClass")
 

    svg_root
        .call(d3.zoom().on('zoom', () => {
            d3.selectAll("."+"svgClass").attr('transform', d3.event.transform);
        }));

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0);

    simulation.on("tick", tick);

    function tick() {
        new_tick();
        // updateGroups();
    }
    function new_tick() {

        node.attr("cx", d => d.x) // position of nodes
            .attr("cy", d => d.y);

        link.attr("x1", d => d.source.x) // position of links
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            .attr("marker-end", d => (d.radius > 0 & d.arrow != false) ? 'url(#arrowhead)' : NaN);

        // svg.append('defs').append('marker')
        //     .attrs({
        //         'id': 'arrowhead',
        //         'viewBox': '-0 -5 10 10',
        //         'refX': 13,
        //         'refY': 0,
        //         'orient': 'auto',
        //         'markerWidth': 5,
        //         'markerHeight': 5,
        //         'xoverflow': 'visible'
        //     })
        //     .append('svg:path')
        //     .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        //     .attr('fill', 'black')
        //     .style('stroke', 'black');
    }



    /** forced layout */
    let groups = svg.append('g').attr('class', 'groups');
    let node = svg.append("g").selectAll("circle").attr("class", "nodes"); // create nodes
    let link = svg.append("g").selectAll("line").attr("class", "links"); // create links


    function filterGroup(nodes, links) {
        let groupIds = [];  // make groupId's empty 
        let n = [];
        let l = [];

        // links.forEach(function(d,i){
        //     console.log(d.arrow==false?d.arrow:NaN);
        // })

        links.forEach(function (d, i) { // assigning group to nodes using links
            let idx1 = nodes.findIndex(n => n.id == d.source);
            let idx2 = nodes.findIndex(n => n.id == d.target);
            nodes[idx1]['group'] = d.id.toString();
            nodes[idx2]['group'] = d.id.toString();
        })

        groupIds = d3.set(nodes.filter(function (n) { return n.radius > 0 })
            .map(function (n) { return +n.group; })) // filtering groupId's repeated more than 4 times
            .values()
            .map(function (groupId) {
                return {
                    groupId: groupId, count: nodes.filter(function (n) {
                        return n.group == groupId;
                    }).length
                };
            })
            .filter(function (group) {
                // console.log(group);
                return group.count > 4;
            })
            .map(function (group) { return group.groupId; });

        nodes.forEach(function (d, i) {  // remove unnecessary nodes
            groupIds.includes(d.group) ? n.push(d) : NaN;   // new nodes
        })

        links.forEach(function (d, i) { // remove unnecessary links
            groupIds.includes(d.id.toString()) ? l.push(d) : NaN; // new links
        })

        cluster != undefined ? rec() : NaN;

        function rec() {   // flitering nodes that belongs to specific cluster
            let nf = n.filter(d => d.group == cluster);
            let lf = l.filter(d => d.id == cluster);
            nodes.forEach(function (d, i) {
                if (d.userid != undefined) {
                    users.push(d.userid);  // users in selected cluster
                }
            })
            n = nf;
            l = lf;
            setCluster(undefined);
        }
        return [n, l, groupIds];
    }


    function calculateInfo(n) {
        let total_users = 0;
        let total_followers = 0;
        let total_unfollowers = 0;
        let total_newfollowers = 0;

        for (let i = 0; i < n.length; i++) {
            n[i]['radius'] > 0 ? n[i]['cluster'] == 0 ? total_users = total_users + 1 : n[i]['cluster'] == 1 ? total_followers = total_followers + n[i]['radius'] : n[i]['cluster'] == 2 ? total_newfollowers = total_newfollowers + n[i]['radius'] : n[i]['cluster'] == 3 ? total_unfollowers = total_unfollowers + n[i]['radius'] : NaN : NaN;
        }
        return [total_users, total_followers, total_newfollowers, total_unfollowers];
    }


    function polygonGenerator(groupId) {  // create polygon around cluster
        var node_coords = node
            .filter(function (d) {
                return d.group == groupId;
            })
            .data()
            .map(function (d) { return [d.x, d.y]; });
        return d3.polygonHull(node_coords);
    };

    function drawPolygons(groupIds, paths) {
        groupIds.forEach(function (groupId) {
            var path = paths.filter(function (d) { return d == groupId; })
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

    /** init */
    return Object.assign(svg.node(), {
        init({ nodes, links }) {
            d3.selectAll("#tesvg" + temp).remove();    // remove text - user's info
            d3.selectAll("#pathsvg" + temp).remove();  // removing old polygons

            /** change the type of surrounding polygons */
            select.on('change', function () {
                let val = d3.select(this).property('value');
                d3.select('#curveLabel').text(val);
                valueline.curve(d3[val]);
                updateGroups();
            });


            let result = filterGroup(nodes, links);
            let n = result[0];
            let l = result[1];
            let groupIds = result[2];

            let graph_details = calculateInfo(n);
            info_panel_para.remove();
            info_panel_para = info_panel.append("p")
            for (let i = 0; i < 4; i++) {
                info_labels_text[i] = info_panel_para.append("text").attr("id", "tesvg" + info_labels[i] + temp).text(info_labels[i] + " " + graph_details[i]);
                info_panel_para.append("br");
            }

            const old = new Map(node.data().map(d => [d.id, d]));
            n = n.map(d => Object.assign(old.get(d.id) || {}, d));
            l = l.map(d => Object.assign({}, d));

            simulation.nodes(n);
            simulation.force("link").links(l);
            simulation.alpha(1).restart();

            node = node.data(n, d => d.id).join("circle");
            link = link.data(l, d => `${d.s}\t${d.t}`).join("line");

            node.attr("r", d => (d.radius > 0 && d.radius <= 10) ? radius[0] : (d.radius > 10 && d.radius <= 25) ? radius[1] : (d.radius > 25 && d.radius <= 50) ? radius[2] : d.radius > 50 ? radius[3] : null)
                .attr("id", d => "n" + d.id)
                .attr("value", temp)
                .attr("opacity", 0.5)
                .attr("fill", d => colors[d.cluster])
                .append("title");
            node.exit().remove();

            // node.select('title').text(function (d) {
            //     let userid = d['userid'];
            //     let followers = d['followers'];
            //     let unfollowers = d['unfollowers'];
            //     let newfollowers = d['newfollowers'];
            //     return 'userid ' + userid + '\n' + 'followers ' + followers + '\n' + 'unfollowers ' + unfollowers + '\n' + 'newfollowers ' + newfollowers;
            // });

            link.attr('stroke', function (d) {  // removing class of nodes
                svg.select("#n" + d.source.id).attr("class", undefined);
                svg.select("#n" + d.target.id).attr("class", undefined);
                return NaN;
            })

            link.attr('stroke', function (d) {
                if (d.radius > 0) {
                    let x = "m" + d.id;
                    d.source.className = d.target.className = x;
                    svg.select("#n" + d.source.id).attr("class", x); // assiging class to nodes
                    svg.select("#n" + d.target.id).attr("class", x);
                    if (d.arrow == false) {
                        return 'rgb(250,2,229)';
                    } else {
                        return 'black';
                    }
                } else {
                    return 'none';
                }
            })



            node.on("click", (event, d) => {
                setTemp(node.attr("value"));
                console.log("tets");
                let group = event.group;
                setCluster(group);
                let nf = nodes.filter(d => d.group == group);
                let lf = links.filter(d => d.id == group);
                let graph = { "nodes": nf, "links": lf }
                obj.forEach(function (m, n) {
                    if (m['idx'] == temp) {
                        // cluster = graph;
                        m['graph'].init(graph);
                    }
                });
            })
           
            let user_info = ["userid","followers", "newfollowers", "unfollowers",];
;
            node.on("mouseenter", (d, i) => {
                for(let i=0;i<user_info_labels.length;i++){
                    if(d["cluster"]==0){
                        user_info_panel.style("visibility","visible");
                        let y = user_info[i];
                        console.log(y);
                        user_info_labels_text[i].text(user_info_labels[i] + " " + d[y]);
                        user_info_labels_text[i].append("br");
                    }
                }
                svg.selectAll("." + d.className).attr("opacity", 1);
            })
                .on("mouseleave", (d, i) => {
                    user_info_panel.style("visibility","hidden");
                    let x = d.id;
                    let c = d3.select("#n" + x).attr('class').toString();
                    d3.selectAll("." + c).attr("opacity", 0.5);
                })
               

            simulation.on("tick", tick);

            let paths = groups.selectAll('.path_placeholder')
                .attr("id", "pathsvg" + temp)
                .data(groupIds, function (d) {
                    return +d;
                })
                .join(
                    enter => enter.append('g')
                        .attr('class', 'path_placeholder')
                        .attr("id", "pathsvg" + temp)
                        .append('path')
                        .attr('stroke', function (d) { return "darkmagenta" })
                        .attr('fill', function (d) { return "darkmagenta" })
                        .attr("opacity", 1),
                    update => update
                        .attr("id", "pathsvg" + temp)
                        .append('path')
                        .attr('stroke', function (d) { return "rgb(31, 119, 180)" })
                        .attr('fill', function (d) { return "rgb(31, 119, 180)" })
                        .attr("opacity", 1),
                    exit => exit.remove()
                );

            paths.transition()
                .duration(2000)
                .attr("opacity", 1);


            function tick() {
                new_tick();
                drawPolygons(groupIds, paths);
            }
        },
        update({ nodes, links }) {

            let result = filterGroup(nodes, links);
            let n = result[0];
            let l = result[1];
            let groupIds = result[2];


            let new_node = {};
            let new_link = {};

            n.forEach((d) => {
                if (d.userid != undefined)
                    new_node["l" + d.userid] = d;
            });

            let graph_details = calculateInfo(n);


            for (let i = 0; i < 4; i++) {
                info_labels_text[i].text(info_labels[i] + " " + graph_details[i]);
            }

            node.attr("r", function (d, i) {
                d.radius = (new_node["l" + d.userid] == undefined) ? 0 : new_node["l" + d.userid].radius;
                return (d.radius > 0 && d.radius <= 10) ? radius[0] : (d.radius > 10 && d.radius <= 25) ? radius[1] : (d.radius > 25 && d.radius <= 50) ? radius[2] : d.radius > 50 ? radius[3] : null;
            })


            let user_info = ["userid","followers", "newfollowers", "unfollowers",];
;
            node.on("mouseenter", (d, i) => {
                        let y = user_info[0];
                        let x=d[y];
                        let f=0;
                        for(let i=0;i<nodes.length;i++){
                            if(nodes[i]['userid']==x){
                                f=nodes[i]['newfollowers']
                            }
                        }
                for(let i=0;i<user_info_labels.length;i++){
                    if(d["cluster"]==0){
                        user_info_panel.style("visibility","visible");
                        // let y = user_info[i];
                        // console.log(d[y]);
                        user_info_labels_text[i].text(user_info_labels[i] + " " + f);
                        user_info_labels_text[i].append("br");
                    }
                }
                svg.selectAll("." + d.className).attr("opacity", 1);
            })
                .on("mouseleave", (d, i) => {
                    user_info_panel.style("visibility","hidden");
                    let x = d.id;
                    let c = d3.select("#n" + x).attr('class').toString();
                    d3.selectAll("." + c).attr("opacity", 0.5);
                })

            link.attr('stroke', function (d2) {
                if (d2 != undefined) {
                    if (d2.target.radius > 0) {
                        let x = "m" + d2.id;
                        d3.select("#n" + d2.source.id).attr("class", x); // assiging class to nodes
                        d3.select("#n" + d2.target.id).attr("class", x);
                        if (d2.arrow == false) {
                            return 'rgb(250,2,229)';
                        } else {
                            return 'black';
                        }
                    } else {
                        return 'none';
                    }
                }
                return "none";
            }
            )

        }
    });

}


_callApi(1, users);

export function _callApi(w, users) {
    console.log(w);
    let x = _call(w, users);
    x.then(function () {
        de(Gr);
    });
}

function de(data) {
    obj.forEach(function (m, n) {
        if (m['idx'] == temp) {
            if (m['init'] === false) {
                m['graph'].init(data);
                m["init"] = true;
            }
            else {
                m['graph'].update(data);
            }
        }
    });
}