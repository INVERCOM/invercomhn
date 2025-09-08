import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { VentaLote } from '../models/ventaLote';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-ventas-lotes',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateVentaLotesComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public lotes: CheesyObject[] = [];
    public clientes: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    private $destroy: Subject<void> = new Subject();
    @Input() ventaLote: VentaLote = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        private authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/proyectos/lotes').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            console.log('Event socket: lotes');
            this.getLotes();
        });
        skNsCore.fromEvent('/ventas/clientes').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            console.log('Event socket: clientes');
            this.getClientes();
        });
        this.createForm = _builder.group({
            venlot_nid:  [0],
            lote_nid:  ['', Validators.required],
            cli_nid:  ['', Validators.required],
            venlot_dfecha:  ['', Validators.required],
            venlot_fprecio:  ['', Validators.required],
            venlot_fprima:  ['', Validators.required],
            venlot_fvalorfinal:  ['', Validators.required],
            venlot_ftasainteresanual:  ['', Validators.required],
            venlot_nnumeromeses:  ['', Validators.required],
            venlot_ndiapago:  ['', Validators.required],
            venlot_ndiamaxpago:  ['', Validators.required],
            venlot_fcuotanivelada:  ['', Validators.required],
            venlot_dfechaprimerpago:  ['', Validators.required],
            venlot_vobservaciones:  [''],
            venlot_nsts:  ['']
          });
        this.getLotes();
        this.getClientes();
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.ventaLote && this.ventaLote?.venlot_nid && this.ventaLote?.venlot_nid > 0) {
            this.venlot_nid?.setValue(this.ventaLote?.venlot_nid)
            this.lote_nid?.setValue(this.searchById(this.ventaLote?.lote_nid, this.lotes))
            this.cli_nid?.setValue(this.searchById(this.ventaLote?.cli_nid, this.clientes))
            this.venlot_dfecha?.setValue(this.ventaLote?.venlot_dfecha)
            this.venlot_fprecio?.setValue(this.ventaLote?.venlot_fprecio)
            this.venlot_fprima?.setValue(this.ventaLote?.venlot_fprima)
            this.venlot_fvalorfinal?.setValue(this.ventaLote?.venlot_fvalorfinal)
            this.venlot_ftasainteresanual?.setValue(this.ventaLote?.venlot_ftasainteresanual)
            this.venlot_nnumeromeses?.setValue(this.ventaLote?.venlot_nnumeromeses)
            this.venlot_ndiapago?.setValue(this.ventaLote?.venlot_ndiapago)
            this.venlot_ndiamaxpago?.setValue(this.ventaLote?.venlot_ndiamaxpago)
            this.venlot_fcuotanivelada?.setValue(this.ventaLote?.venlot_fcuotanivelada)
            this.venlot_dfechaprimerpago?.setValue(this.ventaLote?.venlot_dfechaprimerpago)
            this.venlot_vobservaciones?.setValue(this.ventaLote?.venlot_vobservaciones)
            this.venlot_nsts?.setValue(this.ventaLote?.venlot_nsts)
        }
    }

    getLotes() {
        this.lotes = [{id: '', text: '...', obj:{}}];
        this.lote_nid?.setValue('');
        this.dbapi.getLotes().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando unidades de medida');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['lote_nid'], text:data[key]['lote_vcodigo'] + ' - ' + data[key]['lote_vnombre'], obj:data[key]}
                    this.lotes = [ ...this.lotes, item ];
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getClientes() {
        this.clientes = [{id: '', text: '...', obj:{}}];
        this.cli_nid?.setValue('');
        this.dbapi.getClientes().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando unidades de medida');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['cli_nid'], text:data[key]['cli_videntidad'] + ' - ' + data[key]['cli_vnombre'], obj:data[key]}
                    this.clientes = [ ...this.clientes, item ];
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _ventaLote: VentaLote = {
                venlot_nid: this.venlot_nid?.value > 0 ? this.venlot_nid?.value : null,
                lote_nid: this.lote_nid?.value.id,
                cli_nid: this.cli_nid?.value.id,
                venlot_dfecha: this.venlot_dfecha?.value,
                venlot_fprecio: this.venlot_fprecio?.value,
                venlot_fprima: this.venlot_fprima?.value,
                venlot_fvalorfinal: this.venlot_fvalorfinal?.value,
                venlot_ftasainteresanual: this.venlot_ftasainteresanual?.value,
                venlot_nnumeromeses: this.venlot_nnumeromeses?.value,
                venlot_ndiapago: this.venlot_ndiapago?.value,
                venlot_ndiamaxpago: this.venlot_ndiamaxpago?.value,
                venlot_fcuotanivelada: this.venlot_fcuotanivelada?.value,
                venlot_dfechaprimerpago: this.venlot_dfechaprimerpago?.value,
                venlot_vobservaciones: this.venlot_vobservaciones?.value,
                venlot_nsts: 1
            }
            this.dbapi.save(_ventaLote).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/proyectos/ventaLotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                        this.skNsCore.notificarUpsert('/proyectos/lotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                        this.getLotes();
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
        this.venlot_nid?.setValue(0);
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

    setPrecio(lote: any){
        let precioLote = '';
        if (lote && lote['value'] && lote['value']['id'] > 0) {
            precioLote = lote['value']['obj']['lote_fprecio']
        }
        this.venlot_fprecio?.setValue(precioLote);
        this.setValorFinal()
    }

    setValorFinal(){
        let valorFinal: any = '';
        if (this.venlot_fprecio?.value > -1 && this.venlot_fprima?.value > -1) {
            valorFinal = this.venlot_fprecio?.value - this.venlot_fprima?.value
        }
        this.venlot_fvalorfinal?.setValue(valorFinal)
        this.setCuotraMensual();
    }

    setCuotraMensual(){
        let cuotaMensual: number = 0;
        if (this.venlot_fvalorfinal?.value > -1 && this.venlot_nnumeromeses?.value > 0) {
            if (this.venlot_ftasainteresanual?.value > 0) {
                cuotaMensual = parseFloat((this.venlot_fvalorfinal?.value / this.venlot_nnumeromeses?.value)?.toFixed(2))
            } else {
                cuotaMensual = parseFloat((this.venlot_fvalorfinal?.value / this.venlot_nnumeromeses?.value)?.toFixed(2))
            }
        }
        this.venlot_fcuotanivelada?.setValue(cuotaMensual)
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get venlot_nid() { return this.createForm.get('venlot_nid') };
    get lote_nid() { return this.createForm.get('lote_nid') };
    get cli_nid() { return this.createForm.get('cli_nid') };
    get venlot_dfecha() { return this.createForm.get('venlot_dfecha') };
    get venlot_fprecio() { return this.createForm.get('venlot_fprecio') };
    get venlot_fprima() { return this.createForm.get('venlot_fprima') };
    get venlot_fvalorfinal() { return this.createForm.get('venlot_fvalorfinal') };
    get venlot_ftasainteresanual() { return this.createForm.get('venlot_ftasainteresanual') };
    get venlot_nnumeromeses() { return this.createForm.get('venlot_nnumeromeses') };
    get venlot_ndiapago() { return this.createForm.get('venlot_ndiapago') };
    get venlot_ndiamaxpago() { return this.createForm.get('venlot_ndiamaxpago') };
    get venlot_fcuotanivelada() { return this.createForm.get('venlot_fcuotanivelada') };
    get venlot_dfechaprimerpago() { return this.createForm.get('venlot_dfechaprimerpago') };
    get venlot_vobservaciones() { return this.createForm.get('venlot_vobservaciones') };
    get venlot_nsts() { return this.createForm.get('venlot_nsts') };

}
