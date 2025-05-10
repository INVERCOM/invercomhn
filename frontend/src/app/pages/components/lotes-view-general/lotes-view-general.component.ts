import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { DbapiService } from 'src/app/routers/proyectos/lotes/services/dbapi.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

@Component({
    selector: 'app-lotes-view-general',
    templateUrl: './lotes-view-general.component.html',
    styleUrls: ['./lotes-view-general.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class LotesViewGeneralComponent {
	@ViewChild(GoogleMap, { static: false }) googleMap!: GoogleMap;
	@ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

	infoContent: string = ''; 
	infoWindowPosition: google.maps.LatLng | undefined;
	polygons: google.maps.Polygon[] = [];
	center: google.maps.LatLngLiteral = { lat: 14.5934, lng: -87.8336 };
	public options: google.maps.MapOptions = {}

	constructor(
        private dbapi: DbapiService,
        public authS: AuthService,
    ) {
		this.options = {
			zoomControl: true,
			scrollwheel: true,
			disableDoubleClickZoom: false,
			mapTypeId: 'terrain',
			maxZoom: 20,
			minZoom: 4,
			tilt : 45,
			mapTypeControl: true
		}
		this.getData();
	}

	getData(){
		this.dbapi.getAll(null).pipe(map((res: any) => {
			res.forEach((val: any) => {
				val['proy_vnombre'] = val['_tproyectos'] ? val['_tproyectos']['proy_vnombre'] : '';
				val['unimed_vdescripcion'] = val['_tunidades_medidas'] ? val['_tunidades_medidas']['unimed_vdescripcion'] : '';
				val['lote_vsts'] = val['lote_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
			});
			return res;
		}),
		take(1)).subscribe({ next: (data: any): void => {
			data.forEach((element: any) => {
				if (element['lote_vgeopath']) {
					// Asignar color según el valor de lote_nsts
					let fillColor;
					let statusText;

					switch (element['lote_nsts']) {
						case 1:
							fillColor = '#00FF00'; // Verde
							statusText = 'Disponible'; // Estatus: Disponible
							break;
						case 2:
							fillColor = '#FF0000'; // Rojo
							statusText = 'Apartado'; // Estatus: Apartado
							break;
						case 3:
							fillColor = '#FFA500'; // Naranja
							statusText = 'En pagos'; // Estatus: En pagos
							break;
						case 4:
							fillColor = '#FFFF00'; // Amarillo
							statusText = 'Adquirido'; // Estatus: Adquirido
							break;
						default:
							fillColor = '#808080'; // Gris (para valores no especificados)
							statusText = 'Desconocido'; // Estatus desconocido
							break;
					}

					// Crear el contenido dinámico para el infoWindow, incluyendo el status
					const infoContent = `
						<p style="color: black;">
							<b>${element['lote_vnombre']}</b> | ${element['proy_vnombre']}<br>
							<strong>Área:</strong> ${element['lote_fmedida']} m²<br>
							<strong>Precio:</strong> L.${element['lote_fprecio']}<br>
							<strong>Largo:</strong> ${element['lote_flargo']} m<br>
							<strong>Ancho:</strong> ${element['lote_fancho']} m<br>
							<strong>Status:</strong> ${statusText}
						</p>
					`;

					// Pasar el color, el contenido del infoWindow, y otros datos al dibujar la geocerca
					this.drawGeofence(
						JSON.parse(element['lote_vgeopath']),
						infoContent,
						fillColor
					);
				}
			})}, error: (err) => {
				console.log('erroor', err);
			}
		})
	}
	
	drawGeofence(geoPath: { lat: number; lng: number }[], tooltipText: string, fillColor: string) {
		const polygon = new google.maps.Polygon({
			paths: geoPath,
			strokeColor: 'black',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: fillColor,
			fillOpacity: 0.35,
		});
		
		polygon.setMap(this.googleMap.googleMap!);
		
		polygon.addListener('click', (event: google.maps.MapMouseEvent) => {
			if (event.latLng) { 
				this.infoContent = tooltipText;
				this.infoWindowPosition = event.latLng;
				this.infoWindow.open(); 
			}
		});
	
		polygon.addListener('mouseout', () => {
			this.infoWindow.close();
			this.infoWindowPosition = undefined;
		});
		this.polygons.push(polygon); 
	}
}