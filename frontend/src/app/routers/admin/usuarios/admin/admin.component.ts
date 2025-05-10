import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Usuario } from '../models/usuario';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [MessageService]
})
export class AdminUsuariosComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public changePasswordDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public asigAccesosDialog: boolean = false;
    public asigCiasDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: Usuario[] = [];
    public item: Usuario = {};
    public itemChangePass: Usuario = {};
    public itemAsigAccesos: Usuario = {};
    public itemAsigCias: Usuario = {};
    public selectedData: Usuario[] = [];
    public dataOptions: any[] = [];
    public dataValue: any = [1];
    public submitted: boolean = false;
    public cols: any[] = [];
    public statuses: any[] = [];
    public rowsPerPageOptions = [5, 10, 20];
    private $destroy: Subject<void> = new Subject();
    constructor(
        private dbapi: DbapiService,
        private messageService: MessageService,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        skNsCore.fromEvent('/admin/usuarios+'+this.authS.isValidCia(false).toString()).pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: clientes');
                this.getData();
            }
        });
        this.getData();
        this.cols = [
            { field: 'user_nid', header: 'ID' },
            { field: 'user_vmail', header: 'Correo' },
            { field: 'user_vtelefono', header: 'Teléfono' },
            { field: 'user_vtiemposesion', header: 'Tiempo sesión' },
            { field: 'user_vsts', header: 'Estado' },
        ];
        this.dataOptions = [
            { name: 'ACTIVOS', value: [1] },
            { name: 'PENDIENTES', value: [2] },
            { name: 'ELIMINADOS', value: [0] },
            { name: 'TODOS', value: [-1, 0, 1, 2] }
        ];
    }

    getData(){
        this.isLoadingTable = true
        this.dbapi.getAll(this.dataValue).pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['user_vsts'] = val['user_nsts'] == 1 ? 'ACTIVO' : (val['user_nsts'] == 2 ? 'PENDIENTE' :'ELIMINADO');
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

    asignacionAccesos(item: any){
        this.itemAsigAccesos = { ...item };
        this.asigAccesosDialog = true;
    }
    
    asignacionCias(item: any){
        this.itemAsigCias = { ...item };
        this.asigCiasDialog = true;
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

    changePasswordRow(item: any) {
        this.itemChangePass = { ...item };
        this.changePasswordDialog = true;
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
        this.selectedData.forEach(row => { row.user_nsts = 0; });
        this.item.user_nsts = 0;
        this.dbapi.setBulkSts(this.selectedData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/usuarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.item.user_nsts = 0;
        this.dbapi.setSts(this.item).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/admin/usuarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.item.user_nsts = 2;
        this.dbapi.setSts(this.item).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/admin/usuarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.selectedData.forEach(row => { row.user_nsts = 2; });
        this.item.user_nsts = 2;
        this.dbapi.setBulkSts(this.selectedData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/admin/usuarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
            if (this.data[i].user_nid === id) {
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
            this.changePasswordDialog = false;
            this.asigAccesosDialog = false;
            this.asigCiasDialog = false;
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
