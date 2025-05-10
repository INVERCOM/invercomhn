import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Cliente } from '../models/cliente';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-clientes',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateClientesComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public companias: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
     private $destroy: Subject<void> = new Subject();
    @Input() cliente: Cliente = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            cli_nid:  [0],
            cia_nid:  ['', Validators.required],
            cli_vnombre:  ['', Validators.required],
            cli_videntidad:  ['',],
            cli_vrtn:  ['',],
            cli_vdireccion:  ['',],
            cli_vtelefono:  ['',],
            cli_nsts:  ['']
          });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getCompanias();
        });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.cliente && this.cliente?.cli_nid && this.cliente?.cli_nid > 0) {
            this.cli_nid?.setValue(this.cliente?.cli_nid)
            this.cia_nid?.setValue(this.searchById(this.cliente?.cia_nid, this.companias))
            this.cli_vnombre?.setValue(this.cliente?.cli_vnombre)
            this.cli_videntidad?.setValue(this.cliente?.cli_videntidad)
            this.cli_vrtn?.setValue(this.cliente?.cli_vrtn)
            this.cli_vdireccion?.setValue(this.cliente?.cli_vdireccion)
            this.cli_vtelefono?.setValue(this.cliente?.cli_vtelefono)
            this.cli_nsts?.setValue(this.cliente?.cli_nsts)
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
                this.guardando = false;
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _cliente: Cliente = {
                cli_nid: this.cli_nid?.value > 0 ? this.cli_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                cli_vnombre: this.cli_vnombre?.value.trim().toUpperCase(),
                cli_videntidad: this.cli_videntidad?.value.trim().toUpperCase(),
                cli_vrtn: this.cli_vrtn?.value.trim().toUpperCase(),
                cli_vdireccion: this.cli_vdireccion?.value.trim().toUpperCase(),
                cli_vtelefono: this.cli_vtelefono?.value.trim().toUpperCase(),
                cli_nsts: 1
            }
            this.dbapi.save(_cliente).pipe(take(1)).subscribe({ next: (res: any) => {
                    if(res.type == 'success'){
                        this.skNsCore.notificarUpsert('/ventas/clientes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.cli_nid?.setValue(0);
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

    get cli_nid() { return this.createForm.get('cli_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get cli_vnombre() { return this.createForm.get('cli_vnombre') };
    get cli_videntidad() { return this.createForm.get('cli_videntidad') };
    get cli_vrtn() { return this.createForm.get('cli_vrtn') };
    get cli_vdireccion() { return this.createForm.get('cli_vdireccion') };
    get cli_vtelefono() { return this.createForm.get('cli_vtelefono') };
    get cli_nsts() { return this.createForm.get('cli_nsts') };
   

}
