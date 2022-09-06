import { count,temp,setCount,svgId,setSvgId,setTemp,visdiv,obj,setObj,select,cluster,setCluster,radius,color,scaleFactor,colors,refresh,add,sub} from "./index.js";

let svgRet = new _createSVG(1500, 1000);
setObj(0,svgRet); 
setTemp(0);
var t;
var users=[];


refresh.on("click",function(){
    setCluster(undefined);
    users=[];
    let x=_call(1,users);  
    x.then(function (data) {
        re(Gr);
      });
})

function re(data){
    console.log(data);
    obj.forEach(function(m,n){
        d3.select("#weekssvg"+n).text("week"+1);
        d3.select("#weeksvg"+n).attr("value",0);
        setTemp(n);
        m['j'].update(data);
    });
}

add.on("click",()=>{
    let x=_call(1,users);  
    x.then(function (data) {
        let svg = new _createSVG(1500, 1000);
        obj.push({"i":count,"j":svg})
        svg.update(Gr);
      });
})

// sub.on("click",()=>{
//     setCount(count-1);
//     d3.select("#dsvg"+count).remove();
// })

function _createSVG(width, height) {
    count==undefined?setCount(0):setCount(count+1);
    setSvgId("svg"+count);  // set svgId
    setTemp(count);  // set temp value

    var polygon,centroid;
       
    let div = visdiv.append("div")
                .attr("id","d"+svgId)
                .style("width","100%")
                .style("height","100%")
                .style("background","azure");

    let slider = d3.select("#d"+svgId)  // week slider
                    .append("input")
                    .style("display","block")
                    .attr("id","week"+svgId)
                    .attr("type","range")
                    .attr("min",1)
                    .attr("max",15)
                    .attr("value",0)
                    .style("float","left")
                    .on("change",function(){
                        setTemp(d3.select(this).attr('id').replace('weeksvg',''));
                        let val = +d3.select(this).property("value");
                        weekno.text("week"+val);
                        _callApi(val,users);
                    })

    let weekno = d3.select("#d"+svgId)  // week text
                    .append("text")
                    .attr("id","weeks"+svgId)
                    .text("week"+1)
                    .attr("value","week"+1)
                    .style("font-size","x-large");

    let close = d3.select("#d"+svgId)   // close svg button
                    .append("button")
                    .attr("class","close")
                    .attr("id","close"+temp)
                    .text("X")
                    .style("float","right")

    d3.select("#close"+temp).on("click",function(){
        obj.forEach(function(m,n){
            if(m['i']==temp){
                obj.splice(n, 1);
            }
        })
        setCount(count-1);
        d3.select("#dsvg"+temp).remove();
        console.log(obj);
    })

    var svg = d3.select("#d"+svgId)
                .append("svg")  // create svg
                .style("display","block")
                .style("margin","auto")
                .attr("width", "80%")
                .attr("height", "80%")
                .attr("id",svgId)
                .on("mouseenter",()=>{
                    let e = svg.attr("id").replace("gsvg",'');
                    // console.log(e);
                    if(temp!=e){
                        setTemp(e);
                    }
                })
                .attr("z-index",-1)
                .attr("position","relative")
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .append("g")
                .attr("id", "g" + svgId);

    

    let cb = d3.select('#svg')  //week checkbox 
                .append("div")
                .attr("class","cb");


    let tooltip = d3.select('#svg')  //tool tip
                    .append("div")
                    .attr("class","tooltip")
                    .text("users")
                    // .style("height","auto")
                    // .style("position","relative");
    
    let tooltipText = tooltip.append("span")
                        .attr("class","tooltiptext")
                        .attr("position","absolute")
                        .text("arun");
    tooltipText.text("arun");

    let zoom = d3.zoom().on('zoom', handleZoom);
            
    function handleZoom() {
        d3.select("#" + "gsvg" + temp).attr('transform', d3.event.transform);
    }

    d3.select('#svg' + temp).call(zoom);

    var simulation = d3.forceSimulation()  // create simulation
        .force("charge", d3.forceManyBody().strength(-60))
        .force("link", d3.forceLink().id(d => d.id).distance(30))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
                
    var groups = svg.append('g').attr('class', 'groups'); // create groups
    
    var node = svg.append("g").selectAll("circle").attr("class","nodes"); // create nodes
     
    var link = svg.append("g").selectAll("line").attr("class","links"); // create links

    var valueline = d3.line()    // curve type
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .curve(d3.curveCatmullRomClosed);

    
    return Object.assign(d3.select("#gsvg"+temp).node(), {
        update({ nodes, links }) {
        var groupIds=[];  // make groupId's empty 
        d3.selectAll("#pathsvg"+temp).remove();  // removing old polygons
      
        select.on('change', function() {
                let val = d3.select(this).property('value');
                d3.select('#curveLabel').text(val);
                valueline.curve(d3[val]);
                updateGroups();
                });

            links.forEach(function(d,i){
                assignGroup(d.source,d.target,d.id,i);
            })

            function assignGroup(id1,id2,group,k){  // assigning group to nodes
                let i=nodes.findIndex(n=>n.id==id1);
                let j=nodes.findIndex(n=>n.id==id2);
                nodes[i]['radius']>0 ? nodes[i]['group']=group.toString():links[k]['id']=-1;
                nodes[j]['radius']>0 ? nodes[j]['group']=group.toString():links[k]['id']=-1;
            }

            links.filter(function(d,i){return d.id!=-1});  // removing unnecessary links

            groupIds = d3.set(nodes.filter(function(n){return n.radius>0})
                .map(function (n) { return +n.group; })) // filtering groupId's repeated more than 4 times
                .values()
                .map(function (groupId) { 
                    return { groupId: groupId,count: nodes.filter(function (n) { 
                        return +n.group == groupId; }).length};})
                .filter(function (group) { 
                    return  group.count > 4; })
                .map(function (group) { return group.groupId; });
            
            var n=[];
            var l=[];

            nodes.forEach(function(d,i){  // remove unnecessary nodes
                groupIds.includes(d.group)?n.push(d):NaN;   // new nodes
            })

            links.forEach(function(d,i){ // remove unnecessary links
                groupIds.includes(d.id.toString())?l.push(d):NaN; // new links
            })

            cluster!=undefined?rec():NaN;

            function rec(){   // flitering nodes that belongs to specific cluster
                let nf = nodes.filter(d=>d.group==cluster);
                let lf = links.filter(d=>d.id==cluster);
                nodes.forEach(function(d,i){
                    if(d.userid!=undefined){
                        users.push(d.userid);  // users in selected cluster
                    }
                })
                n=nf;
                l=lf;
               setCluster(undefined); 
            }

            tooltipText.text(n.length);
            d3.selectAll("tooltipText").text(users);

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
            .attr("value",temp)
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
                setTemp(node.attr("value"));
                let group = event.group;
                setCluster(group);
                let nf = nodes.filter(d=>d.group==group);
                let lf = links.filter(d=>d.id==group);
                let graph = { "nodes": nf, "links": lf }
                obj.forEach(function(m,n){
                    if(m['i']==temp){
                        m['j'].update(graph);
                    }
                });
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
                .attr("id","pathsvg"+temp)
                .data(groupIds, function (d) { 
                    // console.log("pathsvg"+temp)
                    return +d; })
                .join(
                    enter=>enter.append('g')
                        .attr('class', 'path_placeholder')
                        .attr("id","pathsvg"+temp)
                        .append('path')
                        .attr('stroke', function (d) { return color(d); })
                        .attr('fill', function (d) { return color(d); })
                        .attr("opacity",1),
                    update=>update
                        .attr("id","pathsvg"+temp) 
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
                // console.log(groupId);
                var node_coords = node
                    .filter(function (d) { 
                        // console.log(d.group);
                        return d.group == groupId; })
                    .data()
                    .map(function (d) { return [d.x, d.y]; });
                return d3.polygonHull(node_coords);
            };

        //    groupIds = groupIds.filter(function(e){return e!=0}); // remove groupId of hidden nodes;
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
                // let polygon,centroid;
                // console.log(groupIds);
                groupIds.forEach(function (groupId) {
                   var path = paths.filter(function (d) {return d == groupId;})
                        .attr('transform', 'scale(1) translate(0,0)')
                        .attr('d', function (d) {
                                // console.log(d);
                                polygon=polygonGenerator(d);
                                // console.log(polygon);
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


_callApi(1,users);

export function _callApi(w,users){
    let x=_call(w,users);  
    x.then(function (data) {
        de(Gr);
      });
}

function de(data){
    let graph = data;
        obj.forEach(function(m,n){
            if(m['i']==temp){
                m['j'].update(graph);
            }
        });
}