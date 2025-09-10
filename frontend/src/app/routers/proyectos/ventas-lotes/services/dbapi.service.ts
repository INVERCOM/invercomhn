import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { VentaLote, VentaLoteSts } from '../models/ventaLote';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class DbapiService{
    readonly _prefix = API_HOST + '/api/ventaslotes';
    constructor(
        private http: HttpClient,
        private authS: AuthService,
        private router: Router,
    ) {}

    getAll(lote_nsts: any) {
        this.authS.refreshToken();
        return this.http.post( this._prefix + '/getall', { cia_nids: this.authS.isValidCia(false), lote_nsts: lote_nsts });
    }

    save(_ventaLotes : VentaLote) {
        const data: object = {..._ventaLotes,...this.authS.getUsuarioLog()};
        return this.http.post( this._prefix + '/save', data);
    }

    setSts(_ventaLotes : VentaLoteSts) {
        return this.http.post( this._prefix + '/setsts/' + _ventaLotes.venlot_nid, { lote_nsts: _ventaLotes.venlot_nsts, ...this.authS.getUsuarioLog() } );
    }

    setBulkSts(_ventaLotes : VentaLoteSts[]) {
        return this.http.post( this._prefix + '/setbullksts', {data: _ventaLotes, ...this.authS.getUsuarioLog()});
    }
    
    getLotes() {
        return this.http.post( this._prefix + '/lotes/getall', {lote_nsts: [1], sucu_nids: this.authS.getSucursalSelected()});
    }

    getClientes() {
        return this.http.post( this._prefix + '/clientes/getall', {cia_nids: this.authS.isValidCia(false)});
    }
}
