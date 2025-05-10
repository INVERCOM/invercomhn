import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { FormasPagos } from '../models/formasPagos';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-formas-pagos',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateFormasPagosComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public companias: CheesyObject[] = [];
    public SiNo: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() FormaPago: FormasPagos = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            forpag_nid:  [0],
            cia_nid:  ['', Validators.required],
            forpag_vcodigo:  ['', Validators.required],
            forpag_vdescripcion:  ['', Validators.required],
            forpag_ndprocentajeadicional:  ['', Validators.required],
            forpag_nsts:  ['']
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
        if (this.FormaPago && this.FormaPago?.forpag_nid && this.FormaPago?.forpag_nid > 0) {
            this.forpag_nid?.setValue(this.FormaPago?.forpag_nid)
            this.cia_nid?.setValue(this.searchById(this.FormaPago?.cia_nid, this.companias))
            this.forpag_vcodigo?.setValue(this.FormaPago?.forpag_vcodigo)
            this.forpag_vdescripcion?.setValue(this.FormaPago?.forpag_vdescripcion)
            this.forpag_ndprocentajeadicional?.setValue(this.FormaPago?.forpag_ndprocentajeadicional)
            this.forpag_nsts?.setValue(this.FormaPago?.forpag_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _FormaPago: FormasPagos = {
                forpag_nid: this.forpag_nid?.value > 0 ? this.forpag_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                forpag_vcodigo: this.forpag_vcodigo?.value.trim().toUpperCase(),
                forpag_vdescripcion: this.forpag_vdescripcion?.value.trim().toUpperCase(),
                forpag_ndprocentajeadicional: this.forpag_ndprocentajeadicional?.value > 0 ? this.forpag_ndprocentajeadicional?.value : 0,
                forpag_nsts: 1
            }
            this.dbapi.save(_FormaPago).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/ventas/formaspagos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.forpag_nid?.setValue(0);
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

    get forpag_nid() { return this.createForm.get('forpag_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get forpag_vcodigo() { return this.createForm.get('forpag_vcodigo') };
    get forpag_vdescripcion() { return this.createForm.get('forpag_vdescripcion') };
    get forpag_ndprocentajeadicional() { return this.createForm.get('forpag_ndprocentajeadicional') };
    get forpag_nsts() { return this.createForm.get('forpag_nsts') };

}
