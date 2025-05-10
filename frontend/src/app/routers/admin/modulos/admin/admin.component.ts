import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Modulo, ModuloSts } from '../models/modulo';
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
export class AdminModuloComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: Modulo[] = [];
    public item: Modulo = {};
    public selectedData: Modulo[] = [];
    public submitted: boolean = false;
    public cols: any[] = [];
    public statuses: any[] = [];
    public rowsPerPageOptions = [5, 10, 20];
    private $destroy: Subject<void> = new Subject();
    constructor(
        private dbapi: DbapiService,
        private messageService: MessageService,
        private authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/admin/modulos').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: tipos pagos');
                this.getData();
            }
        });
        this.cols = [
            { field: 'modu_nid', header: 'ID' },
            { field: 'modu_vnombre', header: 'Nombre' },
            { field: 'modu_vdescripcion', header: 'Descripción' },
            { field: 'modu_vsts', header: 'Estado' },
        ];
        this.getData();
    }

    getData(){
        this.isLoadingTable = true
        this.dbapi.getAll().pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['modu_vsts'] = val['modu_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
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

    confirmDeleteSelected() {
        const deleteData: ModuloSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ modu_nid: row.modu_nid, modu_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/modulos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        const deleteItem: ModuloSts = { modu_nid: this.item.modu_nid, modu_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/admin/modulos', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].modu_nid === id) {
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

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }
}
