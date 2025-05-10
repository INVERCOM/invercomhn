import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { PuntoEmision, PuntoEmisionSts } from '../models/puntoEmision';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/puntosemision';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
  ) {}

  getAll(punemi_nsts: any = [1]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      punemi_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_puntoEmision : PuntoEmision) {
    const data: object = {..._puntoEmision,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_puntoEmision : PuntoEmisionSts) {
    return this.http.post( this._prefix + '/setsts/' + _puntoEmision.punemi_nid, { punemi_nsts: _puntoEmision.punemi_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_puntoEmisions : PuntoEmisionSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _puntoEmisions, ...this.authS.getUsuarioLog()});
  }
  
  getSucursales() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallsucursales', body);
  }

}
