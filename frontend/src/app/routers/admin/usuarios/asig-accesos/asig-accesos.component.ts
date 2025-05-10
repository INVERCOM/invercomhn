import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { Usuario, UsuarioAcceso } from '../models/usuario';
import { Table } from 'primeng/table';
import { map, take } from 'rxjs';

@Component({
    selector: 'app-asig-accesos-usuarios',
    templateUrl: './asig-accesos.component.html',
    styleUrls: ['./asig-accesos.component.scss']
})
export class AsigAccesosUsuariosComponent implements OnInit, OnChanges {
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
            { field: 'acce_nid', header: 'ID' },
            { field: 'acce_vnombre', header: 'Nombre' },
            { field: 'acce_vdescripcion', header: 'Descripción' },
            { field: 'modu_vnombre', header: 'Modulo' },
            { field: 'acce_vclave', header: 'Clave' },
        ];
        this.getAccesos();
    }

    getAccesos(){
        this.isLoadingTable = true
        this.dbapi.getAccesos().pipe(map((res: any) => {
            res.forEach((val: any) => {
                val['checked'] = false;
            });
            return res;
        }),
        take(1)).subscribe({ next: (data: any): void => {
                this.data = [...data];
                this.getAsigUsuarioAcceso();
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
        this.getAsigUsuarioAcceso();
    }

    getAsigUsuarioAcceso(){
        if (this.usuario && this.usuario?.user_nid && this.usuario?.user_nid > 0) {
            this.data.forEach((val) => {
                val['checked'] = false;
            })
            this.dbapi.getAsigUsuarioAcceso(this.usuario.user_nid).pipe(take(1)).subscribe({ next: (data: any): void => {
                    this.data.forEach((x: any) => {
                        data.forEach((y: any) =>{
                            if (x.acce_nid === y.acce_nid) {
                                x.checked = true;
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
        const asignaciones: UsuarioAcceso[] = []
        const user_nid: number = this.usuario.user_nid ? this.usuario.user_nid : 0;
        this.data.forEach((x: any) => {
            if (x.checked) {
                asignaciones.push({
                    user_nid,
                    acce_nid: x.acce_nid
                });
            }
        });
        this.dbapi.saveAsigUsuarioAcceso(user_nid, asignaciones).pipe( take(1) ).subscribe({ next: (res: any) => {
                this.edit.emit(res);
            }, error: (err) => {
                console.log(err);
                this.guardando = false;
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }
}
