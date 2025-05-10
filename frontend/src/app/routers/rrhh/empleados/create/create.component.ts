import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Empleado } from '../models/empleado';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-empleados',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateEmpleadosComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public companias: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() empleado: Empleado = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            emp_nid:  [0],
            cia_nid:  ['', Validators.required],
            emp_vcodigo:  ['',],
            emp_videntidad:  ['', Validators.required],
            emp_vnombre:  ['', Validators.required],
            emp_vapellido:  ['', Validators.required],
            emp_vdireccion:  ['',],
            emp_vtelefono:  ['', ],
            emp_vfechaingreso:  ['',],
            emp_nsts:  ['']
          });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getCompanias();
        });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.empleado && this.empleado?.emp_nid && this.empleado?.emp_nid > 0) {
            this.emp_nid?.setValue(this.empleado?.emp_nid)
            this.cia_nid?.setValue(this.searchById(this.empleado?.cia_nid, this.companias))
            this.emp_vcodigo?.setValue(this.empleado?.emp_vcodigo)
            this.emp_videntidad?.setValue(this.empleado?.emp_videntidad)
            this.emp_vnombre?.setValue(this.empleado?.emp_vnombre)
            this.emp_vapellido?.setValue(this.empleado?.emp_vapellido)
            this.emp_vdireccion?.setValue(this.empleado?.emp_vdireccion)
            this.emp_vtelefono?.setValue(this.empleado?.emp_vtelefono)
            this.emp_vfechaingreso?.setValue(this.empleado?.emp_vfechaingreso)
            this.emp_nsts?.setValue(this.empleado?.emp_nsts)
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

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _empleado: Empleado = {
                emp_nid: this.emp_nid?.value > 0 ? this.emp_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                emp_vcodigo: this.emp_vcodigo?.value.trim().toUpperCase(),
                emp_videntidad: this.emp_videntidad?.value.trim().toUpperCase(),
                emp_vnombre: this.emp_vnombre?.value.trim().toUpperCase(),
                emp_vapellido: this.emp_vapellido?.value.trim().toUpperCase(),
                emp_vdireccion: this.emp_vdireccion?.value.trim().toUpperCase(),
                emp_vtelefono: this.emp_vtelefono?.value,
                emp_vfechaingreso: this.emp_vfechaingreso?.value,
                emp_nsts: 1
            }
            this.dbapi.save(_empleado).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/rrhh/empleados', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.emp_nid?.setValue(0);
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

    get emp_nid() { return this.createForm.get('emp_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get emp_vcodigo() { return this.createForm.get('emp_vcodigo') };
    get emp_videntidad() { return this.createForm.get('emp_videntidad') };
    get emp_vnombre() { return this.createForm.get('emp_vnombre') };
    get emp_vapellido() { return this.createForm.get('emp_vapellido') };
    get emp_vdireccion() { return this.createForm.get('emp_vdireccion') };
    get emp_vtelefono() { return this.createForm.get('emp_vtelefono') };
    get emp_vfechaingreso() { return this.createForm.get('emp_vfechaingreso') };
    get emp_nsts() { return this.createForm.get('emp_nsts') };
   

}
