import React from 'react';
import Highcharts from 'highcharts';
import InlineSVG from 'svg-inline-react';

import NodosPFilter from './NodosPFilter';

import './Precios.css';

// const energia = [906.68, 779.66, 699.98, 570.82, 575.25, 761.06, 969.8, 1407.68, 1405.7, 1544.38, 1587.43, 1573.09, 1515.52, 1589.06, 1571.96, 1578.69, 1582.8, 1553.74, 1624.75, 1647.01, 1639.93, 1564.79, 1553.45, 1467.59];

const perdidas =  [83.47, 71.4, 63.37, 50.19, 50.64, 70.68, 93.07, 140.65, 136.81, 154.63, 156.39, 160.17, 163.6, 158.95, 157.12, 152.08, 151.17, 156.71, 174.96, 193, 192.45, 181.29, 167.15, 143.37];

const congestion = [-0.31, -0.2, -1.98, 0, -0.02, -2.2, -0.35, -0.02, 0, -1.37, -1.19, 0, -1.99, -9.97, -5.74, -8.69, -11.76, -10.87, -19.03, -14.57, -18.24, -17.25, -17.77, -17.27];


export default class Precios extends React.Component {


	
	componentDidMount() {
		let chart = new Highcharts.Chart('highcharts2', {
			chart : {
				type : 'column',
				backgroundColor : 'transparent'
			},
			title : {
				text : 'Precios Marginales Locales',
				style: {
					color: "#fff"
				}
			},
			subtitle : {
				text : 'Nodo: 01AAN-85',
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
				},
			},
			tooltip : {
				formatter : function () {
					return '<strong>Hora '+this.x+ ' </strong><br/>' + '<strong>' + this.series.name + ': </strong>'+this.point.y+'<br/>'
					+ '<strong>Total: </strong>' + this.point.stackTotal;
				}
			},
			plotOptions : {
				// area : {
				// 	// lineWidth : 1,
				// 	marker : {
				// 		enabled : false,
				// 		states : {
				// 			hover : {
				// 				enabled : true,
				// 				radius : 7
				// 			}
				// 		}
				// 	},
				// 	// shadow : false,
				// 	// states : {
				// 	// 	hover : {
				// 	// 		lineWidth : 1
				// 	// 	}
				// 	// }
				// },
				column: {
					stacking: 'normal',
					dataLabels: {
						enabled: true,
						color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
					}
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
					name : 'Componente energía',
					// type : "line",
					color: '#F3CF62',
					// fillColor : {
					// 	linearGradient : [0, 0, 0, 300],
					// 	stops : [
					// 		[0, Highcharts.getOptions().colors[1]],
					// 		[1, 'rgba(2,0,0,0)']
					// 	]
					// },
					data : [906.68, 779.66, 699.98, 570.82, 575.25, 761.06, 969.8, 1407.68, 1405.7, 1544.38, 1587.43, 1573.09, 1515.52, 1589.06, 1571.96, 1578.69, 1582.8, 1553.74, 1624.75, 1647.01, 1639.93, 1564.79, 1553.45, 1467.59]
				},
				{
					name: 'Component pérdidas',
					data: perdidas
				},
				{
					name: 'Componente congestión',
					data: congestion
				}
			]
		});
	}

	
	render() {
		return(
			<div className="Precios">
				<div className="row">
					<div className="col titles">
						<h2>Precios Marginales Locales</h2>
						<h3>{new Date().toLocaleString().split(',')[0]}</h3>
					</div>
					<div className="col align-right">
						<a href="#" className="btn download">Descarga los datos</a>
					</div>
				</div>
				<div className="row">

					<NodosPFilter />

					<div className="col scalars">
						<div className="scalarContainer">
							<a href="#" className="btn compareNodeBtn">+ Compara NodosP</a>
						</div>
					</div>
				</div>
				<div className="row precios_tab">
					<div className="col-md-3">
						<a href="#">Listado</a>
					</div>
					<div className="col-md-3">
						<a className="active" href="#">Gr&aacute;fica</a>
					</div>
				</div>
				<hr/>
				<div className="row">
					<div className="col">
						<div className="chartContainer">
							<div id="highcharts2"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}