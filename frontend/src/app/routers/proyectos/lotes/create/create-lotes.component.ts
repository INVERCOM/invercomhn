import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Lote } from '../models/lotes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
  selector: 'app-create-lotes',
  templateUrl: './create-lotes.component.html',
  styleUrls: ['./create-lotes.component.scss']
})

export class CreateLotesComponent {
	@ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
	@ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

    infoContent: string = ''; 
	dataOriginal: any[] = [];
    data: any[] = [];
	public createForm: FormGroup;
    public primeraCons: boolean = false;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public residenciales: CheesyObject[] = [];
	public unimeds: CheesyObject[] = [];
    infoWindowPosition: google.maps.LatLng | undefined;
	polygons: google.maps.Polygon[] = [];
	center: google.maps.LatLngLiteral = { lat: 14.5934, lng: -87.8336 };
	public options: google.maps.MapOptions = {}
    geocercaCoordinates: google.maps.LatLngLiteral[] = [];
    isDrawing: boolean = true;
    polygon: google.maps.Polygon | undefined;
    polygonOptions: google.maps.PolygonOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        editable: true, 
        draggable: true,
    };
    private $destroy: Subject<void> = new Subject();

    @Input() Lote: Lote = {};
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            lote_nid:  [0],
            proy_nid:  ['', Validators.required],
			unimed_nid:  ['', Validators.required],
            lote_vnombre:  ['', Validators.required],
            lote_vcodigo:  ['', Validators.required],
			lote_vgeopath:  ['', Validators.required],
            lote_fmedida:  ['', Validators.required],
			lote_flargo:  ['', Validators.required],
			lote_fancho:  ['', Validators.required],
            lote_fprecio_unidad:  ['', Validators.required],
			lote_fprecio:  ['', Validators.required],
            lote_nsts:  ['']
        });
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
		authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            //this.consultas();
        });
    }

    consultas(){
        this.getProyectos();
        this.getUnimeds();
        this.getData();
    }
    
	ngOnChanges() {
        this.consultas();
        if (this.Lote && this.Lote?.lote_nid && this.Lote?.lote_nid > 0) {
			this.geocercaCoordinates = JSON.parse(this.Lote?.lote_vgeopath!);
            this.lote_nid?.setValue(this.Lote?.lote_nid)
            this.proy_nid?.setValue(this.Lote?.proy_nid)
			this.unimed_nid?.setValue(this.Lote?.unimed_nid)
            this.center = this.geocercaCoordinates[0];
            this.lote_vnombre?.setValue(this.Lote?.lote_vnombre)
            this.lote_vcodigo?.setValue(this.Lote?.lote_vcodigo)
            this.lote_fmedida?.setValue(this.Lote?.lote_fmedida)
			this.lote_fancho?.setValue(this.Lote?.lote_fancho)
			this.lote_flargo?.setValue(this.Lote?.lote_flargo)
			this.lote_fprecio?.setValue(this.Lote?.lote_fprecio)
            this.lote_fprecio_unidad?.setValue(this.Lote?.lote_fprecio_unidad)
			this.lote_vgeopath?.setValue(this.Lote?.lote_vgeopath)
            this.lote_nsts?.setValue(this.Lote?.lote_nsts)
			this.updatePolygon();
        }
    }

    getProyectos() {
		this.proy_nid?.setValue('');
        this.residenciales = [];
        this.dbapi.getProyectos().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['proy_nid'], text:data[key]['proy_vnombre'], obj:data[key]}
                    this.residenciales = [ ...this.residenciales, item ];
                }
                this.residenciales.length == 1 && this.proy_nid?.setValue(this.residenciales[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getData(){
        this.data = [];
        this.dataOriginal = [];
        this.dbapi.getAll(null).pipe(
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
                this.setProyecto(this.proy_nid?.value) 
            }
        });
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
    
    drawGeocercas(data: any[]){
        data.forEach((element: any) => {
            if (element['lote_vgeopath'] && element['lote_nid'] != this.lote_nid?.value) {
                let fillColor = '#00FF00';
                const infoContent = `
                    <p style="color: black;">
                        <b>${element['lote_vnombre']}</b> | ${element['proy_vnombre']}<br>
                        <strong>Área:</strong> ${element['lote_fmedida']} m²<br>
                        <strong>Largo:</strong> ${element['lote_flargo']} m<br>
                        <strong>Ancho:</strong> ${element['lote_fancho']} m<br>
                    </p>
                `;
                this.drawGeofence(
                    JSON.parse(element['lote_vgeopath']),
                    infoContent,
                    fillColor
                );
            }
        });
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
        
        polygon.setMap(this.map.googleMap!);
        polygon.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) { 
                this.infoContent = tooltipText;
                this.infoWindowPosition = event.latLng;
                this.infoWindow.open(); 
            }
        });
        this.polygons.push(polygon); 
    }

	getUnimeds() {
		this.unimed_nid?.setValue('');
        this.unimeds = [];
        this.dbapi.getUnimeds().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['unimed_nid'], text:data[key]['unimed_vdescripcion'], obj:data[key]}
                    this.unimeds = [ ...this.unimeds, item ];
                }
                this.unimeds.length == 1 && this.unimed_nid?.setValue(this.unimeds[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    calculaPrecio(){
        let total = 0;
        if (this.lote_fprecio_unidad?.value && this.lote_fmedida?.value) {
            total = this.lote_fprecio_unidad?.value * this.lote_fmedida?.value
            this.lote_fprecio?.setValue(total)
        }
    }

	onMapClick(event: google.maps.MapMouseEvent) {
        if (event.latLng && this.isDrawing) {
            const coords = event.latLng.toJSON();
            this.geocercaCoordinates = [...this.geocercaCoordinates, coords];
            this.updatePolygon();
        }
    }
    
    onPolygonComplete(polygon: google.maps.Polygon) {
        this.polygon = polygon;
        google.maps.event.addListener(polygon.getPath(), 'set_at', () => this.updatePolygonCoordinates());
        google.maps.event.addListener(polygon.getPath(), 'insert_at', () => this.updatePolygonCoordinates());
        google.maps.event.addListener(polygon.getPath(), 'remove_at', () => this.updatePolygonCoordinates());
    }
    
    updatePolygonCoordinates() {
        if (this.polygon) {
            this.geocercaCoordinates = this.polygon.getPath().getArray().map(latLng => latLng.toJSON());
        }
    }
    
    finishDrawing() {
        this.isDrawing = false;
        if (this.geocercaCoordinates.length > 2) {
            this.geocercaCoordinates = [...this.geocercaCoordinates, this.geocercaCoordinates[0]];
        }
        const geocercaJson = JSON.stringify(this.geocercaCoordinates);
        this.lote_vgeopath?.setValue(geocercaJson);
    }
    
    updatePolygon() {
        if (this.geocercaCoordinates.length > 1) {
            if (this.polygon) {
                this.polygon.setPath(this.geocercaCoordinates.map(coords => new google.maps.LatLng(coords.lat, coords.lng)));
            } else {
                const map = this.map?.googleMap;
                if (map) {
                    this.polygon = new google.maps.Polygon({
                        ...this.polygonOptions,
                        paths: this.geocercaCoordinates.map(coords => new google.maps.LatLng(coords.lat, coords.lng)),
                    });
                    this.polygon.setMap(map);
                    this.onPolygonComplete(this.polygon);
                }
            }
        }
    }  
    
    clearPolygon() {
        if (this.polygon) {
            this.polygon.setMap(null);
            this.polygon = undefined; 
        }
        this.geocercaCoordinates = [];
        this.lote_vgeopath?.setValue('');
        this.isDrawing = true;
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _Lote: Lote = {
                lote_nid: this.lote_nid?.value > 0 ? this.lote_nid?.value : null,
                proy_nid: this.proy_nid?.value.id,
				unimed_nid: this.unimed_nid?.value.id,
				lote_vgeopath: this.lote_vgeopath?.value,
                lote_vnombre: this.lote_vnombre?.value.trim().toUpperCase(),
                lote_vcodigo: this.lote_vcodigo?.value.trim().toUpperCase(),
                lote_fmedida: this.lote_fmedida?.value,
				lote_flargo: this.lote_flargo?.value,
				lote_fancho: this.lote_fancho?.value,
                lote_fprecio_unidad: this.lote_fprecio_unidad?.value,
				lote_fprecio: this.lote_fprecio?.value,
                lote_nsts: 1
            }
            this.dbapi.save(_Lote).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/residenciales/lotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                        this.limpiarForm();
                    }
                    this.edit.emit(res)
                    this.guardando = false;        
                    this.clearPolygon();
                }, error: (err) => {
                    console.log(err);
                    this.guardando = false;
                    this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            })
        }
    }

    limpiarForm(){
        this.createForm.reset();
        this.lote_nid?.setValue(0);
    }

    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
    }

    searchById(id: any, array: any[]) {
        for (let index = 0; index < array.length; index++) {
            const row = array[index];
            if (row.id == id) {
                return row;
            }
        }
        return '';
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get lote_nid() { return this.createForm.get('lote_nid') };
    get proy_nid() { return this.createForm.get('proy_nid') };
	get unimed_nid() { return this.createForm.get('unimed_nid') };
    get lote_vnombre() { return this.createForm.get('lote_vnombre') };
    get lote_vcodigo() { return this.createForm.get('lote_vcodigo') };
	get lote_vgeopath() { return this.createForm.get('lote_vgeopath') };
	get lote_fmedida() { return this.createForm.get('lote_fmedida') };
    get lote_fprecio_unidad() { return this.createForm.get('lote_fprecio_unidad') };
    get lote_flargo() { return this.createForm.get('lote_flargo') };
	get lote_fancho() { return this.createForm.get('lote_fancho') };
	get lote_fprecio() { return this.createForm.get('lote_fprecio') };
    get lote_nsts() { return this.createForm.get('lote_nsts') };

}
