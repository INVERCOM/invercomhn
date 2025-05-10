import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Proyecto } from '../models/proyecto';
import { Subject, take, takeUntil } from 'rxjs';
import { DbapiService } from '../services/dbapi.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { GoogleMap } from '@angular/google-maps';

interface CheesyObject { id: string; text: string; obj: object}

@Component({
	selector: 'app-create-proyecto',
	templateUrl: './create-proyecto.component.html',
	styleUrls: ['./create-proyecto.component.scss']
})
export class CreateProyectoComponent {
    @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
    
	public createForm: FormGroup;
    public sucursales: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
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
    @Input() proyecto: Proyecto = {};
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(private dbapi: DbapiService, private _builder: FormBuilder, public authS: AuthService, private skNsCore: SkNsCore) {
        this.createForm = _builder.group({
            proy_nid:  [0],
            sucu_nid:  ['', Validators.required],
            proy_vgeopath:  ['', Validators.required],
            proy_vnombre:  ['', Validators.required],
            proy_vdescripcion:  ['', Validators.required],
            proy_nsts:  ['']
        });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getSucursales();
        });
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
    }

    ngOnChanges() {
        this.clearPolygon();
        if (this.proyecto && this.proyecto?.proy_nid && this.proyecto?.proy_nid > 0) {
            this.proy_nid?.setValue(this.proyecto?.proy_nid)
            this.sucu_nid?.setValue(this.searchById(this.proyecto?.sucu_nid, this.sucursales))
            this.geocercaCoordinates = JSON.parse(this.proyecto?.proy_vgeopath!);
            this.center = this.geocercaCoordinates[0];
            this.proy_vgeopath?.setValue(this.proyecto?.proy_vgeopath)
            this.proy_vnombre?.setValue(this.proyecto?.proy_vnombre)
            this.proy_vdescripcion?.setValue(this.proyecto?.proy_vdescripcion)
            this.proy_nsts?.setValue(this.proyecto?.proy_nsts)
            this.updatePolygon();
        }
    }

    getSucursales() {
        this.sucursales = [];
        this.sucu_nid?.setValue('');
        this.dbapi.getSucursales().pipe(take(1)).subscribe({ next:(data: any) => {
			if ( !data || data == null || data === '' ) {
				console.log('Error consultando compañías');
                return;
            }
            for (const key in data) {
				const item={id:data[key]['sucu_nid'], text:data[key]['sucu_vnombre'], obj:data[key]}
                this.sucursales = [ ...this.sucursales, item ];
            }
            this.sucursales.length == 1 && this.sucu_nid?.setValue(this.sucursales[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
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
        this.proy_vgeopath?.setValue(geocercaJson);
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
        this.proy_vgeopath?.setValue('');
        this.isDrawing = true;
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _proyecto: Proyecto = {
                proy_nid: this.proy_nid?.value > 0 ? this.proy_nid?.value : null,
                sucu_nid: this.sucu_nid?.value.id,
                proy_vgeopath: this.proy_vgeopath?.value,
                proy_vnombre: this.proy_vnombre?.value.trim().toUpperCase(),
                proy_vdescripcion: this.proy_vdescripcion?.value.trim().toUpperCase(),
                proy_nsts: 1
            }
            this.dbapi.save(_proyecto).pipe(take(1)).subscribe({ next: (res: any) => {
				if (res.type == 'success') {
					this.skNsCore.notificarUpsert('/proyectos/sucursales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
					this.limpiarForm();
				}
                this.guardando = false;
                this.edit.emit(res)}, error: (err) => {
                    console.log(err);
                    this.guardando = false;
                    this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            })
        }
    }

    limpiarForm(){
        this.createForm.reset();
        this.proy_nid?.setValue(0);
        this.clearPolygon();
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

    get proy_nid() { return this.createForm.get('proy_nid') };
    get sucu_nid() { return this.createForm.get('sucu_nid') };
    get proy_vgeopath() { return this.createForm.get('proy_vgeopath') };
    get proy_vnombre() { return this.createForm.get('proy_vnombre') };
    get proy_vdescripcion() { return this.createForm.get('proy_vdescripcion') };
    get proy_nsts() { return this.createForm.get('proy_nsts') };

}
