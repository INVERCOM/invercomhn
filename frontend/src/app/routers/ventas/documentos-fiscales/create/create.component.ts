import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { DocumentoFiscal } from '../models/documentoFiscal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-documentos-fiscales',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateDocumentosFiscalesComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public companias: CheesyObject[] = [];
    public SiNo: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() DocumentoFiscal: DocumentoFiscal = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            docfis_nid:  [0],
            cia_nid:  ['', Validators.required],
            docfis_vcodigo:  ['', Validators.required],
            docfis_vdescripcion:  ['', Validators.required],
            docfis_nrebajarinventarios:  ['', Validators.required],
            docfis_ngenerarcxc:  ['', Validators.required],
            docfis_nsts:  ['']
          });
        this.SiNo = [
            {id:'', text:'...', obj:{}},
            {id:'1', text:'SI', obj:{}},
            {id:'0', text:'NO', obj:{}}
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
        if (this.DocumentoFiscal && this.DocumentoFiscal?.docfis_nid && this.DocumentoFiscal?.docfis_nid > 0) {
            this.docfis_nid?.setValue(this.DocumentoFiscal?.docfis_nid)
            this.cia_nid?.setValue(this.searchById(this.DocumentoFiscal?.cia_nid, this.companias))
            this.docfis_vcodigo?.setValue(this.DocumentoFiscal?.docfis_vcodigo)
            this.docfis_vdescripcion?.setValue(this.DocumentoFiscal?.docfis_vdescripcion)
            this.docfis_nrebajarinventarios?.setValue(this.searchById(this.DocumentoFiscal?.docfis_nrebajarinventarios, this.SiNo))
            this.docfis_ngenerarcxc?.setValue(this.searchById(this.DocumentoFiscal?.docfis_ngenerarcxc, this.SiNo))
            this.docfis_nsts?.setValue(this.DocumentoFiscal?.docfis_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _DocumentoFiscal: DocumentoFiscal = {
                docfis_nid: this.docfis_nid?.value > 0 ? this.docfis_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                docfis_vcodigo: this.docfis_vcodigo?.value.trim().toUpperCase(),
                docfis_vdescripcion: this.docfis_vdescripcion?.value.trim().toUpperCase(),
                docfis_nrebajarinventarios: this.docfis_nrebajarinventarios?.value.id > 0 ? this.docfis_nrebajarinventarios?.value.id : 0,
                docfis_ngenerarcxc: this.docfis_ngenerarcxc?.value.id > 0 ? this.docfis_ngenerarcxc?.value.id : 0,
                docfis_nsts: 1
            }
            this.dbapi.save(_DocumentoFiscal).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/ventas/documentosfiscales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.docfis_nid?.setValue(0);
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

    get docfis_nid() { return this.createForm.get('docfis_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get docfis_vcodigo() { return this.createForm.get('docfis_vcodigo') };
    get docfis_vdescripcion() { return this.createForm.get('docfis_vdescripcion') };
    get docfis_nrebajarinventarios() { return this.createForm.get('docfis_nrebajarinventarios') };
    get docfis_ngenerarcxc() { return this.createForm.get('docfis_ngenerarcxc') };
    get docfis_nsts() { return this.createForm.get('docfis_nsts') };

}
