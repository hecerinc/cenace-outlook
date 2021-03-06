import React from 'react';
import {
  DatePicker,
  DayOfWeek,
  IDatePickerStrings
} from 'office-ui-fabric-react/lib/DatePicker';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import '../style/DownloadRangeData.css';

initializeIcons();
// const today: Date = new Date();
const minDate: Date = new Date('2016-01-01');
const maxDate: Date = new Date('2018-05-19');

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
	// constructor() {
	// 	super();
	// 	this.state = {
	// 		precios: {
	// 			startDate: null,
	// 			endDate: null,
	// 		},
	// 		demanda: {
	// 			startDate: null,
	// 			endDate: null,
	// 		}
	// 	}
	// }
	validateParams = (e) => {
		if(e.target.href == "#") {
			e.preventDefault();
			return false;
		}
		if(!this.props.validate(e.target.name)) {
			e.preventDefault();
			alert('Please complete all fields');
			return false;
		}
		return true;
	}
	render() {
		return(
			<div className="DownloadRangeData">
				<div className="row">
					<div className="startdate col">
						<h4>Start date</h4>
						<DatePicker
							isRequired={ true }
							onSelectDate = {newDate => {this.props.onSelectDate(newDate, "startDate")}}
							firstDayOfWeek={ DayOfWeek.Sunday }
							// strings={ DayPickerStrings }
							placeholder='Select a date...'
							minDate={ minDate }
							maxDate={ maxDate }
							allowTextInput={ false }
							value={this.props.start}
						/>
					</div>
					<div className="enddate col" style={{paddingLeft: '20px'}}>
						<h4>End date</h4>
						<DatePicker
							isRequired={ true }
							onSelectDate = {newDate => {this.props.onSelectDate(newDate, "endDate")}}
							firstDayOfWeek={ DayOfWeek.Sunday }
							// strings={ DayPickerStrings }
							placeholder='Select a date...'
							minDate={ minDate }
							maxDate={ maxDate }
							allowTextInput={ false }
							value={this.props.end}
						/>
					</div>
				</div>
				<a target="_blank" rel="noopener noreferrer" name={this.props.validateName} onClick={this.validateParams} href={this.props.downloadURL || '#'} className="download btn">Download</a>
			</div>
		);
	}
}
