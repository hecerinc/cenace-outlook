import React, { Component } from 'react';
import Highcharts from 'highcharts';
import InlineSVG from 'svg-inline-react';
import './App.css';
import Precios from './Precios';
import Demanda from './Demanda';
/* eslint import/no-webpack-loader-syntax: off */

Highcharts.setOptions({
	chart: {
		style: {
			fontFamily: 'Segoe UI, sans-serif'
		}
	}
});

class App extends Component {
	constructor() {
		super();
		this.state = {
			active: 1
		};
		this.loadChart = this.loadChart.bind(this);
		this.toggleView = this.toggleView.bind(this);
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
				text : 'Diciembre 15, 2016',
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
					formatter:function() {
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
					type : "line",
					color: '#F3CF62',
					// fillColor : {
					// 	linearGradient : [0, 0, 0, 300],
					// 	stops : [
					// 		[0, Highcharts.getOptions().colors[1]],
					// 		[1, 'rgba(2,0,0,0)']
					// 	]
					// },
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
	componentDidMount() {
		// this.loadChart();
	}
	toggleView(e) {
		e.preventDefault();
		const name = e.target.name;
		let active = name == "demanda" ? 0 : 1;
 		this.setState({active});
	}
	render() {
		return (
			<div className="App">
				<h1 className="fw300" style={{marginBottom: 0}}>Sistema El&eacute;ctrico Nacional</h1>
				<h3 style={{fontSize: '12px', marginTop: 0, color: '#537095'}}><span style={{fontSize: '10px'}}>una iniciativa de</span> Berkeley Energy and Climate Institute</h3>

				<p className="firstp">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet molestiae consequuntur ducimus dicta explicabo reiciendis magni dolores tempore dolor enim nulla accusantium, ea velit, a aperiam. Facilis minus minima aperiam officiis ratione at similique perspiciatis fugit quas omnis, ipsum sit eligendi, nostrum autem nisi reiciendis repellendus, aliquam molestiae reprehenderit quasi quo impedit id maxime odit. Libero, reprehenderit. Iusto sit enim, fugit amet expedita, a optio illo molestiae rerum. Quos sed doloremque omnis dolorum similique nemo distinctio, perferendis veniam eos aperiam quo quibusdam culpa expedita laudantium excepturi harum iure odio atque consequuntur delectus. Explicabo vero, nobis hic minus similique voluptates quo!</p>
				<div className="demandaprecio">
					<ul>
						<li><a name="demanda" onClick={this.toggleView} className={this.state.active !== 1 ? 'active' : ''} href="#">Demanda</a></li>
						<li><a name="precios" onClick={this.toggleView} className={this.state.active === 1 ? 'active' : ''} href="#">Precios</a></li>
					</ul>
					<hr/>
				</div>

				<Precios visible={this.state.active === 1} />

				<Demanda visible={this.state.active !== 1} />

				<p className="footer" style={{textAlign: 'center', marginTop: '40px'}}>2018 &copy; Berkeley Energy and Climate Institute</p>
			</div>
		);
	}
}

export default App;
