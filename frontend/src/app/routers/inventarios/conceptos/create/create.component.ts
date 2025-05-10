import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { ConceptoInventario } from '../models/conceptoInventario';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-conceptos-inventarios',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateConceptosInventariosComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public companias: CheesyObject[] = [];
    public tiposConceptoInv: CheesyObject[] = [];
    public bodegaConfiguracion: CheesyObject[] = [];
    public SiNo: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() conceptoInventario: ConceptoInventario = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            coninv_nid:  [0],
            cia_nid:  ['', Validators.required],
            coninv_vdescripcion:  ['', Validators.required],
            coninv_vobservaciones:  ['', Validators.required],
            coninv_ntipo:  ['', Validators.required],
            coninv_nbodegaconfigurada:  ['', Validators.required],
            coninv_nisvencosteo:  ['', Validators.required],
            coninv_ndevolucion:  ['', Validators.required],
            coninv_nsts:  ['']
          });
        this.tiposConceptoInv = [
            {id:'', text:'...', obj:{}},
            {id:'1', text:'ENTRADA', obj:{}},
            {id:'2', text:'SALIDA', obj:{}},
            {id:'3', text:'TRANSFERENCIA', obj:{}}
        ];
        this.bodegaConfiguracion = [
            {id:'', text:'...', obj:{}},
            {id:'0', text:'NO', obj:{}},
            {id:'1', text:'BODEGA PRINCIPAL', obj:{}},
            {id:'2', text:'BODEGA DEVOLUCIONES', obj:{}},
        ];
        this.SiNo = [
            {id:'', text:'...', obj:{}},
            {id:'1', text:'SI', obj:{}},
            {id:'0', text:'NO', obj:{}},
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
        if (this.conceptoInventario && this.conceptoInventario?.coninv_nid && this.conceptoInventario?.coninv_nid > 0) {
            this.coninv_nid?.setValue(this.conceptoInventario?.coninv_nid)
            this.cia_nid?.setValue(this.searchById(this.conceptoInventario?.cia_nid, this.companias))
            this.coninv_vdescripcion?.setValue(this.conceptoInventario?.coninv_vdescripcion)
            this.coninv_vobservaciones?.setValue(this.conceptoInventario?.coninv_vobservaciones)
            this.coninv_ntipo?.setValue(this.searchById(this.conceptoInventario?.coninv_ntipo, this.tiposConceptoInv))
            this.coninv_nbodegaconfigurada?.setValue(this.searchById(this.conceptoInventario?.coninv_nbodegaconfigurada, this.tiposConceptoInv))
            this.coninv_nisvencosteo?.setValue(this.searchById(this.conceptoInventario?.coninv_nisvencosteo, this.SiNo))
            this.coninv_ndevolucion?.setValue(this.searchById(this.conceptoInventario?.coninv_ndevolucion, this.SiNo))
            this.coninv_nsts?.setValue(this.conceptoInventario?.coninv_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _conceptoInventario: ConceptoInventario = {
                coninv_nid: this.coninv_nid?.value > 0 ? this.coninv_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                coninv_vdescripcion: this.coninv_vdescripcion?.value.trim().toUpperCase(),
                coninv_vobservaciones: this.coninv_vobservaciones?.value.trim().toUpperCase(),
                coninv_ntipo: this.coninv_ntipo?.value.id,
                coninv_nbodegaconfigurada: this.coninv_nbodegaconfigurada?.value.id,
                coninv_nisvencosteo: this.coninv_nisvencosteo?.value.id,
                coninv_ndevolucion: this.coninv_ndevolucion?.value.id,
                coninv_nsts: 1
            }
            this.dbapi.save(_conceptoInventario).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/inventarios/conceptosinventarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.coninv_nid?.setValue(0);
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

    get coninv_nid() { return this.createForm.get('coninv_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get coninv_vdescripcion() { return this.createForm.get('coninv_vdescripcion') };
    get coninv_vobservaciones() { return this.createForm.get('coninv_vobservaciones') };
    get coninv_ntipo() { return this.createForm.get('coninv_ntipo') };
    get coninv_nbodegaconfigurada() { return this.createForm.get('coninv_nbodegaconfigurada') };
    get coninv_nisvencosteo() { return this.createForm.get('coninv_nisvencosteo') };
    get coninv_ndevolucion() { return this.createForm.get('coninv_ndevolucion') };
    get coninv_nsts() { return this.createForm.get('coninv_nsts') };

}
