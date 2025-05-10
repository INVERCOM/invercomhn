import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { PagoLote } from '../models/pagoLote';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';

interface CheesyObject { id: string; text: string; obj: object}
@Component({
  selector: 'app-create-pagos-lotes',
  templateUrl: './create-pagos-lotes.component.html',
  styleUrls: ['./create-pagos-lotes.component.scss']
})

export class CreatePagosLotesComponent {
	public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public sucursales: CheesyObject[] = [];
    public ventasLotes: CheesyObject[] = [];
	public monedas: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() pagoLote: PagoLote = {};
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            paglot_nid:  [0],
            sucu_nid:  ['', Validators.required],
			venlot_nid:  ['', Validators.required],
            mone_nid:  ['', Validators.required],
            paglot_vnumerodocumento:  [''],
			paglot_dfecha:  ['', Validators.required],
			paglot_fimporte:  ['', Validators.required],
			// paglot_ffactorcambio:  ['', Validators.required],
			// paglot_fimportelocal:  ['', Validators.required],
			paglot_vdocumentoreferecnia:  [''],
			paglot_vobservaciones:  [''],
            paglot_nsts:  ['']
        });
		authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.consultas();
        });
    }

	consultas(){
		this.getSucursales();
		this.getMonedas();
	}

	ngOnChanges() {
        if (this.pagoLote && this.pagoLote?.paglot_nid && this.pagoLote?.paglot_nid > 0) {
            this.paglot_nid?.setValue(this.pagoLote?.paglot_nid)
            this.sucu_nid?.setValue(this.searchById(this.pagoLote?.sucu_nid, this.sucursales))
            this.venlot_nid?.setValue(this.searchById(this.pagoLote?.venlot_nid, this.ventasLotes))
            this.mone_nid?.setValue(this.searchById(this.pagoLote?.mone_nid, this.monedas))
            this.paglot_vnumerodocumento?.setValue(this.pagoLote?.paglot_vnumerodocumento)
			this.paglot_dfecha?.setValue(this.pagoLote?.paglot_dfecha)
			this.paglot_fimporte?.setValue(this.pagoLote?.paglot_fimporte)
			// this.paglot_ffactorcambio?.setValue(this.pagoLote?.paglot_ffactorcambio)
			// this.paglot_fimportelocal?.setValue(this.pagoLote?.paglot_fimportelocal)
            this.paglot_vdocumentoreferecnia?.setValue(this.pagoLote?.paglot_vdocumentoreferecnia)
            this.paglot_vobservaciones?.setValue(this.pagoLote?.paglot_vobservaciones)
            this.paglot_nsts?.setValue(this.pagoLote?.paglot_nsts)
        }
    }

    getSucursales() {
        this.sucursales = [{id:'', text:'...', obj:{}}];
		this.sucu_nid?.setValue({id:'', text:'...', obj:{}});
        this.dbapi.getSucursales().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['sucu_nid'], text:data[key]['sucu_vnombre'], obj:data[key]}
                    this.sucursales = [ ...this.sucursales, item ];
                }
            console.log(this.sucursales);
            
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

	getMonedas() {
        // this.monedas = [{id:'', text:'...', obj:{}}];
		// this.mone_nid?.setValue({id:'', text:'...', obj:{}});
        // this.dbapi.getMonedas().pipe(take(1)).subscribe({ next: (data: any) => {
        //         if ( !data || data == null || data === '' ) {
        //             console.log('Error consultando compañías');
        //             return;
        //         }
        //         for (const key in data) {
        //             const item={id:data[key]['mone_nid'], text:data[key]['mone_vnombre'], obj:data[key]}
        //             this.monedas = [ ...this.monedas, item ];
        //         }
        //     }, error: (err) => {
        //         console.log(err);
        //         this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
        //     }
        // });
    }

    getVentasLotes() {
        this.ventasLotes = [{id:'', text:'...', obj:{}}];
		this.venlot_nid?.setValue({id:'', text:'...', obj:{}});
        if (this.sucu_nid?.value && this.sucu_nid?.value.id > 0) {
            this.dbapi.getVentasLotes(this.sucu_nid?.value.id).pipe(take(1)).subscribe({ next: (data: any) => {
                    if ( !data || data == null || data === '' ) {
                        console.log('Error consultando compañías');
                        return;
                    }
                    console.log(data);
                    
                    for (const key in data) {
                        const item={id:data[key]['venlot_nid'], text:data[key]['_tlotes']['lote_vcodigo'] + ' - ' + data[key]['_tlotes']['lote_vnombre'] + ' - ' + data[key]['_tclis']['cli_videntidad'] + ' - ' + data[key]['_tclis']['cli_vnombre'], obj:data[key]}
                        this.ventasLotes = [ ...this.ventasLotes, item ];
                    }
                    this.ventasLotes.length == 1 && this.venlot_nid?.setValue(this.ventasLotes[0]);
                }, error: (err) => {
                    console.log(err);
                    this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            });
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _Lote: PagoLote = {
                paglot_nid: this.paglot_nid?.value > 0 ? this.paglot_nid?.value : null,
                sucu_nid: this.sucu_nid?.value.id,
				venlot_nid: this.venlot_nid?.value.id,
				mone_nid: this.mone_nid?.value,
                paglot_vnumerodocumento: this.paglot_vnumerodocumento?.value.trim().toUpperCase(),
                paglot_dfecha: this.paglot_dfecha?.value.trim().toUpperCase(),
				paglot_fimporte: this.paglot_fimporte?.value,
				paglot_ffactorcambio: 1,
				paglot_fimportelocal: this.paglot_fimporte?.value,
				paglot_vdocumentoreferecnia: this.paglot_vdocumentoreferecnia?.value.trim().toUpperCase(),
				paglot_vobservaciones: this.paglot_vobservaciones?.value.trim().toUpperCase(),
                paglot_nsts: 1
            }
            this.dbapi.save(_Lote).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/proyectos/pagoslotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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

    setSucursal(sucursal: any){
        this.mone_nid?.setValue('')
        if (sucursal && sucursal.id > 0) {
            this.mone_nid?.setValue(sucursal.obj['cias']['mone_nid']);
        }
    }
    
    setImportePago(ventaLote: any){
        this.paglot_fimporte?.setValue(0)
        if (ventaLote && ventaLote.id > 0) {
            this.paglot_fimporte?.setValue(ventaLote.obj['venlot_fcuotanivelada']);
        }
    }

    limpiarForm(){
        this.createForm.reset();
        this.paglot_nid?.setValue(0);
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

    get paglot_nid() { return this.createForm.get('paglot_nid') };
    get sucu_nid() { return this.createForm.get('sucu_nid') };
	get venlot_nid() { return this.createForm.get('venlot_nid') };
    get mone_nid() { return this.createForm.get('mone_nid') };
    get paglot_vnumerodocumento() { return this.createForm.get('paglot_vnumerodocumento') };
	get paglot_dfecha() { return this.createForm.get('paglot_dfecha') };
	get paglot_fimporte() { return this.createForm.get('paglot_fimporte') };
	// get paglot_ffactorcambio() { return this.createForm.get('paglot_ffactorcambio') };
	// get paglot_fimportelocal() { return this.createForm.get('paglot_fimportelocal') };
    get paglot_vdocumentoreferecnia() { return this.createForm.get('paglot_vdocumentoreferecnia') };
    get paglot_vobservaciones() { return this.createForm.get('paglot_vobservaciones') };
    get paglot_nsts() { return this.createForm.get('paglot_nsts') };

}
