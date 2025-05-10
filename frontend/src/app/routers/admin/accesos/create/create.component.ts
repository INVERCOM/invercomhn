import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Acceso } from '../models/acceso';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-accesos',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateAccesosComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public modulos: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() acceso: Acceso = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        private authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/admin/modulos').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            console.log('Event socket: módulos');
            this.getModulos();
        });
        this.createForm = _builder.group({
            acce_nid:  [0],
            modu_nid:  ['', Validators.required],
            acce_vnombre:  ['', Validators.required],
            acce_vdescripcion:  ['', Validators.required],
            acce_vclave:  ['', Validators.required],
            acce_nsts:  ['']
          });
        this.getModulos();
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.acceso && this.acceso?.acce_nid && this.acceso?.acce_nid > 0) {
            this.acce_nid?.setValue(this.acceso?.acce_nid)
            this.modu_nid?.setValue(this.searchById(this.acceso?.modu_nid, this.modulos))
            this.acce_vnombre?.setValue(this.acceso?.acce_vnombre)
            this.acce_vdescripcion?.setValue(this.acceso?.acce_vdescripcion)
            this.acce_vclave?.setValue(this.acceso?.acce_vclave)
        }
    }

    getModulos() {
        this.modulos = [{id: '', text: '...', obj:{}}];
        this.modu_nid?.setValue('');
        this.dbapi.getModulos().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando unidades de medida');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['modu_nid'], text:data[key]['modu_vnombre'], obj:data[key]}
                    this.modulos = [ ...this.modulos, item ];
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _acceso: Acceso = {
                acce_nid: this.acce_nid?.value > 0 ? this.acce_nid?.value : null,
                modu_nid: this.modu_nid?.value.id,
                acce_vnombre: this.acce_vnombre?.value.trim().toUpperCase(),
                acce_vdescripcion: this.acce_vdescripcion?.value.trim().toUpperCase(),
                acce_vclave: this.acce_vclave?.value.trim().toLowerCase(),
                acce_nsts: 1
            }
            this.dbapi.save(_acceso).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/admin/accesos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.acce_nid?.setValue(0);
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

    get acce_nid() { return this.createForm.get('acce_nid') };
    get modu_nid() { return this.createForm.get('modu_nid') };
    get acce_vnombre() { return this.createForm.get('acce_vnombre') };
    get acce_vdescripcion() { return this.createForm.get('acce_vdescripcion') };
    get acce_vclave() { return this.createForm.get('acce_vclave') };
    get acce_nsts() { return this.createForm.get('acce_nsts') };

}
