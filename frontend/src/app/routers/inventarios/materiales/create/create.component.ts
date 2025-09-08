import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Material } from '../models/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-materiales',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateMaterialesComponent implements OnChanges, OnDestroy {
    public createForm: FormGroup;
    public companias: CheesyObject[] = [];
    public impuestos: CheesyObject[] = [];
    public manejosInv: CheesyObject[] = [];
    public SiNo: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() material: any = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        public skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/inventario/impuestos').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            console.log('Event socket: impuestos');
            this.getImpuestos();
        });
        this.createForm = _builder.group({
            mater_nid:  [0],
            cia_nid:  ['', Validators.required],
            mater_vcodigo:  [''],
            mater_vnombre:  ['', Validators.required],
            mater_vdescripcion:  ['', Validators.required],
            mater_vcodbar:  [''],
            mater_nprecio:  ['', Validators.required],
            mater_ncosto:  ['', Validators.required],
            mater_ntipomanejo:  ['', Validators.required],
            mater_vimpuestos:  [''],
            mater_nisv:  ['', Validators.required],
            mater_nisvincluido:  ['', Validators.required],
            mater_nmostrarfact:  ['', Validators.required],
            mater_nsts:  ['']
          });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getCompanias();
        });
        this.getImpuestos()
        this.manejosInv = [
            {id: '', text:'...', obj:{}},
            {id: '1', text:'INVENTARIABLE', obj:{}},
            {id: '2', text:'NO INVENTARIABLE', obj:{}}
        ]
        this.SiNo = [
            {id: '', text:'...', obj:{}},
            {id: '1', text:'SI', obj:{}},
            {id: '0', text:'NO', obj:{}}
        ]
    }

    ngOnChanges() {
        if (this.material && this.material?.mater_nid && this.material?.mater_nid > 0) {
            this.mater_nid?.setValue(this.material?.mater_nid)
            this.cia_nid?.setValue(this.searchById(this.material?.cia_nid, this.companias))
            this.mater_vcodigo?.setValue(this.material?.mater_vcodigo)
            this.mater_vnombre?.setValue(this.material?.mater_vnombre)
            this.mater_vdescripcion?.setValue(this.material?.mater_vdescripcion)
            this.mater_vcodbar?.setValue(this.material?.mater_vcodbar)
            this.mater_nprecio?.setValue(this.material?.mater_nprecio)
            this.mater_ncosto?.setValue(this.material?.mater_ncosto)
            this.mater_ntipomanejo?.setValue(this.searchById(this.material?.mater_ntipomanejo.toString(), this.manejosInv))
            this.mater_nisvincluido?.setValue(this.searchById(this.material?.mater_nisvincluido.toString(), this.SiNo))
            this.mater_nisv?.setValue(this.material?.mater_nisv)
            this.mater_nmostrarfact?.setValue(this.searchById(this.material?.mater_nmostrarfact.toString(), this.SiNo))
            this.mater_nsts?.setValue(this.material?.mater_nsts)
            const impuestos = []
            for (let i = 0; i < this.material['isvs']?.length; i++) {
                const row = this.material?.['isvs'][i];
                impuestos.push(this.searchById(row['isv_nid'], this.impuestos))
            }
            this.mater_vimpuestos?.setValue(impuestos);
        }
    }

    getCompanias() {
        this.companias = [];
        this.cia_nid?.setValue('');
        this.dbapi.getCompanias().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['cia_nid'], text:data[key]['cia_vnombre'], obj:data[key]}
                    this.companias = [ ...this.companias, item ];
                }
                this.companias.length == 1 && this.cia_nid?.setValue(this.companias[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getImpuestos() {
        this.mater_vimpuestos?.setValue('');
        this.dbapi.getImpuestos().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando impuestos');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['isv_nvalor'], text:data[key]['isv_vdescripcion'], obj:data[key]}
                    this.impuestos = [ ...this.impuestos, item ];
                }
                this.impuestos.length == 1 && this.mater_nisv?.setValue(this.impuestos[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    save(){
        if (this.validarForm()) {
            this.guardando = true;
            // const impuestosAsignados = []
            // for (let i = 0; i < this.mater_vimpuestos?.value.length; i++) {
            //     const imp = this.mater_vimpuestos?.value[i];
            //     impuestosAsignados.push({
            //         mater_nid: this.mater_nid?.value > 0 ? this.mater_nid?.value : null,
            //         isv_nid: imp.id
            //     });
            // }
            const _material: Material = {
                mater_nid: this.mater_nid?.value > 0 ? this.mater_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                mater_vcodigo: this.mater_vcodigo?.value.trim().toUpperCase(),
                mater_vnombre: this.mater_vnombre?.value.trim().toUpperCase(),
                mater_vdescripcion: this.mater_vdescripcion?.value.trim().toUpperCase(),
                mater_vcodbar: this.mater_vcodbar?.value.trim().toUpperCase(),
                mater_nprecio: this.mater_nprecio?.value,
                mater_ncosto: this.mater_ncosto?.value,
                mater_ntipomanejo: this.mater_ntipomanejo?.value.id,
                mater_nisv: this.mater_nisv?.value.id > 0 ? this.mater_nisv?.value.id : 0,
                mater_nisvincluido: this.mater_nisvincluido?.value.id,
                mater_nmostrarfact: this.mater_nmostrarfact?.value.id,
                mater_nsts: 1
            }
            this.dbapi.save(_material, []).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/inventario/materiales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
                        this.limpiarForm();
                    }
                    this.edit.emit(res)
                    this.guardando = false;
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
        this.mater_nid?.setValue(0);
        this.mater_ntipomanejo?.setValue('');
        this.mater_nisvincluido?.setValue('');
        this.mater_nisv?.setValue('');
        this.mater_nmostrarfact?.setValue('');
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
        if(this.createForm.valid && this.mater_ntipomanejo?.value.id != '' && this.mater_nisvincluido?.value.id != '' && this.mater_nmostrarfact?.value.id != ''){
            return true
        } else {
            return false;
        }
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
      }

    get mater_nid() { return this.createForm.get('mater_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get mater_vcodigo() { return this.createForm.get('mater_vcodigo') };
    get mater_vnombre() { return this.createForm.get('mater_vnombre') };
    get mater_vdescripcion() { return this.createForm.get('mater_vdescripcion') };
    get mater_vcodbar() { return this.createForm.get('mater_vcodbar') };
    get mater_nprecio() { return this.createForm.get('mater_nprecio') };
    get mater_ncosto() { return this.createForm.get('mater_ncosto') };
    get mater_ntipomanejo() { return this.createForm.get('mater_ntipomanejo') };
    get mater_vimpuestos() { return this.createForm.get('mater_vimpuestos') };
    get mater_nisv() { return this.createForm.get('mater_nisv') };
    get mater_nisvincluido() { return this.createForm.get('mater_nisvincluido') };
    get mater_nmostrarfact() { return this.createForm.get('mater_nmostrarfact') };
    get mater_nsts() { return this.createForm.get('mater_nsts') };

}
