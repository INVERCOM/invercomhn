import { Injectable } from '@angular/core';

@Injectable({
  	providedIn: 'root'
})
export class TimezoneService {
	constructor( ) { }
	parseDate( fecha: string | number | Date ) {
		return new Date(new Date(fecha).setUTCHours((new Date(fecha).getUTCHours() + new Date().getTimezoneOffset()/60) + Number(localStorage.getItem('timezone')!=null?localStorage.getItem('timezone'):'0')));
	}
	
	parseDateTwice( fecha: string | number | Date ) {
		return new Date(new Date(fecha).setUTCHours(new Date(fecha).getUTCHours() + Number(localStorage.getItem('timezone')!=null?Number(localStorage.getItem('timezone')):'0'))).toISOString().slice(0,-1);
	}

	parseDateToQuery( fechaHora: string | number | Date ) {
		return new Date(new Date(fechaHora).setUTCHours((new Date(fechaHora).getUTCHours() - new Date().getTimezoneOffset()/60) - Number(localStorage.getItem('timezone')!=null?localStorage.getItem('timezone'):'0')));
	}

	toUtc( fecha: string | number | Date ) {
		return new Date(fecha).toUTCString();
	}
}
