function draw_bubble(max_node = 800) {
    let svg = d3.select('.bubble')
        .append('svg')
        .attr('width', _width)
        .attr('height', _height)
        .append('g');
    let padding = {
        top: .02 * _height, bottom: .12 * _height,
        left: .05 * _width, right: .1 * _width
    };
    let x_interp = d3.interpolate(padding.left, _width - padding.right);
    let get_x = year => {
        return x_interp((year - year_range[0]) / (year_range[1] - year_range[0]))
    };
    let initialize = d => {
        d.r = 5 * Math.sqrt(+d[cur_sale]);
        d.x = get_x(d['Year']);
        d.y = _height * 0.4 + _height * 0.1 * Math.random();
        return d;
    };

    let nodes = vgdata.Game_data
        .slice(0, max_node)
        .map(d => initialize(d));

    let simulation = d3.forceSimulation(nodes)
        .velocityDecay(.2)
        .force('x', d3.forceX(d => get_x(d['Year'])).strength(0.1))
        .force('y', d3.forceY(height + (padding.top - padding.bottom) / 2).strength(0.02))
        // .force('boundary', forceBoundary(0, padding.top,
        //     _width, _height - padding.bottom).strength(0.005))
        .force('collide', d3.forceCollide().radius(d => d.r).iterations(2));

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
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .style('fill', d => d3.interpolateSpectral((d['Year'] - 1980) / (2016 - 1980)))
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
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

    let ticked = () => {
        node.attr('cx', d => d.x)
            .attr('cy', d => d.y);
    };
    simulation.on('tick', ticked);

    // x axis
    let update_x_axis = () => {
        let x = d3.scaleLinear()
            .domain(year_range)
            .range([padding.left, _width - padding.right]);
        return d3.axisBottom()
            .scale(x)
            .tickFormat(d => d)
    };
    let axis_x = update_x_axis();

    let x_axis = svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '1rem');

    let update = filter_func => {
        // update data
        let old = node.data().filter(d => filter_func(d));
        let old_map = new Map(old.map(d => [d['Rank'], d]));
        nodes = vgdata.Game_data
            .filter(d => filter_func(d))
            .map(d => old_map.get(d['Rank']) || initialize(d));
        nodes = nodes.slice(0, Math.min(max_node, nodes.length));

        // update nodes
        node = node.data(nodes)
            .join('circle')
            .style('fill', d => d3.interpolateSpectral((d['Year'] - 1980) / (2016 - 1980)))
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)
            .call(drag(simulation));

        simulation.nodes(nodes)
            .on('tick', ticked)
            .alpha(1).restart();
    };

    let update_year = () => {
        // update axis
        let new_axis_x = update_x_axis();
        x_axis.transition()
            .duration(1000)
            .call(new_axis_x);
        update(filter_year);
    };
    let update_sale = () => {
        nodes.forEach(d => d.r = 5 * Math.sqrt(+d[cur_sale]));
        node.transition()
            .duration(1000)
            .attr('r', d => d.r);
        simulation.alpha(1)
            .force('collide', d3.forceCollide().radius(d => d.r).iterations(2));
    };
    let update_attr = () => {
        if (cur_attribute_value.has('All'))
            update(filter_year);
        else update(d => filter_year(d) && filter_attr(d));
    };
    return [update_year, update_sale, update_attr];
}
