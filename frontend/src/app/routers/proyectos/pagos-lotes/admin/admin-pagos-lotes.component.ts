import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { PagoLote, PagoLoteSts } from '../models/pagoLote';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, map, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { UtilsService } from 'src/app/shared/utils.service';

@Component({
    templateUrl: './admin-pagos-lotes.component.html',
    styleUrls: ['./admin-pagos-lotes.component.scss'],
    providers: [MessageService]
})
export class AdminPagosLotesComponent implements OnDestroy {
    public createDialog: boolean = false;
    public reportePagosDialog: boolean = false;
    public editDialog: boolean = false;
    public deleteItemDialog: boolean = false;
    public deleteItemsDialog: boolean = false;
    public restartItemDialog: boolean = false;
    public restartItemsDialog: boolean = false;
    public isLoadingTable: boolean = false;
    public data: PagoLote[] = [];
    public item: PagoLote = {};
    public selectedData: PagoLote[] = [];
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
        public currencyPipe: CurrencyPipe,
        public datePipe: DatePipe,
        public utilsService: UtilsService,
        private skNsCore: SkNsCore
    ) {
        (window as any).pdfMake.vfs = pdfFonts.vfs;
        skNsCore.fromEvent('/proyectos/pagoslotes').pipe(takeUntil(this.$destroy)).subscribe((x)=>{
            if (this.skNsCore.socketId != x) {
                console.log('Event socket: pagos lotes');
                this.getData();
            }
        });
        authS.øbserverSucursalSelected.pipe( takeUntil(this.$destroy) ).subscribe((x)=>{
            console.log('Cambio sucursal:', x);
            this.getData();
        });
        this.cols = [
            { field: 'paglot_nid', header: 'ID' },
            { field: 'sucu_vnombre', header: 'Sucursal' },
            { field: 'lote_vnombre', header: 'Lote' },
            { field: 'cli_vnombre', header: 'Cliente' },
            { field: 'paglot_vnumerodocumento', header: 'Numero pago' },
            { field: 'paglot_dfecha', header: 'Fecha' },
            { field: 'paglot_fimporte', header: 'Import' },
			{ field: 'paglot_vdocumentoreferecnia', header: 'Documento ref' },
			{ field: 'paglot_vobservaciones', header: 'Observaciones' },
			{ field: 'paglot_vsts', header: 'Estado' },
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
                val['sucu_vnombre'] = val['_tsucus'] ? val['_tsucus']['sucu_vnombre'] : '';
                val['lote_vnombre'] = val['_tvenlots'] && val['_tvenlots']['_tlotes'] ? val['_tvenlots']['_tlotes']['lote_vnombre'] : '';
                val['cli_vnombre'] = val['_tvenlots'] && val['_tvenlots']['_tclis'] ? val['_tvenlots']['_tclis']['cli_vnombre'] : '';
                val['paglot_vsts'] = val['paglot_nsts'] == 1 ? 'ACTIVO' : 'ELIMINADO';
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

    openReportePagos() {
        this.reportePagosDialog = true;
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
        const deleteData: PagoLoteSts[] = []
        this.selectedData.forEach(row => { deleteData.push({ paglot_nid: row.paglot_nid, paglot_nsts: 0}) });
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
        const deleteItem: PagoLoteSts = { paglot_nid: this.item.paglot_nid, paglot_nsts: 0}
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
        this.item.paglot_nsts = 1;
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
        this.selectedData.forEach(row => { row.paglot_nsts = 1; });
        this.item.paglot_nsts = 1;
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
            if (this.data[i].paglot_nid === id) {
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

    async showPDF(row: any){
        console.log(row);
        const image = 'data:image/jpeg;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//2gAMAwEAAgADAAAAIfPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPAyPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPFrUO/PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPFPfAg4PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPBPfaqSA6/PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPOBv/Z3PFTULPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPidfPPPHZfO3PPPPNjgj/PPPPOMtPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPIbgYtfPPTvOiPPPNPPLBAY/PPOZLgF/PPPPPPPPPPPPPPPPPPPPPPPPPPPPC/fAQ8JvVPOwvPOJ7fPPPLzFfPVveiA5PPPPPPPPPPPPPPPPPPPPPPPPPPPBHvd3DwwY/Nf8Azzzj/wBo88889lB489hQmRg8888888888888888888888888A/16d89dDCk+8888o/8AePPPPPPIStvuPJB25/PPPPPPPPPPPPPPPPPPPPPODvI+PMYPPFo2fPPPPLDHHPPPPPPPCGUn1fPM0nvPPPPPPPPPPPPPPPPPPPOJqrfPPH1TPPPEIC/PPPPPPPPPPPPPPDdv3bPPPBrfPPPPPPPPPPPPPPPPPOWYPPPPKP1ePPPPLJTvPPPPPPPPPPPPPPPAlnPPPPJPffPPPPPPPPPPPPPPODzfPPPPPOUNPPPPPPPPPPPPPPPPPPPPPPPPLPPPPPPPLfPPPPPPPPPPPPPPPPPPPPPPOtlcNtcTtP8A0288Mc/++90soPnQvrbzzzzzzzzzzzzzzzzzzzzzzzzzzStnDBfzz33TbQ08k8gBDLLbz09f3rTTnfjMDUXzTzzzzzzzzzzzzzzzj3t4ce4I8LuE5y77zzzzzzzzzzzzzzzzzzzz5w6HOb+ThTln7zzzzzzzzzzy77zzzzzyQzwjRjQTBwCzDjDwARxzzgSzjzyzjThhTyTTzzzzzzzzzzzzzzzzzzzzzzzyTDxzSjzhjTzwDxzzxSyzhDTyywTzgTRyDgwTzzzzzzzzzzzzzzzzzzzzzzzxADywxDTwjRTwgDTzhSASiDzzygTzwBQzATwDzzzzzzzzzzzzzzzzzzzzzzzwCjzzzRzxjDzyjxzyhQgCyBTzigzywBxzjihTzzzzzzzzzzzzzzzzzzzzzzzzQSxjzhzzzTzgzjwyQSxBRzyCTwhSQyhTxSxDTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjTTDzzzzzzzzjjzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwziSjCDxTTTwhRDCBhCzjjzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzhyzRwzjDCTzxQizhTyByDjzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzywwzxwwwzywzzxywywyyzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz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zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwZnzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzsW83zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzJX/wCf588888888888888888888888888888888888888888888888888884p317d3vh888888888888888888888888888888888888888888888888888tX9188Xy9888888888888888888888888888888888888888888A5A8888lf1zLc888Y6tC888884rB8888888888888888888888888888888YvU8I88Au1xb884088sUlo088J8kvv88888888888888888888888888888JX1U9pZev1z9888X9Y888Vz18FF0ux/O888888888888888888888888888C09z+79e41RD8888+948888+3jz1XN7Vt18888888888888888888888888j3zAB8I538wh8888U+9o888888PRyBsA0YvS88888888888888888888888H3+n8l488Yc/v88888ssc8888888399+Vo8/x4088888888888888888884xSA88o+VY888KzF888888888888888hbZVo88spu088888888888888888hndc888o+V48888sK088888888888888884WU8888LfN8888888888888884zR888888VMM88888888888888888888888888888888d88888888888888888888888yLgCJMD4RMus/tM+//wDX/mDO1AOx+vPPPPPPPPPPPPPPPPPPPPPPPPDAk7LTv/ffs9c+vMOOv/8A7TnX/jrbbrrHjz276jU4fzzzzzzzzzzzzzzzgm1NvnkCi9X5M/57zzzzzzzzzzzzzzzzzzzy56O69u7LsyKXbzzzzzzzzzzz4zzzzzzyRmCjTzhwDzgCijRQBgBTzjyBHwi3jChBzyhnzzzxzzzzzzzzzzzzzzzzzzzwDzgjjxSwzzjwDxTzxSghBTzwziDyzDRgzyxDzzzzzzzzzzzzzzzzzzzzzzzwTTixwhywBzzwAjzzySTTgBzzyxTzijQzgzwTzzzzzzzzzzzzzzzzzzzzzzzxDjhyyhzwiDzwDxyjxRjjxxzzixjyxhzSwDgTzzzzzzzzzzzzzzzzzzzzzzzyzyxzyzzzzTzwygiySTRjByAAzyziSzxjhyRDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzTTDzzzzzzzzTzzzzTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyxzByziTiSzzzGxjDjRTzxDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyjAjhzDhjjBjy2XyhxECiSTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxwxzwxxxxzzzyxzwyyzwyzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz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'
        this.dbapi.getSaldoActualVentaLote(row['venlot_nid'], row['paglot_dfecha']).pipe(take(1)).subscribe({ next: (data: any) => {
            console.log('-->', data);
        
            const dd = {
                background: { image: image, width: 400, height: 300, opacity: 0.2, margin:[100,100,0,0]}, 
                content: [
                    {
                        text: 'RECIBO DE PAGO',
                        alignment: 'right',
                        margin:[0,0,35,0],
                        style: 'header'
                    },
                    {
                        text: '#'+row['paglot_vnumerodocumento'],
                        alignment: 'right',
                        margin:[0,0,35,5],
                        style: 'header'
                    },
                    {
                        text: this.datePipe.transform( row['paglot_dfecha'], 'dd-MM-yyyy'),
                        alignment: 'right',
                        margin:[0,5,35,5],
                        style: 'subheader'
                    },
                    {
                        text: 'Lic. José Antonio Mancia',
                        alignment: 'left',
                        fontSize: 11,
                        bold: true,
                        margin:[170,-70,0,0],
                    },
                    {
                        text: 'Propietario',
                        alignment: 'left',
                        fontSize: 11,
                        bold: true,
                        margin:[170,0,0,0],
                    },
                    {
                        text: '(504) 9919-7799',
                        alignment: 'left',
                        fontSize: 11,
                        bold: false,
                        margin:[170,0,0,0],
                    },
                    {
                        text: 'Siguatepeque, Comayagua',
                        alignment: 'left',
                        fontSize: 11,
                        bold: false,
                        margin:[170,0,0,0],
                    },
                    {
                        text: 'Honduras',
                        alignment: 'left',
                        fontSize: 11,
                        bold: false,
                        margin:[170,0,0,0],
                    },
                    {
                        image: image,
                        width: 150,
                        margin:[0,-115,0,0],
                        height: 150,
                    },
                    {
                        text:'_________________________________________________________________________________________',
                        margin:[0,-35,0,0],
                        fontSize: 12,
                    },
                    {
                        text: 'RECIBIMOS DE:',
                        fontSize: 11,
                        margin:[35,15,0,0],
                        bold: false
                    },
                    {
                        text: row['_tvenlots']['_tclis']['cli_vnombre'],
                        fontSize: 14,
                        alignment: 'center',
                        margin:[35,-14.5,0,0],
                        bold: true
                    },
                    {
                        text:'__________________________________________________________________',
                        margin:[125,-5,15,0],
                        fontSize: 12,
                    },
                    {
                        columns:[
                                {
                                    text: 'LA CANTIDAD DE:',
                                    fontSize: 11,
                                    margin:[22,20,0,0],
                                    bold: false
                                },
                                {
                                    width: 170,
                                    text: this.currencyPipe.transform(row['paglot_fimportelocal'], ' '),
                                    fontSize: 14,
                                    alignment: 'center',
                                    margin:[0,20,0,0],
                                    bold: true
                                },
                                {
                                    width: 75,
                                    text: 'MONEDA:',
                                    fontSize: 11,
                                    margin:[22,20,0,0],
                                    bold: false
                                },
                                {
                                    text: row['_tmones']['mone_vnombre'],
                                    fontSize: 12,
                                    alignment: 'center',
                                    margin:[-30,20,0,0],
                                    bold: true
                                },
                            
                            ]
                    },
                    
                    {
                        text:'__________________________________________________________________',
                        margin:[125,-5,15,0],
                        fontSize: 12,
                    },
                    {
                        text: this.utilsService.numeroALetras(parseFloat(row['paglot_fimportelocal']).toFixed(2)),
                        fontSize: 12,
                        alignment: 'center',
                        margin:[35,10,0,0],
                        bold: true
                    },
                    {
                        text:'__________________________________________________________________',
                        margin:[125,-5,15,0],
                        fontSize: 12,
                    },
                        {
                        text: 'POR CONCEPTO DE:',
                        fontSize: 11,
                        margin:[13,20,0,0],
                        bold: false
                    },
                    {
                        text: row['paglot_vobservaciones'],
                        fontSize: 14,
                        alignment: 'center',
                        margin:[35,-14.5,0,0],
                        bold: true
                    },
                    {
                        text:'__________________________________________________________________',
                        margin:[125,-5,15,20],
                        fontSize: 12,
                    },
                    {
                        text:'_________________________________________________________________________________________',
                        fontSize: 12,
                    },
                    {
                        style: 'tableExample',
                        margin:[0,20,15,20],
                        table: {
                            widths: [100, 90],
                            body: [
                                [
                                    {text:'SALDO ANTERIOR', bold: true, alignment: 'right'}, 
                                    {text: this.currencyPipe.transform(data[0]['saldoactual'], ' ') , alignment: 'right'},
                                ],
                                [
                                    {text:'SU ABONO', bold: true, alignment: 'right'}, 
                                    {text: this.currencyPipe.transform(row['paglot_fimportelocal'], ' ') , alignment: 'right'},
                                ],
                                [
                                    {text:'SALDO ACTUAL', bold: true, alignment: 'right'}, 
                                    {text:this.currencyPipe.transform(data[0]['saldoactual'] - row['paglot_fimportelocal'] , ' '), alignment: 'right'},
                                ],
                            ]
                        }
                    },
                    {
                        text:'_____________________________',
                        alignment: 'right',
                        margin:[0,-50,50,0],
                        fontSize: 12,
                    },
                    {
                        text:'FIRMA',
                        alignment: 'right',
                        margin:[0,0,110,0],
                        fontSize: 12,
                    },
                    
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    },
                    subheader: {
                        fontSize: 14,
                        bold: false
                    },
                    quote: {
                        italics: true
                    },
                    small: {
                        fontSize: 8
                    }
                }
                
            }
            pdfMake.createPdf(dd).open();
        }});
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }
}
