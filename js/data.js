let vgdata = {};
let vgdata_file = './data/vgsales.csv';


function get_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = parseInt(d[attr]);
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });
    console.log('attr', attr, 'min', min, 'max', max);

    return [min, max];
}

function aggregate(data, group) {
    console.log(`Processing ${group} data ...`);
    let unique = [...new Set(data.map(d => d[group]))];
    let group2idx = new Map(unique.map((d, i) => [d, i]));
    let group_data = unique.map((d, i) => {
        let g_data = {id: i, g_name: d, count: 0};
        for (let field of vgdata.aggr_fields)
            g_data[field] = 0.;
        return g_data
    });
    data.forEach(d => {
        let d_group = group_data[group2idx.get(d[group])];
        d_group.count += 1;
        for (let field of vgdata.aggr_fields)
            d_group[field] += +d[field];
    });

    vgdata[`${group}2idx`] = group2idx;
    vgdata[`${group}_data`] = group_data;
    console.log(`${group} data processing complete with size ${group_data.length}`);
}

function proc_data(data) {
    vgdata.aggr_groups = ['Platform', 'Year', 'Genre', 'Publisher'];
    vgdata.aggr_fields = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales'];
    vgdata['Game_data'] = data;
    for (let group of vgdata.aggr_groups) {
        aggregate(data, group)
    }
}
