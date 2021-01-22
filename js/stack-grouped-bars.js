/*

*/
let bar_layout = 'grouped';

function draw_SGB() {
    let width = _width, height = _height * 0.8;
    let last_mode = cur_mode;
    let last_bar_layout = $("input:radio:checked").val();
    let svg = d3.select('.stack-grouped-bar')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('y', -height / 2);
    let keys_alphabet = ['EU_Sales', 'JP_Sales', 'NA_Sales', 'Other_Sales'];
    let padding = {
        top: 0, bottom: .12 * height,
        left: .05 * width, right: .1 * width
    };
    let name_list = [];
    let XRange = [];
    for (let i = year_range[0]; i <= year_range[1]; i++)
        XRange.push(i);

    let YearData = vgdata.aggregate('Year', filter_attr).filter(d => d['g_name'] >= year_range[0] && d['g_name'] <= year_range[1]);
    YearData.sort(function (a, b) {
        let v1 = parseInt(a['g_name']);
        let v2 = parseInt(b['g_name']);
        return v1 - v2;
    });
    let stackData = YearData;
    let groupedData = [];
    for (let i of keys_alphabet) {
        let array = [];
        for (let j of stackData) {
            array.push(j[i]);
        }
        groupedData.push(array);
    }
    let groupedMax = d3.max(groupedData, d => d3.max(d));
    let stack = d3.stack()
        .keys(keys_alphabet)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    stackData = stack(stackData);
    for (let i = 0; i < stackData.length; i++) {
        for (let j of stackData[i]) {
            j.push(i);
        }
    }
    let stackMax = d3.max(stackData, y => d3.max(y, y => y[1]));

    let update_y_axis = (Max) => {
        let y_scale = d3.scaleLinear()
            .domain([0, Max])
            .range([height - padding.bottom, padding.top]);
        return d3.axisLeft()
            .scale(y_scale)
            .ticks()
            .tickFormat(d => d);
    }

    let update_x_axis = (range) => {
        let x_scale = d3.scaleBand()
            .domain(range)
            .rangeRound([padding.left, width - padding.right])
            .padding(0.08);
        return [x_scale, d3.axisBottom()
            .scale(x_scale)
            .ticks(range.length - 1)
            .tickFormat(d => d)];
    }

    let x_scale = d3.scaleBand()
        .domain(XRange)
        .rangeRound([padding.left, width - padding.right])
        .padding(0.08);
    let y_scale = d3.scaleLinear()
        .domain([0, stackMax])
        .range([height - padding.bottom, padding.top]);
    let color = d3.scaleOrdinal()
        .domain(keys_alphabet)
        .range(d3.quantize(d3.interpolateViridis, 4))
        .unknown('#ccc');
    let x_Axis = d3.axisBottom()
        .scale(x_scale)
        .ticks(year_range[1] - year_range[0])
        .tickFormat(d => d);
    let y_Axis = update_y_axis(stackMax);

    let rect = svg.append('g')
        .attr('id', 'stack-graph')
        .selectAll('g')
        .data(stackData)
        .join('g')
        .attr('fill', d => color(d.key))
        .attr('fill-opacity', 0.7)
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('x', (d, i) => x_scale(XRange[i]))
        .attr('y', (d, i) => y_scale(d[1]))
        .attr('height', d => y_scale(d[0]) - y_scale(d[1]))
        .attr('width', x_scale.bandwidth());

    let y_axis = svg.append('g')
        .attr('id', 'y_axis')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(y_Axis);

    let x_axis = svg.append('g')
        .attr('id', 'x_axis')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(x_Axis)
        .selectAll('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('transform', 'rotate(45)');


    rect.on('mouseover', (e, d) => {
        // let content = '<table><tr><td>Year</td><td>' + d.data.g_name + '</td></tr>'
        //     + '<tr><td>' + keys_alphabet[d[2]] + '</td><td>' + d.data[keys_alphabet[d[2]]].toFixed(4) + '</td></tr></table>';
        // let tooltip = d3.select('#tooltip');
        // tooltip.html(content)
        //     .style('left', (x_scale(d.data.g_name) + 5) + 'px')
        //     .style('top', ((y_scale(d[0]) + y_scale(d[1])) / 2 + _height + 5) + 'px')
        //     .style('visibility', 'visible');
    })
        .on('mouseout', () => {
            // let tooltip = d3.select('#tooltip');
            // tooltip.style('visibility', 'hidden');
        })

    let legend_auto = d3.legendColor()
        .scale(color)
        .cells(keys_alphabet)
        // .orient('')
        .shapeWidth(10);
    svg.append('g')
        .attr('class', 'legend_auto')
        .style('font-size', 12)
        .attr('transform', `translate(${0.9 * width}, ${0.1 * height})`)
        .call(legend_auto);

    function transitionGrouped(range) {
        rect.transition()
            .duration(700)
            .delay((d, i) => i * 20)
            .attr('x', (d, i) => {
                return x_scale(range[i]) + x_scale.bandwidth() / keys_alphabet.length * d[2];
            })
            .attr('width', x_scale.bandwidth() / keys_alphabet.length)
            .transition()
            .attr('y', d => y_scale(d[1] - d[0]))
            .attr('height', d => y_scale(0) - y_scale(d[1] - d[0]));
    }

    function transitionStacked(range) {
        rect.transition()
            .duration(700)
            .delay((d, i) => i * 20)
            .attr('y', d => y_scale(d[1]))
            .attr('height', d => y_scale(d[0]) - y_scale(d[1])
            )
            .transition()
            .attr('x', (d, i) => x_scale(range[i]))
            .attr('width', x_scale.bandwidth());
    }

    let attr_value_cb = () => {
        //data update
        console.log(stackData);
        if(cur_mode == 'Global')
        {
            YearData = vgdata.aggregate('Year', filter_attr).filter(d => d['g_name'] >= year_range[0] && d['g_name'] <= year_range[1]);
            for (let i = 1980; i <= 2016; i++) {
                let flag = 1;
                for (let j = 0; j < YearData.length; j++)
                    if (parseInt(YearData[j].g_name) == i) {
                        flag = 0;
                        break;
                    }
                if (flag) {
                    let year = {};
                    year.id = YearData.length;
                    year.g_name = i.toString();
                    year.NA_Sales = 0;
                    year.count = 0;
                    year.Global_Sales = 0;
                    year.JP_Sales = 0;
                    year.EU_Sales = 0;
                    year.Other_Sales = 0;
                    YearData.push(year);
                }
            }
            YearData.sort(function (a, b) {
                let v1 = parseInt(a['g_name']);
                let v2 = parseInt(b['g_name']);
                return v1 - v2;
            });
            groupedData = [];
            stackData = YearData;
            for (let i of keys_alphabet) {
                let array = [];
                for (let j of stackData) {
                    array.push(j[i]);
                }
                groupedData.push(array);
            }
            stackData = stack(stackData);
            for (let i = 0; i < stackData.length; i++) {
                for (let j of stackData[i]) {
                    j.push(i);
                }
            }
            stackMax = d3.max(YearData, y => y.Global_Sales);
            d3.select('#stack-graph')
                .selectAll('g')
                .data(stackData)
                .selectAll('rect')
                .data(d => d);
        }
        else
        {
            groupedData = [];
            stackData = select_data.Game_data;
            name_list = [];
            for(let i of stackData)
            {
                name_list.push(i.Name);
            }
            for (let i of keys_alphabet) {
                let array = [];
                for (let j of stackData) {
                    array.push(parseFloat(j[i]));
                }
                groupedData.push(array);
            }
            stackData = stack(stackData);
            for (let i = 0; i < stackData.length; i++) {
                for (let j of stackData[i]) {
                    j.push(i);
                }
            }
            stackMax = d3.max(select_data.Game_data, d => parseFloat(d.Global_Sales));
        }
        bar_layout = $("input:radio:checked").val();
        groupedMax = d3.max(groupedData, d => d3.max(d));
        let yMax = bar_layout == 'stacked' ? stackMax : groupedMax;
        //axis update
        let new_y_axis = update_y_axis(yMax);
        y_axis.transition()
            .duration(700)
            .call(new_y_axis);
        y_scale = d3.scaleLinear()
            .domain([0, stackMax])
            .range([height - padding.bottom, padding.top]);
        svg.select('#x_axis')
            .remove();
        let range = cur_mode == 'Global' ? XRange : name_list;
        let [new_scale, new_x_axis] = update_x_axis(range);
        x_scale = new_scale;
        if (cur_mode == 'Global')
        {
            x_axis = svg.append('g')
                .attr('id', 'x_axis')
                .attr('transform', `translate(${0}, ${height - padding.bottom})`)
                .call(x_Axis)
                .selectAll('text')
                .attr('x', 10)
                .attr('y', 10)
                .attr('transform', 'rotate(45)');
        }
        else {
            x_axis = svg.append('g')
                .attr('id', 'x_axis')
                .attr('transform', `translate(${0}, ${height - padding.bottom})`)
                .call(new_x_axis)
                .selectAll('text')
                .attr('x', select_data.Game_data.length + 5)
                .attr('y', select_data.Game_data.length + 5)
                .attr('transform', `rotate(${2 * select_data.Game_data.length})`);
        }
        //graph update
        if(last_mode != cur_mode || choose_action == 1)
        {
            // alert('yes');
            d3.select('#stack-graph')
                .remove();
            rect = svg.append('g')
                .attr('id', 'stack-graph')
                .selectAll('g')
                .data(stackData)
                .join('g')
                .attr('fill', d => color(d.key))
                .attr('fill-opacity', 0.7)
                .selectAll('rect')
                .data(d => d)
                .join('rect')
                .attr('x', (d, i) => x_scale(range[i]))
                .attr('y', (d, i) => y_scale(d[1]))
                .attr('height', d => y_scale(d[0]) - y_scale(d[1]))
                .attr('width', x_scale.bandwidth());
            // console.log(stackData);
            // svg.select('#stack-graph')
            //     .selectAll('g')
            //     .data(stackData)
            //     .join('g')
            //     .attr('fill', d => color(d.key))
            //     .attr('fill-opacity', 0.7)
            //     .selectAll('rect')
            //     .data(d => d)
            //     .join(
            //         enter => enter.append('rect')
            //             .attr('x', (d, i) => x_scale(range[i]))
            //             .attr('y', (d, i) => y_scale(d[1]))
            //             .attr('height', d => y_scale(d[0]) - y_scale(d[1]))
            //             .attr('width', x_scale.bandwidth())
            //             .call(enter => enter.transition()
            //                 .duration(700)),
            //         update => update
            //             .attr('x', (d, i) => x_scale(range[i]))
            //             .call(update => update.transition()
            //                 .duration(700)),
            //         exit => exit.remove()
            //
            //     )
            //     .attr('x', (d, i) => x_scale(range[i]))
            //     .attr('y', (d, i) => y_scale(d[1]))
            //     .attr('height', d => y_scale(d[0]) - y_scale(d[1]))
            //     .attr('width', x_scale.bandwidth());
        }
        if (bar_layout == 'stacked')
            transitionStacked(range);
        else if (bar_layout == 'grouped')
            transitionGrouped(range);
        last_mode = cur_mode;
        last_bar_layout = bar_layout;
    }

    let comp_cb = () => {

    };
    return [attr_value_cb, comp_cb];
}
