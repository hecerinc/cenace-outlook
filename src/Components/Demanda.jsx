import React from 'react';
import Highcharts from 'highcharts';
import request from 'request';

import Filter from './Filter';

Highcharts.setOptions({
	chart: {
		style: {
			fontFamily: 'Segoe UI, sans-serif'
		}
	}
});


let dateOpts = {year: 'numeric', month: 'long', day: 'numeric' };

const todayData = require('../data/todayDemand.json');

const defaultData = todayData['SIN']['MONTERREY'];

export default class Demanda extends React.Component {

	constructor() {
		super();
		this.state = {
			selectedSystem: 'SIN',
			selectedZone: null
		};
		this.loadChart = this.loadChart.bind(this);
		this.selectZone = this.selectZone.bind(this);
		this.selectFilterUpdated = this.selectFilterUpdated.bind(this);
	}
	componentDidMount() {
		this.loadChart();
	}
	loadChart() {
		this.chart = new Highcharts.Chart('chart', {
			chart : {
				type : 'spline',
				backgroundColor : 'transparent'
			},
			title : {
				text : 'Demanda pronosticada',
				style: {color: "#fff"}
			},
			subtitle : {
				//text : ,
				text : `MONTERREY  |  ${(new Date().toLocaleDateString('es-MX', dateOpts))}`,
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
				// FUTURE: Add real demand when data becomes available
				// { name : 'Demanda real' },
				{
					name : 'Pronóstico MDA',
					type : "area",
					// color: '#F3CF62',
					color: '#4CF1CD',
					fillColor : {
						linearGradient : [0, 0, 0, 300],
						stops : [
							//[0, Highcharts.getOptions().colors[1]],
							[0, 'rgba(76,241,205, .3)'],
							[1, 'rgba(76,241,205, 0)']
						]
					},
					data : defaultData
				}
			]
		});

	}

	selectZone(zdc) {
		// Send the request
		// TODO: change this
		const date = "2017-01-02";
		const sistema = this.state.selectedSystem;
		request(`http://localhost/outlook_server/demanda/${sistema}/${zdc}/${date}`, (error, response, body) => {
			if(!error && response && response.statusCode == 200){
				let res = JSON.parse(body);
				this.chart.series[0].update({data: res.data}, false);
				this.chart.setTitle(null, {text: `${zdc} | ${(new Date().toLocaleDateString('es-MX', dateOpts))}`});
				this.chart.redraw();
			}
		});
		// const zonedata = todayData[sistema][zdc];
		// TODO: Maybe remove this?
		// this.setState({selectedZone: zdc});
	}
	selectFilterUpdated(filterName, newVal) {
		switch(filterName) {
			case "zdc":
				this.selectZone(newVal);
			break;
			case "region":
				// We don't want to rerender when this is updated
				this.setState({selectedSystem: newVal});
			break;
			default:
			break;
		}
	}
	shouldComponentUpdate(nextProps, nextState) {
		// Means you're updating something else
		return nextState.selectedSystem === this.state.selectedSystem;
	}

	render() {

		// TODO: swap this out for React Router
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

					<Filter depth={3} updateNode={this.selectFilterUpdated} />

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