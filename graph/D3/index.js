var radius = ['3', '5', '7', '9', '11'];
var colors = ['black', 'blue', 'green', 'red'];
var color = d3.scaleOrdinal(d3.schemeCategory10);
var scaleFactor = 1.4;
var w=1;
var select,options,curveTypes,cluster,button,inputbx,slider,checkbox;
var users=[];
var obj=[]; // to store svg objects
var ob=new Set();  // to store checked svg's number
var dynamic=0;

curveTypes = ['curveBasisClosed', 'curveCardinalClosed', 'curveCatmullRomClosed', 'curveLinearClosed']; // curve types

checkbox = d3.select(".cb")
            .append("label")
            .text("compare")
            .append("input")
            .attr("type","checkbox")

select = d3.select('#curveSettings')
            .append('select')
            .attr('class','select');

options = d3.select('select')
        .selectAll('option')
        .data(curveTypes).enter()
        .append('option')
        .text(function (d) { return d; });

button = d3.select(".btn")
            .append("button")
            .text("Refresh")
            .on("click",function(){
                cluster=undefined;
                users=[];
                _callApi(parseInt(inputbx._groups[0][0].value));
            })

var count;
var svgRet = new _createSVG(1500, 1000);
obj.push({"i":0,"j":svgRet});
ob.add(0);
console.log(ob);
// _callApi(w);

function _createSVG(width, height) {
    let title=d3.select("#svg")
                .append("div")
                .attr("class","title")
    let text=  title.append("text")
                // .style("margin-left","50%")
                // .style("margin-right","50%")
                .style("width","50%")

    let cb = d3.select('#svg')
                .append("div")
                .attr("class","cb");

    if(count==undefined){
        count=0;
    }else{
        count=parseInt(count);
        count=count+1;
        count=count.toString();
    }
    let svgId = "svg"+count;

    let c = cb.append("input")
            .attr("type","checkbox")
            .attr("checked","true")
            .attr("id","c"+count)
            .on("change",function(d){
                if(c._groups[0][0]["checked"]==true){
                    let x = d3.select(this).attr("id");
                    x=x.slice(1);
                    x=parseInt(x);
                    ob.add(x);
                }else{
                    let x = d3.select(this).attr("id");
                    x=x.slice(1);
                    x=parseInt(x);
                    ob.delete(x);
                    console.log(ob);
                }
            });
    
    var polygon,centroid;

    var svg = d3.select('#svg').append("svg")  // create svg
                .attr("width", width)
                .attr("height", height)
                .attr("id",svgId)
                .attr("viewBox", [-width / 2, -height / 2, width, height]);

    
    var simulation = d3.forceSimulation()  // create simulation
        .force("charge", d3.forceManyBody().strength(-60))
        .force("link", d3.forceLink().id(d => d.id).distance(30))
        .force("x", d3.forceX())
        .force("y", d3.forceY())

    var groups = svg.append('g').attr('class', 'groups'); // create groups

    var node = svg.append("g").selectAll("circle").attr("class","nodes"); // create nodes
     
    var link = svg.append("g").selectAll("line").attr("class","links"); // create links

    var valueline = d3.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .curve(d3.curveCatmullRomClosed);

    return Object.assign(svg.node(), {
        update({ nodes, links }) {
        var groupIds=[];
        let week=d3.select("#week").attr("value");
        text.text("week"+week).style("font-size","x-large")
        checkbox._groups[0][0]["checked"]=false;

        dynamic=dynamic.toString();
        d3.selectAll("#path"+dynamic).remove();  // removing old polygons
      
        select.on('change', function() {
                let val = d3.select('select').property('value');
                d3.select('#curveLabel').text(val);
                valueline.curve(d3[val]);
                updateGroups();
                });

            links.forEach(function(d,i){
                assignGroup(d.source,d.target,d.id,i);
            })

            function assignGroup(id1,id2,group,k){
                let i=nodes.findIndex(n=>n.id==id1);
                let j=nodes.findIndex(n=>n.id==id2);
                nodes[i]['radius']>0 ? nodes[i]['group']=group.toString():links[k]['id']=-1;
                nodes[j]['radius']>0 ? nodes[j]['group']=group.toString():links[k]['id']=-1;
            }

            links.filter(function(d,i){return d.id!=-1});  // remove unnecessary links

            groupIds = d3.set(nodes.filter(function(n){return n.radius>0})
                .map(function (n) { return +n.group; })) // filter groupId's
                .values()
                .map(function (groupId) { 
                    return { groupId: groupId,count: nodes.filter(function (n) { 
                        return +n.group == groupId; }).length};})
                .filter(function (group) { 
                    return  group.count > 4; })
                .map(function (group) { return group.groupId; });
            
            let n=[];
            let l=[];

            nodes.forEach(function(d,i){  // remove unnecessary nodes
                groupIds.includes(d.group)?n.push(d):NaN;
            })

            links.forEach(function(d,i){ // remove unnecessary links
                groupIds.includes(d.id.toString())?l.push(d):NaN;
            })

            cluster!=undefined?rec():NaN;

            function rec(){
                let nf = nodes.filter(d=>d.group==cluster);
                let lf = links.filter(d=>d.id==cluster);
                nodes.forEach(function(d,i){
                    if(d.userid!=undefined){
                        users.push(d.userid);  // users in selected cluster
                    }
                })
                n=nf;
                l=lf;
                cluster=undefined;
            }

            const old = new Map(node.data().map(d => [d.id, d]));
            n = n.map(d => Object.assign(old.get(d.id) || {}, d));
            l = l.map(d => Object.assign({}, d));

            simulation.nodes(n);
            
            simulation.force("link").links(l);
            simulation.alpha(1).restart();

            node = node.data(n, d => d.id).join("circle")
            link = link.data(l, d => `${d.s}\t${d.t}`).join("line");

            node.attr("r", d => (d.radius > 0 && d.radius <= 10) ? radius[0] : (d.radius > 10 && d.radius <= 25) ? radius[1] : (d.radius > 25 && d.radius <= 50) ? radius[2] : d.radius > 50 ? radius[3] : null)
            .attr("id", d => "n" + d.id)
            .attr("opacity",0.5)
            .attr("fill", d=> colors[d.cluster])
            .append("title");
            node.exit().remove();
            node.select('title').text(function (d) {
                let userid = d['userid'];
                let followers = d['followers'];
                let unfollowers = d['unfollowers'];
                let newfollowers = d['newfollowers'];
                return 'userid ' + userid + '\n' + 'followers ' + followers + '\n' + 'unfollowers ' + unfollowers + '\n' + 'newfollowers ' + newfollowers;
            });
           
            link.attr('stroke',function(d){  // making class of links undefined on iteration
                d3.select("#n"+d.source.id).attr("class",undefined);
                d3.select("#n"+d.target.id).attr("class",undefined);
                return NaN;
            })

            link.attr('stroke', function (d) {
                if (d.radius > 0) {   
                    let x= "m"+d.id;   // appending character 'm' to id 
                    d3.select("#n"+d.source.id).attr("class",x);
                    d3.select("#n"+d.target.id).attr("class",x);
                    if(d.arrow==false){
                        return 'rgb(250,2,229)';
                    }else{
                        return 'black';
                    }
                }else {
                    return 'none';
                }
            })

            

            node.on("click",(event,d)=>{
                cluster = event.group;
                let group = event.group;
                let nf = nodes.filter(d=>d.group==group);
                let lf = links.filter(d=>d.id==group);
                let graph = { "nodes": nf, "links": lf }
                svgRet.update(graph);
            })

            node.on("mouseenter", (event, d) => {
                let x=event.id;
                let c = d3.select("#n"+x).attr('class').toString();
                d3.selectAll("."+c).attr("opacity",1);
             })
             .on("mouseleave", (event, d) => {
                let x=event.id;
                let c = d3.select("#n"+x).attr('class').toString();
                d3.selectAll("."+c).attr("opacity",0.5);
             })
             .on('dbclick',()=>{
                console.log("dbclick");
             });

            
            var paths = groups.selectAll('.path_placeholder')
                .data(groupIds, function (d) { return +d; })
                .join(
                    enter=>enter.append('g')
                        .attr('class', 'path_placeholder')
                        .attr("id","path"+dynamic)
                        .append('path')
                        .attr('stroke', function (d) { return color(d); })
                        .attr('fill', function (d) { return color(d); })
                        .attr("opacity",1),
                    update=>update
                        .append('path')
                        .attr('stroke', function (d) { return color(d); })
                        .attr('fill', function (d) { return color(d); })
                        .attr("opacity",1),
                     exit=>exit.remove()
                    );

            paths.transition()
                .duration(2000)
                .attr("opacity", 1);


            function polygonGenerator(groupId) {  // create polygon around cluster
                var node_coords = node
                    .filter(function (d) { 
                        return d.group == groupId; })
                    .data()
                    .map(function (d) { return [d.x, d.y]; });
                return d3.polygonHull(node_coords);
            };

           groupIds = groupIds.filter(function(e){return e!=0}); // remove groupId of hidden nodes;
           simulation.on("tick",tick);
    
           function tick(){
                 new_tick();
                updateGroups();
           }
           function new_tick(){

            node.attr("cx", d => d.x) // position of nodes
                .attr("cy", d => d.y);

           link.attr("x1", d => d.source.x) // position of links
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y)
              .attr("marker-end", d => (d.radius > 0 & d.arrow != false) ? 'url(#arrowhead)' : NaN);  
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
           }
           
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
        data: JSON.stringify({ 'week': week ,'users':users}),
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
    
    let follower_status = ["followers", "newfollowers", "unfollowers"];
    let follower_list = ["follower_list", "newfollower_list", "unfollower_list"];
    let data_length=finaldata.length;
    let V;
    let adjListArray=[];
    let id = 1;
    let ids = [];

    finaldata.forEach(function (d, i) {
        users.push(d.user);
        user_dic[d.user] = i * 4;
    });

    for (let i = 0; i < data_length; i++) {
        let tnode = {};
        tnode['id'] = (user_dic[finaldata[i].user]).toString();
        tnode['cluster'] = 0; // default cluster
        tnode['radius'] = 11; // default radius
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
    
 

    let my_dict=tedges;
    let dict_length = my_dict.length;

    Graph(tnodes.length);
    function Graph(v){   
        V=v;
        for (let i = 0; i < v; i++) {
            adjListArray.push([]);
        }
    }
    
    for(var i = 0 ; i < dict_length ; i++){
        addEdge(my_dict[i]['source'],my_dict[i]['target']);
     }
     connectedComponents();
    
    function addEdge(src,dest){
        adjListArray[src].push(dest);
        adjListArray[dest].push(src);
    }

    function connectedComponents(){
        let visited = new Array(V);
        for(let i = 1; i < V; i++){
            visited[i] = false;
        }
        for (let v = 1; v < V; ++v){
            if (!visited[v]){
                DFSUtil(v, visited);
                id++;
            }
        }
    }

    function DFSUtil(v,visited){
        visited[v] = true;
        ids[v] = id;
        for (let x = 0; x < adjListArray[v].length; x++){
            if (!visited[adjListArray[v][x]]){
                DFSUtil(adjListArray[v][x], visited);
            }
        }
    }
    
    for(var i = 0 ; i < my_dict.length ; i++){
        if(ids[my_dict[i].source]==undefined){
        }
        my_dict[i].id = ids[my_dict[i].source];
    }
  
    
    let graph = { "nodes": tnodes, "links": my_dict}
    
    if(checkbox._groups[0][0]["checked"]){
        svgRet = new _createSVG(1500, 1000);
        obj.push({"i":parseInt(count),"j":svgRet});
        ob.add(parseInt(count));
        dynamic=parseInt(count);
        svgRet.update(graph);
    }else{
        console.log(obj,ob);
        ob.forEach(function(d,m){
            obj.forEach(function(p,n){
                if(p['i']==d){
                    dynamic=d;
                    p['j'].update(graph);
                }
            })
        })
    }
}

export default function define(runtime, observer) {

}


 makeSlider("Week", "week", 1, 15, 1);  //week slider

function makeSlider(name, attr, min, max, defaultValue) {
   
    d3.select(".sliders").append("label").text(name);
    inputbx = d3.select(".sliders").append("input").attr("value", defaultValue).attr('id', attr);
    slider = d3.select(".sliders").append("input");
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

