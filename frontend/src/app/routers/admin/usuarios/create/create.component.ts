import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Usuario } from '../models/usuario';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-usuario',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateUsuariosComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public tiempos: CheesyObject[] = [];
    public empleados: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() usuario: Usuario = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            user_nid:  [0],
            user_vmail:  ['', Validators.required],
            user_vtelefono:  ['', Validators.required],
            user_vpass:  [''],
            emp_nid:  [''],
            user_vtiemposesion:  ['', Validators.required],
            user_nsts:  ['']
          });
        this.tiempos = [
            {id: '', text:'...', obj:{} },
            {id: '30m', text:'30 minutos', obj:{} },
            {id: '1h', text:'1 hora', obj:{} },
            {id: '2h', text:'2 horas', obj:{} },
            {id: '6h', text:'6 horas', obj:{} },
            {id: '12h', text:'12 horas', obj:{} },
            {id: '24h', text:'24 horas', obj:{} }
        ];
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.emp_nid?.setValue('');
            this.getEmpleados();
        });
        skNsCore.fromEvent('/rrhh/empleados+'+this.authS.isValidCia(false).toString()).pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: empleados');
                this.getEmpleados();
            }
        });
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.usuario && this.usuario?.user_nid && this.usuario?.user_nid > 0) {
            this.user_nid?.setValue(this.usuario?.user_nid)
            this.user_vmail?.setValue(this.usuario?.user_vmail)
            this.user_vtelefono?.setValue(this.usuario?.user_vtelefono)
            this.user_vpass?.setValue(this.usuario?.user_vpass)
            this.user_vtiemposesion?.setValue(this.usuario?.user_vtiemposesion)
            this.emp_nid?.setValue(this.searchById(this.usuario?.emp_nid, this.tiempos))
            this.user_vtiemposesion?.setValue(this.searchById(this.usuario?.user_vtiemposesion, this.tiempos))
        }
    }

    getEmpleados() {
        this.empleados = [{id:'0', text:'...', obj:{}}];
        this.dbapi.getEmpleados().pipe(take(1)).subscribe({ next: (data: any) => {
            if ( !data || data == null || data === '' ) {
                console.log('Error consultando empleados');
                return;
            }
            console.log(data);
            
            for (const key in data) {
                const item={id:data[key]['emp_nid'], text:data[key]['emp_videntidad'] + ' - ' + data[key]['emp_vnombre'] + ' ' + data[key]['emp_vapellido'], obj:data[key]}
                this.empleados = [ ...this.empleados, item ];
            }
            this.empleados.length == 1 && this.emp_nid?.setValue(this.empleados[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _usuario: Usuario = {
                user_nid: this.user_nid?.value > 0 ? this.user_nid?.value : null,
                user_vmail: this.user_vmail?.value.trim().toLowerCase(),
                user_vtelefono: this.user_vtelefono?.value.toString().trim(),
                user_vpass: '',
                emp_nid: this.emp_nid?.value.id > 0 ? this.emp_nid?.value.id : 0,
                user_vtiemposesion: this.user_vtiemposesion?.value.id,
                user_nsts: this.usuario && this.usuario?.user_nid ? this.usuario?.user_nsts : 2
            }
            this.dbapi.save(_usuario).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/admin/usuarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.user_nid?.setValue(0);
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

    get user_nid() { return this.createForm.get('user_nid') };
    get user_vmail() { return this.createForm.get('user_vmail') };
    get user_vtelefono() { return this.createForm.get('user_vtelefono') };
    get user_vpass() { return this.createForm.get('user_vpass') };
    get emp_nid() { return this.createForm.get('emp_nid') };
    get user_vtiemposesion() { return this.createForm.get('user_vtiemposesion') };
    get user_nsts() { return this.createForm.get('user_nsts') };

}
