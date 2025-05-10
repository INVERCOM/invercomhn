import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { PuntoEmision } from '../models/puntoEmision';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-puntos-emision',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreatePuntosEmisionComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public sucursales: CheesyObject[] = [];
    public configuracionInv: CheesyObject[] = [];
    public SiNo: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
     private $destroy: Subject<void> = new Subject();
    @Input() puntoEmision: PuntoEmision = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            punemi_nid:  [0],
            sucu_nid:  ['', Validators.required],
            punemi_vcodigo:  ['', Validators.required],
            punemi_vdescripcion:  ['',],
            punemi_vdireccion:  ['',],
            punemi_vtelefono:  ['',],
            punemi_nconfinventario:  ['',],
            punemi_nvalidarfactura:  ['',],
            punemi_nsts:  ['']
          });

        this.configuracionInv = [
            {id: '', text:'...', obj:{}},
            {id: '1', text:'REBAJA DIRECTA', obj:{}},
            {id: '2', text:'ORDEN DE ENTREGA', obj:{}}
        ]
        this.SiNo = [
            {id: '', text:'...', obj:{}},
            {id: '1', text:'SI', obj:{}},
            {id: '0', text:'NO', obj:{}}
        ]
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getSucursales();
        });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.puntoEmision && this.puntoEmision?.punemi_nid && this.puntoEmision?.punemi_nid > 0) {
            this.punemi_nid?.setValue(this.puntoEmision?.punemi_nid)
            this.sucu_nid?.setValue(this.searchById(this.puntoEmision?.sucu_nid, this.sucursales))
            this.punemi_vcodigo?.setValue(this.puntoEmision?.punemi_vcodigo)
            this.punemi_vdescripcion?.setValue(this.puntoEmision?.punemi_vdescripcion)
            this.punemi_vdireccion?.setValue(this.puntoEmision?.punemi_vdireccion)
            this.punemi_vtelefono?.setValue(this.puntoEmision?.punemi_vtelefono)
            this.punemi_nconfinventario?.setValue(this.searchById(this.puntoEmision?.punemi_nconfinventario?.toString(), this.configuracionInv))
            this.punemi_nvalidarfactura?.setValue(this.searchById(this.puntoEmision?.punemi_nvalidarfactura?.toString(), this.SiNo))
            this.punemi_nsts?.setValue(this.puntoEmision?.punemi_nsts)
        }
    }

    getSucursales() {
        this.sucursales = [];
        this.sucu_nid?.setValue('');
        this.dbapi.getSucursales().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando sucursales');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['sucu_nid'], text:data[key]['sucu_vnombre'], obj:data[key]}
                    this.sucursales = [ ...this.sucursales, item ];
                }
                this.sucursales.length == 1 && this.sucu_nid?.setValue(this.sucursales[0]);
            }, error: (err) => {
                console.log(err);
                this.guardando = false;
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    save(){
        if (this.validarForm()) {
            this.guardando = true;
            const _puntoEmision: PuntoEmision = {
                punemi_nid: this.punemi_nid?.value > 0 ? this.punemi_nid?.value : null,
                sucu_nid: this.sucu_nid?.value.id,
                punemi_vcodigo: this.punemi_vcodigo?.value.toString().trim(),
                punemi_vdescripcion: this.punemi_vdescripcion?.value.trim().toUpperCase(),
                punemi_vdireccion: this.punemi_vdireccion?.value.trim().toUpperCase(),
                punemi_vtelefono: this.punemi_vtelefono?.value.toString().trim(),
                punemi_nconfinventario: this.punemi_nconfinventario?.value.id,
                punemi_nvalidarfactura: this.punemi_nvalidarfactura?.value.id,
                punemi_nsts: 1
            }
            this.dbapi.save(_puntoEmision).pipe(take(1)).subscribe({ next: (res: any) => {
                    if(res.type == 'success'){
                        this.skNsCore.notificarUpsert('/ventas/puntosemision', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
                        this.limpiarForm();
                    } 
                    this.guardando = false;
                    this.edit.emit(res)
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
        this.punemi_nid?.setValue(0);
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

    validarForm(){
        if(this.createForm.valid && this.punemi_nconfinventario?.value.id != '' && this.punemi_nvalidarfactura?.value.id != ''){
            return true
        } else {
            return false;
        }
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get punemi_nid() { return this.createForm.get('punemi_nid') };
    get sucu_nid() { return this.createForm.get('sucu_nid') };
    get punemi_vcodigo() { return this.createForm.get('punemi_vcodigo') };
    get punemi_vdescripcion() { return this.createForm.get('punemi_vdescripcion') };
    get punemi_vdireccion() { return this.createForm.get('punemi_vdireccion') };
    get punemi_vtelefono() { return this.createForm.get('punemi_vtelefono') };
    get punemi_nconfinventario() { return this.createForm.get('punemi_nconfinventario') };
    get punemi_nvalidarfactura() { return this.createForm.get('punemi_nvalidarfactura') };
    get punemi_nsts() { return this.createForm.get('punemi_nsts') };
   

}
