// NodosPFilter.jsx

import React from 'react';
import classNames from 'classnames';

const nodosmap = require('./nodosmap.json');

const regiones = ['Sistema Interconectado Nacional', 'Baja California', 'Baja California Sur'];


export default class Filter extends React.Component {

	constructor() {
		super();
		this.state = {
			selects: {
				'region': {
					disabled: false,
					selected: null
				},
				'bas': { 
					disabled: true,
					selected: null
				},
				'zdc': { 
					disabled: true,
					selected: null
				},
				'nodosp': { 
					disabled: true,
					selected: null
				}
			}
		};
		this.populateSelects = this.populateSelects.bind(this);
		this.handleSelect = this.handleSelect.bind(this);

	}

	handleSelect(e) {
		const val = e.target.value;
		const selectName = e.target.name.split('_')[1];
		const selects = {...this.state.selects};
		selects[selectName].selected = val;
		if(selectName === "region"){
			selects['bas'].selected = null;
			selects['zdc'].selected = null;
		}
		if(selectName === "bas"){
			selects['zdc'].selected = null;
			selects['nodosp'].selected = null;
		}
		if(selectName === "nodosp" && val != ""){
			this.props.updateNode(val);
		}
		this.setState({selects});
		this.populateSelects();
	}


	componentDidMount() {
	// 	const bas = this.props.data.balancingAreas;
	// 	this.baNames = Object.keys(bas).map(bakey => {
	// 		return {id: bakey, name: bas[bakey].properties.name};
	// 	});

		// Enable sistemas
		const selects = {...this.state.selects};
		selects['region'].disabled = false;
		selects['region'].selected = 'SIN';
		this.setState({selects});

		this.populateSelects();

	}
	// componentWillReceiveProps(nextProps) {
	// 	this.populateSelects(nextProps);
	// }
	populateSelects(nextProps) {
		// Populate the balance areas select
		// const {balanceArea, loadZone, project, lz_pjs} = nextProps || this.props;
		const selects = {...this.state.selects};

		const region = selects['region'].selected;
		const balanceArea = selects['bas'].selected;
		const zdc = selects['zdc'].selected;
		const nodop = selects['nodosp'].selected;

		selects['bas'].disabled = region === null;
		selects['zdc'].disabled = balanceArea === null;
		selects['nodosp'].disabled = zdc === null;

		// if(region !== null){
		// 	// Get the load zones for this balance area and populate the options with it
		// 	selects['bas'].disabled = false;
		// 	// selects['lzs'].options = getLZs(balanceArea, nextProps.data);
		// }
		// if(zdc !== null){
		// 	// Get the projects for this load zone and populate the options with it
		// 	selects['nodosp'].disabled = false;
		// 	// selects['pjs'].options = getPJs(loadZone, lz_pjs);
		// }
		this.setState({selects});
	}


	render() {
		const sels = this.state.selects
		const basdata = sels['bas'].disabled ? [] : Object.keys(nodosmap[sels['region'].selected]);
		const zdcs = sels['zdc'].disabled ? [] : Object.keys(nodosmap[sels['region'].selected][sels['bas'].selected]);
		const nodosp = sels['nodosp'].disabled ? [] : nodosmap[sels['region'].selected][sels['bas'].selected][sels['zdc'].selected];
		// TODO: parent element has same class. Remove one
		const classOne = classNames('col', 'filters', 'NodosPFilter', {hidden: this.props.visible === undefined ? false : !this.props.visible});
		const nodesClass = classNames('row', {hidden: this.props.hideNodes !== undefined});
		return (
			<div className={classOne}>
				<div className="row">
					<div className="col-3 label">Sistema: </div>
					<div className="col-9">
						<select
							value={sels['region'].selected || ""}
							name="precios_region" 
							id="precios_region" 
							onChange={this.handleSelect}
						 >
							<option value="">---</option>
							{
								Object.keys(nodosmap).map((region, index) => 
									<option key={'region'+index} value={region}>{regiones[index]}</option>
								)
							}
						</select>
					</div>
				</div>
				<div className="row">
					<div className="col-3 label">Regi&oacute;n de Control: </div>
					<div className="col-9">
						<select 
							value={sels['bas'].selected || ""}
							name="precios_bas" 
							id="precios_bas" 
							disabled={sels['bas'].disabled}
							onChange={this.handleSelect}
						>
							<option value="">---</option>
							{basdata.map((ba, index) => 
								<option key={`bas_${index}`} value={ba}>{ba}</option>
							)}
						</select>
					</div>
				</div>
				<div className="row">
					<div className="col-3 label">Zona de Carga: </div>
					<div className="col-9">
						<select 
							value={sels['zdc'].selected || ""}
							name="precios_zdc" id="precios_zdc" 
							disabled={sels['zdc'].disabled}
							onChange={this.handleSelect}
						>
							<option value="">---</option>
							{zdcs.map((zdc, index) => 
								<option key={`zdc_${index}`} value={zdc}>{zdc}</option>
							)}
						</select>
					</div>
				</div>
				<div className={nodesClass}>
					<div className="col-3 label">NodoP: </div>
					<div className="col-9">
						<select 
							name="precios_nodosp"
							id="precios_nodosp"
							value={sels['nodosp'].selected || ""}
							disabled={sels['nodosp'].disabled}
							onChange={this.handleSelect}
						>
							<option value="">---</option>

							{nodosp.map((nodop, index) => 
								<option key={`nodop_${index}`} value={nodop}>{nodop}</option>
							)}
						</select>
					</div>
				</div>
				
			</div>
		);
	}
}


	