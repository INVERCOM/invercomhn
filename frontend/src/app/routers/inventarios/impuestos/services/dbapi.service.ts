import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Impuesto, ImpuestoSts } from '../models/impuesto';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/impuestos';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll() {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_isv : Impuesto) {
    const data: object = {..._isv,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_isv : ImpuestoSts) {
    return this.http.post( this._prefix + '/setsts/' + _isv.isv_nid, { isv_nsts: _isv.isv_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_isves : ImpuestoSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _isves, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }

}
