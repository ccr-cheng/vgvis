let data_frame_flag = 0;
function click_button() {
    if(data_frame_flag == 0) {
        data_frame_flag = 1;
        d3.select('.selectData')
            .style('display', 'block');
    }
    else {
        data_frame_flag = 0;
        d3.select('.selectData')
            .style('display', 'none');
    }
}

function update_frame() {
    d3.select('.selectData')
        .select('svg')
        .remove();
    let svg = d3.select('.selectData')
        .append('svg')
        .attr('width', 0.2 * _width)
        .attr('height', 0.8 * _height);
    let game_data = select_data.Game_data;
    for (let i = 0; i < game_data.length; i++) {
        let name = game_data[i].Name;
        if (name.length > 25)
            name = name.substring(0, 25) + '...';
        svg.append('g')
            .attr('transform', `translate(${20}, ${(i + 1) * 20})`)
            .append('text')
            .style('white-space', 'pre')
            .text((i + 1).toString() + '.' + '  ' + name);
    }
}