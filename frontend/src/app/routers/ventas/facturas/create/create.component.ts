import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Factura } from '../models/factura';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-create-facturas',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateFacturasComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public puntosEmision: CheesyObject[] = [];
    public registrosFiscales: CheesyObject[] = [];
    public monedas: CheesyObject[] = [];
    public agentesVenta: CheesyObject[] = [];
    public agentesCobro: CheesyObject[] = [];
    public clientes: CheesyObject[] = [];
    public formasPagos: CheesyObject[] = [];
    public tiposFacturas: CheesyObject[] = [];
    public materiales: CheesyObject[] = [];
    public data: any[] = [];
    public subtotal: number = 0;
    public descuento: number = 0;
    public isv: number = 0;
    public total: number = 0;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
     private $destroy: Subject<void> = new Subject();
    @Input() factura: any = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            fact_nid:  [0],
            punemi_nid:  ['', Validators.required],
            cli_nid:  ['', Validators.required],
            forpag_nid:  ['', Validators.required],
            regfis_nid:  ['', Validators.required],
            docfis_nid:  ['', Validators.required],
            mone_nid:  ['', Validators.required],
            mone_nidlocal:  ['', Validators.required],
            fact_nfactorcambio:  ['', Validators.required],
            fact_nvendedor:  ['', Validators.required],
            fact_ncobrador:  ['', Validators.required],
            fact_ntipo:  [''],
            fact_dfecha:  [''],
            fact_dcredito:  [''],
            fact_dfechavencimiento:  [''],
            cli_vrtn:  [''],
            cli_vdireccion:  [''],
            cli_vtelefono:  [''],
            cli_nsts:  [''],
            mater_nid:  [''],

            facdet_fcosto:  [''],
            facdet_fcantidad:  [''],
            facdet_fdescuentosaplicados:  [''],
            facdet_fimpuestosaplicados:  [''],
            facdet_fsubtotal:  [''],
          });
        this.tiposFacturas = [
            {id:'1', text:'CONTADO', obj:{}},
            {id:'2', text:'CREDITO', obj:{}},
        ];
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getMonedas();
            this.getPuntosEmision();
            this.getClientes();
            this.getAgentes();
            this.getFormasPagos();
            this.getMateriales();
        });
    }

    ngOnInit() {

    }

    ngOnChanges() {
        // if (this.factura && this.factura?.fact_nid && this.factura?.fact_nid > 0) {
        //     this.fact_nid?.setValue(this.factura?.fact_nid)
        //     this.punemi_nid?.setValue(this.searchById(this.factura?.punemi_nid, this.puntosEmision))
        //     this.cli_nid?.setValue(this.factura?.cli_nid)
        //     this.cli_videntidad?.setValue(this.factura?.cli_videntidad)
        //     this.cli_vrtn?.setValue(this.factura?.cli_vrtn)
        //     this.cli_vdireccion?.setValue(this.factura?.cli_vdireccion)
        //     this.cli_vtelefono?.setValue(this.factura?.cli_vtelefono)
        //     this.cli_nsts?.setValue(this.factura?.cli_nsts)
        // }
    }

    getPuntosEmision() {
        this.puntosEmision = [];
        this.punemi_nid?.setValue('');
        this.dbapi.getPuntosEmision().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['punemi_nid'], text:data[key]['punemi_vcodigo'] + ' ' + data[key]['punemi_vdireccion'] + ' ' + data[key]['sucus']['sucu_vnombre'] + ' ' + data[key]['sucus']['cias']['cia_vnombre'], obj:data[key]}
                    this.puntosEmision = [ ...this.puntosEmision, item ];
                }
                if ( this.puntosEmision.length == 1 ) {
                    this.punemi_nid?.setValue(this.puntosEmision[0]);
                    this.mone_nidlocal?.setValue(data[0]['sucus']['cias']['mone_nid']);
                    this.getRegistrosFiscalesByPuntoEmision();
                    this.setFactorCambio();
                }
            }, error: (err) => {
                console.log(err);
                this.guardando = false;
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getRegistrosFiscalesByPuntoEmision() {
        this.registrosFiscales = [];
        this.regfis_nid?.setValue('');
        if (this.punemi_nid?.value && this.punemi_nid?.value.id > 0) {
            this.dbapi.getRegistrosFiscalesByPuntoEmision(this.punemi_nid?.value.id).pipe(take(1)).subscribe({ next: (data: any) => {
                    if ( !data || data == null || data === '' ) {
                        console.log('Error consultando registros fiscales');
                        return;
                    }
                    for (const key in data) {
                        const item={id:data[key]['regfis_nid'], text:data[key]['docfiss']['docfis_vcodigo'] + ' ' + data[key]['docfiss']['docfis_vdescripcion']  + ' ' + data[key]['regfis_vcai'], obj:data[key]}
                        this.registrosFiscales = [ ...this.registrosFiscales, item ];
                    }
                    if ( this.registrosFiscales.length == 1 ) {
                        this.regfis_nid?.setValue(this.registrosFiscales[0])
                        this.docfis_nid?.setValue(data[0]['docfis_nid']);
                    }
                }, error: (err) => {
                    console.log(err);
                    this.guardando = false;
                    this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            });
        }
    }

    getClientes() {
        this.clientes = [{id: '', text: '...', obj:{}}];
        this.fact_nid?.setValue('');
        this.dbapi.getClientes().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando unidades de medida');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['fact_nid'], text:data[key]['cli_videntidad'] + ' - ' + data[key]['cli_vnombre'], obj:data[key]}
                    this.clientes = [ ...this.clientes, item ];
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getMonedas() {
        this.monedas = [];
        this.mone_nid?.setValue('');
        this.dbapi.getMonedas().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando monedas');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['mone_nid'], text:data[key]['mone_vnombre'], obj:data[key]}
                    this.monedas = [ ...this.monedas, item ];
                }
                if ( this.monedas.length == 1 ) {
                    this.mone_nid?.setValue(this.monedas[0])
                    this.setFactorCambio();
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getFormasPagos() {
        this.formasPagos = [];
        this.forpag_nid?.setValue('');
        this.dbapi.getFormasPagos().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando formas pagos');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['forpag_nid'], text:data[key]['forpag_vdescripcion'], obj:data[key]}
                    this.formasPagos = [ ...this.formasPagos, item ];
                }
                if ( this.formasPagos.length == 1 ) {
                    this.forpag_nid?.setValue(this.formasPagos[0])
                    this.setFactorCambio();
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getMateriales() {
        this.materiales = [{id: '', text: '...', obj:{}}];
        this.mater_nid?.setValue('');
        this.dbapi.getMateriales().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando materiales');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['mater_nid'], text:data[key]['mater_vcodigo'] + ' - ' + data[key]['mater_vnombre'] + (data[key]['mater_vcodbar'] && data[key]['mater_vcodbar'] != '' && data[key]['mater_vcodigo'] != data[key]['mater_vcodbar'] ? ' - ' + data[key]['mater_vcodbar'] : '' ), obj:data[key]}
                    this.materiales = [ ...this.materiales, item ];
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    getAgentes() {
        this.agentesVenta = [];
        this.agentesCobro = [];
        this.fact_nvendedor?.setValue(null);
        this.fact_ncobrador?.setValue(null);
        this.dbapi.getAgentes().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando unidades de medida');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['agen_nid'], text:data[key]['agen_vcodigo'] + ' - ' + data[key]['agen_vnombre'], obj:data[key]}
                    if (data[key]['agen_ntipo'] === 3) {
                        this.agentesVenta = [ ...this.agentesVenta, item ];
                        this.agentesCobro = [ ...this.agentesCobro, item ];
                    } else if (data[key]['agen_ntipo'] === 1) {
                        this.agentesVenta = [ ...this.agentesVenta, item ];
                    } else if (data[key]['agen_ntipo'] === 2) {
                        this.agentesCobro = [ ...this.agentesCobro, item ];
                    } 
                }
                if ( this.agentesVenta.length == 1 ) {
                    this.fact_nvendedor?.setValue(this.agentesVenta[0])
                }
                if ( this.agentesCobro.length == 1 ) {
                    this.fact_ncobrador?.setValue(this.agentesCobro[0])
                }
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    setFactorCambio(){
        if (this.mone_nid?.value && this.mone_nid?.value.id > 0 && this.mone_nid.value.id === this.mone_nidlocal?.value ) {
            this.fact_nfactorcambio?.setValue(1)
        } else {
            this.fact_nfactorcambio?.setValue('')
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _factura: Factura = {
                fact_nid: this.fact_nid?.value > 0 ? this.fact_nid?.value : null,
                punemi_nid: this.punemi_nid?.value.id,
                regfis_nid: this.regfis_nid?.value.id,
                mone_nid: this.mone_nid?.value.id,
                mone_nidlocal: this.mone_nid?.value.id,
                forpag_nid: this.forpag_nid?.value.id,
                fact_nfactorcambio: this.fact_nfactorcambio?.value,
                fact_ncai: this.regfis_nid?.value.obj['regfis_vcai'],
                fact_ndoc: null,
                fact_nfactura: null,
                fact_ndocreferencia: null,
                fact_ntipo: this.fact_ntipo?.value,
                fact_nvendedor: this.fact_nvendedor?.value.id,
                fact_ncobrador: this.fact_ncobrador?.value.id,
                fact_vdocexoneracion: '',
                fact_nordencompra: '',
                fact_dcredito: this.fact_dcredito?.value,
                fact_dfecha: this.fact_dfecha?.value ? new Date(this.fact_dfecha?.value).getTime() : null,
                fact_dfechavencimiento: this.fact_dfechavencimiento?.value ? new Date(this.fact_dfechavencimiento?.value).getTime() : null,
                fact_dfechacreacion: null,
                fact_vobservaciones: '',
                fact_nisv: this.isv,
                fact_ntotal: this.total,
                fact_vdocreferencia: '',
                fact_vdocreferenciados: '',
                fact_vdocreferenciatres: '',
                fact_nsolocrearfactura: 0,
                fact_nsts: 1,
                _tfacturas_detalle: [...this.data] 
            }
            console.log(_factura);
            this.dbapi.save(_factura).pipe(take(1)).subscribe({ next: (res: any) => {
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
        this.fact_nid?.setValue(0);
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

    setMaterial(material: any){
        console.log('material', material);
        if (material && material.id > 0) {
            this.facdet_fimpuestosaplicados?.setValue(material.obj['mater_nisv'])
            this.facdet_fcosto?.setValue(material.obj['mater_nisvincluido'] > 0 && material.obj['mater_nisv'] > 0 ? material.obj['mater_nprecio'] / (1 + (material.obj['mater_nisv'] / 100)) : material.obj['mater_nprecio'])
        }else{
            this.facdet_fcosto?.setValue(0)
            this.facdet_fimpuestosaplicados?.setValue(0)
        }
        this.calcularDetalle()
    }

    calcularDetalle(){
        if (!(this.facdet_fcosto?.value > 0)) {
            this.facdet_fcosto?.setValue(0);
        }
        if (!(this.facdet_fcantidad?.value > 0)) {
            this.facdet_fcantidad?.setValue(0);
        }
        console.log('facdet_fdescuentosaplicados', this.facdet_fdescuentosaplicados?.value > 0);
        
        if (!(this.facdet_fdescuentosaplicados?.value > 0)) {
            console.log('etrooo');
            
            this.facdet_fdescuentosaplicados?.setValue(0);
        }
        if (!(this.facdet_fimpuestosaplicados?.value > 0)) {
            this.facdet_fimpuestosaplicados?.setValue(0);
        }
        const subTotalBruto = this.facdet_fcosto?.value * this.facdet_fcantidad?.value
        const subTotalNeto = subTotalBruto - this.facdet_fdescuentosaplicados?.value
        const isvValor = subTotalNeto * (this.facdet_fimpuestosaplicados?.value/100)
        const subTotal = subTotalNeto + isvValor
        this.facdet_fsubtotal?.setValue(subTotal)
    }

    calcularTotales(){
        let subtotal = 0
        let descuento = 0
        let isv = 0
        let total = 0
        this.data.forEach((row: any) => {
            subtotal += row.facdet_fcosto * row.facdet_fcantidad
            descuento += row.facdet_fdescuentovalor
            isv += row.facdet_fimpuestosvalor
            total += row.facdet_nsubtotal
        });
        this.subtotal = subtotal
        this.descuento = descuento
        this.isv = isv
        this.total = total
    }

    agregarDetalle(){
        const subTotalBruto = this.facdet_fcosto?.value * this.facdet_fcantidad?.value
        const descuentoValor = subTotalBruto * (this.facdet_fdescuentosaplicados?.value/100)
        const subTotalNeto = subTotalBruto - descuentoValor
        const isvValor = subTotalNeto * (this.facdet_fimpuestosaplicados?.value/100)
        const subTotal = subTotalNeto + isvValor
        const rowDetalle = {
            facdet_nid: null,
            fact_nid: null,
            mater_vdescripcion: this.mater_nid?.value.text,
            mater_nid: this.mater_nid?.value.id,
            facdet_fcantidad: this.facdet_fcantidad?.value,
            facdet_fcosto: this.facdet_fcosto?.value,
            facdet_fdescuentosaplicados: this.facdet_fdescuentosaplicados?.value,
            facdet_fdescuentovalor: descuentoValor,
            facdet_fimpuestosaplicados: this.facdet_fimpuestosaplicados?.value,
            facdet_fimpuestosvalor: isvValor,
            facdet_vdescripcion: '',
            facdet_nsubtotal: subTotal
        }
        this.data.push(rowDetalle)
        this.calcularTotales();
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get fact_nid() { return this.createForm.get('fact_nid') };
    get punemi_nid() { return this.createForm.get('punemi_nid') };
    get cli_nid() { return this.createForm.get('cli_nid') };
    get forpag_nid() { return this.createForm.get('forpag_nid') };
    get regfis_nid() { return this.createForm.get('regfis_nid') };
    get docfis_nid() { return this.createForm.get('docfis_nid') };
    get mone_nid() { return this.createForm.get('mone_nid') };
    get mone_nidlocal() { return this.createForm.get('mone_nidlocal') };
    get fact_nfactorcambio() { return this.createForm.get('fact_nfactorcambio') };
    get fact_nvendedor() { return this.createForm.get('fact_nvendedor') };
    get fact_ncobrador() { return this.createForm.get('fact_ncobrador') };
    get fact_ntipo() { return this.createForm.get('fact_ntipo') };
    get fact_dfecha() { return this.createForm.get('fact_dfecha') };
    get fact_dcredito() { return this.createForm.get('fact_dcredito') };
    get fact_dfechavencimiento() { return this.createForm.get('fact_dfechavencimiento') };
    get cli_nsts() { return this.createForm.get('cli_nsts') };

    get mater_nid() { return this.createForm.get('mater_nid') };
    get facdet_fcosto() { return this.createForm.get('facdet_fcosto') };
    get facdet_fcantidad() { return this.createForm.get('facdet_fcantidad') };
    get facdet_fdescuentosaplicados() { return this.createForm.get('facdet_fdescuentosaplicados') };
    get facdet_fimpuestosaplicados() { return this.createForm.get('facdet_fimpuestosaplicados') };
    get facdet_fsubtotal() { return this.createForm.get('facdet_fsubtotal') };
}
