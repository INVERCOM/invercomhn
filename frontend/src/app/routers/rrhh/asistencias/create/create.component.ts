import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Asistencia } from '../models/asistencia';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { DatePipe } from '@angular/common';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-asistencias',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateAsistenciasComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public companias: CheesyObject[] = [];
    public empleados: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() asistencia: Asistencia = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore,
        private datePipe: DatePipe
    ) {
        this.createForm = _builder.group({
            asis_nid:  [0],
            cia_nid:  ['', Validators.required],
            emp_nid:  ['', Validators.required],
            asis_ttfechaentrada:  [''],
            asis_nlatentrada:  [''],
            asis_nlongentrada:  [''],
            asis_ttfechasalida:  [''],
            asis_nlatsalida:  [''],
            asis_nlongsalida:  [''],
            asis_nminutosreceso:  [''],
            asis_nsts:  ['']
          });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.cia_nid?.setValue('');
            this.emp_nid?.setValue('');
            this.getCompanias();
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
        if (this.asistencia && this.asistencia?.emp_nid && this.asistencia?.emp_nid > 0) {
            this.asis_nid?.setValue(this.asistencia?.asis_nid)
            this.cia_nid?.setValue(this.searchById(this.asistencia?.cia_nid, this.companias))
            this.emp_nid?.setValue(this.searchById(this.asistencia?.emp_nid, this.empleados))
            this.asis_ttfechaentrada?.setValue( this.asistencia?.asis_ttfechaentrada ? this.datePipe.transform(this.asistencia?.asis_ttfechaentrada, 'yyyy-MM-dd HH:mm') : null )
            this.asis_nlatentrada?.setValue(this.asistencia?.asis_nlatentrada)
            this.asis_nlongentrada?.setValue(this.asistencia?.asis_nlongentrada)
            this.asis_ttfechasalida?.setValue( this.asistencia?.asis_ttfechasalida ? this.datePipe.transform(this.asistencia?.asis_ttfechasalida, 'yyyy-MM-dd HH:mm') : null )
            this.asis_nlatsalida?.setValue(this.asistencia?.asis_nlatsalida)
            this.asis_nlongsalida?.setValue(this.asistencia?.asis_nlongsalida)
            this.asis_nminutosreceso?.setValue(this.asistencia?.asis_nminutosreceso)
            this.asis_nsts?.setValue(this.asistencia?.asis_nsts)
        }
    }

    getCompanias() {
        this.companias = [{id:'', text:'...', obj:{}}];
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

    getEmpleados() {
        this.empleados = [{id:'', text:'...', obj:{}}];
        this.dbapi.getEmpleados().pipe(take(1)).subscribe({ next: (data: any) => {
            if ( !data || data == null || data === '' ) {
                console.log('Error consultando empleados');
                return;
            }
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
            const _asistencia: Asistencia = {
                asis_nid: this.asis_nid?.value > 0 ? this.asis_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                emp_nid: this.emp_nid?.value.id,
                asis_ttfechaentrada: this.asis_ttfechaentrada?.value,
                asis_nlatentrada: this.asis_nlatentrada?.value,
                asis_nlongentrada: this.asis_nlongentrada?.value,
                asis_ttfechasalida: this.asis_ttfechasalida?.value,
                asis_nlatsalida: this.asis_nlatsalida?.value,
                asis_nlongsalida: this.asis_nlongsalida?.value,
                asis_nminutosreceso: this.asis_nminutosreceso?.value,
                asis_nsts: this.asis_nsts?.value > 0 ? 3 : 1
            }
            console.log(_asistencia);
            this.dbapi.save(_asistencia).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/rrhh/asistencias', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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

    validarForm(){
        if(this.createForm.valid && this.cia_nid?.value.id != '' && this.emp_nid?.value.id != ''){
            return true
        } else {
            return false;
        }
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get asis_nid() { return this.createForm.get('asis_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get emp_nid() { return this.createForm.get('emp_nid') };
    get asis_ttfechaentrada() { return this.createForm.get('asis_ttfechaentrada') };
    get asis_nlatentrada() { return this.createForm.get('asis_nlatentrada') };
    get asis_nlongentrada() { return this.createForm.get('asis_nlongentrada') };
    get asis_ttfechasalida() { return this.createForm.get('asis_ttfechasalida') };
    get asis_nlatsalida() { return this.createForm.get('asis_nlatsalida') };
    get asis_nlongsalida() { return this.createForm.get('asis_nlongsalida') };
    get asis_nminutosreceso() { return this.createForm.get('asis_nminutosreceso') };
    get asis_nsts() { return this.createForm.get('asis_nsts') };
   

}
