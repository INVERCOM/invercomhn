import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Modulo } from '../models/modulo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-modulos',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateModuloComponent implements OnInit, OnChanges {
    public createForm: FormGroup;
    public monedas: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    @Input() modulo: Modulo = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        private authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            modu_nid:  [0],
            modu_vnombre:  ['', Validators.required],
            modu_vdescripcion:  ['', Validators.required],
            modu_nsts:  ['']
          });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.modulo && this.modulo?.modu_nid && this.modulo?.modu_nid > 0) {
            this.modu_nid?.setValue(this.modulo?.modu_nid)
            this.modu_vnombre?.setValue(this.modulo?.modu_vnombre)
            this.modu_vdescripcion?.setValue(this.modulo?.modu_vdescripcion)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _modulo: Modulo = {
                modu_nid: this.modu_nid?.value > 0 ? this.modu_nid?.value : null,
                modu_vnombre: this.modu_vnombre?.value.trim().toUpperCase(),
                modu_vdescripcion: this.modu_vdescripcion?.value.trim().toUpperCase(),
                modu_nsts: 1
            }
            this.dbapi.save(_modulo).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/admin/modulos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.modu_nid?.setValue(0);
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

    get modu_nid() { return this.createForm.get('modu_nid') };
    get modu_vnombre() { return this.createForm.get('modu_vnombre') };
    get modu_vdescripcion() { return this.createForm.get('modu_vdescripcion') };
    get modu_nsts() { return this.createForm.get('modu_nsts') };

}
