import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Lote, LoteSts } from '../models/lotes';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DbapiService{
    readonly _prefix = API_HOST + '/api/lotes';
    constructor(
        private http: HttpClient,
        private authS: AuthService,
        private router: Router,
    ) {}

    getAll(lote_nsts: any): Observable<any[]> {
        return this.http.post<any[]>(this._prefix + '/getall', { sucu_nids: this.authS.getSucursalSelected(), lote_nsts: lote_nsts });
    }


    getAllFree(lote_nsts: any): Observable<any[]> {
        return this.http.post<any[]>(this._prefix + '/getallfree', { });
    }
    
    save(_lotes : Lote, img: any = null) {
        const data: object = {..._lotes,...this.authS.getUsuarioLog(), img};
        return this.http.post( this._prefix + '/save', data);
    }

    setSts(_lotes : LoteSts) {
        return this.http.post( this._prefix + '/setsts/' + _lotes.lote_nid, { lote_nsts: _lotes.lote_nsts, ...this.authS.getUsuarioLog() } );
    }

    setBulkSts(_lotes : LoteSts[]) {
        return this.http.post( this._prefix + '/setbullksts', {data: _lotes, ...this.authS.getUsuarioLog()});
    }

    getSucursales() {
        const body = {
            cia_nids: this.authS.isValidCia(false)
        }
        return this.http.post( '/api/sucursales/getall', body);
    }
    
    getProyectos() {
        const body = {
            sucu_nids: this.authS.getSucursalSelected(),
            proy_nsts: 1
        }
        return this.http.post( API_HOST + '/api/proyectos/getall', body);
    }

    getProyectosAll() {
        const body = {
            sucu_nids: null
        }
        return this.http.post( API_HOST + '/api/proyectos/getallforclients', body);
    }

    getUnimeds(unimed_nsts = [1, 2]) {
       // this.authS.refreshToken();
        const body = {
            cia_nids: this.authS.isValidCia(false),
            unimed_nsts
        }
        return this.http.post( API_HOST + '/api/unidadesmedidas/getall', body);
    }
    
    getImg( lote_nid: number ) {
        return this.http.post( this._prefix + '/getimg', {file: lote_nid, lote_nid});
    }
}
