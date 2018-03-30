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
		this.state = {active: 3 };
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
				<h1 className="fw300" style={{marginBottom: 0}}>Sistema El&eacute;ctrico Nacional</h1>
				<h3 style={{fontSize: '12px', marginTop: 0, color: '#537095'}}><span style={{fontSize: '10px'}}>una iniciativa de</span> Berkeley Energy and Climate Institute</h3>

				<p className="firstp">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet molestiae consequuntur ducimus dicta explicabo reiciendis magni dolores tempore dolor enim nulla accusantium, ea velit, a aperiam. Facilis minus minima aperiam officiis ratione at similique perspiciatis fugit quas omnis, ipsum sit eligendi, nostrum autem nisi reiciendis repellendus, aliquam molestiae reprehenderit quasi quo impedit id maxime odit. Libero, reprehenderit. Iusto sit enim, fugit amet expedita, a optio illo molestiae rerum. Quos sed doloremque omnis dolorum similique nemo distinctio, perferendis veniam eos aperiam quo quibusdam culpa expedita laudantium excepturi harum iure odio atque consequuntur delectus. Explicabo vero, nobis hic minus similique voluptates quo!</p>
				<div className="demandaprecio">
					<ul>
						<li><a name="demanda" onClick={this.toggleView} className={this.state.active === 1 ? 'active' : ''} href="#">Demanda</a></li>
						<li><a name="precios" onClick={this.toggleView} className={this.state.active === 2 ? 'active' : ''} href="#">Precios</a></li>
						<li><a name="datos" onClick={this.toggleView} className={this.state.active == 3 ? 'active' : ''} href="#">Datos</a></li>
					</ul>
					<hr/>
				</div>


				<Demanda visible={this.state.active === 1} />
				<Precios visible={this.state.active === 2} />
				<DatosFrame visible={this.state.active === 3} />

				<p className="footer" style={{textAlign: 'center', marginTop: '60px'}}>2018 &copy; Berkeley Energy and Climate Institute</p>
			</div>
		);
	}
}

export default App;
