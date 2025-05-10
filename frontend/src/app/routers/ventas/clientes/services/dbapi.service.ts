import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Cliente, ClienteSts } from '../models/cliente';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/clientes';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
  ) {}

  getAll(cli_nsts: any = [1]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      cli_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_cliente : Cliente) {
    const data: object = {..._cliente,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_cliente : ClienteSts) {
    return this.http.post( this._prefix + '/setsts/' + _cliente.cli_nid, { cli_nsts: _cliente.cli_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_clientes : ClienteSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _clientes, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }

}
