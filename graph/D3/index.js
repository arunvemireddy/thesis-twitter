// import {_createSVG} from  "./network.js"
var w=1;
var inputbx=1,slider;
var title;
var menu;
// var refresh;
export var title,menu,curveTypes,select_label,select,option,visdiv,count,svgRet,temp,svgId,obj=[],cluster,refresh,add,sub;
export var radius = ['3', '5', '7', '9', '11'],color = d3.scaleOrdinal(d3.schemeCategory10),scaleFactor = 1.4,colors = ["black","blue","green","red"];

export function setCount(value) {
    count = value;
    // console.log(count);
}

export function setSvgId(value) {
    svgId = value;
}

export function setTemp(value) {
    temp = value;
}

export function setObj(val1,val2){
    obj.push({"i":val1,"j":val2});
}

// export function setCompare(value){
//     compare._groups[0][0]["checked"]=value;
// }

export function setPolygon(value){
    polygon = value;
}

export function setCentroid(value){
    centroid = value;
}

// export function setUsers(value){
//     if(value!=undefined){
//     users.push(value);
//     }else{
//         users=[];
//     }
// }
export function setCluster(value){
    cluster = value;
}





title = d3.select("#title")
        .style("width","100%")
        .style("height","5%")
        .style("background","rgb(242, 240, 233)")
        .append("p")
        .text("Social Media Visualization")
        .style("font","bold")
        .style("text-align","center")

menu = d3.select("#menu")
        .style("background","rgb(218, 237, 245)")
        // .style("display","inline-block")
        .style("float","left")
        .style("width","15%")
        .style("height","100%")
        .append("group")
        .attr("id","me")

add = menu.append("button")
        .attr("class","add")
        .text("+");

sub = menu.append("button")
        .attr("class","sub")
        .text("-");

// compare = menu
//         .append("label")
//         .text("comapre")
//         .append("input")
//         .attr("type","checkbox")
//         .style("margin-bottom","15px")

menu.append("br")

refresh = d3.select("#me")
        .append("button")
        .style("margin-bottom","15px")
        .text("Refresh")
        // .attr("disabled",true)
        // .on("click",function(){
        //     cluster=undefined;
        //     users=[];
        //     _callApi(parseInt(inputbx._groups[0][0].value));
        // })

// menu.append("br")

curveTypes = ['curveBasisClosed', 'curveCardinalClosed', 'curveCatmullRomClosed', 'curveLinearClosed']; // curve types

select_label=d3.select('#me')
                    .append("span")
                    .style("display","flex")

select_label.append("text")
            .text("Type Of Curve")
            .style("display","block")
            .style("margin-bottom","10px");

select = select_label.append('select')
            .attr('class','select')

option = select.selectAll('option')
            .data(curveTypes).enter()
            .append('option')
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; })

visdiv = d3.select("#visdiv")
            .style("display","flex")
            .style("background","rgb(235, 252, 237)")
            .style("height","100%")
            .style("width","85%")
            .style("float","right");
                

// svgRet = new _createSVG(1500, 1000);
// obj.push({"i":0,"j":svgRet}); 
// temp=0;


// _callApi(1,users=[]);

// export function _callApi(w,users){
//     let x=_call(w,users);  
//     x.then(function (data) {
//         de(Gr);
//       });
// }

// function de(data){
//     console.log(data+"arun");
//     let graph = data;
//     if(compare._groups[0][0]["checked"]){ 
//         let svg = new _createSVG(1500, 1000);
//         obj.push({"i":count,"j":svg}); 
//         svg.update(graph);
//     }else{
//         obj.forEach(function(m,n){
//             if(m['i']==temp){
//                 m['j'].update(graph);
//             }
//         });
//     }
// }

  





export default function define(runtime, observer) {

}

