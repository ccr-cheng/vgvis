function draw_bubble(filter_thres = 2.) {
    let svg = d3.select('.scatter')
        .append('svg')
        .attr('width', _width)
        .attr('height', _height)
        .append('g');
    let nodes = vgdata.Game_data
        .filter(d => d['Year'] !== 'N/A' && +d['Global_Sales'] > filter_thres);

    let simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX().strength(0.001))
        .force('y', d3.forceY().strength(0.001))
        .force('collide', d3.forceCollide().radius(d => 5 * Math.sqrt(+d['Global_Sales'])).iterations(3))
        .force('charge', d3.forceManyBody().strength(1.))
        .force('center', d3.forceCenter(width, height))
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
        .style('fill', 'rgba(80, 80, 80, .2)')
        .attr('cx', width)
        .attr('cy', height)
        .attr('r', d => 5 * Math.sqrt(d['Global_Sales']))
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
