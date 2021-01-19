/*

*/
let bar_layout = 'grouped';

function draw_SGB() {
    let svg = d3.select('.stack-grouped-bar')
        .append('svg')
        .attr('width', _width)
        .attr('height', _height);
    let keys_alphabet = ['EU_Sales', 'JP_Sales', 'NA_Sales', 'Other_Sales'];
    let padding = {
        top: .02 * _height, bottom: .12 * _height,
        left: .05 * _width, right: .1 * _width
    };
    let XRange = [];
    for (let i = year_range[0]; i <= year_range[1]; i++)
        XRange.push(i);
    console.log(vgdata.aggregate('Year', d => filter_attr(d)));
    let YearData = vgdata.aggregate('Year', d => filter_attr(d)).filter(d => d['g_name'] >= year_range[0] && d['g_name'] <= year_range[1]);
    YearData.sort(function (a, b) {
        let v1 = parseInt(a['g_name']);
        let v2 = parseInt(b['g_name']);
        return v1 - v2;
    });
    let stackData = YearData;
    let groupedData = [];
    for(let i of keys_alphabet) {
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
            .range([_height - padding.bottom, padding.top]);
        return d3.axisLeft()
            .scale(y_scale)
            .ticks()
            .tickFormat(d => d);
    }
    let x_scale = d3.scaleBand()
        .domain(XRange)
        .rangeRound([padding.left, _width - padding.right])
        .padding(0.08);
    let y_scale = d3.scaleLinear()
        .domain([0, stackMax])
        .range([_height - padding.bottom, padding.top]);
    let color = d3.scaleOrdinal()
        .domain(keys_alphabet)
        .range(d3.schemeCategory10)
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
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('x', (d, i) => x_scale(XRange[i]))
        .attr('y', (d, i) => y_scale(d[1]))
        .attr('height', d => y_scale(d[0]) - y_scale(d[1]))
        .attr('width', x_scale.bandwidth());
    let y_axis = svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(y_Axis);
    let x_axis = svg.append('g')
        .attr('transform', `translate(${0}, ${_height - padding.bottom})`)
        .call(x_Axis)
        .selectAll('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('transform', 'rotate(45)');

    function transitionGrouped() {
        rect.transition()
            .duration(700)
            .delay((d, i) => i * 20)
            .attr('x', (d, i) => {
                return x_scale(XRange[i]) + x_scale.bandwidth() / keys_alphabet.length * d[2];
            })
            .attr('width', x_scale.bandwidth() / keys_alphabet.length)
            .transition()
            .attr('y', d => y_scale(d[1] - d[0]))
            .attr('height', d => y_scale(0) - y_scale(d[1] - d[0]));
    }
    function transitionStacked() {
        rect.transition()
            .duration(700)
            .delay((d, i) => i * 20)
            .attr('y', d => y_scale(d[1]))
            .attr('height', d => y_scale(d[0]) - y_scale(d[1])
            )
            .transition()
            .attr('x', (d, i) => x_scale(XRange[i]))
            .attr('width', x_scale.bandwidth());
    }
    return () => {
        //data update
        YearData = vgdata.aggregate('Year', d => filter_attr(d)).filter(d => d['g_name'] >= year_range[0] && d['g_name'] <= year_range[1]);
        for(let i = 1980; i <= 2016; i++)
        {
            let flag = 1;
            for (let j = 0; j < YearData.length; j++)
                if(parseInt(YearData[j].g_name) == i)
                {
                    flag = 0;
                    break;
                }
            if(flag)
            {
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
        stackData = stack(YearData);
        for (let i = 0; i < stackData.length; i++) {
            for (let j of stackData[i]) {
                j.push(i);
            }
        }
        console.log(stackData);
        d3.select('#stack-graph')
            .selectAll('g')
            .data(stackData)
            .selectAll('rect')
            .data(d => d);
        bar_layout = $("input:radio:checked").val();
        groupedData = [];
        for(let i of keys_alphabet) {
            let array = [];
            for (let j of stackData) {
                array.push(j[i]);
            }
            groupedData.push(array);
        }
        stackData = stack(stackData);
        groupedMax = d3.max(groupedData, d => d3.max(d));
        stackMax = d3.max(YearData, y => y.Global_Sales);
        let yMax = bar_layout == 'stacked' ? stackMax: groupedMax;
        //axis update
        let new_y_axis = update_y_axis(yMax);
        y_axis.transition()
            .duration(1000)
            .call(new_y_axis);
        y_scale = d3.scaleLinear()
            .domain([0, stackMax])
            .range([_height - padding.bottom, padding.top]);
        if(bar_layout == 'stacked')
            transitionStacked();
        else if(bar_layout == 'grouped')
            transitionGrouped();

    }
}
