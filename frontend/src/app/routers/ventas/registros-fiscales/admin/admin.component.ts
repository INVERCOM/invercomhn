import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { RegistroFiscal, RegistroFiscalSts } from '../models/registroFiscal';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { DatePipe } from '@angular/common';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [MessageService]
})
export class AdminRegistrosFiscalesComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: RegistroFiscal[] = [];
    public item: RegistroFiscal = {};
    public selectedData: RegistroFiscal[] = [];
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
        private skNsCore: SkNsCore,
        private datePipe: DatePipe,
    ) {
        skNsCore.fromEvent('/ventas/registrosfiscales').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: registros fiscales');
                this.getData();
            }
        });
        this.cols = [
            { field: 'regfis_nid', header: 'ID' },
            { field: 'punemi_vdescripcion', header: 'Punto emisión' },
            { field: 'docfis_vdescripcion', header: 'Doc. Fiscal' },
            { field: 'regfis_vcai', header: 'CAI' },
            { field: 'regfis_vnumeroautorizacion', header: 'No. Autorización' },
            { field: 'regfis_ninicio', header: 'Rango inicial' },
            { field: 'regfis_nfin', header: 'Rango final' },
            { field: 'regfis_vfechamaxemision', header: 'Fecha max emisión' },
            { field: 'regfis_vsts', header: 'Estado' },
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
                val['punemi_vdescripcion'] = val['punemis'] ? val['punemis']['punemi_vcodigo'] + ' - ' + val['punemis']['punemi_vdescripcion'] : '';
                val['docfis_vdescripcion'] = val['docfiss'] ? val['docfiss']['docfis_vdescripcion'] : '';
                val['regfis_vsts'] = val['regfis_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
                val['regfis_vfechamaxemision'] = this.datePipe.transform(val['regfis_dfechamaxemision'], 'dd-MM-yyyy');
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
        const deleteData: RegistroFiscalSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ regfis_nid: row.regfis_nid, regfis_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/ventas/registrosfiscales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        const deleteItem: RegistroFiscalSts = { regfis_nid: this.item.regfis_nid, regfis_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/ventas/registrosfiscales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
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
        this.item.regfis_nsts = 1;
        this.dbapi.setSts(this.item).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/ventas/registrosfiscales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        this.selectedData.forEach(row => { row.regfis_nsts = 1; });
        this.item.regfis_nsts = 1;
        this.dbapi.setBulkSts(this.selectedData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/ventas/registrosfiscales', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
            if (this.data[i].regfis_nid === id) {
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
