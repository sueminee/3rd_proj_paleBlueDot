d3.json('http://52.78.57.243:5000/asterism', (error, linkData) => {
  if (error) throw error;
  //Gnomonic 형태로 그려낸다
  var projections = {
    "Gnomonic": d3.geo.orthographic(),
  };

  var config = {
    "projection": "Gnomonic",
    // true로 해두면 뒷면이 보이지 않게 됩니다 
    "clip": true,
    // 마찰력. 노드들이 움직이면서 서로 얼마나 부대낄지 결정합니다. 0 안 부대낌 ~ 1 부대낌
    "friction": .9,
    // 다발들이 얼마나 좁게 묶이는지 조절합니다. 0 느슨함 ~ 1 빡빡함
    "linkStrength": 2,
    // 링크의 간격을 조절합니다
    "linkDistance": 20,
    "charge": 30,
    "gravity": .1, "theta": .8
  };

  var width = window.innerWidth;
  var height = window.innerHeight;

  var projection = projections[config["projection"]]  //gnomonic
    .scale(1000)  //여기를 조절해 원하는 크기의 우주를 생성합니다
    .translate([width / 2, height / 2])
    .clipAngle(config["clip"] ? 90 : null)
  var path = d3.geo.path()
    .projection(projection)

  var force = d3.layout.force()
    .linkDistance(config["linkDistance"])
    .linkStrength(config["linkStrength"])
    .gravity(config["gravity"])
    .size([width, height])
    .charge(-config["charge"]);
  var svg = d3.select("#svgContainer").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 1000")
    .classed("responsive", true)
    .call(d3.behavior.drag()
      .origin(function () { var r = projection.rotate(); return { x: 2 * r[0], y: -2 * r[1] }; })
      .on("drag", function () { force.start(); var r = [d3.event.x / 2, -d3.event.y / 2, projection.rotate()[2]]; t0 = Date.now(); origin = r; projection.rotate(r); }))

  d3.json('http://52.78.57.243:5000/star', (err, nodeData) => {
    if (err) throw err;
    var links = [];
    // 지금은 같은 별자리들끼리 원형으로 이어지는 알고리즘입니다. 하지만 나중에 다른 알고리즘으로 수정하려 합니다.
    for (var asterismId in linkData) {
      for (var i = 0; i < linkData[asterismId].length; i++) {
        const source = nodeData[linkData[asterismId][i]];
        const target = i === linkData[asterismId].length - 1 ? nodeData[linkData[asterismId][0]] : nodeData[linkData[asterismId][i + 1]]
        links.push({ source: source, target: target })
      }
    }

    var nodes = [];
    for (var key in nodeData) {
      nodes.push(nodeData[key]);
    }

    var colors = d3.scale.category10();

    var link = svg.selectAll("path.link")
      .data(links)
      .enter().append("path").attr("class", "link")

    var node = svg.selectAll("path.node")
      .data(nodes)
      .enter().append("path").attr("class", "node")
      .style("stroke", function (d) { return '#000'; })
      .call(force.drag)
      .style("fill", function (d, i) {
        return colors(i);
      })
      .on("click", (e) => {
        passingDataToModal(e.index, e.starName);
        modal.style.display = "block";
      });
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