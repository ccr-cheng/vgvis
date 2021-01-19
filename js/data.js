let vgdata = {
    Game_data: null,
    aggr_groups: ['Platform', 'Year', 'Genre', 'Publisher'],
    aggr_fields: ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales'],
    aggregate: function (group, filter_func = () => true) {
        let data = this.Game_data.filter(filter_func);
        let unique = [...new Set(data.map(d => d[group]))];
        if (group === 'Year')
            unique = unique.sort((a, b) => a - b);
        let group2idx = new Map(unique.map((d, i) => [d, i]));
        let group_data = unique.map((d, i) => {
            let g_data = {id: i, g_name: d, count: 0};
            for (let field of vgdata.aggr_fields)
                g_data[field] = 0.;
            return g_data;
        });
        data.forEach(d => {
            let d_group = group_data[group2idx.get(d[group])];
            d_group.count += 1;
            for (let field of vgdata.aggr_fields)
                d_group[field] += +d[field];
        });
        return group_data;
    }
};
const vgdata_file = './data/vgsales.csv';

let platforms = [
    "Wii", "NES", "GB", "DS", "X360", "PS3", "PS2", "SNES",
    "GBA", "3DS", "PS4", "N64", "PS", "XB", "PC", "2600",
    "PSP", "XOne", "GC", "WiiU", "GEN", "DC", "PSV", "SAT",
    "SCD", "WS", "NG", "TG16", "3DO", "GG", "PCFX"
];
let genres = [
    "Sports", "Platform", "Racing", "Role-Playing", "Puzzle", "Misc",
    "Shooter", "Simulation", "Action", "Fighting", "Adventure", "Strategy"
];

let publishers = [];

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

    return [min, max];
}

function proc_data(data) {
    vgdata.Game_data = data;
    // generate publisher list
    publishers = [...new Set(data.map(d => d['Publisher']))];
}
