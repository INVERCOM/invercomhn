import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Asistencia, AsistenciaSts } from '../models/asistencia';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { DatePipe } from '@angular/common';
import { UtilsService } from 'src/app/shared/utils.service';
import { TimezoneService } from 'src/app/shared/services/timezone.service';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [MessageService]
})

export class AdminAsistenciasComponent implements OnInit, OnDestroy {
    public createDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: Asistencia[] = [];
    public item: Asistencia = {};
    public selectedData: Asistencia[] = [];
    public submitted: boolean = false;
    public cols: any[] = [];
    public tipoConsultaOp: any[] = [];
    public tipoConsulta: {value: string, label: string};
    public fechaInicio: string = '';
    public fechaFin: string = '';
    public statuses: any[] = [];
    public dataOptions: any[] = [];
    public dataValue: any = [1,2,3];
    public rowsPerPageOptions = [5, 10, 20];
    private $destroy: Subject<void> = new Subject();
    constructor(
        private dbapi: DbapiService,
        private messageService: MessageService,
        private timezone: TimezoneService,
        private utilsService: UtilsService,
        public authS: AuthService,
        private skNsCore: SkNsCore,
        private datePipe: DatePipe
    ) {
        this.tipoConsultaOp = [...utilsService.tipoConsulta]
        this.tipoConsulta = this.tipoConsultaOp[0];
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getData();
        });
        skNsCore.fromEvent('/rrhh/asistencias+'+this.authS.isValidCia(false).toString()).pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: asistencias');
                this.getData();
            }
        });
        this.cols = [
            { field: 'asis_nid', header: 'ID' },
            { field: 'cia_vnombre', header: 'Compañía' },
            { field: 'emp_videntidad', header: 'Identidad' },
            { field: 'emp_vnombrecompleto', header: 'Empleado' },
            { field: 'asis_ttfechaentradapipe', header: 'Fecha/hora entrada' },
            { field: 'asis_nlatlogentrada', header: 'Ubicación entrada' },
            { field: 'asis_ttfechasalidapipe', header: 'Fecha/hora salida' },
            { field: 'asis_nlatlogsalida', header: 'Ubicación salida' },
            { field: 'asis_vminutosreceso', header: 'Tiempo receso (min)' },
            { field: 'asis_vsts', header: 'Estado' },
        ];
        this.dataOptions = [
            { name: 'ACTIVOS', value: [1, 2, 3] },
            { name: 'PENDIENTE', value: [1] },
            { name: 'FINALIZADOS', value: [2, 3] },
            { name: 'ELIMINADOS', value: [0] },
            { name: 'TODOS', value: [-1, 0, 1, 2, 3] }
        ];
    }

    getData(){
        const fechas = this.utilsService.getDayToQuery(this.tipoConsulta.value, this.fechaInicio, this.fechaFin);
        if (fechas['fechaInicio'] != '' && fechas['fechaFinal'] != '') {
            this.data = []; this.isLoadingTable = true;
            this.dbapi.getAll(fechas, this.dataValue).pipe(map((res: any) => {
                res.forEach((val: any) => {
                    val['cia_vnombre'] = val['cias'] ? val['cias']['cia_vnombre'] : '';
                    val['emp_videntidad'] = val['emps'] ? val['emps']['emp_videntidad'] : '';
                    val['emp_vnombrecompleto'] = val['emps'] ? val['emps']['emp_vnombre'] + ' ' + val['emps']['emp_vapellido']  : '';

                    val['asis_ttfechaentradapipe'] = val['asis_ttfechaentrada'] ? this.datePipe.transform(val['asis_ttfechaentrada'], 'dd-MM-yyyy HH:mm') : '-----';
                    val['asis_ttfechasalidapipe'] = val['asis_ttfechasalida'] ? this.datePipe.transform(val['asis_ttfechasalida'], 'dd-MM-yyyy HH:mm') : '-----';

                    val['asis_nlatlogentrada'] = val['asis_nlatentrada'] ? val['asis_nlatentrada'] + ',' + val['asis_nlongentrada']: '-----';
                    val['asis_nlatlogsalida'] = val['asis_nlatsalida'] ? val['asis_nlongentrada'] + ',' + val['asis_nlongsalida'] : '-----';

                    val['asis_vminutosreceso'] = val['asis_nminutosreceso'] ? val['asis_nminutosreceso'] + ' min' : '-----';
                    val['asis_vsts'] = val['asis_nsts'] == 1 ? 'PENDIENTE' : val['asis_nsts'] > 1 ? 'FINALIZADO' : 'ELIMINADO';
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
        const deleteData: AsistenciaSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ asis_nid: row.asis_nid, asis_nsts: 0}) });
        this.dbapi.setBulkSts(deleteData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/rrhh/asistencias', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const deleteItem: AsistenciaSts = { asis_nid: this.item.asis_nid, asis_nsts: 0}
        this.dbapi.setSts(deleteItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/rrhh/asistencias', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const restartItem: AsistenciaSts = { asis_nid: this.item.asis_nid, asis_nsts: 3}
        this.dbapi.setSts(restartItem).pipe(take(1)).subscribe({ next: (res: any) => {
                this.skNsCore.notificarUpsert('/rrhh/asistencias', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
        const restartData: AsistenciaSts[] = []
        this.selectedData.forEach(row => { restartData.push({ asis_nid: row.asis_nid, asis_nsts: 3}) });
        this.dbapi.setBulkSts(restartData).pipe(take(1)).subscribe({ next: (res: any) => {
                this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                if (res['type'] == 'success') {
                    this.skNsCore.notificarUpsert('/rrhh/asistencias', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
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
            if (this.data[i].asis_nid === id) {
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
