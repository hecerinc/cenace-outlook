import React from 'react';

import {
  DatePicker,
  DayOfWeek,
  IDatePickerStrings
} from 'office-ui-fabric-react/lib/DatePicker';

import '../style/DownloadRangeData.css';

// const today: Date = new Date();
const minDate: Date = new Date('2018-03-20');
const maxDate: Date = new Date('2018-03-30');

const DayPickerStrings: IDatePickerStrings = {
	months: [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Septiembre',
		'Octubre',
		'Noviembre',
		'Diciembre'
	],

	shortMonths: [
		'Ene.',
		'Feb.',
		'Mar.',
		'Abr.',
		'May.',
		'Jun.',
		'Jul.',
		'Ago.',
		'Sep.',
		'Oct.',
		'Nov.',
		'Dic.'
	],

	days: [
		'Domingo',
		'Lunes',
		'Martes',
		'Miércoles',
		'Jueves',
		'Viernes',
		'Sábado'
	],

	shortDays: [
		'D',
		'L',
		'M',
		'M',
		'J',
		'V',
		'S'
	],

	goToToday: 'Ir al día de hoy',
	prevMonthAriaLabel: 'Ir al mes anterior',
	nextMonthAriaLabel: 'Ir al siguiente mes',
	prevYearAriaLabel: 'Ir al año anterior',
	nextYearAriaLabel: 'Ir al siguiente año',

	isRequiredErrorMessage: 'El campo es requisito.',

	invalidInputErrorMessage: 'Formato de día inválido.',

	isOutOfBoundsErrorMessage: `El día debe estar entre ${minDate.toLocaleDateString()}-${maxDate.toLocaleDateString()}`
};

export default class DownloadRangeData extends React.Component {
	render() {
		return(
			<div className="DownloadRangeData">
				<div className="row">
					<div className="startdate col">
						<h4>Fecha inicial</h4>
						<DatePicker
							isRequired={ false }
							firstDayOfWeek={ DayOfWeek.Sunday }
							strings={ DayPickerStrings }
							placeholder='Select a date...'
							minDate={ minDate }
							maxDate={ maxDate }
							allowTextInput={ true }
						/>
					</div>
					<div className="enddate col" style={{paddingLeft: '20px'}}>
						<h4>Fecha final</h4>
						<DatePicker
							isRequired={ false }
							firstDayOfWeek={ DayOfWeek.Sunday }
							strings={ DayPickerStrings }
							placeholder='Select a date...'
							minDate={ minDate }
							maxDate={ maxDate }
							allowTextInput={ true }
						/>
					</div>
				</div>
				<a href="#" className="download btn">Descargar</a>
			</div>
		);
	}
}
