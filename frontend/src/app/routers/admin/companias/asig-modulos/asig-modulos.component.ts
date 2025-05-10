import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Compania, ModulosCias } from '../models/compania';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { map, take } from 'rxjs';

@Component({
    selector: 'app-asig-modulos-companias',
    templateUrl: './asig-modulos.component.html',
    styleUrls: ['./asig-modulos.component.scss']
})
export class AsigModulosCiasComponent implements OnInit, OnChanges {
    public guardando: boolean = false;
    public isLoadingTable: boolean = false;
    public selectedData: any[] = [];
    public data: any[] = [];
    public cols: any[] = [];

    @Input() compania: Compania = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
    ) {
        this.cols = [
            { field: 'modu_nid', header: 'ID' },
            { field: 'modu_vnombre', header: 'Nombre' },
            { field: 'modu_vdescripcion', header: 'Descripción' },
        ];
        this.getModulos();
    }

    getModulos(){
        this.isLoadingTable = true
        this.dbapi.getModulos().pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['checked'] = false;
            });
            return res;
        }),
        take(1)).subscribe({next: (data: any): void => {
                this.data = [...data];
                this.getAsigModulosCias();
                this.isLoadingTable = false;
            }, error: (err) => {
                console.log(err);
                this.isLoadingTable = false;
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        })
    }

    ngOnInit() {}

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

    cambiarBtn(e: any, tipo: any) {
        e && e.preventDefault();
        tipo = tipo * 1 || 0;
        this.data.forEach((x: any) => {
          x.checked = tipo == -1 ? !x.checked : (true == tipo);
        });
      }

    ngOnChanges() {
        this.getAsigModulosCias();
    }

    getAsigModulosCias(){
        if (this.compania && this.compania?.cia_nid && this.compania?.cia_nid > 0) {
            this.data.forEach((val) => {
                val['checked'] = false;
            })
            this.dbapi.getAsigModulosCias(this.compania.cia_nid).pipe(take(1)).subscribe({ next: (data: any): void => {
                    this.data.forEach((x: any) => {
                        data.forEach((y: any) =>{
                            if (x.modu_nid === y.modu_nid) { x.checked = true; }
                        })
                    });
                }, error: (err) => {
                    console.log(err);
                    this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            })
        }
    }

    saveAsignacion(){
        const asignaciones: ModulosCias[] = []
        const cia_nid: number = this.compania.cia_nid ? this.compania.cia_nid : 0;
        this.data.forEach((x: any) => {
            if (x.checked) {
                asignaciones.push({
                    cia_nid,
                    modu_nid: x.modu_nid
                });
            }
        });
        this.dbapi.saveAsigModulosCias(cia_nid, asignaciones).pipe( take(1) ).subscribe({ next: (res: any) => {
                this.edit.emit(res);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
        
    }
}
