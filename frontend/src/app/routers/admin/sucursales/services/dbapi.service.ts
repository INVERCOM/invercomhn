import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Sucursal, SucursalSts, SucursalUsuario } from '../models/sucursal';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/sucursales';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(sucu_nsts: any = [1]) {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getall', {cia_nids: this.authS.isValidCia(false), sucu_nsts});
  }

  save(_sucursal : Sucursal) {
    const data: object = {..._sucursal,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_sucursal : SucursalSts) {
    return this.http.post( this._prefix + '/setsts/' + _sucursal.sucu_nid, { sucu_nsts: _sucursal.sucu_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_sucursales : SucursalSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _sucursales, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }

  // =============================================================================================================================
  
  getAsigSucursalUsuario(sucu_nid: number,) {
    return this.http.post( this._prefix + '/asigsucursalusuarios/getall/' + sucu_nid, {});
  }

  saveAsigSucursalUsuario(sucu_nid: number, _sucursalusuario : SucursalUsuario[]) {
    const data: object = {asig: _sucursalusuario, ...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/asigsucursalusuarios/save/' + sucu_nid, data);
  }
  
  getUsuarios() {
    const body = {
      cia_nids: this.authS.isValidCia(false),
      user_nsts: [1, 2]
    }
    return this.http.post( this._prefix + '/getallusuariosbycia', body);
  }

}
