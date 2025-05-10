import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { FacturaSts } from '../models/factura';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [MessageService]
})
export class AdminFacturasComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: any[] = [];
    public item: any = {};
    public selectedData: any[] = [];
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
        private skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/ventas/clientes+'+this.authS.isValidCia(false).toString()).pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: clientes');
                this.getData();
            }
        });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getData();
        });
        this.cols = [
            { field: 'fact_nid', header: 'ID' },
            { field: 'cli_vnombre', header: 'Nombre completo' },
            { field: 'cli_videntidad', header: 'Identidad' },
            { field: 'cli_vrtn', header: 'RTN' },
            { field: 'cli_vdireccion', header: 'Dirección' },
            { field: 'cli_vtelefono', header: 'Teléfono' },
            { field: 'cli_vsts', header: 'Estado' },
        ];
        this.dataOptions = [
            { name: 'ACTIVOS', value: [1] },
            { name: 'ELIMINADOS', value: [0] },
            { name: 'TODOS', value: [-1, 0, 1] }
        ];
    }

    getData(){
        this.isLoadingTable = true
        this.dbapi.getAll(this.dataValue).pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['cia_vnombre'] = val['cias'] ? val['cias']['cia_vnombre'] : '';
                val['cli_vsts'] = val['fact_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
            });
            return res;
        }),
        take(1)).subscribe({ next: (data: any): void => {
                this.data = [...data];
                this.isLoadingTable = false;
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
          })
    }

    ngOnInit() {
    }

    openNew() {
        this.item = {};
        this.submitted = false;
        this.createDialog = true;
    }

    deleteSelectedData() {
        this.deleteItemsDialog = true;
    }

    editRow(item: any) {
        this.item = { ...item };
        this.editDialog = true;
    }

    deleteRow(item: any) {
        this.deleteItemDialog = true;
        this.item = { ...item };
    }

    deleteSelectedItems() {
        this.deleteItemsDialog = true;
    }

    confirmDeleteSelected() {
        const deleteData: FacturaSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ fact_nid: row.fact_nid, fact_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/ventas/clientes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const deleteItem: FacturaSts = { fact_nid: this.item.fact_nid, fact_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/ventas/clientes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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

    restartRow(item: any) {
        this.restartItemDialog = true;
        this.item = { ...item };
    }

    restartSelectedItems() {
        this.restartItemsDialog = true;
    }

    confirmRestart() {
        const restartItem: FacturaSts = { fact_nid: this.item.fact_nid, fact_nsts: 1}
        this.dbapi.setSts(restartItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/ventas/clientes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const restartData: FacturaSts[] = []
        this.selectedData.forEach(row => { restartData.push({ fact_nid: row.fact_nid, fact_nsts: 1}) });
        this.dbapi.setBulkSts(restartData).pipe(take(1)).subscribe({ next: (res: any) => {
            this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
            if (res['type'] == 'success') {
                this.skNsCore.notificarUpsert('/ventas/clientes', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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

    clearDataSelected(){
        this.selectedData = [];
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].fact_nid === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    editEvent(res: any){
        this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 });
        if(res['type'] == 'success'){
            this.getData();
            this.createDialog = false;
            this.editDialog = false;
        }
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }
}
