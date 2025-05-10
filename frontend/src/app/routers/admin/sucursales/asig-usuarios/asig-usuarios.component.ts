import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Sucursal, SucursalUsuario } from '../models/sucursal';
import { Table } from 'primeng/table';
import { map, take } from 'rxjs';

@Component({
    selector: 'app-asig-usuarios-sucursales',
    templateUrl: './asig-usuarios.component.html',
    styleUrls: ['./asig-usuarios.component.scss'],
})
export class AsigUsuariosSucursalesComponent implements OnInit, OnChanges {
    public guardando: boolean = false;
    public isLoadingTable: boolean = false;
    public selectedData: any[] = [];
    public data: any[] = [];
    public cols: any[] = [];

    @Input() sucursal: Sucursal = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
    ) {
        this.cols = [
            { field: 'user_nid', header: 'ID' },
            { field: 'user_vmail', header: 'Correo' },
            { field: 'user_vtelefono', header: 'Teléfono' },
            { field: 'user_vsts', header: 'Estado' },
        ];
        this.getUsuarios();
    }

    getUsuarios(){
        this.isLoadingTable = true
        this.dbapi.getUsuarios().pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['checked'] = false;
                val['x.usecia_npricipal'] = false;
                val['user_vsts'] = val['user_nsts'] == 1 ? 'ACTIVO' : (val['user_nsts'] == 2 ? 'PENDIENTE' :'ELIMINADO');
            });
            return res;
        }),
        take(1)).subscribe({ next: (data: any): void => {
                this.data = [...data];
                this.getAsigSucursalUsuario();
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

    cambiarBtn(e: any, tipo: any) {
        e && e.preventDefault();
        tipo = tipo * 1 || 0;
        this.data.forEach((x: any) => {
          x.checked = tipo == -1 ? !x.checked : (true == tipo);
        });
      }

    ngOnChanges() {
        this.getAsigSucursalUsuario();
    }

    getAsigSucursalUsuario(){
        if (this.sucursal && this.sucursal?.sucu_nid && this.sucursal?.sucu_nid > 0) {
            this.data.forEach((val) => {
                val['checked'] = false;
            })
            this.dbapi.getAsigSucursalUsuario(this.sucursal.sucu_nid).pipe(take(1)).subscribe({ next: (data: any): void => {
                    this.data.forEach((x: any) => {
                        data.forEach((y: any) =>{
                            if (x.user_nid === y.user_nid) { x.checked = true; }
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
        const asignaciones: SucursalUsuario[] = []
        const sucu_nid: number = this.sucursal.sucu_nid ? this.sucursal.sucu_nid : 0;
        this.data.forEach((x: any) => {
            if (x.checked) {
                asignaciones.push({
                    sucu_nid,
                    user_nid: x.user_nid,
                });
            }
        });
        this.dbapi.saveAsigSucursalUsuario(sucu_nid, asignaciones).pipe( take(1) ).subscribe({ next: (res: any) => {
                this.edit.emit(res);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }
}
