import React from 'react';

export default class Demanda extends React.Component {
	render() {
		const hideClass = this.props.visible ? 'Demanda': 'Demanda hidden';
		return(
			<div className={hideClass}>
				<div className="row">
					<div className="col titles">
						<h2>Demanda pronosticada</h2>
						<h3>{new Date().toLocaleString().split(',')[0]}</h3>
					</div>
					<div className="col align-right">
						<a href="#" className="btn download"> 
							Descarga los datos 
						</a>
					</div>
				</div>
				<hr/>
				<div className="row">
					<div className="col filters">
						<div className="row">
							<div className="col-3 label">
								Sistema:
							</div>
							<div className="col-9">
								<select name="sistema" id="sistema">
									<option value="">---</option>
									<option value="1">Sistema Interconectado Nacional (SIN)</option>
									<option value="2">Baja California (BCA)</option>
									<option value="3">Baja California Sur (BCS)</option>
									<option value="4">Mulege</option>
								</select>
							</div>
						</div>
						<div className="row">
							<div className="col-3 label">
								Zona de Carga (NodosP Distribuidos)
							</div>
							<div className="col-9">
								<select name="sistema" id="sistema">
									<option value="">---</option>
								</select>
							</div>
						</div>
						
					</div>
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