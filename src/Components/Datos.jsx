import React from 'react';
import classNames from 'classnames';

import NodosPFilter from './Filter';
import DownloadRangeData from './DownloadRangeData';

import '../style/Datos.css';

export default class DatosFrame extends React.Component{
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
						<p>Link al scraper: <a className="green" href="https://github.com/hecerinc/CENACE-scraper" target="_blank">github.com/hecerinc/CENACE-scraper</a></p>
					</div>
				</div>
				<div className="row">
					<div className="col filters maincol">
						<h3>Demanda pronosticada (MDA)</h3>
						<NodosPFilter hideNodes={true} updateNode={_ => true} />
						<DownloadRangeData />

					</div>
					<div className="col filters maincol">
						<h3>Precios Marginales Locales</h3>
						<NodosPFilter updateNode={_ => true} />
						<DownloadRangeData />

					</div>
				</div>
			</div>
		);
	}
}
