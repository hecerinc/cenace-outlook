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
		this.validateSubmit = this.validateSubmit.bind(this);
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
				filterData['region'] = newVal;
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
	validateSubmit(name) {
		const fields = this.state[name];
		for(var key in fields) {
			if(fields[key] === null)
				return false;
		}
		return true;
	}
	render() {
		const hideClass = classNames('DatosFrame', {hidden: !this.props.visible});
		return(
			<div className={hideClass}>
				<div className="row">
					<div className="col titles">
						<h2>Download data</h2>
					</div>
				</div>
				<div className="row mb5">
					<div className="col">
						<p className="white">The data for this visualization is being scraped from the official CENACE data available at <a href="http://www.cenace.gob.mx/GraficaDemanda.aspx" className="green">http://www.cenace.gob.mx/GraficaDemanda.aspx</a>. <strong>Note:</strong> Times registered in CST.</p>
						<p>You can access the scraper being used at: <a className="green"  rel="noopener noreferrer" href="https://github.com/hecerinc/CENACE-scraper" target="_blank">github.com/hecerinc/CENACE-scraper</a></p>
					</div>
				</div>
				<div className="row">
					<div className="col filters maincol">
						<h3>Forecast Demand (DAM)</h3>
						<NodosPFilter depth={3} updateNode={(filterName, value) => {this.updateFilter(filterName, value, 'demanda')}} />
						<DownloadRangeData 
							validateName="demanda" 
							start={this.state.demanda.startDate} 
							end={this.state.demanda.endDate} 
							onSelectDate={(newDate, whichDate) => {this.updateDateSelection("demanda", whichDate, newDate)}} 
							downloadURL={this.state.demandaURL}
							validate={this.validateSubmit}
						/>

					</div>
					<div className="col filters maincol">
						<h3>Local Marginal Prices</h3>
						<NodosPFilter updateNode={(filterName, value) => {this.updateFilter(filterName, value, 'precios')}} />
						<DownloadRangeData 
							validateName="precios" 
							start={this.state.precios.startDate} 
							end={this.state.precios.endDate} 
							onSelectDate={(newDate, whichDate) => {this.updateDateSelection("precios", whichDate, newDate)}} 
							downloadURL={this.state.preciosURL}
							validate={this.validateSubmit}
						/>

					</div>
				</div>
			</div>
		);
	}
}
