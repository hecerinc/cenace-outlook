//(function($){
jQuery(function($){
// Forces all future ajax request to not pull from cache
$(document).ready(function() {
  $.ajaxSetup({ cache: false });
});

// NQC 2018, December is 2017 change out last number in array. Dec 2018 = 48604.14 
var nqc = [48577.84,48997.50,49753.86,53004.99,52686.88,54842.63,53340.38,52977.56,51804.92,50342.24,48295.34,48525.19];

//  Directory where the CSV files are located, relative to the script directory
var outDir          = '/outlook/SP/'; // Make sure this has trailing slash
// Suffix is used to pull graph based on today or yesterday.
var suffix          = '';

// Ramp Need
var theLabel; //For Ramp need text
var minPointLoadX,
	maxPointLoadX;

//  Color definitions. These are used in various graphs on the page
var solarColor      = '#ffa300',
	windColor       = '#3b6e8f',
	geothermalColor = '#8f500d',
	biomassColor    = '#8d8b00',
	biogasColor     = '#b7b464',
	smallhydroColor = '#89d1ca',
	renewablesColor = '#84bd00',
	coalColor       = '#000000',
	nuclearColor    = '#555555',
	naturalgasColor = '#e66d01',
	largehydroColor = '#35bdb2',
	batteriesColor  = '#ffd597',
	importsColor    = '#b93f1e',
	//otherColor      = '#c9c689',
	otherColor      = '#9f97b7',
	nonrenewablesColor      = '#424242';
	
//	Forecasted Peak Info for Demand
var	todayForecastedPeakTime,
	todayForecastedPeak;

//	Placeholder for CO2 Reuction numbers	
var yearlyEmissionCO2 = [63285033,60939666,53230083,48003182];
	
//  Series Visible
var DemandVisible     = [true,true,true,false];
var RenewablesVisible = [true,true,true,true,true,true];
var NetdemandVisible  = [true,true,true];
var FuelsourceVisible = [true,true,true,true,true,true,true,true,true,true,true,true,true];
var CO2Visible        = [true,true,true,true,true];
	
// Single Numbers Data
var currentDemand;
var plannedCapacity;	
var renewablesPercentage,
	renewablesNumber,
	nonrenewablesPercentage,
	nonrenewablesNumber;

//Compare and Switching Charts 
var compareToday = false;
var compareYesterday = false;
var compareTomorrow = false;
var showForecasted = false;
var demandTime = 'Today';
var netDemandTime = 'Today';
var renewablesTime = 'Today';
var renewTime = 'Today';
var batteriesTime = 'Today';
var importTime = 'Today';
var currentTime,
	currentDate,
	currentTimeHour,
	currentTimeMinute;

// Client Time
var clientTime = new Date();
var clientTimeMinutes = clientTime.getMinutes();
	clientTimeMinutes = clientTimeMinutes % 10; //Only use the ones place
	clientTimeSeconds = clientTime.getSeconds();
var delayTime = 0;

// Define CO2 Chart ahead of time due to avoid using destroy before chart is init.

var chartCO2Supply = null;



// Midnight reload (0:05), *NEEDED* if 0:05 is missed due to error in data, time is 00:10 and data present > than time... reload.

function refreshAt(nowHour, nowMinute, refreshHour, refreshMinute) {
	var nowTime = new Date();
	var refreshTime = new Date();
	
	// Set Hours and Minutes into date format
	nowTime.setHours(nowHour);
	nowTime.setMinutes(nowMinute);
	refreshTime.setHours(refreshHour);
	refreshTime.setMinutes(refreshMinute);
	
	if(nowTime.getHours() > refreshTime.getHours() ||
	   (nowTime.getHours() == refreshTime.getHours() && nowTime.getMinutes() > refreshTime.getMinutes()) ||
		nowTime.getHours() == refreshTime.getHours() && nowTime.getMinutes() == refreshTime.getMinutes()) {
			refreshTime.setDate(nowTime.getDate() + 1);
		}
	// Simple Refresh *OLD*, Only works if refresh is always Midnight
	//var refreshTimeout = ((refreshHour*3600000) + (refreshMinute*60000)) - ((nowHour*3600000) + (nowMinute*60000));
	
	var timeout = (refreshTime.getTime() - nowTime.getTime());
	
	//console.log('Refresh Timeout: ' + refreshTimeout);
	//console.log('Timeout: ' + timeout);
	
	// *OLD*
	//setTimeout(function() { window.location.reload(true); }, refreshTimeout);
	
	setTimeout(function() { window.location.reload(true); }, timeout);
}



// Add commas to number strings
function numberWithCommas(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

// Round up decimals
function roundUp(num, precision) {
  //return Math.ceil(num * precision) / precision
  var hasE = ("" + num).indexOf("e");
  //console.log('Has E: '+hasE);
  //if(!(("" + num).includes("e"))) {
  if(hasE == -1) {
	return +(Math.round(num + "e+" + precision)  + "e-" + precision);
  } else {
	var arr = ("" + num).split("e");
	var sig = ""
	if(+arr[1] + precision > 0) {
	  sig = "+";
	}
	return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + precision)) + "e-" + precision);
  }
}

// Change Interval Time to value to plot or reference x coordinate
function intervalToArray(intrvl) {
	//Since 0:00 comes twice (start and end) need to figure out how to deal with
	intrvl = intrvl.split(":");
	var hour = Number(intrvl[0]);
	var min = Number(intrvl[1]);
	if(min >= 5) {
		min = min / 5;
	}
	var total = ((hour *12)) + min;
	return total;
}

// Highest Point on Series
function highestPointIndex(data) {
	var max = data.dataMax;
	maxIndex = data.processedYData.indexOf(max);
	return maxIndex;
}

// Parse CSVs to use one series array. Mainly used to update a series on a graph without reloading the whole graph
function parseCSVData(csv,columnNum) {
	var data = [],
	lines = csv.split("\n");
  
	$.each(lines, function(itemNum, item) {
		var fields = item.split(",");
	
		if (itemNum > 0 && itemNum <= lines.length-2){
			if(columnNum) {
				if(fields[columnNum] != '')
					data.push(parseFloat(fields[columnNum]));
				else {
					data.push();
				}
			} else {
				if(fields[columnNum] != '') {
					data.push(parseFloat(fields[1]));
				}
			}
		}
	
	})
  return data
}

function createCSV(elem,chartID,seriesLabel,fileName,day) {
	
	//console.log('download');
	var chart = $('#'+chartID).highcharts();
	//console.log('chart= '+chart);
	var csv = '';
	
	var pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
	var arrayDate = currentDate.match(pattern);
	//var csvTimestamp = new Date(arrayDate[3], arrayDate[1]-1, arrayDate[2]);
	var csvTimestampYesterday  = new Date(arrayDate[3], arrayDate[1]-1, arrayDate[2]-1);
		csvTimestampYesterday = ((csvTimestampYesterday.getMonth() + 1) < 10 ? '0' : '') + (csvTimestampYesterday.getMonth() + 1)+'/'+((csvTimestampYesterday.getDate() < 10 ? '0' : '') + csvTimestampYesterday.getDate())+'/'+csvTimestampYesterday.getFullYear();
	var dayTimestamp;
	
	if(day == 'Yesterday'){
		dayTimestamp = csvTimestampYesterday;
	} else {
		dayTimestamp = currentDate;
	}
	
	//console.log(arrayDate);
	//console.log(csvTimestamp);
	
	$.each(chart.series, function(i,s){
		//console.log('s: ' + s);
		if(i == 0) {
			csv += seriesLabel + ' ' + dayTimestamp + ",";
			$.each(s.points, function(j,p){
				if(j < (s.points.length - 1)) {
					//console.log('p= '+p);
					var object = p;
					var output = '';
						for (var property in object) {
						  output += property + ': ' + object[property]+'; ';
						}
						//console.log(output);
					csv += p.name + ",";
				} else {
					csv += p.name + "\n";
				}
			});
			//console.log('CSV Download');
		}
		if(s.visible == true) {
			
			
			csv += s.name +",";
			
			$.each(s.points, function(j,p){
				var thePoint;
				if(p.y == null) {
					thePoint = '';
				} else {
					thePoint = p.y;
				}
				
				if(j < (s.points.length - 1)) {
					csv += thePoint + ",";
				} else {
					csv += thePoint + "\n";
				}
			});
		}
	});
	
	if ( window.navigator.msSaveOrOpenBlob && window.Blob ) {
		// IE10+
		var blob = new Blob( [ csv ], { type: "text/csv" } );
		navigator.msSaveOrOpenBlob( blob, fileName + '.csv' );
	} else {
		// Modern Browsers
		//console.log('Finish Download');
		elem.attr('href','data:text/csv;charset=utf8,' + encodeURIComponent(csv)).attr('download',fileName + '.csv')
	}
}



// Set Highcharts default options
Highcharts.setOptions({
		chart: {
				type: 'line',
				margin: [30,1,70,65],
				style: {
					fontFamily: 'arial, helvetica, sans-serif'
				},
				resetZoomButton: {
					theme: {
						zIndex: 999999
					}
				},
				zoomType: 'x'
			},
		xAxis: { 				
				categories: ['0:00','0:05','0:10','0:15','0:20','0:25','0:30','0:35','0:40','0:45','0:50','0:55','1:00','1:05','1:10','1:15','1:20','1:25','1:30','1:35','1:40','1:45','1:50','1:55','2:00','2:05','2:10','2:15','2:20','2:25','2:30','2:35','2:40','2:45','2:50','2:55','3:00','3:05','3:10','3:15','3:20','3:25','3:30','3:35','3:40','3:45','3:50','3:55','4:00','4:05','4:10','4:15','4:20','4:25','4:30','4:35','4:40','4:45','4:50','4:55','5:00','5:05','5:10','5:15','5:20','5:25','5:30','5:35','5:40','5:45','5:50','5:55','6:00','6:05','6:10','6:15','6:20','6:25','6:30','6:35','6:40','6:45','6:50','6:55','7:00','7:05','7:10','7:15','7:20','7:25','7:30','7:35','7:40','7:45','7:50','7:55','8:00','8:05','8:10','8:15','8:20','8:25','8:30','8:35','8:40','8:45','8:50','8:55','9:00','9:05','9:10','9:15','9:20','9:25','9:30','9:35','9:40','9:45','9:50','9:55','10:00','10:05','10:10','10:15','10:20','10:25','10:30','10:35','10:40','10:45','10:50','10:55','11:00','11:05','11:10','11:15','11:20','11:25','11:30','11:35','11:40','11:45','11:50','11:55','12:00','12:05','12:10','12:15','12:20','12:25','12:30','12:35','12:40','12:45','12:50','12:55','13:00','13:05','13:10','13:15','13:20','13:25','13:30','13:35','13:40','13:45','13:50','13:55','14:00','14:05','14:10','14:15','14:20','14:25','14:30','14:35','14:40','14:45','14:50','14:55','15:00','15:05','15:10','15:15','15:20','15:25','15:30','15:35','15:40','15:45','15:50','15:55','16:00','16:05','16:10','16:15','16:20','16:25','16:30','16:35','16:40','16:45','16:50','16:55','17:00','17:05','17:10','17:15','17:20','17:25','17:30','17:35','17:40','17:45','17:50','17:55','18:00','18:05','18:10','18:15','18:20','18:25','18:30','18:35','18:40','18:45','18:50','18:55','19:00','19:05','19:10','19:15','19:20','19:25','19:30','19:35','19:40','19:45','19:50','19:55','20:00','20:05','20:10','20:15','20:20','20:25','20:30','20:35','20:40','20:45','20:50','20:55','21:00','21:05','21:10','21:15','21:20','21:25','21:30','21:35','21:40','21:45','21:50','21:55','22:00','22:05','22:10','22:15','22:20','22:25','22:30','22:35','22:40','22:45','22:50','22:55','23:00','23:05','23:10','23:15','23:20','23:25','23:30','23:35','23:40','23:45','23:50','23:55','24:00'],
				labels: {
					formatter: function() {
						return this.value.split(':')[0];
					},
					align: 'center',
					x: 0,
					y: 20,
					enabled: true
				},
				lineColor: '#b2b2b2',
				tickInterval: 12,
				tickWidth: 0,
				gridLineWidth: 1,
				startOnTick: true,
				endOnTick: true,
				gridLineColor: '#d8d8d8',
				alternateGridColor: {
					linearGradient: {
						x1: 0, y1: 1,
						x2: 1, y2: 1
					},
					stops: [ [0, '#f8f8f8' ],
							 [0.5, '#f8f8f8'] ,
							 [0.8, '#f8f8f8'] ,
							 [1, '#f8f8f8'] ]
				},
				max:288
			},
			yAxis: [{ // left y axis
				title: {
					text: 'MW',
					margin: 10
				},
				tickPositioner: function () {
					var positions = [],
						tick = (Math.floor(this.dataMin / 1000)*1000) - 2000,
						increment = 5000;

					for (; tick - increment <= (this.dataMax + 1000); tick += increment) {
						positions.push(tick);
					}
					return positions;
				},
				labels: {
					align: 'right',
					x: -10,
					y: 3,
					formatter:function() {
						return Highcharts.numberFormat(this.value, 0, '', ',');
					}
				},
				gridLineColor: '#d8d8d8',
				showFirstLabel: true,
				gridLineWidth: 1,
				minorTickLength: 0,
				tickLength: 0
			}],

			legend: {
				align: 'center',
				verticalAlign: 'bottom',
				y: 20,
				floating: false,
				borderWidth: 0
			},

			tooltip: {
				shared: true,
				crosshairs: true,
				borderColor: '#637d97',
				useHTML: true,
				backgroundColor: 'rgba(255,255,255,0.9)'
			},
			colors: ['#925899', '#3e7ad3', '#00c7b1', '#ffa300'],
			credits: {
				enabled: false
			},
			plotOptions: {
				series: {
					cursor: 'pointer',
					dataLabels: {
						allowOverlap: true,
						zIndex: 0,
						className: 'highlight'
					},
					marker: {
						lineWidth: 1
						
					},				
				}
			},
			exporting: {
				enabled: false
			}
	});

// Default Options for Supply	
	
var options = {
	chart: {
		backgroundColor: 'rgba(255, 255, 255, 0.0)',
		plotBorderWidth: null,
		plotShadow: false,
		renderTo: 'supply',
		type: 'pie',
		margin: [15,0,0,0],
		padding: [0,0,0,0],
		spacing: [0, 0, 0, 0],
		height: 350
	},
	legend: {
		useHTML: true,
		enabled: true,
		floating: false,
		verticalAlign: 'top',
		align:'right',
		layout: 'vertical',
		padding: 15,
		margin: 0,
		x: 0,
		y: 50,
		itemWidth: 150,
		backgroundColor: '#ffffff',
		borderColor: '#d8d8d8',
		borderWidth: 1,
		borderRadius: 5,
		itemMarginTop: 2,
		itemMarginBottom: 2,
		itemStyle: {
			fontWeight: 'normal'
		},
		labelFormatter: function() {
			var s = '';
			s = '<b>' + this.name + '</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
			return s;
		}
	},
	title: {
		text: ''
	},
	tooltip: {
		enabled: true,
		formatter: function () {
		var s = '';
			s = '<b>' + this.point.name + '</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
			return s;
		}
	},
	
	plotOptions: {
		pie: {
			allowPointSelect: false,
			cursor: 'pointer',
			center: ["25%", "50%"],
			point:{
				events : {
					legendItemClick: function(e){
						e.preventDefault();
					}
				}
			},
			dataLabels: {
				enabled: false,
				style: {
					color: 'black'
				},
				distance: 10,
				formatter:function() {
					  var s = '';
						s = '<b>' + this.point.name + '</b><br/>'+ Highcharts.numberFormat(this.point.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
						return s;
				}
			},
			showInLegend: true
		}
		
	},
	colors: [renewablesColor,naturalgasColor,largehydroColor,importsColor,nuclearColor,coalColor,otherColor],
	series: [{
		name: 'supply-all',
		data: [],
		size: '60%',
		innerSize: '62.5%'
	}]
};	

// Default options for Renewables Pie

var optionsRenewables = {
	chart: {
		backgroundColor: 'rgba(255, 255, 255, 0.0)',
		plotBorderWidth: null,
		plotShadow: false,
		renderTo: 'renewablesSupply',
		type: 'pie',
		margin: [15,0,0,0],
		padding: [0,0,0,0],
		spacing: [0, 0, 0, 0],
		height: 350
	},
	legend: {
		useHTML:true,
		enabled: true,
		floating: false,
		verticalAlign: 'top',
		align:'right',
		layout: 'vertical',
		padding: 15,
		margin: 0,
		x: 0,
		y: 50,
		itemWidth: 150,
		backgroundColor: '#ffffff',
		borderColor: '#d8d8d8',
		borderWidth: 1,
		borderRadius: 5,
		itemMarginTop: 2,
		itemMarginBottom: 2,
		itemStyle: {
			fontWeight: 'normal'
		},
		labelFormatter: function() {
			var s = '';
			if(this.name == 'Batteries' && this.y < 0) {
				s = '<b>Batteries (storing)</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
			} else {
				s = '<b>' + this.name + '</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
			}
			return s;
		}
	},
	title: {
		text: ''
	},
	tooltip: {
		enabled: true,
		formatter: function () {
		var s = '';
			if(this.name == 'Batteries' && this.y < 0) {
				s = '<b>Batteries (storing)</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
			} else {
				s = '<b>' + this.point.name + '</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' MW)';
			}
			return s;
		}
	},
	
	plotOptions: {
		pie: {
			allowPointSelect: false,
			cursor: 'pointer',
			center: ["25%", "50%"],
			point:{
				events : {
					legendItemClick: function(e){
						e.preventDefault();
					}
				}
			},
			dataLabels: {
				enabled: false,
				style: {
					color: 'black'
				},
				distance: 10,
				formatter:function() {

					  var s = '';
						s = '<b>' + this.point.name + '</b><br/>'+ Highcharts.numberFormat(this.point.percentage,1) +'% (' + this.y + ' MW)';
						return s;
				}
			},
			showInLegend: true
		}
		
	},
	colors: [solarColor,windColor,geothermalColor,biomassColor,biogasColor,smallhydroColor, batteriesColor],
	series: [{
		data: [],
		size: '50%',
		innerSize: '62.5%'
	}]
};

// Default options for CO2

var optionsCO2 = {
	chart: {
		backgroundColor: 'rgba(255, 255, 255, 0.0)',
		plotBorderWidth: null,
		plotShadow: false,
		renderTo: 'co2Supply',
		type: 'pie',
		margin: [15,0,0,0],
		padding: [0,0,0,0],
		spacing: [0, 0, 0, 0],
		height: 350
	},
	xAxis: {
		categories: ['0:00','0:05','0:10','0:15','0:20','0:25','0:30','0:35','0:40','0:45','0:50','0:55','1:00','1:05','1:10','1:15','1:20','1:25','1:30','1:35','1:40','1:45','1:50','1:55','2:00','2:05','2:10','2:15','2:20','2:25','2:30','2:35','2:40','2:45','2:50','2:55','3:00','3:05','3:10','3:15','3:20','3:25','3:30','3:35','3:40','3:45','3:50','3:55','4:00','4:05','4:10','4:15','4:20','4:25','4:30','4:35','4:40','4:45','4:50','4:55','5:00','5:05','5:10','5:15','5:20','5:25','5:30','5:35','5:40','5:45','5:50','5:55','6:00','6:05','6:10','6:15','6:20','6:25','6:30','6:35','6:40','6:45','6:50','6:55','7:00','7:05','7:10','7:15','7:20','7:25','7:30','7:35','7:40','7:45','7:50','7:55','8:00','8:05','8:10','8:15','8:20','8:25','8:30','8:35','8:40','8:45','8:50','8:55','9:00','9:05','9:10','9:15','9:20','9:25','9:30','9:35','9:40','9:45','9:50','9:55','10:00','10:05','10:10','10:15','10:20','10:25','10:30','10:35','10:40','10:45','10:50','10:55','11:00','11:05','11:10','11:15','11:20','11:25','11:30','11:35','11:40','11:45','11:50','11:55','12:00','12:05','12:10','12:15','12:20','12:25','12:30','12:35','12:40','12:45','12:50','12:55','13:00','13:05','13:10','13:15','13:20','13:25','13:30','13:35','13:40','13:45','13:50','13:55','14:00','14:05','14:10','14:15','14:20','14:25','14:30','14:35','14:40','14:45','14:50','14:55','15:00','15:05','15:10','15:15','15:20','15:25','15:30','15:35','15:40','15:45','15:50','15:55','16:00','16:05','16:10','16:15','16:20','16:25','16:30','16:35','16:40','16:45','16:50','16:55','17:00','17:05','17:10','17:15','17:20','17:25','17:30','17:35','17:40','17:45','17:50','17:55','18:00','18:05','18:10','18:15','18:20','18:25','18:30','18:35','18:40','18:45','18:50','18:55','19:00','19:05','19:10','19:15','19:20','19:25','19:30','19:35','19:40','19:45','19:50','19:55','20:00','20:05','20:10','20:15','20:20','20:25','20:30','20:35','20:40','20:45','20:50','20:55','21:00','21:05','21:10','21:15','21:20','21:25','21:30','21:35','21:40','21:45','21:50','21:55','22:00','22:05','22:10','22:15','22:20','22:25','22:30','22:35','22:40','22:45','22:50','22:55','23:00','23:05','23:10','23:15','23:20','23:25','23:30','23:35','23:40','23:45','23:50','23:55','24:00']
	},
	legend: {
		useHTML:true,
		enabled: true,
		floating: false,
		verticalAlign: 'top',
		align:'right',
		layout: 'vertical',
		padding: 15,
		margin: 0,
		x: 0,
		y: 75,
		itemWidth: 150,
		backgroundColor: '#ffffff',
		borderColor: '#d8d8d8',
		borderWidth: 1,
		borderRadius: 5,
		itemMarginTop: 2,
		itemMarginBottom: 2,
		itemStyle: {
			fontWeight: 'normal'
		},
		labelFormatter: function() {
			var s = '';
				s = '<b>' + this.name + '</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' mTCO<sub>2</sub>/h)';
			return s;
		}
	},
	title: {
		text: ''
	},
	tooltip: {
		enabled: true,
		useHTML: true,
		formatter: function () {
			var s = '';
				s = '<b>' + this.point.name + '</b><br/>'+ Highcharts.numberFormat(this.percentage,1) +'% (' + Highcharts.numberFormat(this.y, 0, '', ',') + ' mTCO<sub>2</sub>/h)';
			return s;
		}
	},
	
	plotOptions: {
		pie: {
			allowPointSelect: false,
			cursor: 'pointer',
			center: ["25%", "50%"],
			point:{
				events : {
					legendItemClick: function(e){
						e.preventDefault();
					}
				}
			},
			dataLabels: {
				enabled: false,
				style: {
					color: 'black'
				},
				distance: 10,
				formatter:function() {

					  var s = '';
						s = '<b>' + this.point.name + '</b><br/>'+ Highcharts.numberFormat(this.point.percentage,1) +'% (' + this.y + ' MW)';
						return s;
				}
			},
			showInLegend: true
		}
		
	},
	colors: [importsColor,naturalgasColor,biogasColor,biomassColor,geothermalColor,coalColor,otherColor],
	series: [{
		data: [],
		size: '60%',
		innerSize: '62.5%'
	}]
};
	
//Get JSON for display of grid status
	
$.getJSON(outDir + 'awejson.txt',function (json) {
	var hasAlert = false;
	
	var alertBuild = [];
	$.each(json, function(regionName, region){            
		//console.log('Region: '+index);
		$.each(region, function(alertType, alertID){
			if(alertID != '') {
				var southernAlert = false,
				northernAlert = false,
				veaAlert = false,
				southernAlertID = '',
				northernAlertID = '',
				veaAlertID = '';
				
				hasAlert = true;
				
				
				
				if(regionName == 'Northern California') {
					northernAlert = true;
				} else if(regionName == 'Southern California') {
					southernAlert = true;
				} else if(regionName == 'VEA Region') {
					veaAlert = true;
				} else {
					
				}
				// If alertType matches alert type in alertBuild then merge otherwise add new
				
				if(alertBuild.length == 0) {
					if(northernAlert == true) {
						northernAlertID = alertID;
					} else if(southernAlert == true) {
						southernAlertID = alertID;
					} else if(veaAlert == true) {
						veaAlertID = alertID;
					} else {
						
					}
					alertBuild.push([alertType, northernAlertID, southernAlertID, veaAlertID]);
				} else {
					for( var i = 0, len = alertBuild.length; i < len; i++ ) {
						if( alertBuild[i][0] === alertType ) {
							if(northernAlert == true) {
								alertBuild[i][1] = alertID;
							} else if(southernAlert == true) {
								alertBuild[i][2] = alertID;
							} else if(veaAlert == true) {
								alertBuild[i][3] = alertID;
							} else {
								
							}						
							break;
						}
						// Last Item and didn't find the alertType add new
						if(i == (len - 1)) {
							if(northernAlert == true) {
								northernAlertID = alertID;
							} else if(southernAlert == true) {
								southernAlertID = alertID;
							} else if(veaAlert == true) {
								veaAlertID = alertID;
							} else {
								
							}
							alertBuild.push([alertType, northernAlertID, southernAlertID, veaAlertID]);
							break;
						}
					}
				}
			}
			
		});
	});
	//console.log(alertBuild);
	if(hasAlert == true) {
		$(".system-status").addClass('alert-active');
		$(".system-status").html('<div class="row">'+
		'<div class="col-6 justify-content-between"><h4>Grid status</h4><a class="system-status-info" href="/informed/Pages/Notifications/NoticeLog.aspx">View all alerts</a></div>'+
		'<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-header">Northern California</div></div>'+
		'<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-header">Southern California</div></div>'+
		'<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-header">VEA Region</div></div>'+
		'</div>');
		$.each(alertBuild, function(type, value){
			$(".system-status").append('<div class="row border-top-1 alert-types">'+
			'<div class="col-6"><div class="alert-type">' + value[0] + '</div></div>');
			if(value[1] != '') {$(".system-status .alert-types").append('<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-check"><a href="http://content.caiso.com/awe/SP/systemstatus.html#' + value[1] + '" target="_blank">' + value[1] + '</a></div></div>');
			} else {$(".system-status .alert-types").append('<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-check"></div></div>'); }
			if(value[2] != '') {$(".system-status .alert-types").append('<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-check"><a href="http://content.caiso.com/awe/SP/systemstatus.html#' + value[2] + '" target="_blank">' + value[2] + '</a></div></div>');
			} else {$(".system-status .alert-types").append('<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-check"></div></div>'); }
			if(value[3] != '') {$(".system-status .alert-types").append('<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-check"><a href="http://content.caiso.com/awe/SP/systemstatus.html#' + value[3] + '" target="_blank">' + value[3] + '</a></div></div>');
			} else {$(".system-status .alert-types").append('<div class="col-2 justify-content-center d-flex align-items-center border-left-1"><div class="status-check"></div></div>'); }
			$(".system-status").append('</div>');
		});
	} else {
		$(".system-status").addClass('normal');
	}
	//$(".system-status").html(json.Transmission Emergency + ' <span>MW</span>');
});	


/* DEMAND */
/*  -------------------------------------------------------------------------------
	START GRABBING JSON THEN POPULATE CHARTS AFTER LOAD
	-------------------------------------------------------------------------------  */
/* 	Ramp Need dependent on JSON for forecast peak and current time */

function populateData(json) {
	$(".current-demand .overview-large-number").html(json.CurrentSystemDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' <span>MW</span>');
	$(".demand-capacity-number").html(json.CurrentSystemDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' MW');
	$(".current-peak .overview-large-number").html(json.TodaysPeakDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' <span>MW</span>');
	
	// Forecasted Peak
	$(".forecasted-peak .overview-large-number").html(json.todayForecastPeakDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' <span>MW</span>');
	todayForecastedPeak = json.todayForecastPeakDemand;
	
	// Forecasted Peak Time
	todayForecastedPeakTime = json.todayForecastPeakDemandTS.slice(8,12);
	var todayForecastedPeakTimeHour = todayForecastedPeakTime.slice(0,2);
	var todayForecastedPeakTimeMin = todayForecastedPeakTime.slice(2,4);
	
	todayForecastedPeakTime = todayForecastedPeakTimeHour + ':' + todayForecastedPeakTimeMin;
	
	// Today Peak Time
	var todayPeakTime = json.TodaysPeakDemandTS.slice(8,12);
	var todayPeakTimeHour = todayPeakTime.slice(0,2);
	var todayPeakTimeMin = todayPeakTime.slice(2,4);
	
		todayPeakTime = todayPeakTimeHour + ':' + todayPeakTimeMin;
		$(".current-peak .overview-large-label span").html('(' + todayPeakTime + ')');
		
		//$(".tomorrows-peak .overview-number").html(json.tomorrowsForecastPeakDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' MW');
		if(json.tomorrowsForecastPeakDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") != '0') {
			$(".tomorrows-peak .overview-large-number").html(json.tomorrowsForecastPeakDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' <span>MW</span>');
		} else {
			//$(".tomorrows-peak .overview-large-number").html('N/A');
		}
	// Historical
	var histPeak = json.histDemand.toLocaleString(undefined, {maximumFractionDigits:2});
	var histPeakNumber = histPeak.split(' ');
	histPeakNumber = histPeakNumber[0];
	
		$(".historical-peak .overview-large-number").html( histPeakNumber + ' <span>MW</span>');
		$(".historical-peak .overview-date").html(json.histDemandDate);

	// Current Demand
	currentDemand = json.CurrentSystemDemand;
	
	// Time
	var timeDate = json.slotDate;
	var timeDateArray = timeDate.split(' ');
		
	currentTime = timeDateArray[1];
	currentDate = timeDateArray[0];
	$(".time span").html(timeDateArray[1] + ' ' + timeDateArray[0]);
	$(".wtime span").html(' as of ' +timeDateArray[1]);
	
	var currentTimeArray = timeDateArray[1].split(':');
	currentTimeHour = currentTimeArray[0];
	currentTimeMinute = currentTimeArray[1];
	
	// Planned Capacity (Available)
	var plannedCapacity = json.CurrentAdjustedUnloadedGenerationCapacity + json.CurrentSystemDemand;
	
		
	$(".available-capacity .overview-large-number").html(numberWithCommas(plannedCapacity) + ' <span>MW</span>');
	
	// Outages
	var plannedOutages = json.Limitation;
		plannedOutages = roundUp(plannedOutages, 1);
		
	$(".planned-outages .overview-large-number").html(numberWithCommas(plannedOutages) + ' <span>MW</span>');
	
	// Planned Capacity Chart
	
	var capacityCurrentPercentage = (currentDemand/plannedCapacity) * 100 + "%";
	var capacityOutagesPercentage = (plannedOutages/plannedCapacity) * 100 + "%";
	var forcastedPeakPercentage = (((todayForecastedPeak/plannedCapacity)-(50/plannedCapacity)) * 100) + "%";
	
	$(".capacity-chart-labels.label-forecasted-peak").css("left", forcastedPeakPercentage );
	$(".resources-minus-outages").html(numberWithCommas(plannedCapacity) + ' <span>MW</span>');
	$(".capacity-chart-bar.green").css("width", capacityCurrentPercentage );
	$('.label-current-demand .capacity-number').html(json.CurrentSystemDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' MW');
	$('.label-forecasted-peak .capacity-number').html(json.todayForecastPeakDemand.toLocaleString(undefined, {maximumFractionDigits:2}).replace(/\D\d\d$/, "") + ' MW');		
	$(".capacity-chart-bar.red").css("width", capacityOutagesPercentage );
	
	// CO2 Yearly Reduction
	
	var yearlyEmissionCO2Start = yearlyEmissionCO2[0];
	var yearlyEmissionCO2End = yearlyEmissionCO2[yearlyEmissionCO2.length-1];
	
	var yearlyEmissionCO2Decrease = yearlyEmissionCO2Start - yearlyEmissionCO2End;
	
	var yearlyEmissionCO2PercentDecrease = (yearlyEmissionCO2Decrease / yearlyEmissionCO2Start) * 100;
	
	$(".co2-reduction .overview-large-number").html(roundUp(yearlyEmissionCO2PercentDecrease,0) + '%');
}	
	
	//Get JSON for display of stats on top
	$.getJSON(outDir + 'stats.txt',function (json) {
		populateData(json);
	}).done(function() {
			createLineCharts();
			loadUpdateSupply(true);
			loadSupplyCO2();
			yearlyEmissions();
			refreshAt(parseInt(currentTimeHour),parseInt(currentTimeMinute),0,5); //Will refresh the page at 00:05
			console.log(parseInt(currentTimeHour));
			console.log(parseInt(currentTimeMinute));
	});
	
	function loadUpdateSupply(load) {
		if($('#supply').length && $('#renewablesSupply').length) {
			$.get(outDir + 'fuelsource' + suffix + '.csv', function(data) {
				var items;
				var names;
				var obj;
				var lines    = data.split('\n');
				var lastline = lines.length-2;
				var renew = [];
				var nonrenew = [];
				var orderList = [];
				var renewablesList = [];
				var sum = 0;
				names = lines[0].split(','); // labels
				items = lines[lastline].split(','); // values
				
				$.each(items, function(itemNo, item) {
					if (itemNo > 0) {
						//console.log("Name OF " + names[itemNo]);
						if(itemNo >= 1 && itemNo <= 6) {
							renew.push(item);
							if(itemNo == 1) {
								$(".solar .overview-large-number").html(numberWithCommas(item) + ' <span>MW</span>');
							}
							if(itemNo == 2) {
								$(".wind .overview-large-number").html(numberWithCommas(item) + ' <span>MW</span>');
							}
						} else if (itemNo == 11){
							renew.push(item);
							
							for( var i = 0; i < renew.length; i++ ){
								//console.log("Renew Amount:" + renew[i]);
								sum += parseInt( renew[i], 10 ); //don't forget to add the base
							}
							obj = {};
							obj['name'] = 'Renewables';
							obj['y'] = sum;
							orderList.push(['Renewables',sum]);
							$(".renewables .overview-large-number").html(numberWithCommas(sum) + ' <span>MW</span>');
						} else {
							obj = {};
							obj['name'] = names[itemNo];
							obj['y'] = parseInt(item);
							orderList.push([names[itemNo],parseFloat(item)]);
						}
					}   // endif
				});
				//Reorder Supply Array

				var reorderList = [orderList[4],orderList[2],orderList[3],orderList[5],orderList[1],orderList[0],orderList[6]];
				


					$.each(items, function(itemNo, item) {
						if (itemNo > 0) {
							if(itemNo >= 7 && itemNo != 11) {
								//renew.push(item);
							} else {
								obj = {};
								obj['name'] = names[itemNo];
								obj['y'] = parseInt(item);
								if (itemNo == 3){
									renewablesList.push(['Geothermal',parseFloat(item)]);
								} else if(itemNo == 4) {
									renewablesList.push(['Biomass',parseFloat(item)]);
								} else if(itemNo == 5) {
									renewablesList.push(['Biogas',parseFloat(item)]);
								} else if(itemNo == 6) {
									renewablesList.push(['Small hydro',parseFloat(item)]);
								} else {
									renewablesList.push([names[itemNo],parseFloat(item)]);
								}
							}
						}   // endif
					});
				
				// Create the chart
				if(load == true) {
					// Spit out data to series
					$.each(reorderList, function(i, reorderItem) {
						options.series[0].data.push(reorderItem);
						//console.log(reorderItem);
					});
					$.each(renewablesList, function(i, item) {
						optionsRenewables.series[0].data.push(item);
						//console.log(reorderItem);
					});
					var chartSupplyPie = new Highcharts.Chart(options);
					// Create the chart
					var chartRenewablesSupplyPie = new Highcharts.Chart(optionsRenewables);
					
				} else {
					//Supply Redraw
					var chartSupplyPie = $('#supply').highcharts();
					chartSupplyPie.series[0].setData(reorderList);
					
					var chartRenewablesSupplyPie = $('#renewablesSupply').highcharts();				
					chartRenewablesSupplyPie.series[0].setData(renewablesList);
					
				}
			});
		}
	}
	function loadSupplyCO2(suffix) {
		if($('#co2Supply').length) {
			
			if (suffix == null) {
				suffix = '';
			}
			
			$.get(outDir + 'co2' + suffix + '.csv', function(data) {
				var items;
				var names;
				var obj;
				var lines    = data.split('\n');
				var lastline = lines.length-2;
				var totalCO2 = [];
				/*var renew = [];
				var nonrenew = [];
				var orderList = [];
				var renewablesList = [];*/
				var sum = 0;
				var orderCO2Supply = [];
				var reorderCO2Supply = [];
				
				if(suffix == '') {
					names = lines[0].split(','); // labels
					items = lines[lastline].split(','); // values
					currentCO2 = 0;
					
					
					// Clear chart
					if(chartCO2Supply != null) {
						//optionsCO2.series[0].remove( true );
						chartCO2Supply.series[0].setData([], false);
						//chartCO2Supply.destroy();
						chartCO2Supply = null;
						//console.log('Chart Destroyed');
					}
					
					$.each(items, function(itemNo, item) {
						if (itemNo > 0) {
							obj = {};
							obj['name'] = names[itemNo].replace(' CO2', ''); // Eliminate CO2 from names in CSV Import
								//console.log(obj['name']);
							obj['y'] = parseInt(item);
							
							orderCO2Supply.push([obj['name'],parseFloat(item)]);
							//optionsCO2.series[0].data.push([names[itemNo],parseFloat(item)]);					
							currentCO2 = currentCO2 + parseInt(items[itemNo]);
							
						}
					});
					
					var reorderCO2Supply = [orderCO2Supply[4],orderCO2Supply[2],orderCO2Supply[0],orderCO2Supply[1],orderCO2Supply[5],orderCO2Supply[3]];
					
					$.each(reorderCO2Supply, function(i, reorderItem) {
						optionsCO2.series[0].data.push(reorderItem);
					});
					
					
					
					// Temp add for missing CO2
					//optionsCO2.series[0].data.push(['Geothermal',0]);
					
					
					chartCO2Supply = new Highcharts.Chart(optionsCO2);
					$(".current-co2 .overview-large-number").html(numberWithCommas(currentCO2) + ' <span>mTCO<sub>2</sub>/h</span>');
					
					var co2Intensity = currentCO2/currentDemand;
					$(".current-co2-intensity .overview-large-number").html(roundUp(co2Intensity,3) + ' <span>mTCO<sub>2</sub>/MWh</span>');
				}
				
				// Today's CO2
				
				lines = data.split("\n");
			  
				$.each(lines, function(itemNum, item) {
					var fields = item.split(",");
					var fieldTotal = 0;
					var hourName;
					
					if (itemNum > 0 && itemNum <= lines.length-2){
				
						$.each(fields, function(i, field) {
							
							if (i > 0) {
								
								fieldTotal = fieldTotal + parseInt(field);
							} else {			
								hourName = field;
							}
						});
						totalCO2.push([hourName, parseFloat(fieldTotal)]);
						fieldTotal = 0; // zero out feildtotal for next row
					}
					
					
				});
				
				//console.log('Array: '+totalCO2);
				
					var chartCO2 = new Highcharts.Chart({
						chart: {
							renderTo: 'co2',
							type: 'line',
							margin: [15,1,55,65],
							height: '302px'
						},
						legend: {
							useHTML : true,
							labelFormatter:function(){
								if(this.name != 'CO2'){
									return this.name;
								}else{
									return 'CO<sub>2</sub>';
								}					
							}	
						},
						yAxis: [{ // left y axis
							title: {
								useHTML: true,
								text: 'mTCO<sub>2</sub>/h',
								margin: 10
							},
							labels: {
								align: 'right',
								x: -10,
								y: 3,
								formatter:function() {
									return Highcharts.numberFormat(this.value, 0, '', ',');
								}
							},
							plotLines: [{
								color: '#b2b2b2',
								width: 2,
								value: 0
							}],
							gridLineColor: '#d8d8d8',
							showFirstLabel: true,
							gridLineWidth: 1,
							minorTickLength: 0,
							tickLength: 0
						}],
						xAxis: {
							   max:288
						},
						tooltip: {
							formatter:function() {
									var s = '<div class="tooltip-header">' + this.x + '</div>';
									$.each(this.points, function () {
										if(this.series.name == 'CO2') {
											s += '<span style="color:' + this.series.color + '"> ● </span>CO<sub>2</sub>: <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
										} else {
											s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
										}
									});
									return s;
								}
						},
						colors: [ '#555555' ],
						series: [{
							name: 'CO2',
							data: totalCO2,
							marker: {
							symbol: 'circle'
							}
						}],
						title: ''
					});
				
			});
		
		}
	}
	
	function yearlyEmissions() {
		if($('#yearlyEmissions').length) {
			var chartYearlyEmissions = new Highcharts.Chart({
				chart: {
					renderTo: 'yearlyEmissions',
					margin: [30,1,70,65]
				},
				yAxis: [{ // left y axis
					title: {
						useHTML: true,
						text: 'mTCO<sub>2</sub> (millions)',
						margin: 10
					},
					labels: {
						align: 'right',
						x: -10,
						y: 3,
						formatter:function() {
							//return Highcharts.numberFormat(this.value, 0, '', ',');
							return Highcharts.numberFormat(this.value/1000000, 2, '.', ',');
						}
					},
					plotLines: [{
						color: '#b2b2b2',
						width: 2,
						value: 0
					}],
					gridLineColor: '#d8d8d8',
					showFirstLabel: true,
					gridLineWidth: 1,
					minorTickLength: 0,
					tickLength: 0,
					tickInterval: 500000
				}],
				xAxis: { 				
					categories: ['Jan.','Feb.','Mar.','Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
					labels: {
						formatter: function() {
							return this.value;
						},
						align: 'center',
						x: 0,
						y: 20,
						enabled: true
					},
					lineColor: '#b2b2b2',
					tickInterval: 1,
					tickWidth: 0,
					gridLineWidth: 1,
					startOnTick: true,
					endOnTick: true,
					gridLineColor: '#d8d8d8',
					alternateGridColor: {
						linearGradient: {
							x1: 0, y1: 1,
							x2: 1, y2: 1
						},
						stops: [ [0, '#f8f8f8' ],
								 [0.5, '#f8f8f8'] ,
								 [0.8, '#f8f8f8'] ,
								 [1, '#f8f8f8'] ]
					},
					max:11
				},
				tooltip: {
					/*formatter:function() {
							var s = '<div class="tooltip-header">' + this.x + '</div>';
							$.each(this.points, function () {
								//s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 2, '.', ',') + '</strong><br/>';
							});
							return s;
						}*/
					formatter:function() {                  
						var pointPct='';
						var baseValue= this.points[0].point.y;
						var toolTipTxt='';
						var toolTipHeader='<div class="tooltip-header">' + this.x + '</div>';
						var toolTipTotal;
								 //console.log(baseValue);
					$.each(this.points, function(i, point) {            
						pointDecrease = baseValue - point.y;
						pointPctDecrease = (pointDecrease/baseValue) * 100;
						//pointPct = (point.y)*100/baseValue;
						//pointPctDecrease *= -1; //Flip Positive to negative
						toolTipTxt += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 2, '.', ',') + '</strong><br/>';
						toolTipTotal = "<div style='margin-top: 5px; padding-top: 5px; border-top: 1px solid #d4d4d4;' >Reduction: "+roundUp(pointPctDecrease,1)+"%</div> ";
					});
					 return toolTipHeader + toolTipTxt + toolTipTotal;
						}
				},
				//colors: [ '#555555' ],
				// Only the first data points need names for csv export. 
				series: [{
					name: '2014',
					data: [['Jan.',5615497.82],['Feb.',5022762.297],['Mar.',5289480.524],['Apr.',4812433.46],['May',5331965.63],['Jun.',5451151.875],['Jul.',6904019.904],['Aug.',6760966.43],['Sep.',6619994.447],['Oct.',6314691.774],['Nov.',5162069.02],['Dec.',5495698.799]],
					marker: {
					symbol: 'circle'
					}
				},{
					name: '2015',
					data: [5505917.487,4527679.374,5087623.957,4685880.093,4581901.769,5675018.244,6286634.53,6628457.346,6600688.58,6358856.435,5001007.945,5302112.891],
					marker: {
					symbol: 'circle'
					}
				},{
					name: '2016',
					data: [5025307.378,4209660.561,4015331.538,3850523.26,4346509.972,5095191.407,5739590.31,5986619.678,5299047.336,5003647.815,4658654.236,4818468.151],
					marker: {
					symbol: 'circle'
					}
				},{
					name: '2017',
					data: [4595421.897,3740562.609,3280286.673,3012251.363,3629460.304,4346447.541,5368488.421,5663131.355,5121222.725,4857247.281,4388661.929,],
					marker: {
					symbol: 'circle'
					}
				}],
				title: ''
			});
		}
	}
	
	
	function refreshContent() {
				$.getJSON(outDir + 'stats.txt',function (json) {
					populateData(json);
				}).done(function() {
					if($('#demand').length && demandTime == 'Today') {
						//Demand Redraw
						var chartDemand = $('#demand').highcharts();
						var theSeries,
						theCSVColumn;
						
						theSeries = 'current-demand';
						theCSVColumn = 3;
						
						$.get(outDir + 'demand.csv', function(csv) {
							var parsedDemand = parseCSVData(csv,theCSVColumn);
							chartDemand.get(theSeries).setData(parsedDemand);
							var parsedHourAhead = parseCSVData(csv,2);
							chartDemand.get('hour-ahead-demand').setData(parsedHourAhead);
						});
						//console.log('redraw: ' + theSeries)
						chartDemand.redraw();
					}
					if($('#netDemand').length && netDemandTime == 'Today') {
						// Net Demand Redraw
						var chartNetDemand = $('#netDemand').highcharts();
						$.get(outDir + 'netdemand.csv', function(csv) {
							var parsedNet = parseCSVData(csv,3);
							chartNetDemand.get('current-net-demand').setData(parsedNet);
							var parsedDemand = parseCSVData(csv,2);
							chartNetDemand.get('current-demand').setData(parsedDemand);
							var parsedHourAhead = parseCSVData(csv,1);
							chartNetDemand.get('hour-ahead-demand').setData(parsedHourAhead);
						});
						
						
						
						if(todayForecastedPeakTime) {
							maxPointLoadX = intervalToArray(todayForecastedPeakTime);
							if(intervalToArray(currentTime) < maxPointLoadX) {
								maxPointLoadX = intervalToArray(currentTime);
							}
						}
								
						if(minPointLoadX < intervalToArray(currentTime)) {
							if ((maxPointLoadX - minPointLoadX) > 0) {
								chartNetDemand.series[2].update({
									zoneAxis: 'x',
										zones: [{
										value: minPointLoadX,
									}, {
										value: maxPointLoadX + 1,
										color: '#890041'
									}, {

									}]
								});
							}
						}
						
						chartNetDemand.redraw();
					}
					if($('#supply').length && $('#renewablesSupply').length) {
						//Supply and Renewables Supply Redraw
						loadUpdateSupply(false);
					}
					if($('#renewables').length && renewablesTime == 'Today') {
						var chartRenewables = $('#renewables').highcharts();
						
						$.get(outDir + 'fuelsource.csv', function(csv) {

							chartRenewables.series[0].setData(parseCSVData(csv,1));
							chartRenewables.series[1].setData(parseCSVData(csv,2));
							chartRenewables.series[2].setData(parseCSVData(csv,3));
							chartRenewables.series[3].setData(parseCSVData(csv,4));
							chartRenewables.series[4].setData(parseCSVData(csv,5));
							chartRenewables.series[5].setData(parseCSVData(csv,6));
							chartRenewables.series[10].setData(parseCSVData(csv,11));
							
						});
						chartRenewables.redraw();
					}
					if($('#batteries').length && renewablesTime == 'Today') {
						var chartBatteries = $('#batteries').highcharts();
						
						$.get(outDir + 'storage.csv', function(csv) {
							chartBatteries.series[0].setData(parseCSVData(csv,1));						
						});
						chartBatteries.redraw();
					}
					if($('#imports').length && renewablesTime == 'Today') {
						var chartImports = $('#imports').highcharts();
						
						$.get(outDir + 'fuelsource.csv', function(csv) {
							chartImports.series[11].setData(parseCSVData(csv,12));						
						});
						chartImports.redraw();
					}
				});
		//console.log('refresh content');
		//console.log(new Date());
		setTimeout(refreshContent, 300000); // Every five minutes
	}
	
	
	if(clientTimeMinutes < 5) {
		delayTime = (5-clientTimeMinutes) * 60000;
	} else if(clientTimeMinutes > 5) {
		delayTime = (10-clientTimeMinutes) * 60000;
	} else {
		
	}
	
	if(delayTime > 0) {
		delayTime = delayTime - (clientTimeSeconds * 1000);
		delayTime = delayTime + 60000; //Delay by 60 seconds in order for server interpret the file.		
	} else {
		/*if(clientTimeSeconds > 30) {
			delayTime = 60000 - (clientTimeSeconds * 1000);
		} else {
			delayTime = 30000 - (clientTimeSeconds * 1000);
		}*/
		delayTime = 60000 - (clientTimeSeconds * 1000);
	}
	
	
	//console.log(clientTime);
	//console.log('Delay Time: ' + delayTime);
	setTimeout(refreshContent, delayTime);
	
function createLineCharts (pickChart, suffix) {
	if (suffix == null) {
		suffix = '';
	}
	var currentDemandName;
	if (suffix == '_YESTERDAY'){
		currentDemandName = "Yesterday's demand<br />(5 min. avg.)";
	} else {
		currentDemandName = 'Current demand<br />(5 min. avg.)';
	}
	
	if(pickChart == null || pickChart == 'demand') {
	/*  ------------------------------------------------------------------------
	Get the CSV and create the chart for demand
	------------------------------------------------------------------------ */
	if($('#demand').length) {
		
		$.get(outDir + 'demand' + suffix + '.csv', function (csv) {
			
			var chartDemand = new Highcharts.Chart({

				data: {
					csv: csv,
					firstRowAsNames: false,
					startRow: 1
				},
				chart: {
					renderTo: 'demand'
				},
				tooltip: {
					formatter:function() {
							var s = '<div class="tooltip-header">' + this.x + '</div>';
							$.each(this.points, function () {
								if (suffix == '_YESTERDAY' && this.series.options.id == 'current-demand' ) {
									s += "<span style='color:" + this.series.color + "'> ● </span>Yesterday's demand: <strong>" + Highcharts.numberFormat(this.y, 0, '', ',') + "</strong><br/>";
								} else if (suffix == '_YESTERDAY' && this.series.options.id == 'todays-demand' ) {
									s += "<span style='color:" + this.series.color + "'> ● </span>Today's demand: <strong>" + Highcharts.numberFormat(this.y, 0, '', ',') + "</strong><br/>";
								} else if(this.series.options.id == 'current-demand') {
									s += '<span style="color:' + this.series.color + '"> ● </span>Current demand: <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								} else if(this.series.options.id == 'yesterdays-demand') { 
									s += "<span style='color:" + this.series.color + "'> ● </span>Yesterday's demand: <strong>" + Highcharts.numberFormat(this.y, 0, '', ',') + "</strong><br/>";
								} else {
									s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								}
							});
							return s;
						}
				},	
				series: [{
					name: 'Day ahead forecast',
					color: 'rgba(4,93,178,.5)',
					dashStyle: 'ShortDot',
					marker: {
						symbol: 'circle'
					}
				
				}, {
					name: 'Hour ahead forecast',
					id: 'hour-ahead-demand',
					color: 'rgba(4,93,178,1)',
					dashStyle: 'ShortDot',
					marker: {
						symbol: 'circle'
					}
				}, {
					name: currentDemandName,
					id: 'current-demand',
					type: 'area',
					color: 'rgba(0,199,177,1)',
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, 'rgba(0,199,177,.3)'],
							[1, 'rgba(0,199,177,0)']
						]
					},
					marker: {
						symbol: 'circle'
					}
				}],

				title: {
					text: ""
				},
				/*exporting: {
					enabled: true,
					filename: 'demand' + suffix
				}*/
				
			});
		});
		}
	}
	
	
	
	//Ramp Need Function
	function rampNeed(chart, loadType) {
		//var minAxis = 108,
		//var minAxis = 144,
		//maxAxis = 228,
		var minAxis,
		maxAxis;
		
		if(netDemandTime == 'Today') {
			if(todayForecastedPeakTime) {
				maxAxis = intervalToArray(todayForecastedPeakTime);
				minAxis = maxAxis - 36;
				if(intervalToArray(currentTime) < maxAxis) {
					maxAxis = intervalToArray(currentTime);
				}
			}
			
		} else {
			maxAxis = highestPointIndex(chart.series[2]);
			minAxis = maxAxis - 36;
		}
		
		
		
		
		//console.log(todayForecastedPeakTime);
		//console.log('min: '+minAxis);
		//console.log('max: '+maxAxis);
		
		var minPointX = minAxis;
		var maxPointX = maxAxis;
		
		//console.log('MINPOINTX' + minPointX);
		//console.log('MAXPOINTX' + maxPointX);
		//console.log('MINPOINTX' + intervalToArray(currentTime));
		
		if(netDemandTime == 'Yesterday' || minPointX < intervalToArray(currentTime)) {
			
			//console.log('MAX AXIS Y: ' + maxAxis);
			
			var points = chart.series[2].points,
			minPointY = points[minAxis].y,
			maxPointY = points[maxAxis].y,
			points,
			minPointPlotY,
			minPointPlotX,
			maxPointPlotY,
			maxPointPlotX;
			
			//console.log('MINPOINTY' + minPointY);
			//console.log('MAXPOINTY' + maxPointY);
			
			
			minPointPlotX = points[minAxis].plotX;
			maxPointPlotX = points[maxAxis].plotX;
			minPointPlotY = points[minAxis].plotY;
			maxPointPlotY = points[maxAxis].plotY;
			
			var middlePointPlotX = ((maxPointPlotX + minPointPlotX) / 2);
			var middlePointPlotY = ((maxPointPlotY + minPointPlotY) / 2);
			var minMaxDifferenceY = maxPointY - minPointY;
			var minMaxDifferenceX = (maxPointX - minPointX) / 12;
				
			if (minMaxDifferenceX > 0) {
				//Round up result
				var minMaxDifferenceX = Math.round(minMaxDifferenceX * 100) / 100;
					
				var plottingY = middlePointPlotY + chart.plotTop + 50;
					
				if(plottingY > 305) {
					plottingY = 305; // Never go lower than the graph
				}
				
				chart.renderer.text('<b>Ramp rate</b><br />~'+minMaxDifferenceY+'MW in '+minMaxDifferenceX+' hours', middlePointPlotX + chart.plotLeft + 40, plottingY)
				.css({
					color: '#890041',
					fontSize: '14px'
				})
				.attr({zIndex:2, id: 'theLabel'})
				.add();
			}
		}
		
		// For initial load for redraw if needed
		minPointLoadX = minPointX;
		maxPointLoadX = maxPointX;
		
	}
	
	//Net Demand Charts
	if($('#netDemand').length) {
		if(pickChart == null || pickChart == 'netDemand') {
			$.get(outDir + 'netdemand' + suffix + '.csv', function (csv) {

				var chartNetDemand = new Highcharts.Chart({

					data: {
						csv: csv,
						firstRowAsNames: false,
						startRow: 1
					},
					chart: {
						renderTo: 'netDemand',
						events: {
							redraw: function() {
								//if (suffix == '_YESTERDAY'){
									$('#theLabel').remove();
									rampNeed(this, 'redraw');					
									
									var index = this.index;
									
									$.each(this.series,function(i,serie){
										if(serie.index == 2 && !(serie.visible)) {
											$('#theLabel').remove();
										}
									});
								//}
							}
						}        
					},
					tooltip: {
						formatter:function() {
							var s = '<div class="tooltip-header">' + this.x + '</div>';
							$.each(this.points, function () {
								if (suffix == '_YESTERDAY' && this.series.options.id == 'current-demand' ) {
									s += "<span style='color:" + this.series.color + "'> ● </span>Yesterday's demand: <strong>" + Highcharts.numberFormat(this.y, 0, '', ',') + "</strong><br/>";
								} else if (suffix == '_YESTERDAY' && this.series.options.id == 'todays-demand' ) {
									s += "<span style='color:" + this.series.color + "'> ● </span>Today's demand: <strong>" + Highcharts.numberFormat(this.y, 0, '', ',') + "</strong><br/>";
								} else if(this.series.options.id == 'current-demand') {
									s += '<span style="color:' + this.series.color + '"> ● </span>Current demand: <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								} else if(this.series.options.id == 'yesterdays-demand') { 
									s += "<span style='color:" + this.series.color + "'> ● </span>Yesterday's demand: <strong>" + Highcharts.numberFormat(this.y, 0, '', ',') + "</strong><br/>";
								} else {
									s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								}
							});
							return s;
						}
					},
					series: [{
						name: 'Hour ahead forecast',
						id: 'hour-ahead-demand',
						color: 'rgba(4,93,178,1)',
						dashStyle: 'ShortDot',
						marker: {
							symbol: 'circle'
						}
					}, {
						name: currentDemandName,
						id: 'current-demand',
						type: 'area',
						color: 'rgba(0,199,177,1)',
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [
								[0, 'rgba(0,199,177,.3)'],
								[1, 'rgba(0,199,177,0)']
							]
						},
						marker: {
							symbol: 'circle'
						}
					}, {
						name: 'Net demand',
						id: 'current-net-demand',
						type: 'area',
						color: 'rgba(64,10,153,1)',
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [
								[0, 'rgba(64,10,153,.3)'],
								[1, 'rgba(64,10,153,0)']
							]
						},
						marker: {
							symbol: 'circle'
						}
					}],
					title: {
						text: ""
					}
					
				}, function(chart) { // on complete
						//if (suffix == '_YESTERDAY'){
							rampNeed(chart);
							
							/*if(suffix == '_YESTERDAY') {
								//maxAxis = highestPointIndex(chart.series[2]);
								startRamp = maxPointLoadX - 36;
							} else {
								if(todayForecastedPeakTime) {
									//maxAxis = intervalToArray(todayForecastedPeakTime);
									startRamp = maxPointLoadX - 36;
								} else {
									startRamp = null;
								}
							}*/
							
							//console.log('MIN LOAD POINT: ' + minPointLoadX);
							//console.log('CURRENT TIME: ' + intervalToArray(currentTime));
							//console.log('MAX LOAD POINT: ' + maxPointLoadX);
							//console.log('min point: '+minPointLoadX);
							//console.log('max point: '+maxPointLoadX);
							if(suffix != '_YESTERDAY') {
								if(intervalToArray(currentTime) < maxPointLoadX) {
									maxPointLoadX = intervalToArray(currentTime);
								}
							}
							
							//console.log('MAX LOAD POINT AFTER: ' + maxPointLoadX);
							
							if(suffix == '_YESTERDAY' || minPointLoadX < intervalToArray(currentTime)) {
								if ((maxPointLoadX - minPointLoadX) > 0) {
									chart.series[2].update({
										zoneAxis: 'x',
											zones: [{
											value: minPointLoadX,
										}, {
											value: maxPointLoadX + 1,
											color: '#890041'
										}, {
	
										}]
									});
								}
							}
						//}
				});
			});
		}
	}
	//console.log(suffix);
	// Get the CSV and create the chart for Renewables
	if($('#renewables').length) {
		if(pickChart == null || pickChart == 'renewables') {
			$.get(outDir + 'fuelsource' + suffix + '.csv', function (csv) {

				var chartRenewables = new Highcharts.Chart({

					data: {
						csv: csv
					},
					chart: {
						renderTo: 'renewables',
						type: 'line',
					},
					yAxis: [{ // left y axis
						title: {
							text: 'MW',
							margin: 10
						},
						tickPositioner: function () {
							var positions = [],
								//tick = (Math.floor(this.dataMin / 1000)*1000),
								tick = 0,
								increment = 1000;

							for (; tick - increment <= (this.dataMax + 1000); tick += increment) {
								positions.push(tick);
							}
							return positions;
						},
						labels: {
							align: 'right',
							x: -10,
							y: 3,
							formatter:function() {
								return Highcharts.numberFormat(this.value, 0, '', ',');
							}
						},
						gridLineColor: '#d8d8d8',
						showFirstLabel: true,
						gridLineWidth: 1,
						minorTickLength: 0,
						tickLength: 0
					}],
					tooltip: {
						formatter:function() {
							var s = '<div class="tooltip-header">' + this.x + '</div>';
							$.each(this.points, function () {
								if(this.series.name == 'Batteries' && this.y < 0) {
									s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ' (storing): <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								} else {
									s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
								}								
							});
							return s;
						}
					},
					colors: [ solarColor,windColor,geothermalColor,biomassColor,biogasColor,smallhydroColor, '#000', '#000', '#000', '#000', batteriesColor, '#000', '#000' ],
					series: [{
						marker: {
							symbol: 'circle'
						}
					}, {
						marker: {
							symbol: 'circle'
						}
					}, {
						marker: {
							symbol: 'circle'
						}
					}, {
						marker: {
							symbol: 'circle'
						}
					}, {
						marker: {
							symbol: 'circle'
						}
					}, {
						marker: {
							symbol: 'circle'
						}
					}, {
						visible: false,
						showInLegend: false
					}, {
						visible: false,
						showInLegend: false
					}, {
						visible: false,
						showInLegend: false
					}, {
						visible: false,
						showInLegend: false
					}, {
						marker: {
							symbol: 'circle'
						}
					}, {
						visible: false,
						showInLegend: false
					}, {
						visible: false,
						showInLegend: false
					}],
					title: ''
				});
			});
		}
	}
	
	if($('#imports').length) {
		if(pickChart == null || pickChart == 'imports') {
			$.get(outDir + 'fuelsource' + suffix + '.csv', function (csv) {

				var chartImports = new Highcharts.Chart({

						data: {
							csv: csv
						},
						chart: {
							renderTo: 'imports',
							type: 'line',
							margin: [30,1,70,65],
							height: '200px'
						},
						yAxis: [{ // left y axis
							title: {
								text: 'MW',
								margin: 10
							},
							labels: {
								align: 'right',
								x: -10,
								y: 3,
								formatter:function() {
									return Highcharts.numberFormat(this.value, 0, '', ',');
								}
							},
							plotLines: [{
								color: '#b2b2b2',
								width: 2,
								value: 0
							}],
							gridLineColor: '#d8d8d8',
							showFirstLabel: true,
							gridLineWidth: 1,
							minorTickLength: 0,
							tickLength: 0
						}],
						xAxis: {
							   max:288
						},
						tooltip: {
							formatter:function() {
									var s = '<div class="tooltip-header">' + this.x + '</div>';
									$.each(this.points, function () {
										s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
									});
									return s;
								}
						},
						colors: [ importsColor ],
						series: [{
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							visible: false,
							showInLegend: false
						}, {
							marker: {
							symbol: 'circle'
							}
						}, {
							visible: false,
							showInLegend: false
						}],
						title: ''
					});
				
			});
		}
	}
	
	
	// Get the CSV and create the chart for Batteries
	if($('#batteries').length) {
		if(pickChart == null || pickChart == 'batteries') {
			$.get(outDir + 'storage' + suffix + '.csv', function (csv) {
				
				if(pickChart == null || pickChart == 'batteries') {
					var chartBatteries = new Highcharts.Chart({

						data: {
							csv: csv
						},
						chart: {
							renderTo: 'batteries',
							/*type: 'line',*/
							type: 'area',
							/*margin: [15,0,55,65],*/
							margin: [30,1,70,65],
							height: '200px'
						},
						yAxis: [{ // left y axis
							title: {
								text: 'MW',
								margin: 10
							},
							labels: {
								align: 'right',
								x: -10,
								y: 3,
								formatter:function() {
									return Highcharts.numberFormat(this.value, 0, '', ',');
								}
							},
							plotLines: [{
								color: '#b2b2b2',
								width: 2,
								value: 0
							}],
							gridLineColor: '#d8d8d8',
							showFirstLabel: true,
							gridLineWidth: 1,
							minorTickLength: 0,
							tickLength: 0
						}],
						xAxis: {
							   max:288
						},
						tooltip: {
							formatter:function() {
								var s = '<div class="tooltip-header">' + this.x + '</div>';
								$.each(this.points, function () {
									if(this.y < 0) {
										s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ' (storing): <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
									} else {
										s += '<span style="color:' + this.series.color + '"> ● </span>' + this.series.name + ': <strong>' + Highcharts.numberFormat(this.y, 0, '', ',') + '</strong><br/>';
									}								
								});
								return s;
							}
						},
						colors: [ batteriesColor ],
						series: [{
							marker: {
							symbol: 'circle'
							},
							color: batteriesColor,
							negativeColor: batteriesColor,
							fillOpacity: 0.35
						}, {
							visible: false,
							showInLegend: false
						}],
						title: ''
					});
				}
				
			});
		}
	}
	
}		

$(document).ready(function() {

	var t = true;
	$('#toggle').click(function() {
		var chartForecast = $('#demand').highcharts();
		
		
		if (t === true) {
			chartForecast.series[1].update({ dataLabels: { className:'highlight hide' }});
			chartForecast.series[3].update({ dataLabels: { className:'highlight hide' }});
			t = false;
		} else {
			chartForecast.series[1].update({ dataLabels: { className:'highlight' }});
			chartForecast.series[3].update({ dataLabels: { className:'highlight' }});
			t = true;
		}
	});


	

	$('#tabDemandYesterday').click(function() {
		
		compareYesterday = false;
		showForecasted = false;
		
		$('#demandOptionsDrop').html("<div class='form-check'><label class='form-check-label'><input type='checkbox' class='form-check-input' id='compareToday'>Today&rsquo;s demand</label></div>");
		
		
		createLineCharts('demand','_YESTERDAY');
		//var chartDemand = $('#demand').highcharts();
		//chartDemand.get('current-demand').update({name:"Yesterday's demand"});
		
		$('.lineChart.demand-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.demand-chart .chart-title').html('Yesterday’s demand');
		demandTime = 'Yesterday';
	});

	$('#tabDemandToday').click(function() {
		
		compareToday = false;
		
		$('#demandOptionsDrop').html("<div class='form-check'><label class='form-check-label'><input type='checkbox' class='form-check-input' id='compareYesterday'>Yesterday&rsquo;s demand</label></div><div class='form-check'><label class='form-check-label'><input type='checkbox' class='form-check-input' id='showForecastedPeak'>Forecasted peak</label></div>");
		
		createLineCharts('demand');

		$('.lineChart.demand-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.demand-chart .chart-title').html('Today’s demand');
		demandTime = 'Today';
	});
	
	$('#demandOptionsDrop').on('click', '#compareToday', function() {
		var chartDemand = $('#demand').highcharts();
		if(compareToday === false){
			$.get(outDir + 'demand.csv', function(csv) {
				var parsedObject = parseCSVData(csv,3);

				chartDemand.addSeries({
					name: "Today's demand<br />(5 min. avg.)",
					id: 'todays-demand',
					type: 'area',
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, 'rgba(255,163,0,.3)'],
							[1, 'rgba(255,163,0,0)']
						]
					},
					color: '#ffa300',
					data: parsedObject
				});
			});
			
			
			chartDemand.redraw();
			compareToday = true;
		} else {
			chartDemand.get('todays-demand').remove();
			compareToday = false;
		}
	});

	$('#demandOptionsDrop').on('click', '#compareYesterday', function() {
		var chartDemand = $('#demand').highcharts();
		if(compareYesterday === false){
			$.get(outDir + 'demand_YESTERDAY.csv', function(csv) {
				var parsedObject = parseCSVData(csv,3);
				//chartDemand.get('current-demand').setData(parsedObject);
				//chartDemand.get('current-demand').update({name:"Current demand w/ pumped storage"});
				chartDemand.addSeries({
					name: "Yesterday's demand<br />(5 min. avg.)",
					id: 'yesterdays-demand',
					type: 'area',
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, 'rgba(255,163,0,.3)'],
							[1, 'rgba(255,163,0,0)']
						]
					},
					color: '#ffa300',
					data: parsedObject
				});
			});
			
			
			chartDemand.redraw();
			compareYesterday = true;
		} else {
			chartDemand.get('yesterdays-demand').remove();
			compareYesterday = false;
		}
	});

	$('#demandOptionsDrop').on('click', '#showForecastedPeak', function() {
		console.log('Is clicked');
		var chartDemand = $('#demand').highcharts();
		if(showForecasted === false){
			chartDemand.addSeries({
				name: "Forecasted peak",
				id: 'forecast-peak',
				color: 'rgba(4,93,178,1)',
				type: 'scatter',
				marker: {
					symbol: 'triangle'
				},
				enableMouseTracking: false,
				showInLegend: false,
				label: todayForecastedPeak,
				dataLabels: {
					align: 'center',
					enabled: true,
					crop: false,
					overflow: 'none',
					style: {
						color: 'rgba(4,93,178,1)'
					},
					padding: 4,
					formatter: function() {
						return ("Forecasted peak: " + Highcharts.numberFormat(todayForecastedPeak, 0, '', ','));
					},
					verticalAlign: 'bottom',
					y: -3
				}
			});
			//console.log(todayForecastedPeakTime);
			chartDemand.get('forecast-peak').addPoint([intervalToArray(todayForecastedPeakTime),todayForecastedPeak]);
			chartDemand.redraw();
			showForecasted = true;
		} else {
			chartDemand.get('forecast-peak').remove();
			showForecasted = false;
		}
	});
	
	$('#tabNetDemandYesterday').click(function() {
		
		createLineCharts('netDemand','_YESTERDAY');
		
		$('.lineChart.net-demand-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.net-demand-chart .chart-title').html('Yesterday’s net demand');
		netDemandTime = 'Yesterday';
	});
	$('#tabNetDemandToday').click(function() {
		
		createLineCharts('netDemand');
		
		$('.lineChart.net-demand-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.net-demand-chart .chart-title').html('Today’s net demand');
		netDemandTime = 'Today';
	});
	
	$('#tabRenewYesterday').click(function() {
		
		createLineCharts('renewables','_YESTERDAY');
		
		$('.lineChart.renewables-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.renewables-chart .chart-title').html('Yesterday’s renewables');
		renewTime = 'Yesterday';

	});
	$('#tabRenewToday').click(function() {
		
		createLineCharts('renewables');
		
		$('.lineChart.renewables-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.renewables-chart .chart-title').html('Today’s renewables');
		renewTime = 'Today';
	});
	
	$('#tabBatteriesYesterday').click(function() {
		
		createLineCharts('batteries','_YESTERDAY');
		
		$('.lineChart.batteries-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.batteries-chart .chart-title').html('Yesterday’s batteries');
		batteriesTime = 'Yesterday';

	});
	$('#tabBatteriesToday').click(function() {
		
		createLineCharts('batteries');
		
		$('.lineChart.batteries-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.batteries-chart .chart-title').html('Today’s batteries');
		batteriesTime = 'Today';
	});
	
	$('#tabImportsYesterday').click(function() {
		
		createLineCharts('imports','_YESTERDAY');
		
		$('.lineChart.imports-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.imports-chart .chart-title').html('Yesterday’s imports');
		importTime = 'Yesterday';

	});
	$('#tabImportsToday').click(function() {
		
		createLineCharts('imports');
		
		$('.lineChart.imports-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		$('.imports-chart .chart-title').html('Today’s imports');
		importTime = 'Today';
	});
	
	$('#tabCO2Yesterday').click(function() {
						
		loadSupplyCO2('_YESTERDAY');
		
		$('.lineChart.co2-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		CO2Time = 'Yesterday';
	});
	
	$('#tabCO2Today').click(function() {
						
		loadSupplyCO2();
		
		$('.lineChart.co2-chart .pagination li').removeClass('active');
		$(this).parent().addClass('active');
		CO2Time = 'Today';
	});
	
	$('#downloadDemandCSV').click(function () {
		createCSV($(this),"demand","Demand", "CAISO-demand",demandTime);
	});
	$('#downloadNetDemandCSV').click(function () {
		createCSV($(this),"netDemand","Net Demand", "CAISO-netdemand",netDemandTime);
	});
	$('#downloadRenewablesCSV').click(function () {
		createCSV($(this),"renewables","Renewables", "CAISO-renewables",renewTime);
	});
	$('#downloadBatteriesCSV').click(function () {
		createCSV($(this),"batteries","", "CAISO-batteries",batteriesTime);
	});
	$('#downloadImportsCSV').click(function () {
		createCSV($(this),"imports","", "CAISO-imports",importTime);
	});
	$('#downloadCO2CSV').click(function () {
		createCSV($(this),"co2","", "CAISO-co2",CO2Time);
	});
	$('#downloadHistoricalCO2CSV').click(function () {
		createCSV($(this),"yearlyEmissions","", "CAISO-historical-co2");
	});

	
	$(function () {
	  $('[data-toggle="popover"]').popover()
	});
	
	$('.overview-icon.available-capacity').tooltip({
		title: 'Energy available to the ISO, including current demand and unloaded capacity',
		placement: 'bottom'
	});
	$('.overview-icon.current-demand').tooltip({
		title: 'Amount of energy needed to fill demand',
		placement: 'bottom'
	});
	$('.overview-icon.forecasted-peak').tooltip({
		title: 'Maximum amount of energy expected to be in demand during the day',
		placement: 'bottom'
	});
	$('.overview-icon.planned-outages').tooltip({
		title: 'Scheduled maintenance and unexpected generation outages',
		placement: 'bottom'
	});
	$('.overview-icon.current-peak').tooltip({
		title: 'Amount and time that maximum amount of energy was used',
		placement: 'bottom'
	});
	$('.overview-icon.tomorrows-peak').tooltip({
		title: 'Forecasted amount and time that maximum amount of energy will be used',
		placement: 'bottom'
	});
	$('.overview-icon.renewables').tooltip({
		title: 'Amount of renewables currently serving demand',
		placement: 'bottom'
	});
	$('.overview-icon.current-co2').tooltip({
		title: 'Total emissions per hour reported on a rolling 5-minute basis',
		placement: 'bottom'
	});
	$('.overview-icon.current-co2-intensity').tooltip({
		title: 'Carbon emissions per hour based on current energy output',
		placement: 'bottom'
	});
	$('.overview-icon.co2-reduction').tooltip({
		title: 'Reductions are calculated by comparing data from the same period in 2014 (Jan. - Nov.)',
		placement: 'bottom'
	});
	
	// IE Edge Sticky top fixed. Have to do it on all versions due to placemnt in Sharepoint Template
	
	//var ms_ie = false;
	//var ua = window.navigator.userAgent;
	//var old_ie = ua.indexOf('MSIE ');
	//var new_ie = ua.indexOf('Trident/');
	//var edge = ua.indexOf('Edge/');

	//if ((old_ie > -1) || (new_ie > -1) || (edge > -1)) {
	//	ms_ie = true;
	//}

	//if ( ms_ie ) {
		var menu = document.querySelector('.sticky-top');
		//console.log('sticky: '+menu );
		var menuPosition = menu.getBoundingClientRect();
		var menuPositionQuery = $('.sticky-top').offset();
		//console.log('menu position: '+menu.getBoundingClientRect().top);
		//console.log('new menu position: '+$('.sticky-top').offset().top );
		var placeholder = document.createElement('div');
		placeholder.style.width = menuPosition.width + 'px';
		placeholder.style.height = menuPosition.height + 'px';
		var isAdded = false;
		
		window.addEventListener('scroll', function() {
			if (window.pageYOffset >= menuPositionQuery.top && !isAdded) {
				menu.classList.add('sticky');
				menu.parentNode.insertBefore(placeholder, menu);
				isAdded = true;
			} else if (window.pageYOffset < menuPositionQuery.top && isAdded) {
				menu.classList.remove('sticky');
				menu.parentNode.removeChild(placeholder);
				isAdded = false;
			} else {
				
			}
		});
	//}
	
});
//})(jq321);
});