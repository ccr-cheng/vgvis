function calcTranslate(data, move = 4) {
  const moveAngle = data.startAngle + ((data.endAngle - data.startAngle) / 2);
  return `translate(${- move * Math.cos(moveAngle + Math.PI / 2)}, ${- move * Math.sin(moveAngle + Math.PI / 2)})`;
}

function draw_pie(attr) {
    let cur_sales = cur_sale;
    let attr2list = new Map();
    let compare;
    if(attr == 'Year')
        compare = (a, b) => parseInt(a.g_name) - parseInt(b.g_name);
    else compare = (a, b) => list.indexOf(a.g_name) - list.indexOf(b.g_name);
    attr2list.set('Platform', platforms);
    attr2list.set('Genre', genres);
    attr2list.set('Publisher', publishers);
    let new_pie = (cur_sales) => {
        return d3.pie()
            .startAngle(Math.PI)
            .endAngle(3 * Math.PI)
            .padAngle(0.025)
            .value(d => d[cur_sales]);
    };
    let list = attr2list.get(attr);
    let svg = d3.select('.pie')
        .append('svg')
        .attr('width', 0.3 * _width)
        .attr('height', _height);
    let width = svg._groups[0][0].width.animVal.value;//width of single svg of pie graph
    let height = svg._groups[0][0].height.animVal.value;//height of single svg of pie graph
    let margin = .1 * Math.min(width, height);
    let padding = .05 * Math.min(width, height);
    let radius = Math.min(width, height) / 2 - margin;

    let data = vgdata.aggregate(attr, filter_all);
    data.sort(compare);
    let g = svg.append('g')
        .attr('font-family', fontFamily)
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    let pie = new_pie(cur_sales);

    let color = d3.scaleOrdinal()
        .domain(data.map(d => d['g_name']))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 ), data.length).reverse())
    let data_ready = pie(data);

    let arc = d3.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius);


    g.selectAll('whatever')
        .data(data_ready)
        .join('path')
        .transition()
        .delay((d, i) => i * 60)
        .duration(500)
        .attr('d', arc)
        .attr('fill', function (d) {
            return (color(d.data['g_name']))
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    const duration = 500;

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
                svg.select('#cardBackText1')
                .text(v.data[cur_sales].toFixed(4));
                svg.select('#cardBackText2')
                .text(v.data['g_name']);
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

    const textThreshold = 0.22;

    let pie_text = g.append("g")
        .attr("font-family", fontFamily)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(data_ready)
        .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style('display', v => v.endAngle - v.startAngle > textThreshold ? 'inline' : 'none')
        .call(text => text.append('tspan')
            .attr('id', 'tspan1')
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data['g_name']))
        .call(text => text.append('tspan')
            .attr('id', 'tspan2')
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data[cur_sales].toLocaleString()));

    const card = g.append('g')
        .attr("font-family", fontFamily)
        .attr('text-anchor', 'middle')
        .style('-webkit-perspective', 1000)
        .style('-webkit-transform', 'rotateY(0deg)')
        .on('click', (event, d) => {
            const flipped = d3.select(event.currentTarget).classed('flipped');
            d3.select(event.currentTarget)
                .classed('flipped', !flipped);
            d3.select(event.currentTarget).transition().duration(500)
                .style('-webkit-transform', flipped ? 'rotateY(0deg)' : 'rotateY(180deg)');
                svg.select('.card-front')
                .transition().delay(250)
                .style('display', flipped ? 'inline' : 'none');
                svg.select('.card-back')
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

    let sale_text = '';

    let change_text = () => {
        if (cur_sale === 'Global_Sales')
            sale_text = 'Global Sales';
        if (cur_sale === 'EU_Sales')
            sale_text = 'Europe Sales';
        if (cur_sale === 'NA_Sales')
            sale_text = 'North America Sales';
        if (cur_sale === 'JP_Sales')
            sale_text = 'Japan Sales';
        if (cur_sale === 'Other_Sales')
            sale_text = 'Other Sales';
    }

    change_text();

    const cardFront = card.append('g')
        .attr('class', 'card-front');
    let cardFrontText2 = cardFront.append('text')
        .attr("font-weight", "bold")
        .attr('dy', '1.2rem')
        .text(sale_text);
    let cardFrontText1 = cardFront.append('text')
        .attr("font-weight", "bold")
        .attr('dy', '-1rem')
        .text(attr);


    const cardBack = card.append('g')
        .attr('class', 'card-back')
        .style('display', 'none')
        .style('transform', 'rotateY(180deg)');

    let cardBackText1 = cardBack.append('text')
        .attr('id', 'cardBackText1')
        .attr("font-weight", "bold")
        .attr('dy', '1.2rem');
    let cardBackText2 = cardBack.append('text')
        .attr('id', 'cardBackText2')
        .attr("font-weight", "bold")
        .attr('dy', '-1rem');

    let update_sale = () => {
        cur_sales = cur_sale;
        change_text();
        pie = new_pie(cur_sales);
        data_ready = pie(data);
        g.selectAll('path')
            .data(data_ready)
            .transition()
            .delay((d, i) => i * 10)
            .duration(500)
            .attr('d', arc);
        cardFrontText1.text(attr);
        cardFrontText2.text(sale_text);
        pie_text.data(data_ready)
            .transition()
            .delay((d, i) => i * 10)
            .duration(500)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .style('display', v => v.endAngle - v.startAngle > textThreshold ? 'inline' : 'none')
            .call(text => text.select('#tspan1')
                .attr("y", "-0.4em")
                .attr("font-weight", "bold")
                .text(d => d.data['g_name'].toString()))
            .call(text => text.select('#tspan2')
                .attr("x", 0)
                .attr("y", "0.7em")
                .attr("fill-opacity", 0.7)
                .text(d => d.data[cur_sales].toLocaleString()));
    }

    let update_attr = () => {
        //data update
        cur_sales = cur_sale;
        list = [];
        data = vgdata.aggregate(attr, filter_all);
        if (attr == 'Year'){
            for (let i = 1980; i <= 2016; i++)
                list.push(i.toString());
        }
        else list = attr2list.get(attr);
        for (let i of list) {
            let flag = 1;
            for (let j of data)
                if(j.g_name == i)
                {
                    flag = 0;
                    break;
                }
            if(flag)
            {
                let str = {};
                str.id = data.length;
                str.g_name = i;
                str.count = 0;
                str.NA_Sales = 0;
                str.EU_Sales = 0;
                str.Global_Sales = 0;
                str.JP_Sales = 0;
                str.Other_Sales = 0;
                data.push(str);
            }
        }
        data.sort(compare);
        // pie update
        pie = new_pie(cur_sales);
        data_ready = pie(data);
        g.selectAll('path')
            .data(data_ready)
            .transition()
            .delay((d, i) => i * 10)
            .duration(500)
            .attr('d', arc);
        // text update
        cardFrontText1.text(attr);
        cardFrontText2.text(sale_text);
        pie_text.data(data_ready)
            .transition()
            .delay((d, i) => i * 10)
            .duration(500)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .style('display', v => v.endAngle - v.startAngle > textThreshold ? 'inline' : 'none')
            .call(text => text.select('#tspan1')
                .attr("y", "-0.4em")
                .attr("font-weight", "bold")
                .text(d => d.data['g_name']))
            .call(text => text.select('#tspan2')
                .attr("x", 0)
                .attr("y", "0.7em")
                .attr("fill-opacity", 0.7)
                .text(d => d.data[cur_sales].toLocaleString()));
    }
    return [update_sale, update_attr];
}


