var Gr;

async function _call(week, users) {
    // console.log(users);
    await $.ajax({
        method: "post",
        url: "/getefd",
        data: JSON.stringify({ 'week': week, 'users': users }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            loadagain(data, week);
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
    let data_length = finaldata.length;
    let V;
    let adjListArray = [];
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
            tnode2['userid'] = finaldata[i].user + "_" + j;
            tnodes.push(tnode2);


            let tedge = {};
            tedge['source'] = user_dic[finaldata[i].user].toString();
            tedge['target'] = (user_dic[finaldata[i].user] + j).toString();
            tedge['radius'] = finaldata[i][follower_status[j - 1]];
            tedge['link_id'] = finaldata[i].user + "_l";
            tedges.push(tedge);

            finaldata[i][follower_list[j - 1]].forEach(function (d) {
                if (users.includes(d)) {
                    let tedge = {};
                    tedge['source'] = user_dic[d].toString();
                    tedge['target'] = (user_dic[finaldata[i].user] + j).toString();
                    tedge['radius'] = 1;
                    tedge['arrow'] = false;
                    tedge['cluster'] = 1;
                    tedge['link_id'] = finaldata[i].user + "_l";
                    tedges.push(tedge);
                }
            }
            )
        }
    }



    let my_dict = tedges;
    let dict_length = my_dict.length;

    Graph(tnodes.length);
    function Graph(v) {
        V = v;
        for (let i = 0; i < v; i++) {
            adjListArray.push([]);
        }
    }

    for (var i = 0; i < dict_length; i++) {
        addEdge(my_dict[i]['source'], my_dict[i]['target']);
    }
    connectedComponents();

    function addEdge(src, dest) {
        adjListArray[src].push(dest);
        adjListArray[dest].push(src);
    }

    function connectedComponents() {
        let visited = new Array(V);
        for (let i = 1; i < V; i++) {
            visited[i] = false;
        }
        for (let v = 1; v < V; ++v) {
            if (!visited[v]) {
                DFSUtil(v, visited);
                id++;
            }
        }
    }

    function DFSUtil(v, visited) {
        visited[v] = true;
        ids[v] = id;
        for (let x = 0; x < adjListArray[v].length; x++) {
            if (!visited[adjListArray[v][x]]) {
                DFSUtil(adjListArray[v][x], visited);
            }
        }
    }

    for (var i = 0; i < my_dict.length; i++) {
        if (ids[my_dict[i].source] == undefined) {
        }
        my_dict[i].id = ids[my_dict[i].source];
    }
    Gr = { "nodes": tnodes, "links": my_dict };
}