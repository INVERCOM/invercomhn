import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Asistencia, AsistenciaSts } from '../models/asistencia';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/asistencias';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(fechas: any = null, asis_nsts: any = [1]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      asis_nsts,
      fechas
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_asistencia : Asistencia) {
    const data: object = {..._asistencia,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_asistencia : AsistenciaSts) {
    return this.http.post( this._prefix + '/setsts/' + _asistencia.asis_nid, { asis_nsts: _asistencia.asis_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_asistencias : AsistenciaSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _asistencias, ...this.authS.getUsuarioLog()});
  }

  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcias', body);
  }

  getEmpleados() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallempleados', body);
  }

}
