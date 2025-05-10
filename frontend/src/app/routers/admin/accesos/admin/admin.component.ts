import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Acceso, AccesoSts } from '../models/acceso';
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
export class AdminAccesosComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: Acceso[] = [];
    public item: Acceso = {};
    public selectedData: Acceso[] = [];
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
        private authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.getData();
        skNsCore.fromEvent('/admin/accesos').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: accesos');
                this.getData();
            }
        });
        this.cols = [
            { field: 'acce_nid', header: 'ID' },
            { field: 'modu_vnombre', header: 'Modulo' },
            { field: 'acce_vnombre', header: 'Nombre' },
            { field: 'acce_vdescripcion', header: 'Descripción' },
            { field: 'acce_vclave', header: 'Clave' },
            { field: 'acce_vsts', header: 'Estado' },
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
                val['modu_vnombre'] = val['modus'] ? val['modus']['modu_vnombre'] : '';
                val['acce_vsts'] = val['acce_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
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

    ngOnInit() {
    }

    openNew() {
        this.item = {};
        this.submitted = false;
        this.createDialog = true;
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
        const deleteData: AccesoSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ acce_nid: row.acce_nid, acce_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/accesos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        const deleteItem: AccesoSts = { acce_nid: this.item.acce_nid, acce_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 });
                this.skNsCore.notificarUpsert('/admin/accesos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                this.deleteItemDialog = false;
                this.item = {};
                this.getData();
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    confirmRestartSelected() {
        const restartData: AccesoSts[] = []
        this.selectedData.forEach(row => { restartData.push({ acce_nid: row.acce_nid, acce_nsts: 1}) });
        this.dbapi.setBulkSts(restartData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/accesos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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

    confirmRestart() {
        const restartItem: AccesoSts = { acce_nid: this.item.acce_nid, acce_nsts: 1}
        this.dbapi.setSts(restartItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 });
                this.skNsCore.notificarUpsert('/admin/accesos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                this.restartItemDialog = false;
                this.item = {};
                this.getData();
            }, error: (err) => {
                console.log(err);
                this.editEvent({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].acce_nid === id) {
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

    restartSelectedItems() {
        this.restartItemsDialog = true;
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
