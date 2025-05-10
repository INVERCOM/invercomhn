import { Component, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Compania, CompaniaSts } from '../models/compania';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { map, take } from 'rxjs';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [MessageService]
})

export class AdminCompaniasComponent implements OnInit {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public asigModulosDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: Compania[] = [];
    public item: Compania = {}; 
    public itemAsigModulos: Compania = {}; 
    public selectedData: Compania[] = [];
    public submitted: boolean = false;
    public cols: any[] = [];
    public statuses: any[] = [];
    public rowsPerPageOptions = [5, 10, 20];

    constructor(
        private dbapi: DbapiService,
        private messageService: MessageService
    ) {
        this.cols = [
            { field: 'cia_nid', header: 'ID' },
            { field: 'cia_vnombre', header: 'Nombre' },
            { field: 'cia_vnombrecomercial', header: 'Comercial' },
            { field: 'cia_vdireccion', header: 'Dirección' },
            { field: 'cia_vtelefono', header: 'Teléfono' },
            { field: 'cia_vrtn', header: 'RTN' },
            { field: 'cia_vcorreo', header: 'Correo' },
            { field: 'mone_vnombre', header: 'Moneda' },
            { field: 'cia_vsts', header: 'Estado' },
        ];
        this.getData();
    }

    mostrarModal(item: any){
        this.itemAsigModulos = { ...item };
        this.asigModulosDialog = true;
    }

    getData(){
        this.isLoadingTable = true
        this.dbapi.getAll().pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['mone_vnombre'] = val['mones'] ? val['mones']['mone_vnombre'] : '';
                val['cia_vsts'] = val['cia_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
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
        const deleteData: CompaniaSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ cia_nid: row.cia_nid, cia_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
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
        const deleteItem: CompaniaSts = { cia_nid: this.item.cia_nid, cia_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
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
            if (this.data[i].cia_nid === id) {
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
            this.asigModulosDialog = false;
        }
    }
}
