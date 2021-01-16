function draw_bubble(filter_thres = 2.) {
    let svg = d3.select('.scatter')
        .append('svg')
        .attr('width', _width)
        .attr('height', _height)
        .append('g');
    let padding = {
        top: .05 * _height, bottom: .15 * _height,
        left: .05 * _width, right: .1 * _width
    };
    let cur_range = year_range;
    let x_interp = d3.interpolate(padding.left, _width - padding.right);
    let get_year_ratio = year => (year - cur_range[0]) / (cur_range[1] - cur_range[0]);
    let get_x = year => x_interp(get_year_ratio(year));

    let nodes = vgdata.Game_data.filter(d => +d['Global_Sales'] > filter_thres);
    nodes.forEach(d => {
        d.r = 5 * Math.sqrt(+d['Global_Sales']);
        d.x = get_x(d['Year']);
        d.y = _height * Math.random();
    });

    let simulation = d3.forceSimulation(nodes)
        .velocityDecay(.1)
        .force('x', d3.forceX(d => get_x(+d['Year'])).strength(0.01))
        .force('y', d3.forceY(height + (padding.top - padding.bottom) / 2).strength(0.01))
        .force('collide', d3.forceCollide().radius(d => d.r).iterations(2))
        // .force('center', d3.forceCenter(width, height + (padding.top - padding.bottom) / 2))
        .force('boundary', forceBoundary(-1000, padding.top, _width + 1000, _height - padding.bottom).strength(0.001))
        .on('tick', () => {
            node.attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

    let drag = simulation => {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    let node = svg.append('g')
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'point')
        .style('fill', d => d3.interpolateSpectral(get_year_ratio(+d['Year'])))
        .attr('cx', width)
        .attr('cy', height)
        .attr('r', d => d.r)
        .call(drag(simulation))
        .on('mouseover', (e, d) => {
            // show a tooltip
            let content = '<table><tr><td>Name</td><td>' + d['Name'] + '</td></tr>'
                + '<tr><td>Year</td><td>' + d['Year'] + '</td></tr>'
                + '<tr><td>Platform</td><td>' + d['Platform'] + '</td></tr>'
                + '<tr><td>Genre</td><td>' + d['Genre'] + '</td></tr>'
                + '<tr><td>Publisher</td><td>' + d['Publisher'] + '</td></tr>'
                + '<tr><td>' + y_attr.replace('_', ' ')
                + '</td><td>' + d[y_attr] + '</td></tr></table>';

            // tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.html(content)
                .style('left', (d.x + 5) + 'px')
                .style('top', (d.y + 5) + 'px')
                .style('visibility', 'visible');
        })
        .on('mouseout', () => {
            // remove tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
        });
}
