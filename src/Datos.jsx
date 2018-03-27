import React from 'react';
import classNames from 'classnames';

export default class DatosFrame extends React.Component{
	render() {
		const hideClass = classNames('DatosFrame', {hidden: !this.props.visible});
		return(
			<div className={hideClass}>
				<h1>Datos Frame</h1>
			</div>
		);
	}
}
