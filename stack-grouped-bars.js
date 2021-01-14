/*

*/
function draw_SGB() {
    let svg = d3.select('.stack-grouped-bar')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    let TimeRange = getTimeRange();
    let XRange = [];
    for (let i = TimeRange[0]; i <= TimeRange[1]; i++)
        XRange.push(i);
    let YearData = vgdata['Year_data'];
    YearData.sort(function (a, b) {
        let v1 = parseInt(a['g_name']);
        let v2 = parseInt(b['g_name']);
        return v1 - v2;
    });
    let stackData = [];
    for (let i = 0; i < YearData.length; i++) {
        let data = YearData[i];
        if (parseInt(data['g_name']) <= TimeRange[1] && parseInt(data['g_name']) >= TimeRange[0])
            stackData.push(data);
    }
    stackData = d3.stack()
        .keys(['EU_Sales', 'JP_Sales', 'NA_Sales', 'Other_Sales'])(stackData);
    // console.log(stackData);
    let yMax = d3.max(stackData, y => d3.max(y, y => y[1]));
    let x_scale = d3.scaleBand()
        .domain(XRange)
        .rangeRound([0, 0.5 * width])
        .padding(0.08);
    let y_scale = d3.scaleLinear()
        .domain([0, yMax])
        .range([0.5 * height, 0]);
    let color = d3.scaleOrdinal()
        .domain(['EU_Sales', 'JP_Sales', 'NA_Sales', 'Other_Sales'])
        .range(d3.schemeCategory10)
        .unknown('#ccc');
    let x_Axis = d3.axisBottom()
        .scale(x_scale)
        .ticks(TimeRange[1] - TimeRange[0])
        .tickFormat(d => d);
    let y_Axis = d3.axisLeft()
        .scale(y_scale)
        .ticks()
        .tickFormat(d => d);
    svg.append('g')
        .selectAll('g')
        .data(stackData)
        .join('g')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('x', (d, i) => x_scale(parseInt(d.data['g_name'])) + 30)
        .attr('y', (d, i) => y_scale(d[1]))
        .attr('height', d => y_scale(d[0]) - y_scale(d[1]))
        .attr('width', x_scale.bandwidth());
    svg.append('g')
        .attr('transform', `translate(${30}, ${0})`)
        .call(y_Axis);
    svg.append('g')
        .attr('transform', `translate(${30}, ${0.5 * height})`)
        .call(x_Axis)
        .selectAll('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('transform', 'rotate(45)');
}
