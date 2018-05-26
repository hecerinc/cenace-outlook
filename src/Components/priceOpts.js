import Highcharts from 'highcharts';
let dateOpts = {year: 'numeric', month: 'long', day: 'numeric' };

export default {
	chart: {
		backgroundColor: 'transparent'
	},
	title: {
		style: {color: '#fff'}
	},
	subtitle: {
		text: `Price comparison for ${new Date().toLocaleDateString('en-US', dateOpts)}`,
		style: {color: '#fff'}
	},
	legend: {itemStyle:  {color: '#fff'}},
	xAxis: {
		tickColor: '#1C324A',
		tickInterval: 1,
		title: {
			text: 'Hour',
			style: {color: '#fff'}
		},
		type: 'linear',
		lineColor: '#243753',
		gridLineColor: '#243753',
		gridLineWidth: 1,
		labels: {
			style: {
				color: '#537095',
				fontFamily: 'Brandon Grotesque, sans-serif',
				fontWeight: '800',
				fontSize: '14px',
				marginTop: 10
			}
		}
	},
	yAxis: {
		tickColor: '#537095',
		title : {
			text : 'Precio <strong>($ MXN)</strong>',
			margin: 10,
			style: {
				color: '#fff',
			}
		},
		gridLineColor: '#243753',
		gridLineWidth: 1,
		labels: {
			align: 'right',
			x: -10,
			y: 3,
			style: {
				color: '#537095',
				fontFamily: 'Brandon Grotesque, sans-serif',
				fontWeight: '600',
				fontSize: '14px'
			},
			formatter:function() {
				return Highcharts.numberFormat(this.value, 0, '', ',');
			}
		}
	},
	plotOptions: {
		area: {
			fillColor: {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, Highcharts.getOptions().colors[0]],
					[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
				]
			},
			marker: {
				radius: 2
			},
			lineWidth: 1,
			states: {
				hover: {
					lineWidth: 1
				}
			},
			threshold: null
		}
	},

	series: [{
		name: 'Hourly MLP',
		data: [906.68, 779.66, 699.98, 570.82, 575.25, 761.06, 969.8, 1407.68, 1405.7, 1544.38, 1587.43, 1573.09, 1515.52, 1589.06, 1571.96, 1578.69, 1582.8, 1553.74, 1624.75, 1647.01, 1639.93, 1564.79, 1553.45, 1467.59]
	}]
};
