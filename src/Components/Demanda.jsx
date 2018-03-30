import React from 'react';
import Highcharts from 'highcharts';


Highcharts.setOptions({
	chart: {
		style: {
			fontFamily: 'Segoe UI, sans-serif'
		}
	}
});

let dateOpts = {year: 'numeric', month: 'long', day: 'numeric' };
export default class Demanda extends React.Component {
	constructor() {
		super();
		this.loadChart = this.loadChart.bind(this);
	}
	componentDidMount() {
		this.loadChart();
	}
	loadChart() {
		let chart = new Highcharts.Chart('chart', {
			chart : {
				type : 'spline',
				backgroundColor : 'transparent'
			},
			title : {
				text : 'Demanda pronosticada',
				style: {
					color: "#fff"
				}
			},
			subtitle : {
				// TODO: translate
				text : new Date().toLocaleDateString('es-MX', dateOpts),
				style: {
					color: "#fff"
				}
			},
			xAxis : {
				tickColor: '#1C324A',
				tickInterval: 1,
				title: {
					text: 'Hora',
					style: {color: '#fff'}
				},
				type: 'linear',
				lineColor: '#243753',
				// type : 'datetime',
				// dateTimeLabelFormats : { // don't display the dummy year
				// 	month : '%e. %b',
				// 	year : '%b'
				// }
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
				},
				// alternateGridColor: {
				// 	linearGradient: {
				// 		x1: 0, y1: 1,
				// 		x2: 1, y2: 1
				// 	},
				// 	stops: [ [0, '#f8f8f8' ],
				// 			 [0.5, '#f8f8f8'] ,
				// 			 [0.8, '#f8f8f8'] ,
				// 			 [1, '#f8f8f8'] ]
				// },
			},
			legend: {itemStyle:  {color: '#fff'}},
			yAxis : {
				tickColor: '#537095',
				title : {
					text : 'Demanda <strong>(MW)</strong>',
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
					formatter: function() {
						return Highcharts.numberFormat(this.value, 0, '', ',');
					}
				},
				min : 18000
			},
			tooltip : {
				formatter : function () {
					return '<strong>' + this.series.name + '</strong><br/>' +
					'Hora '+this.x+': ' + this.y.toFixed(2) + ' MW';
				}
			},
			plotOptions : {
				area : {
					// lineWidth : 1,
					marker : {
						enabled : false,
						states : {
							hover : {
								enabled : true,
								radius : 7
							}
						}
					},
					// shadow : false,
					// states : {
					// 	hover : {
					// 		lineWidth : 1
					// 	}
					// }
				}
			},
			series : [
				// {
				// 	name : 'Demanda real',
				// 	type : "area",
				// 	lineWidth: 3,
				// 	fillColor : {
				// 		linearGradient : {
				// 			x1: 0,
				// 			x2: 0,
				// 			y1: 0,
				// 			y2: 1,
				// 		},
				// 		stops : [
				// 			[0, 'rgba(59,176,254, .3)'],
				// 			[1, 'rgba(59,176,254, 0)']
				// 			// [1, Highcharts.getOptions().colors[0]]
				// 		]
				// 	},
				// 	// Define the data points. All series have a dummy year
				// 	// of 1970/71 in order to be compared on the same x axis. Note
				// 	// that in JavaScript, months start at 0 for January, 1 for February etc.
				// 	data : [
				// 		// demanda real
				// 		[0,29333.363076],
				// 		[1,28113.642925],
				// 		[2,27450.03522],
				// 		[3,27021.877871],
				// 		[4,27045.440327],
				// 		[5,27886.300593],
				// 		[6,29586.168853],
				// 		[7,31034.343695],
				// 		[8,31724.719465],
				// 		[9,32784.9468],
				// 		[10,33224.347835],
				// 		[11,33452.440692],
				// 		[12,33758.117244],
				// 		[13,33706.186002],
				// 		[14,33841.876065],
				// 		[15,33959.647386],
				// 		[16,33875.240466],
				// 		[17,34120.903698],
				// 		[18,35378.774527],
				// 		[19,35639.621831],
				// 		// [20,35241.728668],
				// 		// [21,33932.042597],
				// 		// [22,32773.804802],
				// 		// [23,31292.819838]
				// 	]
				// }, 
				{
					name : 'Pronóstico MDA',
					type : "area",
					color: '#F3CF62',
					fillColor : {
						linearGradient : [0, 0, 0, 300],
						stops : [
							//[0, Highcharts.getOptions().colors[1]],
							[0, 'rgba(243,207,98, .3)'],
							[1, 'rgba(243,207,98, 0)']
						]
					},
					data : [
						// pronostico
						[0, 27918.384],
						[1,  27003.64],
						[2, 26308.963],
						[3, 25955.336],
						[4, 25939.707],
						[5, 26600.559],
						[6, 28007.149],
						[7, 29004.471],
						[8, 30069.292],
						[9, 30983.938],
						[10,31731.574],
						[11,32078.744],
						[12,32428.724],
						[13,32334.966],
						[14,32207.174],
						[15,32312.408],
						[16,32328.769],
						[17,32203.979],
						[18,33424.333],
						[19,34143.305],
						[20, 33620.52],
						[21,32493.885],
						[22,31395.863],
						[23,29972.058]
					]
				}
			]
		});

	}

	render() {

		const hideClass = this.props.visible ? 'Demanda': 'Demanda hidden';
		
		return(
			<div className={hideClass}>
				<div className="row">
					<div className="col titles">
						<h2>Demanda pronosticada</h2>
						<h3>{new Date().toLocaleDateString('es-mx', dateOpts)}</h3>
					</div>
				</div>
				<hr/>
				<div className="row">
					<div className="col filters">
						<div className="row">
							<div className="col-3 label">
								Sistema:
							</div>
							<div className="col-9">
								<select name="sistema" id="sistema">
									<option value="">---</option>
									<option value="1">Sistema Interconectado Nacional (SIN)</option>
									<option value="2">Baja California (BCA)</option>
									<option value="3">Baja California Sur (BCS)</option>
									<option value="4">Mulege</option>
								</select>
							</div>
						</div>
						<div className="row">
							<div className="col-3 label">
								Zona de Carga (NodosP Distribuidos)
							</div>
							<div className="col-9">
								<select name="sistema" id="sistema">
									<option value="">---</option>
								</select>
							</div>
						</div>
						
					</div>
					<div className="col scalars">
						<div className="scalarContainer">
							<table className="scalarTable">
								<tbody>
									<tr>
										<td>
											<p className="figure">35,560 <span className="units">MW</span></p>
											<p className="desc">Demanda actual</p>
										</td>
										<td>
											<p className="figure">29,095 <span className="units">MW</span></p>
											<p className="desc small">Demanda m&aacute;xima pronosticada</p>
										</td>
									</tr>
									<tr>
										<td>
											<p className="figure">28,340 <span className="units">MW</span></p>
											<p className="desc">Demanda m&aacute;xima</p>
										</td>
										<td>
											<p className="figure">35,560 <span className="units">MW</span></p>
											<p className="desc small">Demanda m&aacute;xima pronosticada para mañana</p>
										</td>
										
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div className="chartContainer">
					<div id="chart"></div>
				</div>
			</div>
		);
	}
}