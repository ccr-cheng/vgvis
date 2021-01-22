function draw_bubble(max_node = 800) {
    let width = _width, height = _height;
    let svg = d3.select('.bubble')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');
    let padding = {
        top: .02 * height, bottom: .12 * height,
        left: .05 * width, right: .05 * width
    };
    let select_color = 'rgba(60, 60, 60, 0.7)';
    let x_interp = d3.interpolate(padding.left, width - padding.right);
    let get_x = year => {
        return x_interp((year - year_range[0]) / (year_range[1] - year_range[0]))
    };
    let size_scale = 5;
    let initialize = d => {
        d.r = size_scale * Math.sqrt(+d[cur_sale]);
        d.x = get_x(d['Year']);
        d.y = height * 0.4 + height * 0.1 * Math.random();
        if(d.click_time == undefined) d.click_time = 0;
        return d;
    };

    let nodes = vgdata.Game_data
        .slice(0, max_node)
        .map(d => initialize(d));

    let simulation = d3.forceSimulation(nodes)
        .velocityDecay(.2)
        .force('x', d3.forceX(d => get_x(d['Year'])).strength(0.1))
        .force('y', d3.forceY(height / 2 + (padding.top - padding.bottom) / 2).strength(0.02))
        // .force('boundary', forceBoundary(-width, padding.top,
        //     width * 2, height - padding.bottom).strength(0.005))
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
        .attr('fill', d => d3.interpolateSpectral((d['Year'] - 1980) / (2016 - 1980)))
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
                + '<tr><td>' + cur_sale.replace('_', ' ')
                + '</td><td>' + d[cur_sale] + '</td></tr></table>';

            // tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.html(content)
                .style('left', (d.x/* + _width / 3*/ + 10 + 'px'))
                .style('top', (d.y + 10) + 'px')
                .style('visibility', 'visible');
        })
        .on('click', function (e, d) {
            if(d.click_time == 0) {
                d3.select(this).attr('fill', select_color);
                d.click_time = 1;
                select_data.Game_data.push(d);
                choose_action = 1;
                for(let cb of attr_value_cb)
                    cb();
                choose_action = 0;
            }
            else {
                d3.select(this).attr('fill', d => d3.interpolateSpectral((d['Year'] - 1980) / (2016 - 1980)));
                d.click_time = 0;
                select_data.Game_data.splice(select_data.Game_data.indexOf(d), 1);
                choose_action = 1;
                for(let cb of attr_value_cb)
                    cb();
                choose_action = 0;
            }
            update_frame();
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
            .range([padding.left, width - padding.right]);
        return d3.axisBottom()
            .scale(x)
            .tickFormat(d => d)
    };
    let axis_x = update_x_axis();

    let x_axis = svg.append('g')
        .attr('transform', `translate(0, ${height / 2})`)
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
            .style('fill', d => d.click_time == 0 ? d3.interpolateSpectral((d['Year'] - 1980) / (2016 - 1980)) : select_color)
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
                    + '<tr><td>' + cur_sale.replace('_', ' ')
                    + '</td><td>' + d[cur_sale] + '</td></tr></table>';

                // tooltip
                let tooltip = d3.select('#tooltip');
                tooltip.html(content)
                    .style('left', (d.x/* + _width / 3*/ + 10 + 'px'))
                    .style('top', (d.y + 10) + 'px')
                    .style('visibility', 'visible');
            })
            .on('click', function (e, d) {
                if(d.click_time == 0) {
                    d3.select(this).attr('fill', select_color);
                    d.click_time = 1;
                    select_data.Game_data.push(d);
                    choose_action = 1;
                    for(let cb of attr_value_cb)
                        cb();
                    choose_action = 0;
                }
                else {
                    d3.select(this).attr('fill', d => d3.interpolateSpectral((d['Year'] - 1980) / (2016 - 1980)));
                    d.click_time = 0;
                    select_data.Game_data.splice(select_data.Game_data.indexOf(d), 1);
                    choose_action = 1;
                    for(let cb of attr_value_cb)
                        cb();
                    choose_action = 0;
                }
                update_frame();
            })
            .on('mouseout', () => {
                // remove tooltip
                let tooltip = d3.select('#tooltip');
                tooltip.style('visibility', 'hidden');
            });

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
        nodes.forEach(d => d.r = size_scale * Math.sqrt(+d[cur_sale]));
        node.transition()
            .duration(1000)
            .attr('r', d => d.r);
        simulation.alpha(1)
            .force('collide', d3.forceCollide().radius(d => d.r).iterations(2));
    };
    let update_attr = () => {
        update(d => filter_year(d) && filter_attr(d));
    };
    return [update_year, update_sale, update_attr];
}
