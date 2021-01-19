let vgdata = {
    Game_data: null,
    Platform_data: null, Platform2idx: null,
    Year_data: null, Year2idx: null,
    Genre_data: null, Genre2idx: null,
    Publisher_data: null, Publisher2idx: null,
    aggr_groups: ['Platform', 'Year', 'Genre', 'Publisher'],
    aggr_fields: ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales'],
};
const vgdata_file = './data/vgsales.csv';

const platforms = [
    "Wii", "NES", "GB", "DS", "X360", "PS3", "PS2", "SNES",
    "GBA", "3DS", "PS4", "N64", "PS", "XB", "PC", "2600",
    "PSP", "XOne", "GC", "WiiU", "GEN", "DC", "PSV", "SAT",
    "SCD", "WS", "NG", "TG16", "3DO", "GG", "PCFX"
];
const genres = [
    "Sports", "Platform", "Racing", "Role-Playing", "Puzzle", "Misc",
    "Shooter", "Simulation", "Action", "Fighting", "Adventure", "Strategy"
];

const publishers = [];

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
    if (group === 'Year')
        unique = unique.sort((a, b) => a - b);
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
    vgdata['Game_data'] = data.filter(d => d['Year'] !== 'N/A' &&
        +d['Year'] >= 1980 && +d['Year'] <= 2016);
    for (let group of vgdata.aggr_groups) {
        aggregate(vgdata['Game_data'], group)
    }
    //generate publisher list
    for (let data of vgdata.Publisher_data) {
        publishers.push(data['g_name']);
    }
}

function data_update() {
    d3.csv(vgdata_file).then(data => {
        data = data.filter(() => true);
        data.forEach((d, i) => d.id = i);
        data = data.filter(d => d['Year'] !== 'N/A' && +d['Year'] >= 1980 && +d['Year'] <= 2016);
        if(cur_attribute_type != 'none')
        {
            if(!cur_attribute_value.has('All'))
                data = data.filter(d => cur_attribute_value.has(d[cur_attribute_type]));
        }
        aggregate(data, 'Year');
        data = data.filter(d => {
            return d['Year'] >= year_range[0] && d['Year'] <= year_range[1]
        });
        vgdata['Game_data'] = data;
        for (let group of vgdata.aggr_groups) {
            if (group == 'Year') continue;
            aggregate(data, group);
        }
        //generate publisher list
        for (let data of vgdata.Publisher_data) {
            publishers.push(data['g_name']);
        }
    })
}
