import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Sucursal } from '../models/sucursal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-sucursales',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateSucursalesComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public companias: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() sucursal: Sucursal = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            sucu_nid:  [0],
            cia_nid:  ['', Validators.required],
            sucu_vcodigo:  ['', Validators.required],
            sucu_vnombre:  ['', Validators.required],
            sucu_vdireccion:  ['', Validators.required],
            sucu_vtelefono:  [''],
            sucu_vcorreo:  ['', Validators.email],
            sucu_nsts:  ['']
          });
          authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getCompanias();
        });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.sucursal && this.sucursal?.sucu_nid && this.sucursal?.sucu_nid > 0) {
            this.sucu_nid?.setValue(this.sucursal?.sucu_nid)
            this.cia_nid?.setValue(this.searchById(this.sucursal?.cia_nid, this.companias))
            this.sucu_vcodigo?.setValue(this.sucursal?.sucu_vcodigo)
            this.sucu_vnombre?.setValue(this.sucursal?.sucu_vnombre)
            this.sucu_vdireccion?.setValue(this.sucursal?.sucu_vdireccion)
            this.sucu_vtelefono?.setValue(this.sucursal?.sucu_vtelefono)
            this.sucu_vcorreo?.setValue(this.sucursal?.sucu_vcorreo)
            this.sucu_nsts?.setValue(this.sucursal?.sucu_nsts)
        }
    }

    getCompanias() {
        this.companias = [];
        this.cia_nid?.setValue('');
        this.dbapi.getCompanias().pipe(take(1)).subscribe({ next:(data: any) => {
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

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _sucursal: Sucursal = {
                sucu_nid: this.sucu_nid?.value > 0 ? this.sucu_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                sucu_vcodigo: this.sucu_vcodigo?.value.toString().trim().toUpperCase(),
                sucu_vnombre: this.sucu_vnombre?.value.trim().toUpperCase(),
                sucu_vdireccion: this.sucu_vdireccion?.value.trim().toUpperCase(),
                sucu_vtelefono: this.sucu_vtelefono?.value.toString().trim(),
                sucu_vcorreo: this.sucu_vcorreo?.value.trim().toLowerCase(),
                sucu_nsts: 1
            }
            this.dbapi.save(_sucursal).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/admin/sucursales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.sucu_nid?.setValue(0);
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

    get sucu_nid() { return this.createForm.get('sucu_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get sucu_vcodigo() { return this.createForm.get('sucu_vcodigo') };
    get sucu_vnombre() { return this.createForm.get('sucu_vnombre') };
    get sucu_vdireccion() { return this.createForm.get('sucu_vdireccion') };
    get sucu_vtelefono() { return this.createForm.get('sucu_vtelefono') };
    get sucu_vcorreo() { return this.createForm.get('sucu_vcorreo') };
    get sucu_nsts() { return this.createForm.get('sucu_nsts') };

}
