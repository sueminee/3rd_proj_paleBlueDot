d3.json('http://52.78.57.243:5000/asterism', (error, linksData) => {
  if (error) throw error;
  d3.json('http://52.78.57.243:5000/star', (err, nodesData) => {
    if (err) throw err;

    // Gnomonic 형태로 그려냅니다
    const projections = {
      "Gnomonic": d3.geo.gnomonic(),
      "Orthographic": d3.geo.orthographic(), // 얘는 디버깅 용입니다
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
    let scale = Object.keys(nodesData).length * 7;

    const projection = projections[config["projection"]]  //gnomonic
      .scale(scale)  // 여기를 조절해 원하는 크기의 우주를 생성합니다
      .translate([width / 2, height / 2])
      .clipAngle(config["clip"] ? 90 : null)

    let path = d3.geo.path()
      .pointRadius(25)  // star의 반지름입니다.
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

    // 함수들정의
    var mouseOverFunction = function (d) {
      node
        .transition(1000)
        .style("opacity", function (o) {
          return isConnected(o, d) ? 1.0 : 0.2;
        })
      link
        .transition(1000)
        .style("stroke-opacity", function (o) {
          return o.source === d || o.target === d ? 1 : 0.2;
        })
    }

    var mouseOutFunction = function () {
      node
        .transition(1000)
        .style("opacity", 1.0);
      link
        .transition(1000)
        .style("stroke-opacity", 0.5);
    }

    function isConnected(a, b) {
      return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.asterisms === b.asterisms;
    }

    function isConnectedAsSource(a, b) {
      return linkedByIndex[a.asterisms + "," + b.asterisms];
    }

    function isConnectedAsTarget(a, b) {
      return linkedByIndex[b.asterisms + "," + a.asterisms];
    }

    function isEqual(a, b) {
      return a.asterisms === b.asterisms;
    }

    var linkedByIndex = {};
    links.forEach(function (d) {
      linkedByIndex[d.source.asterisms + "," + d.target.asterisms] = true;
    });

    let link = svg.selectAll("path.link")
      .data(links)
      .enter().append("path").attr("class", "link")

    let node = svg.selectAll("path.node")
      .data(nodes)
      .enter().append("path")
      .attr("class", "node")
      .attr("id", function (d, i) {
        return 'node' + i;
      })
      .call(force.drag)
      .style('fill', function (d, i) {
        svg.append('defs').append('pattern')
          .attr('id', 'imgpattern' + i)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 1)
          .attr('height', 1)
          .append('image')
          .attr('width', 50)
          .attr('height', 50)
          .attr('xlink:href', 'http://52.78.57.243:5000/thumbs/' + d.imgName)
        return `url(#imgpattern${i})`
      })
      .on("click", (e) => {
        passingDataToModal(e.id, e.asterisms);
        modal.style.display = "block";
      })
      .on("mouseover", mouseOverFunction)
      .on("mouseout", mouseOutFunction);

    svg
      .append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 6 + 7) // Controls the shift of the arrow head along the path
      .attr("refY", 2)
      .attr("markerWidth", 6)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0,0 V 4 L6,2 Z");

    link
      .attr("marker-end", "url()");


    // 별 둘레를 깜빡이는 함수입니다
    const setColor = function (i, str, direction) {
      const num = parseInt(str, 16);
      if (direction === 1) {
        if (num === 15) { return setColor(i, 'f', -1); }
        setTimeout(() => setColor(i, (num + 1).toString(16), 1), Math.sin(num * Math.PI / 32) * 100)
        return $('#node' + i).css('stroke', '#' + str + str + str);
      } else if (direction === -1) {
        if (num === 0) { return setColor(i, '0', 1); }
        setTimeout(() => setColor(i, (num - 1).toString(16), -1), Math.sin(num * Math.PI / 32) * 100)
        return $('#node' + i).css('stroke', '#' + str + str + str);
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      setColor(i, (i % 16).toString(16), 1)
    }

    force
      .nodes(nodes)
      .links(links)
      .on("tick", tick)
      .start();

    // star들이 극쪽에 집중되지 않게 합니다
    function transformY(y) {
      if (y % 360 >= -90 && y % 360 < 90) {
        return y = Math.asin((y % 90) / 90) / Math.PI * 180;
      } else if (y % 360 >= 90 && y % 360 < 180) {
        return y = Math.asin((90 - y % 90) / 90) / Math.PI * 180;
      } else if (y % 360 >= 180 && y % 360 < 270) {
        return y = Math.asin(-(y % 90) / 90) / Math.PI * 180
      } else if (y % 360 >= 270) {
        return y = Math.asin(-(90 - y % 90) / 90) / Math.PI * 180
      }
    }

    function tick() {
      link.attr("d", function (d) { const p = path({ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[d.source.x, transformY(d.source.y)], [d.target.x, transformY(d.target.y)]] } }); return p });
      node.attr("d", function (d) { const p = path({ "type": "Feature", "geometry": { "type": "Point", "coordinates": [d.x, transformY(d.y)] } }); return p; })
    }
  });
})