import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { PagoLote, PagoLoteSts } from '../models/pagoLote';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-admin-pagos-clientes',
    templateUrl: './admin-pagos-clientes.component.html',
    styleUrls: ['./admin-pagos-clientes.component.scss'],
    providers: [MessageService]
})
export class AdminPagosClientesComponent implements OnDestroy {
    public createForm: FormGroup;
    public ventasLotes: CheesyObject[] = [];
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: PagoLote[] = [];
    public item: PagoLote = {};
    public selectedData: PagoLote[] = [];
    public submitted: boolean = false;
    public cols: any[] = [];
    public statuses: any[] = [];
    public dataOptions: any[] = [];
    public dataValue: any = [1];
    public rowsPerPageOptions = [5, 10, 20];
    private $destroy: Subject<void> = new Subject();
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        private messageService: MessageService,
        public datePipe: DatePipe,
        public currencyPipe: CurrencyPipe,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            venlot_nid:  [''],
        });
        this.cols = [
            { field: 'paglot_vnumerodocumento', header: 'Numero pago' },
            { field: 'paglot_dfechapipe', header: 'Fecha' },
            { field: 'paglot_fimportepipe', header: 'Importe' },
            { field: 'paglot_fimporteactualpipe', header: 'Saldo' },
        ];
        this.dataOptions = [
            { name: 'ACTIVOS', value: [1] },
            { name: 'ELIMINADOS', value: [0] },
            { name: 'TODOS', value: [-1, 0, 1] }
        ];
        this.getVentasLotes();
    }

    getData(venlot_nid: any){
        console.log(this.venlot_nid?.value);
        
        if (venlot_nid?.value && venlot_nid?.value.id > 0) {
            this.isLoadingTable = true
            this.dbapi.getAllPagosByVentasLotes(this.venlot_nid?.value.id).pipe(take(1)).subscribe({ next: (data: any): void => {
                const predata = []; let saldoActual = 0;
                    if (data && data[0]) {
                        saldoActual += parseFloat(data[0]['_tvenlots']['venlot_fvalorfinal'])
                        predata.push({
                            paglot_vnumerodocumento:'VALOR INICIAL',
                            paglot_dfecha: data[0]['_tvenlots']['venlot_dfecha'],
                            paglot_dfechapipe: this.datePipe.transform( data[0]['_tvenlots']['venlot_dfecha'], 'dd-MM-yyyy' ),
                            paglot_fimporte: saldoActual,
                            paglot_fimportepipe: this.currencyPipe.transform( saldoActual, ' '),
                            paglot_fimporteactual: saldoActual,
                            paglot_fimporteactualpipe: this.currencyPipe.transform( saldoActual, ' '),
                        });
                        for (let i = 0; i < data.length; i++) {
                            const row = data[i];
                            saldoActual = saldoActual - parseFloat(row['paglot_fimportelocal'],)
                            predata.push({
                                paglot_vnumerodocumento: row['paglot_vnumerodocumento'],
                                paglot_dfecha: row['paglot_dfecha'],
                                paglot_dfechapipe: this.datePipe.transform( row['paglot_dfecha'], 'dd-MM-yyyy' ),
                                paglot_fimporte: row['paglot_fimportelocal'],
                                paglot_fimportepipe: this.currencyPipe.transform( row['paglot_fimportelocal'], ' '),
                                paglot_fimporteactual: saldoActual,
                                paglot_fimporteactualpipe: this.currencyPipe.transform( saldoActual, ' '),
                            });       
                        }
                    }
                    this.data = [...predata];
                    console.log(this.data);
                    
                    this.isLoadingTable = false;
                }, error: (err) => {
                    console.log(err);
                    this.isLoadingTable = false;
                    this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            })
        }
    }

    openNew() {
        this.item = {};
        this.submitted = false;
        this.createDialog = true;
    }

    deleteSelectedData() {
        this.deleteItemsDialog = true;
    }

    restartSelectedItems() {
        this.restartItemsDialog = true;
    }

    editRow(item: any) {
        this.item = { ...item };
        this.editDialog = true;
    }

    deleteRow(item: any) {
        this.deleteItemDialog = true;
        this.item = { ...item };
    }

    restartRow(item: any) {
        this.restartItemDialog = true;
        this.item = { ...item };
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].paglot_nid === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    deleteSelectedItems() {
        this.deleteItemsDialog = true;
    }

    editEvent(res: any){
        this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 });
    }

    clearDataSelected(){
        this.selectedData = [];
    }

    getVentasLotes() {
        this.ventasLotes = [{id:'', text:'...', obj:{}}];
		this.venlot_nid?.setValue({id:'', text:'...', obj:{}});
        this.dbapi.getVentasLotes().pipe(take(1)).subscribe({ next: (data: any) => {
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

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get venlot_nid() { return this.createForm.get('venlot_nid') };
}
