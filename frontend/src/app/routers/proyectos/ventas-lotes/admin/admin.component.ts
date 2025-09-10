import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { VentaLote, VentaLoteSts, } from '../models/ventaLote';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [MessageService]
})
export class AdminLotesComponent implements OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: VentaLote[] = [];
    public item: VentaLote = {};
    public selectedData: VentaLote[] = [];
    public submitted: boolean = false;
    public cols: any[] = [];
    public statuses: any[] = [];
    public dataOptions: any[] = [];
    public dataValue: any = [1];
    public rowsPerPageOptions = [5, 10, 20];
    private $destroy: Subject<void> = new Subject();
    constructor(
        private dbapi: DbapiService,
        private messageService: MessageService,
        public authS: AuthService,
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/proyectos/ventaLotes').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: ventas lotes');
                this.getData();
            }
        });
        this.cols = [
            { field: 'venlot_nid', header: 'ID' },
            { field: 'lote_vnombre', header: 'Lote' },
            { field: 'cli_vnombre', header: 'Cliente' },
            { field: 'venlot_fpreciopipe', header: 'Precio' },
            { field: 'venlot_fprimapipe', header: 'Prima' },
            { field: 'venlot_fvalorfinalpipe', header: 'Valor final' },
            { field: 'venlot_fcuotaniveladapipe', header: 'Cuota mensual' },
            { field: 'venlot_dfechapipe', header: 'Fecha' },
            { field: 'venlot_dfechaprimerpagopipe', header: 'Fecha primer pago' },
			{ field: 'venlot_vsts', header: 'Estado' },
        ];
        this.dataOptions = [
            { name: 'ACTIVOS', value: [1] },
            { name: 'ELIMINADOS', value: [0] },
            { name: 'TODOS', value: [-1, 0, 1] }
        ];
        this.getData();
    }

    getData(){
        this.isLoadingTable = true
        this.dbapi.getAll(this.dataValue).pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['lote_vnombre'] = val['_tlotes'] ? val['_tlotes']['lote_vnombre'] : '';
                val['cli_vnombre'] = val['_tclis'] ? val['_tclis']['cli_vnombre'] : '';
                val['venlot_fpreciopipe'] = this.currencyPipe.transform(val['venlot_fprecio'], ' ');
                val['venlot_fprimapipe'] = this.currencyPipe.transform(val['venlot_fprima'], ' ');
                val['venlot_fvalorfinalpipe'] = this.currencyPipe.transform(val['venlot_fvalorfinal'], ' ');
                val['venlot_fcuotaniveladapipe'] = this.currencyPipe.transform(val['venlot_fcuotanivelada'], ' ');
                val['venlot_dfechapipe'] = this.datePipe.transform(val['venlot_dfecha'], 'dd-MM-yyyy');
                val['venlot_dfechaprimerpagopipe'] = this.datePipe.transform(val['venlot_dfechaprimerpago'], 'dd-MM-yyyy');
                val['venlot_vsts'] = val['venlot_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
            });
            return res;
        }),
        take(1)).subscribe({ next: (data: any): void => {
                console.log(data);
                this.data = [...data];
                this.isLoadingTable = false;
            }, error: (err) => {
                console.log(err);
                this.isLoadingTable = false;
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
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

    confirmDeleteSelected() {
        const deleteData: VentaLoteSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ venlot_nid: row.venlot_nid, venlot_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/proyectos/lotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                    this.deleteItemsDialog = false;
                    this.selectedData = [];
                    this.getData();
                }
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    confirmDelete() {
        const deleteItem: VentaLoteSts = { venlot_nid: this.item.venlot_nid, venlot_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/proyectos/lotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 });
                this.deleteItemDialog = false;
                this.item = {};
                this.getData();
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    confirmRestart() {
        this.item.venlot_nsts = 1;
        this.dbapi.setSts(this.item).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/proyectos/lotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 });
                this.restartItemDialog = false;
                this.item = {};
                this.getData();
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    confirmRestartSelected() {
        this.selectedData.forEach(row => { row.venlot_nsts = 1; });
        this.item.venlot_nsts = 1;
        this.dbapi.setBulkSts(this.selectedData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/proyectos/lotes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
                    this.restartItemsDialog = false;
                    this.selectedData = [];
                    this.getData();
                }
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].venlot_nid === id) {
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
        if(res['type'] == 'success'){
            this.getData();
            this.createDialog = false;
            this.editDialog = false;
        }
    }

    clearDataSelected(){
        this.selectedData = [];
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }
}
