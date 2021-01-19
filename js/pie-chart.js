function calcTranslate(data, move = 4) {
    const moveAngle = data.startAngle + ((data.endAngle - data.startAngle) / 2);
    return `translate(${-move * Math.cos(moveAngle + Math.PI / 2)}, ${-move * Math.sin(moveAngle + Math.PI / 2)})`;
}

function draw_pie() {
    let width = height = _height * 2 / 3;
    let cur_sales = 'Global_Sales';

    let svg = d3.select('.pie')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    let margin = .1 * Math.min(width, height);
    let padding = .05 * Math.min(width, height);
    let radius = Math.min(width, height) / 2 - margin;

    //let data = vgdata.Genre_data;
    let data = vgdata.aggregate('Genre', filter_all)

    let g = svg.append('g')
        .attr('font-family', fontFamily)
        .attr('transform', `translate(${width / 2}, ${height / 2})`);


    let pie = d3.pie()
        .startAngle(Math.PI)
        .endAngle(3 * Math.PI)
        .value(d => d[cur_sales])

    let color = d3.scaleOrdinal()
        .domain(data.map(d => d['g_name']))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8), data.length).reverse())

    let data_ready = pie(data);

    let arc = d3.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius);


    g.selectAll('whatever')
        .data(data_ready)
        .join('path')
        .attr('d', arc)
        .attr('fill', function (d) {
            return (color(d.data['g_name']))
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    const duration = 250;

    g.selectAll('path')
        .style('cursor', 'pointer')
        .on('mouseover', (event, v) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(duration)
                .attr('transform', calcTranslate(v, 10));
            d3.select(event.currentTarget).select('path')
                .transition()
                .duration(duration)
                .attr('stroke', 'rgba(100, 100, 100, 0.2)')
                .attr('stroke-width', 4);
            d3.select('.card-back text').text(v.data['Genre']);
        })
        .on('mouseout', (event, v) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(duration)
                .attr('transform', 'translate(0, 0)');
            d3.select(event.currentTarget).select('path')
                .transition()
                .duration(duration)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
        });


    g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(data_ready)
        .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data['g_name']))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data[cur_sales].toLocaleString()));

    const card = g.append('g')
        .attr('text-anchor', 'middle')
        .style('-webkit-perspective', 1000)
        .style('-webkit-transform', 'rotateY(0deg)')
        .on('click', (event, d) => {
            const flipped = d3.select(event.currentTarget).classed('flipped');
            d3.select(event.currentTarget)
                .classed('flipped', !flipped);
            d3.select(event.currentTarget).transition().duration(500)
                .style('-webkit-transform', flipped ? 'rotateY(0deg)' : 'rotateY(180deg)');
            d3.select('.card-front')
                .transition().delay(250)
                .style('display', flipped ? 'inline' : 'none');
            d3.select('.card-back')
                .transition().delay(250)
                .style('display', flipped ? 'none' : 'inline');
        });

    card.append('circle')
        .attr('r', (radius - padding) / 2 - 2)
        .style('fill', 'violet')
        .attr('stroke', 'rgba(100, 100, 100, 0.2)')
        .attr('stroke-width', 4);

    card.append('circle')
        .attr('r', (radius) / 2 - 4)
        .style('fill', 'white');


    const cardFront = card.append('g')
        .attr('class', 'card-front');
    cardFront.append('text')
        .text('Genres');
    cardFront.append('text')
        .attr('dy', '-1.8rem')
        .text('Total Sales');
    cardFront.append('text')
        .attr('dy', '1.8rem')
        .style('font-size', '90%')
        .text('Test');


    const cardBack = card.append('g')
        .attr('class', 'card-back')
        .style('display', 'none')
        .style('transform', 'rotateY(180deg)');
    cardBack.append('text')
        .text('Back');
}


