import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Sucursal, SucursalSts } from '../models/sucursal';
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
export class AdminSucursalesComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public asigUsuariosDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: Sucursal[] = [];
    public item: Sucursal = {};
    public itemAsigUsuarios: Sucursal = {};
    public selectedData: Sucursal[] = [];
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
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getData();
        });
        skNsCore.fromEvent('/admin/sucursales+'+this.authS.isValidCia(false).toString()).pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: sucursales');
                this.getData();
            }
        });
        this.cols = [
            { field: 'sucu_nid', header: 'ID' },
            { field: 'cia_vnombre', header: 'Compañía' },
            { field: 'sucu_vcodigo', header: 'Código' },
            { field: 'sucu_vnombre', header: 'Nombre' },
            { field: 'sucu_vdireccion', header: 'Dirección' },
            { field: 'sucu_vtelefono', header: 'Teléfono' },
            { field: 'sucu_vcorreo', header: 'Correo' },
            { field: 'sucu_vsts', header: 'Estado' },
        ];
        this.dataOptions = [
            { name: 'ACTIVOS', value: [1] },
            { name: 'ELIMINADOS', value: [0] },
            { name: 'TODOS', value: [-1, 0, 1] }
        ];
    }

    getData(){
        this.isLoadingTable = true;
        this.dbapi.getAll(this.dataValue).pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['cia_vnombre'] = val['cias'] ? val['cias']['cia_vnombre'] : '';
                val['sucu_vsts'] = val['sucu_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
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

    asignacionUsuarios(item: any){
        this.itemAsigUsuarios = { ...item };
        this.asigUsuariosDialog = true;
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

    restartRow(item: any) {
        this.restartItemDialog = true;
        this.item = { ...item };
    }

    confirmDeleteSelected() {
        const deleteData: SucursalSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ sucu_nid: row.sucu_nid, sucu_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/sucursales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const deleteItem: SucursalSts = { sucu_nid: this.item.sucu_nid, sucu_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/admin/sucursales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const restartItem: SucursalSts = { sucu_nid: this.item.sucu_nid, sucu_nsts: 1}
        this.dbapi.setSts(restartItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/admin/sucursales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const restartData: SucursalSts[] = []
        this.selectedData.forEach(row => { restartData.push({ sucu_nid: row.sucu_nid, sucu_nsts: 1}) });
        this.dbapi.setBulkSts(restartData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/sucursales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
            if (this.data[i].sucu_nid === id) {
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
            this.asigUsuariosDialog = false;
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
