const _width = $(window).width();
const _height = $(window).height();
let year_range = [1980, 2016];
let cur_mode = 'Global';
let cur_sale = 'Global_Sales';
let cur_attribute_type = 'none';
let cur_attribute_value = new Set();
let year_cb = [];
let sale_type_cb = [];
let attr_value_cb = [];
let choose_action = 0;
let filter_year = d => +d['Year'] >= year_range[0] && +d['Year'] <= year_range[1];
let filter_attr = d => {
    if (cur_attribute_type === 'none') return true;
    if (cur_attribute_value.has('All')) return true;
    return cur_attribute_value.has(d[cur_attribute_type]);
};
let filter_all = d => {
    if (!(+d['Year'] >= year_range[0] && +d['Year'] <= year_range[1])) return false;
    if (cur_attribute_type === 'none') return true;
    if (cur_attribute_value.has('All')) return true;
    return cur_attribute_value.has(d[cur_attribute_type]);
};

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    //fontFamily = "Khand-Regular";
    fontFamily = "Gill Sans"
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}


function main() {
    set_ui();
    d3.csv(vgdata_file).then(data => {
        data = data.filter(d => d['Year'] !== 'N/A' && +d['Year'] >= 1980 && +d['Year'] <= 2016);
        proc_data(data);
        /* data is loaded into `vgdata`, an Object with
         * - `aggr_groups`: Array for the fields that can be grouped
         *     ['Platform', 'Year', 'Genre', 'Publisher']
         * - `aggr_fields`: Array for fields that can be aggregated
         *     ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales']
         * - `Game_data`: raw data for each game
         */
        setTimeSlider();
        for(let group of vgdata.aggr_groups) {
            if (group == 'Publisher') continue;
            let [pie_sale_cb, pie_attr_cb] = draw_pie(group);
            sale_type_cb.push(pie_sale_cb);
            attr_value_cb.push(pie_attr_cb);
        }
        let [stack_attr_cb, stack_comp_cb] = draw_SGB();
        attr_value_cb.push(stack_attr_cb);
        let [bubble_year_cb, bubble_sale_cb, bubble_attr_cb] = draw_bubble();
        year_cb.push(bubble_year_cb);
        sale_type_cb.push(bubble_sale_cb);
        attr_value_cb.push(bubble_attr_cb);
    });

}

main();