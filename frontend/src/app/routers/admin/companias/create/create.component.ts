import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Compania } from '../models/compania';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-companias',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateCompaniasComponent implements OnInit, OnChanges {
    public createForm: FormGroup;
    public monedas: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    @Input() compania: Compania = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder
    ) {
        this.createForm = _builder.group({
            cia_nid:  [0],
            cia_vnombre:  ['', Validators.required],
            cia_vnombrecomercial:  ['', Validators.required],
            cia_vdireccion:  ['', Validators.required],
            cia_vtelefono:  ['', Validators.required],
            cia_vrtn:  ['', Validators.required],
            cia_vcorreo:  [''],
            mone_nid:  ['', Validators.required],
            cia_nsts:  ['']
          });
        this.getMonedas();
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.compania && this.compania?.cia_nid && this.compania?.cia_nid > 0) {
            this.cia_nid?.setValue(this.compania?.cia_nid)
            this.cia_vnombre?.setValue(this.compania?.cia_vnombre)
            this.cia_vnombrecomercial?.setValue(this.compania?.cia_vnombrecomercial)
            this.cia_vdireccion?.setValue(this.compania?.cia_vdireccion)
            this.cia_vtelefono?.setValue(this.compania?.cia_vtelefono)
            this.cia_vrtn?.setValue(this.compania?.cia_vrtn)
            this.cia_vcorreo?.setValue(this.compania?.cia_vcorreo)
            this.mone_nid?.setValue(this.searchById(this.compania?.mone_nid, this.monedas))
        }
    }

    getMonedas() {
        this.monedas = [{id: '', text: '...', obj:{}}];
        this.mone_nid?.setValue('');
        this.dbapi.getMonedas().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando unidades de medida');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['mone_nid'], text:data[key]['mone_vnombre'], obj:data[key]}
                    this.monedas = [ ...this.monedas, item ];
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
            const _compania: Compania = {
                cia_nid: this.cia_nid?.value > 0 ? this.cia_nid?.value : null,
                cia_vnombre: this.cia_vnombre?.value.trim().toUpperCase(),
                cia_vnombrecomercial: this.cia_vnombrecomercial?.value.trim().toUpperCase(),
                cia_vdireccion: this.cia_vdireccion?.value.trim().toUpperCase(),
                cia_vtelefono: this.cia_vtelefono?.value,
                cia_vrtn: this.cia_vrtn?.value,
                cia_vcorreo: this.cia_vcorreo?.value.trim().toLowerCase(),
                mone_nid: this.mone_nid?.value.id,
                cia_nsts: 1
            }
            this.dbapi.save(_compania).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
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
        this.cia_nid?.setValue(0);
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

    get cia_nid() { return this.createForm.get('cia_nid') };
    get cia_vnombre() { return this.createForm.get('cia_vnombre') };
    get cia_vnombrecomercial() { return this.createForm.get('cia_vnombrecomercial') };
    get cia_vdireccion() { return this.createForm.get('cia_vdireccion') };
    get cia_vtelefono() { return this.createForm.get('cia_vtelefono') };
    get cia_vrtn() { return this.createForm.get('cia_vrtn') };
    get cia_vcorreo() { return this.createForm.get('cia_vcorreo') };
    get mone_nid() { return this.createForm.get('mone_nid') };
    get cia_nsts() { return this.createForm.get('cia_nsts') };

}
