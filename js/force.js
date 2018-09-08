d3.json('http://52.78.57.243:5000/asterism', (error, linksData) => {
  if (error) throw error;

  // Gnomonic 형태로 그려냅니다
  const projections = {
    "Gnomonic": d3.geo.gnomonic(),
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
    .pointRadius(15)
    .projection(projection)


  const force = d3.layout.force()
    .linkDistance(config["linkDistance"])
    .linkStrength(config["linkStrength"])
    .gravity(config["gravity"])
    .size([width, height])
    .charge(-config["charge"]);


  // svg라는 element를 만들어냅니다
  let svg = d3.select("#svgContainer").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .classed("responsive", true)  // window size에 responsive하기 위해 필요합니다
    .call(d3.behavior.drag()
      .origin(function () { const r = projection.rotate(); return { x: 2 * r[0], y: -2 * r[1] }; })
      .on("drag", function () { force.start(); const r = [d3.event.x / 2, -d3.event.y / 2, projection.rotate()[2]]; t0 = Date.now(); origin = r; projection.rotate(r); }))


  svg.append('defs').append('pattern')
    .attr('id', 'imgpattern')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 1)
    .attr('height', 1)
    .append('image')
    .attr('width', 40)
    .attr('height', 30)
    .attr('xlink:href', 'http://viewers.heraldcorp.com/news/photo/201804/12640_7045_488.jpg')


  d3.json('http://52.78.57.243:5000/star', (err, nodesData) => {
    if (err) throw err;
    let links = [];

    // 별자리를 별 4개 단위로 그려냅니다
    const drawFour = function (array, type) {
      if (array.length === 1) { return; }
      const drawLine = function (i, j) {
        const source = nodesData[array[i]];
        const target = nodesData[array[j]];
        links.push({ source: source, target: target });
      }

      // 두 점을 잇습니다
      drawLine(0, 1);
      if (array.length === 2) { return; }

      // 세 점을 잇습니다
      drawLine(1, 2);
      if (array.length === 3) { return; }

      // 네 점을 잇습니다
      drawLine(2, 3);

      // 사각형을 만듭니다
      if (type === 'square') { drawLine(0, 3); }

      // 삼각형에 꼭지가 달린 형태를 만듭니다
      if (type === 'triangle') { drawLine(1, 3); }
    }

    for (let asterismId in linksData) {
      const starIds = linksData[asterismId];
      for (let i = 0; i < starIds.length; i++) {

        // node에 asterism 정보를 줍니다
        if (!nodesData[starIds[i]].asterisms || nodesData[starIds[i]].asterisms.length === 0) {
          nodesData[starIds[i]].asterisms = [asterismId];
        } else {
          nodesData[starIds[i]].asterisms.push(asterismId);
        }

        // 4개 단위로 별자리를 그립니다
        if (i % 4 === 0) {
          const types = ['line', 'square', 'triangle'];
          let fourStarIds = [starIds[i]];
          if (i + 1 < starIds.length) { fourStarIds.push(starIds[i + 1]); }
          if (i + 2 < starIds.length) { fourStarIds.push(starIds[i + 2]); }
          if (i + 3 < starIds.length) { fourStarIds.push(starIds[i + 3]); }
          drawFour(fourStarIds, types[~~(Math.random() * 3)])
        }

        // 4개씩 그려진 별자리를 이어줍니다
        if (i % 4 === 3 && i < starIds.length - 1) {
          const source = nodesData[starIds[i]];
          const target = nodesData[starIds[i + 1]];
          links.push({ source: source, target: target });
        }
      }
    }

    // GET 요청을 통해 받아온 데이터를 array 안에 정리합니다
    let nodes = [];
    for (let key in nodesData) {
      nodes.push(nodesData[key]);
    }

    let link = svg.selectAll("path.link")
      .data(links)
      .enter().append("path").attr("class", "link")

    let node = svg.selectAll("path.node")
      .data(nodes)
      .enter().append("path").attr("class", "node")
      .style("stroke", function (d) { return '#000'; })
      .call(force.drag)
      .style("fill", 'url(#imgpattern)')
      .on("click", (e) => {
        passingDataToModal(e.id, e.starName);
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
