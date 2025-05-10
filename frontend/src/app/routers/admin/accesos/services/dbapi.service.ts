import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Acceso, AccesoSts } from '../models/acceso';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/accesos';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(acce_nsts: any = [1]) {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getall', {acce_nsts});
  }

  save(_acceso : Acceso) {
    const data: object = {..._acceso,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_acceso : AccesoSts) {
    return this.http.post( this._prefix + '/setsts/' + _acceso.acce_nid, { acce_nsts: _acceso.acce_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_accesos : AccesoSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _accesos, ...this.authS.getUsuarioLog()});
  }
  
  getModulos() {
    return this.http.post( this._prefix + '/getallmodulos', {});
  }

}
