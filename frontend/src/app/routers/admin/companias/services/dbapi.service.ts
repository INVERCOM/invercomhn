import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Compania, CompaniaSts, ModulosCias } from '../models/compania';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/companias';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll() {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getall', {});
  }

  save(_cia : Compania) {
    const data: object = {..._cia,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_cia : CompaniaSts) {
    return this.http.post( this._prefix + '/setsts/' + _cia.cia_nid, { cia_nsts: _cia.cia_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_cias : CompaniaSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _cias, ...this.authS.getUsuarioLog()});
  }
  
  getMonedas() {
    return this.http.post( this._prefix + '/getallmonedas', {});
  }

  // =============================================================================================================================
  
  getAsigModulosCias(cia_nid: number,) {
    return this.http.post( this._prefix + '/asigciasmodulos/getall/' + cia_nid, {});
  }

  saveAsigModulosCias(cia_nid: number, _moduloscias : ModulosCias[]) {
    const data: object = {asig: _moduloscias, ...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/asigciasmodulos/save/' + cia_nid, data);
  }

  getModulos() {
    return this.http.post( this._prefix + '/getallmodulos', {});
  }

}