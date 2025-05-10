import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { RegistroFiscal } from '../models/registroFiscal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-registros-fiscales',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateRegistrosFiscalesComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public puntosEmision: CheesyObject[] = [];
    public DocumentosFiscales: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() RegistroFiscal: RegistroFiscal = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            regfis_nid:  [0],
            punemi_nid:  ['', Validators.required],
            docfis_nid:  ['', Validators.required],
            regfis_vcai:  ['', Validators.required],
            regfis_vnumeroautorizacion:  ['', Validators.required],
            regfis_ninicio:  ['', Validators.required],
            regfis_nfin:  ['', Validators.required],
            regfis_dfechamaxemision:  ['', Validators.required],
            regfis_nsts:  ['']
          });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getPuntosEmison();
            this.getDocumentosFiscales();
        });
    }

    ngOnInit() {}

    getPuntosEmison() {
        this.puntosEmision = [];
        this.punemi_nid?.setValue('');
        this.dbapi.getPuntosEmison().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['punemi_nid'], text:data[key]['punemi_vcodigo'] + ' - ' + data[key]['punemi_vdescripcion'], obj:data[key]}
                    this.puntosEmision = [ ...this.puntosEmision, item ];
                }
                this.puntosEmision.length == 1 && this.punemi_nid?.setValue(this.puntosEmision[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }
    getDocumentosFiscales() {
        this.DocumentosFiscales = [];
        this.docfis_nid?.setValue('');
        this.dbapi.getDocumentosFiscales().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['docfis_nid'], text:data[key]['docfis_vdescripcion'], obj:data[key]}
                    this.DocumentosFiscales = [ ...this.DocumentosFiscales, item ];
                }
                this.DocumentosFiscales.length == 1 && this.docfis_nid?.setValue(this.DocumentosFiscales[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    ngOnChanges() {
        if (this.RegistroFiscal && this.RegistroFiscal?.docfis_nid && this.RegistroFiscal?.docfis_nid > 0) {
            this.regfis_nid?.setValue(this.RegistroFiscal?.regfis_nid)
            this.punemi_nid?.setValue(this.searchById(this.RegistroFiscal?.punemi_nid, this.puntosEmision))
            this.docfis_nid?.setValue(this.searchById(this.RegistroFiscal?.docfis_nid, this.DocumentosFiscales))
            this.regfis_vcai?.setValue(this.RegistroFiscal?.regfis_vcai)
            this.regfis_vnumeroautorizacion?.setValue(this.RegistroFiscal?.regfis_vnumeroautorizacion)
            this.regfis_ninicio?.setValue(this.RegistroFiscal?.regfis_ninicio)
            this.regfis_nfin?.setValue(this.RegistroFiscal?.regfis_nfin)
            this.regfis_dfechamaxemision?.setValue(this.RegistroFiscal?.regfis_dfechamaxemision)
            this.regfis_nsts?.setValue(this.RegistroFiscal?.regfis_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _RegistroFiscal: RegistroFiscal = {
                regfis_nid: this.regfis_nid?.value > 0 ? this.regfis_nid?.value : null,
                punemi_nid: this.punemi_nid?.value.id,
                docfis_nid: this.docfis_nid?.value.id,
                regfis_vcai: this.regfis_vcai?.value.trim().toUpperCase(),
                regfis_vnumeroautorizacion: this.regfis_vnumeroautorizacion?.value.trim().toUpperCase(),
                regfis_ninicio: this.regfis_ninicio?.value,
                regfis_nfin: this.regfis_nfin?.value,
                regfis_dfechamaxemision: this.regfis_dfechamaxemision?.value,
                regfis_nsts: 1
            }
            this.dbapi.save(_RegistroFiscal).pipe(take(1)).subscribe({ next: (res: any) => {
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

    get regfis_nid() { return this.createForm.get('regfis_nid') };
    get punemi_nid() { return this.createForm.get('punemi_nid') };
    get docfis_nid() { return this.createForm.get('docfis_nid') };
    get regfis_vcai() { return this.createForm.get('regfis_vcai') };
    get regfis_vnumeroautorizacion() { return this.createForm.get('regfis_vnumeroautorizacion') };
    get regfis_ninicio() { return this.createForm.get('regfis_ninicio') };
    get regfis_nfin() { return this.createForm.get('regfis_nfin') };
    get regfis_dfechamaxemision() { return this.createForm.get('regfis_dfechamaxemision') };
    get regfis_nsts() { return this.createForm.get('regfis_nsts') };

}
