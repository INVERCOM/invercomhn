import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { RegistroFiscal, RegistroFiscalSts } from '../models/registroFiscal';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/registrosfiscales';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(regfis_nsts = [1, 2]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      regfis_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_registro : RegistroFiscal) {
    const data: object = {..._registro,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_registro : RegistroFiscalSts) {
    return this.http.post( this._prefix + '/setsts/' + _registro.regfis_nid, { regfis_nsts: _registro.regfis_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_registro : RegistroFiscalSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _registro, ...this.authS.getUsuarioLog()});
  }
  
  getPuntosEmison() {
    const body = { cia_nids: this.authS.isValidCia(false) }
    return this.http.post( this._prefix + '/getallpuntosemision', body);
  }

  getDocumentosFiscales() {
    const body = { cia_nids: this.authS.isValidCia(false) }
    return this.http.post( this._prefix + '/getalldocumentosfiscales', body);
  }

}
