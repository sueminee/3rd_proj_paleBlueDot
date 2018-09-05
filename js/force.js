const fetchData = async () => {
    const data = await d3.json('http://52.78.57.243:5000/star');
    console.log(data);

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var nodes_data = data
    // [
    //     {"name": "Travis", "sex": "M"},
    //     {"name": "Rake", "sex": "M"},
    //     {"name": "Diana", "sex": "F"},
    //     {"name": "Rachel", "sex": "F"},
    //     {"name": "Shawn", "sex": "M"},
    //     {"name": "Emerald", "sex": "F"}
    // ]
    
    var simulation = d3.forceSimulation()
        .nodes(nodes_data);


    //add forces
    //we're going to add a charge to each node 
    //also going to add a centering force
    simulation
        .force("charge_force", d3.forceManyBody())
        .force("center_force", d3.forceCenter(width / 2, height / 2));

    var colors = d3.scaleOrdinal( d3.schemeCategory10 );        
    //draw circles for the nodes 
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes_data)
        .enter()
        .append("circle")
        .attr("r", 5)
        .style( "fill", function( d, i ) {
            return colors(i);
        })
        .on("click", (e) => {
            passingDataToModal(e.index, e.starName); //TODO:여기서 다른애들 더 보내주고, passingDataToModal 함수도 더 수정해야 함.
            modal.style.display = "block";
        });


    function tickActions() {
        //update circle positions to reflect node updates on each tick of the simulation 
        node
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })

        //update link positions 
        //simply tells one end of the line to follow one node around
        //and the other end of the line to follow the other node around

        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

    }

    simulation.on("tick", tickActions);

    //Create links data 
    var links_data = [{
            "source": 1,
            "target": 2
        },
        // {"source": "Diana", "target": "Rake"},
        // {"source": "Diana", "target": "Rachel"},
        // {"source": "Rachel", "target": "Rake"},
        // {"source": "Rachel", "target": "Shawn"},
        // {"source": "Emerald", "target": "Rachel"}
    ]


    //Create the link force 
    //We need the id accessor to use named sources and targets 
    var link_force = d3.forceLink(links_data)
        .id(function (d) {
            return d.id;
        })

    simulation.force("links", link_force)

    //draw lines for the links 
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links_data)
        .enter().append("line")
        .attr('stroke', 'white')
        .attr("stroke-width", 2);
}
fetchData();