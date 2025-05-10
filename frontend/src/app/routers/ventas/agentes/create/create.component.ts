import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Agente } from '../models/agente';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-agentes',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateAgentesComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public companias: CheesyObject[] = [];
    public tiposAgentes: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() agente: Agente = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            agen_nid:  [0],
            cia_nid:  ['', Validators.required],
            agen_vcodigo:  ['', Validators.required],
            agen_vnombre:  ['', Validators.required],
            agen_ntipo:  ['', Validators.required],
            agen_nsts:  ['']
          });
        this.tiposAgentes = [
            {id:'', text:'...', obj:{}},
            {id:'1', text:'VENTAS', obj:{}},
            {id:'2', text:'COBROS', obj:{}},
            {id:'3', text:'AMBOS', obj:{}}
        ];
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getCompanias();
        });
    }

    ngOnInit() {}

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

    ngOnChanges() {
        if (this.agente && this.agente?.agen_nid && this.agente?.agen_nid > 0) {
            this.agen_nid?.setValue(this.agente?.agen_nid)
            this.cia_nid?.setValue(this.searchById(this.agente?.cia_nid, this.companias))
            this.agen_vcodigo?.setValue(this.agente?.agen_vcodigo)
            this.agen_vnombre?.setValue(this.agente?.agen_vnombre)
            this.agen_ntipo?.setValue(this.searchById(this.agente?.agen_ntipo, this.tiposAgentes))
            this.agen_nsts?.setValue(this.agente?.agen_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _agente: Agente = {
                agen_nid: this.agen_nid?.value > 0 ? this.agen_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                agen_vcodigo: this.agen_vcodigo?.value.trim().toUpperCase(),
                agen_vnombre: this.agen_vnombre?.value.trim().toUpperCase(),
                agen_ntipo: this.agen_ntipo?.value.id,
                agen_nsts: 1
            }
            this.dbapi.save(_agente).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/ventas/agentes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.agen_nid?.setValue(0);
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

    get agen_nid() { return this.createForm.get('agen_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get agen_vcodigo() { return this.createForm.get('agen_vcodigo') };
    get agen_vnombre() { return this.createForm.get('agen_vnombre') };
    get agen_ntipo() { return this.createForm.get('agen_ntipo') };
    get agen_nsts() { return this.createForm.get('agen_nsts') };

}
