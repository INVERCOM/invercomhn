import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Proyecto, ProyectoSts } from '../models/proyecto';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class DbapiService{
    readonly _prefix = API_HOST + '/api/proyectos';
    constructor(
        private http: HttpClient,
        private authS: AuthService,
        private router: Router,
    ) {}

    getAll(proy_nsts: any = [1]) {
        this.authS.refreshToken();
        return this.http.post( this._prefix + '/getall', {proy_nsts : proy_nsts, sucu_nids: this.authS.getSucursalSelected()});
    }

    save(_proyectos : Proyecto) {
        const data: object = {..._proyectos,...this.authS.getUsuarioLog()};
        return this.http.post( this._prefix + '/save', data);
    }

    setSts(_proyectos : ProyectoSts) {
        return this.http.post( this._prefix + '/setsts/' + _proyectos.proy_nid, { proy_nsts: _proyectos.proy_nsts, ...this.authS.getUsuarioLog() } );
    }

    setBulkSts(_sucursales : ProyectoSts[]) {
        return this.http.post( this._prefix + '/setbullksts', {data: _sucursales, ...this.authS.getUsuarioLog()});
    }
    
    getSucursales() {
        const body = {
            cia_nids: this.authS.isValidCia(false)
        }
        return this.http.post( '/api/sucursales/getall', body);
    }

}
