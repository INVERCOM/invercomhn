import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Usuario, UserChangePass, UsuarioAcceso, UsuarioCia } from '../models/usuario';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbapiService{
  readonly _prefix = API_HOST + '/api/usuarios';
  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private router: Router,
  ) {}


  getAll(user_nsts = [1, 2]) {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getall', {user_nsts});
  }

  save(_usuario : Usuario) {
    const data: object = {..._usuario,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/save', data);
  }

  setSts(_usuario : Usuario) {
    return this.http.post( this._prefix + '/setsts/' + _usuario.user_nid, { user_nsts: _usuario.user_nsts, ...this.authS.getUsuarioLog() } );
  }
  
  setBulkSts(_usuarios : Usuario[]) {
    return this.http.post( this._prefix + '/setbullksts', {data: _usuarios , ...this.authS.getUsuarioLog()});
  }

  changePassword(user_nid: number , _usuario : UserChangePass) {
    const data: object = {..._usuario,...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/changepassword/' + user_nid.toString(), data );
  }

  getMonedas() {
    return this.http.post( this._prefix + '/getallmonedas', {});
  }

  // =============================================================================================================================
  
  getAsigUsuarioAcceso(user_nid: number,) {
    return this.http.post( this._prefix + '/asigusuariosaccesos/getall/' + user_nid, {});
  }

  saveAsigUsuarioAcceso(user_nid: number, _usuarioacceso : UsuarioAcceso[]) {
    const data: object = {asig: _usuarioacceso, ...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/asigusuariosaccesos/save/' + user_nid, data);
  }

  getAccesos() {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getallaccesos', {});
  }

  getEmpleados() {
    const body = {
      cia_nids: this.authS.isValidCia(false)
    }
    return this.http.post( this._prefix + '/getallempleados', body);
  }

  // =============================================================================================================================
  
  getAsigUsuarioCia(user_nid: number,) {
    return this.http.post( this._prefix + '/asigusuarioscias/getall/' + user_nid, {});
  }

  saveAsigUsuarioCia(user_nid: number, _usuarioacceso : UsuarioCia[]) {
    const data: object = {asig: _usuarioacceso, ...this.authS.getUsuarioLog()};
    return this.http.post( this._prefix + '/asigusuarioscias/save/' + user_nid, data);
  }

  getCias() {
    this.authS.refreshToken();
    return this.http.post( this._prefix + '/getallcias', {});
  }

}