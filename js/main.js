const _width = $(window).width();
const _height = $(window).height();
const width = 0.5 * _width;
const height = 0.5 * _height;
let cur_sale = 'Global_Sales';
let cur_attribute_type = 'none';
let cur_attribute_value = new Set();
let callbacks = [];

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}


function main() {
    set_ui();
    // change this if you want to filter data
    let filter_func = () => true;
    d3.csv(vgdata_file).then(data => {
        data = data.filter(filter_func);
        data.forEach((d, i) => d.id = i);

        proc_data(data);
        /* data is loaded into `vgdata`, an Object with
         * - `aggr_groups`: Array for the fields that can be grouped
         *     ['Platform', 'Year', 'Genre', 'Publisher']
         * - `aggr_fields`: Array for fields that can be aggregated
         *     ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales']
         * - `Game_data`: raw data for each game, with an additional `id` fields
         * - `Platform_data`, `Year_data`, `Genre_data`, `Publisher_data`
         *   Aggregated data, Array of Object, with fields
         *     - `id`: unique id
         *     - `g_name`: group name
         *     - `count`: number of data in the group
         *     - the sum of all field in the `aggr_fields`
         * - `Platform2idx`, `Year2idx`, `Genre2idx`, `Publisher2idx`
         *   Map that maps the group name (string) to index in the data
         *   Use `Platform2idx.get('Nintendo')`
         *   DO NOT use `Platform2idx['Nintendo']` (will get `undefined`)
         */
        for (let attr in vgdata)
            console.log(attr);
        setTimeSlider();
        callbacks.push(draw_SGB());
        // draw_scatter();
        // callbacks.push(draw_bubble());
    });

}

main();