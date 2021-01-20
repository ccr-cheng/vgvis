function draw_scatter() {
    let padding = {'left': 0.1 * width, 'bottom': 0.25 * height, 'top': 0, 'right': 0.1 * width};
    let data = vgdata.Game_data.filter(d => d['Year'] !== 'N/A');

    let svg = d3.select('.scatter')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    // x axis - year
    let x = d3.scaleLinear()
        .domain(year_range)
        .range([padding.left, width - padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .tickFormat(d => d);

    // x axis
    svg.append('g')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.6rem');

    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${height - padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.1 * height)
        .text('Year');

    let update_y_axis = function (cur_y) {
        let y = d3.scaleLinear()
            .domain(get_min_max(data, cur_y))
            .range([height - padding.bottom, padding.top]);
        let axis_y = d3.axisLeft()
            .scale(y)
            .tickFormat(d => d);
        return [y, axis_y]
    };

    [y, axis_y] = update_y_axis(y_attr);

    // y axis
    let y_axis = svg.append('g')
        .attr('id', 'y_axis')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.6rem');
    let y_label = svg.append('g')
        .attr('id', 'y_label')
        .attr('transform', `
                translate(${padding.left}, ${height / 2})
                rotate(-90)
                `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.12)
        .text(y_attr);

    // points
    let points = svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .style('fill', 'blue')
        .attr('cx', d => {
            return x(+d['Year']);
        })
        .attr('cy', d => y(+d[y_attr]))
        .attr('r', 3)
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
                .style('left', (x(+d['Year']) + 5) + 'px')
                .style('top', (y(+d[y_attr]) + 5 + height) + 'px')
                //.transition().duration(500)
                .style('visibility', 'visible');
        })
        .on('mouseout', () => {
            // remove tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
        })
        .on('click', (e, d) => {

        });

    return () => {
        let new_y_label;
        [y, new_y_label] = update_y_axis(y_attr);
        y_axis.transition()
            .duration(1000)
            .call(new_y_label);
        y_label.transition()
            .duration(1000)
            .text(y_attr);
        points.transition()
            .duration(1000)
            .attr('cy', d => y(+d[y_attr]))
    };
}