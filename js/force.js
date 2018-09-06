d3.json('http://52.78.57.243:5000/asterism', (error, linkData) => {
  if (error) throw error;

  //Gnomonic 형태로 그려낸다
  var projections = {
    "Gnomonic": d3.geo.gnomonic(),
  };

  var config = {
    "projection": "Gnomonic",
    // true로 해두면 뒷면이 보이지 않게 됩니다 
    "clip": true,
    // 마찰력. 노드들이 움직이면서 서로 얼마나 부대낄지 결정합니다. 0 안 부대낌 ~ 1 부대낌
    "friction": .9,
    // 다발들이 얼마나 좁게 묶이는지 조절합니다. 0 느슨함 ~ 1 빡빡함
    "linkStrength": 1,
    // 링크의 간격을 조절합니다
    "linkDistance": 20,
    "charge": 30,
    "gravity": .1, "theta": .8
  };

  var width = window.innerWidth,
    height = window.innerHeight - 5,
    nodes = [{ x: width / 2, y: height / 2 }],
    links = [];
  var projection = projections[config["projection"]]  //gnomonic
    .scale(height / 2)
    .translate([(width / 2) - 125, height / 2])
    .clipAngle(config["clip"] ? 90 : null)
  var path = d3.geo.path()
    .projection(projection)

  var force = d3.layout.force()
    .linkDistance(config["linkDistance"])
    .linkStrength(config["linkStrength"])
    .gravity(config["gravity"])
    .size([width, height])
    .charge(-config["charge"]);
  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.drag()
      .origin(function () { var r = projection.rotate(); return { x: 2 * r[0], y: -2 * r[1] }; })
      .on("drag", function () { force.start(); var r = [d3.event.x / 2, -d3.event.y / 2, projection.rotate()[2]]; t0 = Date.now(); origin = r; projection.rotate(r); }))


  d3.json('http://52.78.57.243:5000/star', (err, nodes) => {
    if (err) throw err;
    links = [];
    for (var asterismId in linkData) {
      for (var i = 0; i < linkData[asterismId].length; i++) {
        const source = linkData[asterismId][i];
        const target = i === linkData[asterismId].length - 1 ? linkData[asterismId][0] : linkData[asterismId][i + 1]
        links.push({ source: source - 1, target: target - 1 })
      }
    }

    var link = svg.selectAll("path.link")
      .data(links)
      .enter().append("path").attr("class", "link")
    var node = svg.selectAll("path.node")
      .data(nodes)
      .enter().append("path").attr("class", "node")
      .style("fill", function (d) { return '#ccc'; })
      .style("stroke", function (d) { return '#000'; })
      .call(force.drag);
    force
      .nodes(nodes)
      .links(links)
      .on("tick", tick)
      .start();
    function tick() {
      node.attr("d", function (d) { var p = path({ "type": "Feature", "geometry": { "type": "Point", "coordinates": [d.x, d.y] } }); return p ? p : 'M 0 0' });
      link.attr("d", function (d) { var p = path({ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[d.source.x, d.source.y], [d.target.x, d.target.y]] } }); return p ? p : 'M 0 0' });
    }
  });
})