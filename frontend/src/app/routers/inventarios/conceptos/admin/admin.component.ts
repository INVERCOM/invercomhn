import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { ConceptoInventario, ConceptoInventarioSts } from '../models/conceptoInventario';
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
export class AdminConceptosInventariosComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: ConceptoInventario[] = [];
    public item: ConceptoInventario = {};
    public selectedData: ConceptoInventario[] = [];
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
        skNsCore.fromEvent('/inventarios/conceptosinventarios').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: conceptos inventarios');
                this.getData();
            }
        });
        this.cols = [
            { field: 'coninv_nid', header: 'ID' },
            { field: 'cia_vnombre', header: 'Compañía' },
            { field: 'coninv_vdescripcion', header: 'Descripción' },
            { field: 'coninv_vobservaciones', header: 'Observacion' },
            { field: 'coninv_vtipo', header: 'Tipo' },
            { field: 'coninv_vbodegaconfigurada', header: 'Bodega defecto' },
            { field: 'coninv_visvencosteo', header: 'ISV en costo' },
            { field: 'coninv_vdevolucion', header: 'Para devoluciones' },
            { field: 'coninv_vsts', header: 'Estado' },
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
                val['cia_vnombre'] = val['cias'] ? val['cias']['cia_vnombre'] : '';
                val['coninv_vsts'] = val['coninv_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
                val['coninv_vtipo'] = val['coninv_ntipo'] == 1 ? 'ENTRADA' : (val['coninv_ntipo'] == 2 ? 'SALIDA' : (val['coninv_ntipo'] == 3 ? 'TRANSFERENCIA' : '----'));
                val['coninv_vbodegaconfigurada'] = val['coninv_nbodegaconfigurada'] == 0 ? 'NO' : (val['coninv_nbodegaconfigurada'] == 1 ? 'BODEGA PRINCIPAL' : (val['coninv_nbodegaconfigurada'] == 2 ? 'BODEGA DEVOLUCIONES' : '----'));
                val['coninv_visvencosteo'] = val['coninv_nisvencosteo'] == 1 ? 'SI' : 'NO';
                val['coninv_vdevolucion'] = val['coninv_ndevolucion'] == 1 ? 'SI' : 'NO';
            });
            return res;
        }),
        take(1)).subscribe({ next: (data: any): void => {
                this.data = [...data];
                this.isLoadingTable = false;
            }, error: (err) => {
                console.log(err);
                this.isLoadingTable = false;
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    ngOnInit() {}

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
        const deleteData: ConceptoInventarioSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ coninv_nid: row.coninv_nid, coninv_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/inventarios/conceptosinventarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        const deleteItem: ConceptoInventarioSts = { coninv_nid: this.item.coninv_nid, coninv_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/inventarios/conceptosinventarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.item.coninv_nsts = 1;
        this.dbapi.setSts(this.item).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/inventarios/conceptosinventarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.selectedData.forEach(row => { row.coninv_nsts = 1; });
        this.item.coninv_nsts = 1;
        this.dbapi.setBulkSts(this.selectedData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/inventarios/conceptosinventarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
            if (this.data[i].coninv_nid === id) {
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
