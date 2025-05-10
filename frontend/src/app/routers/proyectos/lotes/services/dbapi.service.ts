import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Lote, LoteSts } from '../models/lotes';
import { AuthService } from 'src/app/shared/services/auth.service';

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

    getAll(lote_nsts: any) {
        //this.authS.refreshToken();
        return this.http.post( this._prefix + '/getall', {sucu_nids: [], lote_nsts: lote_nsts});
    }

    save(_lotes : Lote) {
        const data: object = {..._lotes,...this.authS.getUsuarioLog()};
        return this.http.post( this._prefix + '/save', data);
    }

    setSts(_lotes : LoteSts) {
        return this.http.post( this._prefix + '/setsts/' + _lotes.lote_nid, { lote_nsts: _lotes.lote_nsts, ...this.authS.getUsuarioLog() } );
    }

    setBulkSts(_lotes : LoteSts[]) {
        return this.http.post( this._prefix + '/setbullksts', {data: _lotes, ...this.authS.getUsuarioLog()});
    }
    
    getProyectos() {
        const body = {
            sucu_nids: this.authS.getSucursalSelected()
        }
        return this.http.post( API_HOST + '/api/proyectos/getall', body);
    }

    getUnimeds(unimed_nsts = [1, 2]) {
        this.authS.refreshToken();
        const body = {
            cia_nids: this.authS.isValidCia(false),
            unimed_nsts
        }
        return this.http.post( API_HOST + '/api/unidadesmedidas/getall', body);
    }
}
