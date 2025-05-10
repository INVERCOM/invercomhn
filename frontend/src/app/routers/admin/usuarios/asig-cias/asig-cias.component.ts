import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Usuario, UsuarioCia } from '../models/usuario';
import { Table } from 'primeng/table';
import { map, take } from 'rxjs';

@Component({
    selector: 'app-asig-cias-usuarios',
    templateUrl: './asig-cias.component.html',
    styleUrls: ['./asig-cias.component.scss']
})
export class AsigCiasUsuariosComponent implements OnInit, OnChanges {
    public guardando: boolean = false;
    public isLoadingTable: boolean = false;
    public selectedData: any[] = [];
    public data: any[] = [];
    public cols: any[] = [];

    @Input() usuario: Usuario = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService
    ) {
        this.cols = [
            { field: 'cia_nid', header: 'ID' },
            { field: 'cia_vnombre', header: 'Nombre' },
            // { field: 'cia_vnombrecomercial', header: 'Comercial' },
            // { field: 'cia_vdireccion', header: 'Dirección' },
            { field: 'cia_vtelefono', header: 'Teléfono' },
            { field: 'cia_vcorreo', header: 'Correo' }
        ];
        this.getCias();
    }

    getCias(){
        this.isLoadingTable = true
        this.dbapi.getCias().pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['checked'] = false;
                val['x.usecia_npricipal'] = false;
            });
            return res;
        }),
        take(1)).subscribe({ next: (data: any): void => {
                this.data = [...data];
                this.getAsigUsuarioCia();
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
        this.getAsigUsuarioCia();
    }

    getAsigUsuarioCia(){
        if (this.usuario && this.usuario?.user_nid && this.usuario?.user_nid > 0) {
            this.data.forEach((val) => {
                val['checked'] = false;
            })
            this.dbapi.getAsigUsuarioCia(this.usuario.user_nid).pipe(take(1)).subscribe({ next: (data: any): void => {
                    this.data.forEach((x: any) => {
                        x.usecia_npricipal = false
                        data.forEach((y: any) =>{
                            if (x.cia_nid === y.cia_nid) {
                                x.checked = true;
                                x.usecia_npricipal = y.usecia_npricipal > 0 ? true : false
                            }
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
        const asignaciones: UsuarioCia[] = []
        const user_nid: number = this.usuario.user_nid ? this.usuario.user_nid : 0;
        this.data.forEach((x: any) => {
            if (x.checked) {
                asignaciones.push({
                    user_nid,
                    cia_nid: x.cia_nid,
                    usecia_npricipal: x.usecia_npricipal ? 1 : 0
                });
            }
        });
        this.dbapi.saveAsigUsuarioCia(user_nid, asignaciones).pipe( take(1) ).subscribe({ next: (res: any) => {
                this.edit.emit(res);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
        
    }

    setPrincipal(row: any){
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i]['cia_nid'] != row.cia_nid) {
                this.data[i]['usecia_npricipal'] = false;
            }
        }
    }
}
