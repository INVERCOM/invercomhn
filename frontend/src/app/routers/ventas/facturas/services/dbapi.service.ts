import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Factura, FacturaSts } from '../models/factura';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/facturas';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
  ) {}

  getAll(fact_nsts: any = [1]) {
    this.authS.refreshToken();
    const body = {
      cia_nids: this.authS.isValidCia(false),
      fact_nsts
    }
    return this.http.post( this._prefix + '/getall', body);
  }

  save(_factura : Factura) {
    const data: object = {..._factura,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_factura : FacturaSts) {
    return this.http.post( this._prefix + '/setsts/' + _factura.fact_nid, { fact_nsts: _factura.fact_nsts, ...this.authS.getUsuarioLog() } );
  }

  setBulkSts(_facturas : FacturaSts[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _facturas, ...this.authS.getUsuarioLog()});
  }
  
  getPuntosEmision() {
    const body = {
      cia_nids: this.authS.isValidCia(false),
      sucu_nids: this.authS.getSucursalSelected(),
    }
    return this.http.post( this._prefix + '/getallpuntosemision', body);
  }

  getClientes() {
    return this.http.post( this._prefix + '/getallclientes', {cia_nids: this.authS.isValidCia(false)});
  }

  getAgentes() {
    return this.http.post( this._prefix + '/getallagentes', {cia_nids: this.authS.isValidCia(false)});
  }

  getFormasPagos() {
    return this.http.post( this._prefix + '/getallformaspagos', {cia_nids: this.authS.isValidCia(false)});
  }

  getMateriales() {
    return this.http.post( this._prefix + '/getallmateriales', {cia_nids: this.authS.isValidCia(false)});
  }

  getRegistrosFiscalesByPuntoEmision(punemi_nids: any) {
    return this.http.post( this._prefix + '/getallregistrosfiscalesbypuntoemision', {punemi_nids});
  }

  getMonedas() {
    return this.http.post( this._prefix + '/getallmonedas', {});
  }

}
