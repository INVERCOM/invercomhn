import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Material, MaterialSts } from '../models/material';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/materiales';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(mater_nsts: any = [1]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      mater_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_material : Material, _isvs: any[]) {
    const data: object = {..._material, _isvs, ...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_material : MaterialSts) {
    return this.http.post( this._prefix + '/setsts/' + _material.mater_nid, { mater_nsts: _material.mater_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_materiales : MaterialSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _materiales, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }

  getImpuestos() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallimpuestoscia', body);
  }

}
