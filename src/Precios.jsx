import React from 'react';
import Highcharts from 'highcharts';
import InlineSVG from 'svg-inline-react';
import classNames from 'classnames';

import NodosPFilter from './NodosPFilter';

import './Precios.css';

const masterdata = require('./todaydata.json');



// const energia = [906.68, 779.66, 699.98, 570.82, 575.25, 761.06, 969.8, 1407.68, 1405.7, 1544.38, 1587.43, 1573.09, 1515.52, 1589.06, 1571.96, 1578.69, 1582.8, 1553.74, 1624.75, 1647.01, 1639.93, 1564.79, 1553.45, 1467.59];

const perdidas =  [83.47, 71.4, 63.37, 50.19, 50.64, 70.68, 93.07, 140.65, 136.81, 154.63, 156.39, 160.17, 163.6, 158.95, 157.12, 152.08, 151.17, 156.71, 174.96, 193, 192.45, 181.29, 167.15, 143.37];

const congestion = [-0.31, -0.2, -1.98, 0, -0.02, -2.2, -0.35, -0.02, 0, -1.37, -1.19, 0, -1.99, -9.97, -5.74, -8.69, -11.76, -10.87, -19.03, -14.57, -18.24, -17.25, -17.77, -17.27];


export default class Precios extends React.Component {

	constructor() {
		super();
		this.state = {
			isSecondFilterShown: false,
			selectedNode: null
		};
		this.showSecondFilter = this.showSecondFilter.bind(this);
		this.changeNodeData = this.changeNodeData.bind(this);
		this.updateNode = this.updateNode.bind(this);
	}

	showSecondFilter(e) {
		e.preventDefault();
		this.setState({isSecondFilterShown: true});
	}

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
				{
					name : 'Componente energía',
					color: '#F3CF62',
					// type : "line",
					
					// fillColor : {
					// 	linearGradient : [0, 0, 0, 300],
					// 	stops : [
					// 		[0, Highcharts.getOptions().colors[1]],
					// 		[1, 'rgba(2,0,0,0)']
					// 	]
					// },
					data : [906.68, 779.66, 699.98, 570.82, 575.25, 761.06, 969.8, 1407.68, 1405.7, 1544.38, 1587.43, 1573.09, 1515.52, 1589.06, 1571.96, 1578.69, 1582.8, 1553.74, 1624.75, 1647.01, 1639.93, 1564.79, 1553.45, 1467.59],
					borderWidth: 0,
				},
				{
					name: 'Component pérdidas',
					data: perdidas,
					borderWidth: 0,
				},
				{
					name: 'Componente congestión',
					color: '#FE8000',
					data: congestion,
					borderWidth: 0,
				}
			]
		});
		this.chart = chart;
	}
	updateNode(node) {
		this.setState({selectedNode: node});
		this.changeNodeData(node);
	}
	changeNodeData(node) {
		const nodeData = masterdata[node];
		this.chart.series[0].update({
			data: nodeData['energia']
		}, true);
		this.chart.series[1].update({
			data: nodeData['perdidas']
		}, true);
		this.chart.series[2].update({
			data: nodeData['congestion']
		}, true);
		this.chart.setTitle(null, {text: `Nodo: ${node}`});
		this.chart.redraw();
	}
	render() {
		const hideClass = classNames('Precios', {hidden: !this.props.visible});
		const aClass = classNames('col', 'filters', {hidden: this.state.isSecondFilterShown});
		console.log(aClass);
		return(
			<div className={hideClass}>
				<div className="row">
					<div className="col titles">
						<h2>Precios Marginales Locales</h2>
						<h3>{new Date().toLocaleString().split(',')[0]}</h3>
					</div>
				</div>
				<div className="row">

					<NodosPFilter changeNodeData={this.changeNodeData} visible={true} updateNode={this.updateNode} />

					<div className={aClass}>
						<a href="#" onClick={this.showSecondFilter} className="btn compareNodeBtn">+ Compara NodosP</a>
					</div>
					<NodosPFilter visible={this.state.isSecondFilterShown} />

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