import React, { Component } from 'react';
import InlineSVG from 'svg-inline-react';

import './style/App.css';

import Precios from './Components/Precios';
import Demanda from './Components/Demanda';
import DatosFrame from './Components/Datos';

/* eslint import/no-webpack-loader-syntax: off */

const sectionNames = {
	'demanda': 1,
	'precios': 2,
	'datos': 3
};

class App extends Component {
	constructor() {
		super();
		this.state = {active: 2};
		this.toggleView = this.toggleView.bind(this);
	}

	toggleView(e) {
		e.preventDefault();
		const name = e.target.name;
		let active = sectionNames[name];
 		this.setState({active});
	}
	render() {
		return (
			<div className="App">
				<h1 className="fw300" style={{marginBottom: 0}}>Sistema El&eacute;ctrico Nacional / Mexico's Electricity System</h1>
				<h3 style={{fontSize: '12px', marginTop: 0, color: '#537095'}}>a UC Berkeley California Institute of Energy and Environment initiative</h3>

				<p className="firstp">This visual interface, developed by UC Berkeley in collaboration with Tec de Monterrey, uses open data sources from CENACE and is meant to serve as a support for researchers, and entities interested in the energy sector in M&eacute;xico. National system demand, and local marginal prices can be both observed, compared, and downloaded. </p>
				<p>For inquiries please reach out to <a style={{color: '#4CF1CD'}} href="mailto:sergioc@berkeley.edu">sergioc@berkeley.edu</a></p>
				<div className="demandaprecio">
					<ul className="nav-tabs">
						<li><a name="demanda" onClick={this.toggleView} className={this.state.active === 1 ? 'active' : ''} href="#">Day Ahead Market</a></li>
						<li><a name="precios" onClick={this.toggleView} className={this.state.active === 2 ? 'active' : ''} href="#">Local Marginal Prices</a></li>
						<li><a name="datos" onClick={this.toggleView} className={this.state.active === 3 ? 'active' : ''} href="#">Download Data</a></li>
					</ul>
					<hr/>
				</div>


				<Demanda visible={this.state.active === 1} />
				<Precios visible={this.state.active === 2} />
				<DatosFrame visible={this.state.active === 3} />

				<p className="footer" style={{textAlign: 'center', width: '50%', margin: '60px auto 0'}}>
					2018 &copy; California Institute of Energy and Environment 
					<br /> 
					<small><em>through its collaborative work with Tec de Monterrey under the 'Binational Laboratory on Smart Sustainable Energy Management and Technology Training'</em></small>
				</p>
				<section className="footer-logos">
					<div className="col">
						<img src="/berkeley.svg" alt="University of California"/>
					</div>
					<div className="col">
						<img src="/uciee.svg" alt="California Institute of Energy and Environment"/>
					</div>
					<div className="col">
						<img src="/tec.svg" alt="Tecn&oacute;logico de Monterrey"/>
					</div>
				</section>
			</div>
		);
	}
}

export default App;
