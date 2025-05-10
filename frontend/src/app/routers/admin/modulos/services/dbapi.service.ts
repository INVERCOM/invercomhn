import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Modulo, ModuloSts } from '../models/modulo';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/modulos';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll() {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getall', {});
  }

  save(_modulo : Modulo) {
    const data: object = {..._modulo,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_modulo : ModuloSts) {
    return this.http.post( this._prefix + '/setsts/' + _modulo.modu_nid, { modu_nsts: _modulo.modu_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_modulos : ModuloSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _modulos, ...this.authS.getUsuarioLog()});
  }

}