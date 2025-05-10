import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ConceptoInventario, ConceptoInventarioSts } from '../models/conceptoInventario';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/conceptosinventarios';
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

  save(_registro : ConceptoInventario) {
    const data: object = {..._registro,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_registro : ConceptoInventarioSts) {
    return this.http.post( this._prefix + '/setsts/' + _registro.coninv_nid, { docfis_nsts: _registro.coninv_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_registro : ConceptoInventarioSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _registro, ...this.authS.getUsuarioLog()});
  }
  
  getCompanias() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallcompanias', body);
  }

}
