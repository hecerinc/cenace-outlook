import React from 'react';
import classNames from 'classnames';

import NodosPFilter from './Filter';
import DownloadRangeData from './DownloadRangeData';

import '../style/Datos.css';

const baseUrl = process.env.NODE_ENV === "production" ? process.env['REACT_APP_OUTLOOK_PRODUCTION_SERVER_BASE_URL'] : process.env['REACT_APP_OUTLOOK_SERVER_BASE_URL'];


export default class DatosFrame extends React.Component{
	constructor() {
		super();
		this.state = {
			precios: {
				sistema: 'SIN',
				region: null,
				zdc: null,
				nodo: null,
				startDate: null,
				endDate: null,
			},
			demanda: {
				sistema: 'SIN',
				region: null,
				zdc: null,
				startDate: null,
				endDate: null,
			},
			demandaURL: null, 
			preciosURL: null,
		};
		this.updateDownloadUrl = this.updateDownloadUrl.bind(this);
		this.updateDateSelection = this.updateDateSelection.bind(this);
		this.updateFilter = this.updateFilter.bind(this);
	}
	updateDownloadUrl(whichData) {
		let url = "";
		if(whichData === "demanda") {
			const demanda = this.state.demanda;
			const startDate = demanda.startDate ? demanda.startDate.toISOString().split("T")[0] : null;
			const endDate = demanda.endDate ? demanda.endDate.toISOString().split("T")[0] : null;
			url = `${baseUrl}/demanda/dump/${demanda.sistema}/${demanda.zdc}/${startDate}/${endDate}`;
			this.setState({demandaURL: url});
		}
		else{
			const precios = this.state.precios;
			const startDate = precios.startDate ? precios.startDate.toISOString().split("T")[0] : null;
			const endDate = precios.endDate ? precios.endDate.toISOString().split("T")[0] : null;
			url = `${baseUrl}/precios/dump/${precios.nodo}/${startDate}/${endDate}`;
			this.setState({preciosURL: url});
		}
	}
	updateFilter(filterName, newVal, flag) {
		const filterData = {...this.state[flag]};
		if(newVal == ""){
			newVal = null;
		}
		let updateUrl = false;
		switch(filterName){
			case "region":
				filterData['sistema'] = newVal;
			break;
			case "bas":
			break;
			case "zdc":
				filterData['zdc'] = newVal;
				updateUrl = "demanda";
			break;
			case "nodosp":
				// Can only be precios
				filterData['nodo'] = newVal;
				updateUrl = "precios";
			break;
			default: 
			break;
		}
		let rel = {};
		rel[flag] = filterData;
		this.setState(rel, () => {
			if(updateUrl){
				this.updateDownloadUrl(updateUrl);
			}
		});
	}
	shouldComponentUpdate(newProps, newState){
		if(newProps.visible !== this.props.visible)
			return true;
		if(newState.demandaURL !== this.state.demandaURL || newState.preciosURL !== this.state.preciosURL){
			return true;
		}
		return false;
	}
	updateDateSelection(whichFilter, whichDate, newDate) {
		const filterData = {...this.state[whichFilter]};
		filterData[whichDate] = newDate;
		this.setState({[whichFilter]: filterData}, () => {
			// Check if URL should be updated
			if(this.state.precios.startDate && this.state.precios.endDate){
				this.updateDownloadUrl("precios");
			}
			if(this.state.demanda.startDate && this.state.demanda.endDate){
				this.updateDownloadUrl("demanda");
			}
		});


	}
	render() {
		const hideClass = classNames('DatosFrame', {hidden: !this.props.visible});
		return(
			<div className={hideClass}>
				<div className="row">
					<div className="col titles">
						<h2>Descarga los datos</h2>
					</div>
				</div>
				<div className="row mb5">
					<div className="col">
						<p className="white">Los datos fueron descargados de lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel similique dignissimos reiciendis quidem ipsam laboriosam ex deserunt enim, laudantium culpa aut corrupti quos iste laborum assumenda hic placeat quo quia!</p>
						<p>Link al scraper: <a className="green"  rel="noopener noreferrer" href="https://github.com/hecerinc/CENACE-scraper" target="_blank">github.com/hecerinc/CENACE-scraper</a></p>
					</div>
				</div>
				<div className="row">
					<div className="col filters maincol">
						<h3>Demanda pronosticada (MDA)</h3>
						<NodosPFilter depth={3} updateNode={(filterName, value) => {this.updateFilter(filterName, value, 'demanda')}} />
						<DownloadRangeData start={this.state.demanda.startDate} end={this.state.demanda.endDate} onSelectDate={(newDate, whichDate) => {this.updateDateSelection("demanda", whichDate, newDate)}} downloadURL={this.state.demandaURL} />

					</div>
					<div className="col filters maincol">
						<h3>Precios Marginales Locales</h3>
						<NodosPFilter updateNode={(filterName, value) => {this.updateFilter(filterName, value, 'precios')}} />
						<DownloadRangeData start={this.state.precios.startDate} end={this.state.precios.endDate} onSelectDate={(newDate, whichDate) => {this.updateDateSelection("precios", whichDate, newDate)}} downloadURL={this.state.preciosURL} />

					</div>
				</div>
			</div>
		);
	}
}
