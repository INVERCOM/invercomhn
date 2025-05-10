import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Empleado, EmpleadoSts } from '../models/empleado';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/empleados';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(emp_nsts: any = [1]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      emp_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_empleado : Empleado) {
    const data: object = {..._empleado,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_empleado : EmpleadoSts) {
    return this.http.post( this._prefix + '/setsts/' + _empleado.emp_nid, { emp_nsts: _empleado.emp_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_empleados : EmpleadoSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _empleados, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }
  
}
