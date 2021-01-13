
/*
function name: refresh
function usage: after changing the time scale, it will be called to redraw the graphs
*/
function refresh() {
    let TimeRange = getTimeRange();
}

/*
function name: setTimeSlider
function usage: set the TimeSlider on the bottom, style in style.css
*/
function setTimeSlider() {
    $('.range-slider').jRange({
        from: 1960,
        to: 2020,
        step: 1,
        scale: [1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020],
        format: '%s',
        width: $(window).width() * 0.5, // width of slider
        showLabels: true,
        isRange: true,
        theme: "theme-blue",
        ondragend: refresh // after moving the bottom, call the function
    });
    $('.range-slider').jRange('setValue', '1960, 2020'); // set initial value for the slider
}

/*
function name: getTimeRange
function usage: return the start year and the end year of time scale, in a form of array TimeRange = [startYear, endYear]
*/
function getTimeRange() {
    let TimeRange = d3.select('.range-slider').property('value').split(',').map(d => parseInt(d));
    return TimeRange;
}