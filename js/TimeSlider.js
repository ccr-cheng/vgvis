/*
function name: refresh
function usage: after changing the time scale, it will be called to redraw the graphs
*/
function refresh() {
    year_range = getTimeRange();
    for (let cb of year_cb)
        cb();
    for (let cb of attr_value_cb)
        cb();
}

/*
function name: setTimeSlider
function usage: set the TimeSlider on the bottom, style in style.css
*/
function setTimeSlider() {
    $('.range-slider').jRange({
        from: 1980,
        to: 2016,
        step: 1,
        scale: [1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2016],
        format: '%s',
        width: $(window).width() * 0.85, // width of slider
        showLabels: true,
        isRange: true,
        theme: "theme-blue",
        ondragend: refresh // after moving the bottom, call the function
    });
    $('.range-slider').jRange('setValue', '1980, 2016'); // set initial value for the slider
}

/*
function name: getTimeRange
function usage: return the start year and the end year of time scale, in a form of array TimeRange = [startYear, endYear]
*/
function getTimeRange() {
    let TimeRange = d3.select('.range-slider').property('value').split(',').map(d => parseInt(d));
    return TimeRange;
}