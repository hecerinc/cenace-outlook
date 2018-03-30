// Filter.jsx

import React from 'react';
import classNames from 'classnames';

const nodosmap = require('../data/nodosmap.json');

const regiones = {
	'SIN': 'Sistema Interconectado Nacional', 
	'BCA': 'Baja California', 
	'BCS': 'Baja California Sur'
};


export default class Filter extends React.Component {

	constructor() {
		super();
		this.state = {
			selects: {
				'region': {
					disabled: false,
					name: 'Sistema',
					selected: 'SIN'
				},
				'bas': { 
					disabled: true,
					name: 'Región de Control',
					selected: null
				},
				'zdc': { 
					disabled: true,
					name: 'Zona de Carga',
					selected: null
				},
				'nodosp': { 
					disabled: true,
					name: 'NodoP',
					selected: null
				}
			}
		};
		this.populateSelects = this.populateSelects.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.getData = this.getData.bind(this);

	}

	componentDidMount() {
		this.populateSelects();
	}

	handleSelect(e) {

		const val = e.target.value;
		const selectName = e.target.name.split('_')[1];
		const selects = {...this.state.selects};
		selects[selectName].selected = val;

		if(selectName === "region") {
			selects['bas'].selected = null;
			selects['zdc'].selected = null;
		}
		if(selectName === "bas") {
			selects['zdc'].selected = null;
			selects['nodosp'].selected = null;
		}
		if(selectName === "nodosp" && val !== ""){
			this.props.updateNode(val);
		}
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

		
		this.setState({selects});
	}

	getData() {

		// Get the data 
		const sels = this.state.selects;

		const selectedRegionBAs = nodosmap[sels['region'].selected];
		const basdata = sels['bas'].disabled ? [] : Object.keys(selectedRegionBAs);

		const zdcs = sels['zdc'].disabled ? [] : Object.keys(selectedRegionBAs[sels['bas'].selected]);

		const nodosp = sels['nodosp'].disabled ? [] : selectedRegionBAs[sels['bas'].selected][sels['zdc'].selected];

		return {
			balanceAreas: basdata,
			zdcs,
			nodosp
		};
	}
	
	render() {
		const depth = this.props.depth || 4;
		const sels = this.state.selects;
		const {balanceAreas, zdcs, nodosp} = {...this.getData()};
		const dataArr = [Object.keys(regiones), balanceAreas, zdcs, nodosp];

		// TODO: parent element has same class. Remove one
		const classOne = classNames('NodosPFilter', 'col', 'filters', {
			hidden: this.props.visible === undefined ? false : !this.props.visible
		});
		const nodesClass = classNames('row', {hidden: this.props.hideNodes !== undefined});

		return (
			<div className={classOne}>
				{Object.keys(sels).map((select, index) => {
					return (
						<FilterPres
							selectVar={sels[select]} 
							name={select} 
							data={dataArr[index]} 
							isActive={depth >= (index+1)} 
							cb={this.handleSelect} 
						/>
					);
				})}
			</div>
		);
	}
}

// Presentational
const FilterPres = ({selectVar, name, data, isActive, cb}) => {
	if(!isActive) return null;
	return (
		<div className="row">
			<div className="col-3 label">{selectVar.name}:</div>
			<div className="col-9">
				<select
					name={`nivel_${name}`}
					id={`nivel_${name}`}
					value={selectVar.selected || ""}
					disabled={selectVar.disabled}
					onChange={cb}
				>
					<option value="">---</option>
					{data.map((dataItem, index) => {
						if(name !== "region")
							return <option key={`level_${name}_${index}`} value={dataItem}>{dataItem}</option>;
						else
							return <option key={`region_${index}`} value={dataItem}>{regiones[dataItem]}</option>;
					})}
				</select>
			</div>
		</div>
	);
}


	