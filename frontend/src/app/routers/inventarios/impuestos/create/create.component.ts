import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Impuesto } from '../models/impuesto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';

@Component({
    selector: 'app-create-impuestos',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateImpuestosComponent implements OnInit, OnChanges {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    @Input() impuesto: Impuesto = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            isv_nid:  [0],
            isv_vdescripcion:  ['', Validators.required],
            isv_nvalor:  ['', Validators.required],
            isv_nsts:  ['']
          });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.impuesto && this.impuesto?.isv_nid && this.impuesto?.isv_nid > 0) {
            this.isv_nid?.setValue(this.impuesto?.isv_nid)
            this.isv_vdescripcion?.setValue(this.impuesto?.isv_vdescripcion)
            this.isv_nvalor?.setValue(this.impuesto?.isv_nvalor)
            this.isv_nsts?.setValue(this.impuesto?.isv_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _impuesto: Impuesto = {
                isv_nid: this.isv_nid?.value > 0 ? this.isv_nid?.value : null,
                isv_vdescripcion: this.isv_vdescripcion?.value.trim().toUpperCase(),
                isv_nvalor: this.isv_nvalor?.value,
                isv_nsts: 1
            }
            this.dbapi.save(_impuesto).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/inventario/impuestos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.isv_nid?.setValue(0);
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

    get isv_nid() { return this.createForm.get('isv_nid') };
    get isv_vdescripcion() { return this.createForm.get('isv_vdescripcion') };
    get isv_nvalor() { return this.createForm.get('isv_nvalor') };
    get isv_nsts() { return this.createForm.get('isv_nsts') };

}
