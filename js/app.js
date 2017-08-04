var width = 800,
    height = 600
    root = d3.select('#root')
        .attr('width', width)
        .attr('height', height),
    bg = root.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#333');
    nodes = [];
    links = [];

d3.json('/chat_friends/data.json', function(err, data) {
	nodes = data.response;
	ids = nodes.map(function(n) {
		return n.id;
	});
	nodes.forEach(function(n) {
		if (ids.indexOf(n.id) !== -1 && ids.indexOf(n.invited_by) !== -1) {
			links.push({
				source: n.id,
				target: n.invited_by,
			});
		}
	});

	var link = root.selectAll('.link')
		.data(links)
		.enter()
			.append('line')
			.attr('class', 'link');
	var node = root.selectAll('.node')
		.data(nodes)
		.enter()
			.append('g')
			.attr('class', 'node')
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

	node.append('image')
		.attr("xlink:href", function (d) {
			return d.photo_50;
		})
		.attr('width', 50)
		.attr('height', 50);



	var sim = d3.forceSimulation()
		.nodes(nodes)
		.force("charge", d3.forceManyBody())
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("link", d3.forceLink(links).id(function(d) {
			return d.id;
		}).distance(150));

	sim.on('tick', function() {
		node.attr('transform', function(d) {
			return 'translate(' + d.x + ',' + d.y +')';
		});

		link
			.attr('x1', function(d) {
				return d.source.x;
			})
			.attr('y1', function(d) {
				return d.source.y;
			})
			.attr('x2', function(d) {
				return d.target.x;
			})
			.attr('y2', function(d) {
				return d.target.y;
			});
	});

	sim.restart();


	function dragstarted(d) {
		if (!d3.event.active) sim.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) sim.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}
})
