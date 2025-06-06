import { Injectable } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TimezoneService } from './services/timezone.service';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {
	constructor(
		private datePipe : DatePipe,
		private timezone : TimezoneService
	) {}
	
	public tipoConsulta = [
		{value: '1', label: 'HOY'},
		{value: '2', label: 'AYER'},
		{value: '3', label: 'ESTA SEMANA'},
		{value: '4', label: 'ESTE MES'},
		{value: '5', label: 'POR FECHAS'},
		{value: '6', label: 'TODOS'},
	]

	getDayToQuery(tipoConsulta: string, fechaInicio: string, fechaFin: string) {
		let date = new Date(), dateInicio, dateFinal
		switch(tipoConsulta?.toString()) { 
		  case '1' : { 
			dateInicio = this.timezone.parseDateToQuery(this.datePipe.transform( date, 'yyyy-MM-dd'+ ' 00:00:00') ?? '' );
			dateFinal = this.timezone.parseDateToQuery(this.datePipe.transform( date, 'yyyy-MM-dd'+ ' 23:59:59') ?? '' );
			break; 
		  } 
		  case '2' : { 
			dateInicio = this.timezone.parseDateToQuery(this.datePipe.transform( new Date().setDate( date.getDate() - 1 ), 'yyyy-MM-dd') + ' 00:00:00');
			dateFinal = this.timezone.parseDateToQuery(this.datePipe.transform( new Date().setDate( date.getDate() - 1 ), 'yyyy-MM-dd') + ' 23:59:59');
			break; 
		  } 
		  case '3' : { 
			dateInicio = this.timezone.parseDateToQuery(this.datePipe.transform(new Date(date.setDate(date.getDate() - date.getDay())), 'yyyy-MM-dd') + ' 00:00:00');
			dateFinal = this.timezone.parseDateToQuery(this.datePipe.transform( new Date(date.setDate(date.getDate() - date.getDay() + 7)), 'yyyy-MM-dd') + ' 23:59:59');
			break; 
		  } 
		  case '4' : { 
			dateInicio = this.timezone.parseDateToQuery((this.datePipe.transform( new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd')  + ' 00:00:00') ?? '');
			dateFinal = this.timezone.parseDateToQuery((this.datePipe.transform( new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd' + ' 23:59:59')) ?? '');
			break; 
		  } 
		  case '5' : {
			if (fechaInicio && fechaInicio != '' && fechaFin && fechaFin != '' ) {
				let fechaInicioInput = new Date(fechaInicio);
				let fechaFinInput = new Date(fechaFin);
				fechaInicioInput > fechaFinInput && (fechaInicioInput = fechaFinInput)
				dateInicio = this.timezone.parseDateToQuery(fechaInicioInput);
				dateFinal = this.timezone.parseDateToQuery(fechaFinInput);
			} else{
			  dateInicio = '';
			  dateFinal = '';
			}
			break; 
		  } 
		  case '6' : { 
			dateInicio = 'TODOS';
			dateFinal = 'TODOS';
			break; 
		  } 
		  default: { 
			dateInicio = (this.datePipe.transform( date, 'yyyy-MM-dd'+ ' 00:00:00') );
			dateFinal = (this.datePipe.transform( date, 'yyyy-MM-dd'+ ' 23:59:59') );
			break; 
		  } 
	   }
	   return {fechaInicio: dateInicio, fechaFinal: dateFinal}
	  }

	  numeroALetras = (function() {
		function Unidades(num: any){
			switch(num)
			{
				case 1: return 'UN';
				case 2: return 'DOS';
				case 3: return 'TRES';
				case 4: return 'CUATRO';
				case 5: return 'CINCO';
				case 6: return 'SEIS';
				case 7: return 'SIETE';
				case 8: return 'OCHO';
				case 9: return 'NUEVE';
			}
	
			return '';
		}
		function Decenas(num: any){
			let decena = Math.floor(num/10);
			let unidad = num - (decena * 10);
			switch(decena)
			{
			  case 1:
				  switch(unidad)
				  {
					  case 0: return 'DIEZ';
					  case 1: return 'ONCE';
					  case 2: return 'DOCE';
					  case 3: return 'TRECE';
					  case 4: return 'CATORCE';
					  case 5: return 'QUINCE';
					  default: return 'DIECI' + Unidades(unidad);
				  }
			  case 2:
				  switch(unidad)
				  {
					  case 0: return 'VEINTE';
					  default: return 'VEINTI' + Unidades(unidad);
				  }
			  case 3: return DecenasY('TREINTA', unidad);
			  case 4: return DecenasY('CUARENTA', unidad);
			  case 5: return DecenasY('CINCUENTA', unidad);
			  case 6: return DecenasY('SESENTA', unidad);
			  case 7: return DecenasY('SETENTA', unidad);
			  case 8: return DecenasY('OCHENTA', unidad);
			  case 9: return DecenasY('NOVENTA', unidad);
				case 0: return Unidades(unidad);
			}
		}//Unidades()
	
		function DecenasY(strSin: any, numUnidades: any) {
			if (numUnidades > 0)
				return strSin + ' Y ' + Unidades(numUnidades)
	
			return strSin;
		}//DecenasY()
	
		function Centenas(num: any) {
			let centenas = Math.floor(num / 100);
			let decenas = num - (centenas * 100);
	
			switch(centenas)
			{
				case 1:
					if (decenas > 0)
						return 'CIENTO ' + Decenas(decenas);
					return 'CIEN';
				case 2: return 'DOSCIENTOS ' + Decenas(decenas);
				case 3: return 'TRESCIENTOS ' + Decenas(decenas);
				case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
				case 5: return 'QUINIENTOS ' + Decenas(decenas);
				case 6: return 'SEISCIENTOS ' + Decenas(decenas);
				case 7: return 'SETECIENTOS ' + Decenas(decenas);
				case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
				case 9: return 'NOVECIENTOS ' + Decenas(decenas);
			}
	
			return Decenas(decenas);
		}//Centenas()
	
		function Seccion(num: any, divisor: any, strSingular: any, strPlural: any) {
			let cientos = Math.floor(num / divisor)
			let resto = num - (cientos * divisor)
	
			let letras = '';
	
			if (cientos > 0)
				if (cientos > 1)
					letras = Centenas(cientos) + ' ' + strPlural;
				else
					letras = strSingular;
	
			if (resto > 0)
				letras += '';
	
			return letras;
		}//Seccion()
	
		function Miles(num: any) {
			let divisor = 1000;
			let cientos = Math.floor(num / divisor)
			let resto = num - (cientos * divisor)
	
			let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
			let strCentenas = Centenas(resto);
	
			if(strMiles == '')
				return strCentenas;
	
			return strMiles + ' ' + strCentenas;
		}//Miles()
	
		function Millones(num:any) {
		let divisor = 1000000;
		let cientos = Math.floor(num / divisor)
		let resto = num - (cientos * divisor)
	
		let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
		let strMiles = Miles(resto);
	
		if(strMillones == '')
			return strMiles;
	
		return strMillones + ' ' + strMiles;
	  }
		
	  return function NumeroALetras(num: any, currency: any = null) {
		if (!currency) {
			currency = {
				plural: 'LEMPIRAS',
				singular: 'LEMPIRA',
				centPlural: 'CENTAVOS',
				centSingular: 'CENTAVO',
			  }
		}
		currency = currency || {};
		let data = {
			numero: num,
			enteros: Math.floor(num),
			centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
			letrasCentavos: '',
			letrasMonedaPlural: currency.plural,
			letrasMonedaSingular: currency.singular,
			letrasMonedaCentavoPlural: currency.centPlural,
			letrasMonedaCentavoSingular: currency.centSingular
		};
	
		if (data.centavos > 0) {
			data.letrasCentavos = 'CON ' + (function () {
					if (data.centavos == 1)
						return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
					else
						return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
				})();
		};
	
		if(data.enteros == 0)
			return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
		if (data.enteros == 1)
			return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
		else
			return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
		};
	  })();

	
}
