d3.json('http://52.78.57.243:5000/asterism', (error, linksData) => {
  if (error) throw error;

  // Gnomonic 형태로 그려냅니다
  const projections = {
    "Gnomonic": d3.geo.orthographic(),
  };

  const config = {
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

  // 창의 크기를 읽습니다
  let width = window.innerWidth;
  let height = window.innerHeight;

  const projection = projections[config["projection"]]  //gnomonic
    .scale(1000)  //여기를 조절해 원하는 크기의 우주를 생성합니다
    .translate([width / 2, height / 2])
    .clipAngle(config["clip"] ? 90 : null)
  let path = d3.geo.path()
    .projection(projection)

  const force = d3.layout.force()
    .linkDistance(config["linkDistance"])
    .linkStrength(config["linkStrength"])
    .gravity(config["gravity"])
    .size([width, height])
    .charge(-config["charge"]);

  // svg라는 element를 만들어냅니다
  let svg = d3.select("#svgContainer").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet") // window size에 responsive하기 위해 필요합니다
    .attr("viewBox", "0 0 1000 1000") // window size에 responsive하기 위해 필요합니다
    .classed("responsive", true)  // window size에 responsive하기 위해 필요합니다
    .call(d3.behavior.drag()
      .origin(function () { const r = projection.rotate(); return { x: 2 * r[0], y: -2 * r[1] }; })
      .on("drag", function () { force.start(); const r = [d3.event.x / 2, -d3.event.y / 2, projection.rotate()[2]]; t0 = Date.now(); origin = r; projection.rotate(r); }))

  d3.json('http://52.78.57.243:5000/star', (err, nodesData) => {
    if (err) throw err;
    let links = [];
    // 지금은 같은 별자리들끼리 원형으로 이어지는 알고리즘입니다. 하지만 나중에 다른 알고리즘으로 수정하려 합니다.
    for (let asterismId in linksData) {
      const starIds = linksData[asterismId];
      for (let i = 0; i < starIds.length; i++) {

        // node에 asterism 정보를 줍니다
        if (!nodesData[starIds[i]].asterisms || nodesData[starIds[i]].asterisms.length === 0) {
          nodesData[starIds[i]].asterisms = [asterismId];
        } else {
          nodesData[starIds[i]].asterisms.push(asterismId);
        }

        // 링크를 생성합니다
        const source = nodesData[starIds[i]];
        const target = i === starIds.length - 1 ? nodesData[starIds[0]] : nodesData[starIds[i + 1]]
        links.push({ source: source, target: target })
      }
    }

    // GET 요청을 통해 받아온 데이터를 array 안에 정리합니다
    let nodes = [];
    for (let key in nodesData) {
      nodes.push(nodesData[key]);
    }

    // 나중에 이미지를 불러오게 되면 필요 없습니다
    const colors = d3.scale.category10();

    let link = svg.selectAll("path.link")
      .data(links)
      .enter().append("path").attr("class", "link")

    let node = svg.selectAll("path.node")
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
      node.attr("d", function (d) { const p = path({ "type": "Feature", "geometry": { "type": "Point", "coordinates": [d.x, d.y] } }); return p ? p : 'M 0 0' });
      link.attr("d", function (d) { const p = path({ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[d.source.x, d.source.y], [d.target.x, d.target.y]] } }); return p ? p : 'M 0 0' });
    }
  });
})