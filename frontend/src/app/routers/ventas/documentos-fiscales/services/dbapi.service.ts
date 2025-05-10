import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { DocumentoFiscal, DocumentoFiscalSts } from '../models/documentoFiscal';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/documentosfiscales';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}

  getAll(docfis_nsts = [1, 2]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      docfis_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_registro : DocumentoFiscal) {
    const data: object = {..._registro,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_registro : DocumentoFiscalSts) {
    return this.http.post( this._prefix + '/setsts/' + _registro.docfis_nid, { docfis_nsts: _registro.docfis_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_registro : DocumentoFiscalSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _registro, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }

}
