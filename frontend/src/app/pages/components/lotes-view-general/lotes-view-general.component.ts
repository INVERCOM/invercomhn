import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { DbapiService } from 'src/app/routers/proyectos/lotes/services/dbapi.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-lotes-view-general',
    templateUrl: './lotes-view-general.component.html',
    styleUrls: ['./lotes-view-general.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class LotesViewGeneralComponent {
	@ViewChild(GoogleMap, { static: false }) googleMap!: GoogleMap;
	@ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

	infoContent: SafeHtml = '';
	selectedLote: any = null;
	public residenciales : any;
	public proyecto : any;
	dataOriginal: any[] = [];
    data: any[] = [];
	infoWindowPosition: google.maps.LatLng | undefined;
	polygons: google.maps.Polygon[] = [];
	center: google.maps.LatLngLiteral = { lat: 14.5934, lng: -87.8336 };
	public options: google.maps.MapOptions = {}

	constructor(
		private sanitizer: DomSanitizer,
        private dbapi: DbapiService,
        public authS: AuthService,
		public layoutService: LayoutService, 
    ) {
		this.options = {
			zoomControl: true,
			scrollwheel: true,
			disableDoubleClickZoom: false,
			mapTypeId: 'hybrid',
			maxZoom: 20,
			minZoom: 4,
			tilt : 45,
			mapTypeControl: true
		}
		this.getProyectos();
		this.getData();
	}

	get containerClass() {
        return {
            'layout-theme-light': this.layoutService.config.colorScheme === 'light',
            'layout-theme-dark': this.layoutService.config.colorScheme === 'dark',
            'layout-overlay': this.layoutService.config.menuMode === 'overlay',
            'layout-static': this.layoutService.config.menuMode === 'static',
            'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config.menuMode === 'static',
            'layout-overlay-active': this.layoutService.state.overlayMenuActive,
            'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
            'p-input-filled': this.layoutService.config.inputStyle === 'filled',
            'p-ripple-disabled': !this.layoutService.config.ripple
        }
    }

	setProyecto(e: any) {
		for (let index = 0; index < this.polygons.length; index++) {
			const element = this.polygons[index];
			element.setMap(null);
		}
		this.polygons = [];
		if (e && e.id) {
			this.data =  this.dataOriginal.filter(item => item['proy_nid'] === e.id);
		}else{
			this.data = [...this.dataOriginal]
		}
		this.drawGeocercas(this.data);
    }

	getProyectos() {
        this.residenciales = [];
        this.dbapi.getProyectosAll().pipe(take(1)).subscribe({ next: (data: any) => {
            if ( !data || data == null || data === '' ) {
				console.log('Error consultando residenciales');
				return;
			}
			this.residenciales.push({id:0, text:'', obj:null})
			for (const key in data) {
				const item={id:data[key]['proy_nid'], text:data[key]['proy_vnombre'], obj:data[key]}
				this.residenciales = [ ...this.residenciales, item ];
			}}, error: (err: any) => {
                console.log(err);
            }
        });
    }

	getData(){
		this.polygons = [];
		this.dbapi.getAllFree(null).pipe(
            map((res: any[]) => {
                res.forEach((val: any) => {
                    val['proy_vnombre'] = val['_tproyectos'] ? val['_tproyectos']['proy_vnombre'] : '';
                    val['unimed_vdescripcion'] = val['_tunidades_medidas'] ? val['_tunidades_medidas']['unimed_vdescripcion'] : '';
                    val['lote_vsts'] = val['lote_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
                });
                this.dataOriginal = [...res];
                this.data = [...res];
                return res;
            }),
            take(1)
        ).subscribe({
            next: () => {
                this.drawGeocercas(this.dataOriginal);
            }
        });
	}

	drawGeocercas(data: any[]){
		data.forEach((element: any, index) => {
			if (element['lote_vgeopath']) {
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
				if (index < data.length - 1) {
					this.drawGeofence(
						JSON.parse(element['lote_vgeopath']),
						'',
						fillColor,
						false,
						element
					);
				}else{
					this.drawGeofence(
						JSON.parse(element['lote_vgeopath']),
						'',
						fillColor,
						true,
						element
					);
				}
			}
		});
	}
	
	drawGeofence(geoPath: { lat: number; lng: number }[], tooltipText: string, fillColor: string, esUltimo = false, row: any) {
		const polygon = new google.maps.Polygon({
			paths: geoPath,
			strokeColor: 'black',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: fillColor,
			fillOpacity: 0.35,
		});
		
		polygon.setMap(this.googleMap.googleMap!);
		
		if (esUltimo) {
			const bounds = new google.maps.LatLngBounds();
			geoPath.forEach(coord => {
				if (coord.lat !== 0 && coord.lng !== 0) {
					bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
				}
			});
			if (!bounds.isEmpty()) {
				const center = bounds.getCenter();
				this.googleMap.googleMap!.setCenter(center);
			} else {
			  	console.warn('No se pudo calcular bounds, todos los puntos son (0,0)?');
			}
		}

		polygon.addListener('click', (event: google.maps.MapMouseEvent) => {
			if (event.latLng) { 
				this.infoContent = this.sanitizer.bypassSecurityTrustHtml(tooltipText);
				this.infoWindowPosition = event.latLng;
				this.infoWindow.open(); 
				this.selectedLote = row;
			}
		});
	
		polygon.addListener('mouseout', () => {
			this.infoWindow.close();
			this.infoWindowPosition = undefined;
		});
		this.polygons.push(polygon); 
	}

	cerrarInfoWindow() {
		this.infoWindow.close();
		this.infoWindowPosition = undefined;
	  }
	  
	  verDetalles() {
		// Aquí puedes navegar o abrir modal, etc.
		console.log('Detalles del lote:;');
	  }
}