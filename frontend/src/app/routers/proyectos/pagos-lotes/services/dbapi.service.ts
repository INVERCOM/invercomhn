import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { PagoLote, PagoLoteSts } from '../models/pagoLote';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class DbapiService{
    readonly _prefix = API_HOST + '/api/pagoslotes';
    constructor(
        private http: HttpClient,
        private authS: AuthService,
        private router: Router,
    ) {}

    getAll(paglot_nsts: any) {
        this.authS.refreshToken();
        return this.http.post( this._prefix + '/getall', {sucu_nids: this.authS.getSucursalSelected(), paglot_nsts});
    }

    getAllPagosByVentasLotes(venlot_nid: any) {
        this.authS.refreshToken();
        return this.http.post( this._prefix + '/getallbyventaslotes', {venlot_nid});
    }

    getSaldoActualVentaLote(venlot_nid: any, paglot_dfecha: any) {
        this.authS.refreshToken();
        return this.http.post( this._prefix + '/getsaldoactualventalote', {venlot_nid, paglot_dfecha});
    }

    save(_pagolote : PagoLote) {
        const data: object = {..._pagolote,...this.authS.getUsuarioLog()};
        return this.http.post( this._prefix + '/save', data);
    }

    setSts(_pagolote : PagoLoteSts) {
        return this.http.post( this._prefix + '/setsts/' + _pagolote.paglot_nid, { paglot_nsts: _pagolote.paglot_nsts, ...this.authS.getUsuarioLog() } );
    }

    setBulkSts(_pagolote : PagoLoteSts[]) {
        return this.http.post( this._prefix + '/setbullksts', {data: _pagolote, ...this.authS.getUsuarioLog()});
    }
    
    getSucursales() {
        return this.http.post( this._prefix + '/sucursales/getall', { sucu_nids: this.authS.getSucursalSelected() });
    }

    getVentasLotes(sucu_nids: any = this.authS.getSucursalSelected()) {
        return this.http.post( this._prefix + '/ventaslotes/getall', { sucu_nids });
    }

    getMonedas() {
        return this.http.post( this._prefix + '/monedas/getall', {cia_nids: this.authS.isValidCia(false)});
    }
}
