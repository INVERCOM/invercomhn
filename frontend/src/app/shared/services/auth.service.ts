import { Injectable, OnDestroy } from '@angular/core';
import { UserLogin, UserRecoverPass } from 'src/app/routers/admin/usuarios/models/usuario';
import { HttpClient } from '@angular/common/http';
import { map, take, takeUntil } from 'rxjs/operators';
import { ToolsService } from './tools.service';
import { onErrorResumeNext, Observable, Subject, BehaviorSubject, Observer } from 'rxjs';
import { Router } from '@angular/router';
import { API_HOST } from '../../../environments/environment';
import { SkNsCore } from './sockets.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
	readonly _prefix = API_HOST + '/api/users';
	readonly _prefixCias = API_HOST + '/api/companias';
	public $jwtUpdated: Subject<void> = new Subject();
	private $oldCompany: BehaviorSubject<string> = new BehaviorSubject('');
	private $sendSocket: BehaviorSubject<boolean> = new BehaviorSubject(true);
	private $companySelected: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(localStorage.getItem('cia') != null ? localStorage.getItem('cia') : '');
	private $sucursalSelected: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(localStorage.getItem('sucursal') != null ? localStorage.getItem('sucursal') : '');
	public readonly øbserverSendSocket: Observable<boolean> = this.$sendSocket.asObservable();
	public readonly øbserverCompanySelected: Observable<String | null> = this.$companySelected.asObservable();
	public readonly øbserverSucursalSelected: Observable<String | null> = this.$sucursalSelected.asObservable();
	public $accesos: BehaviorSubject<[]> = new BehaviorSubject([]);
	public $destroy: Subject<void> = new Subject();
	public usuario!: Usuario;
	public soloLectura:boolean = false;
	public cia!: string; 
	public sucursal!: string; 
	constructor(private http: HttpClient, public tool: ToolsService, private router: Router, private skNsCore: SkNsCore) {
		this.setInfoUser()
		this.$jwtUpdated.pipe(takeUntil(this.$destroy)).subscribe((x)=>{
			this.setInfoUser()
		})
		this.øbserverCompanySelected.subscribe((x:String | null)=>{
			this.soloLectura = x=='Todas' ? true : false;
			if ((this.$oldCompany.getValue().toString()!='') || (x == 'Todas')) {
				this.skNsCore.interChangeCia(
					this.$oldCompany.getValue().toString(),
					x! as string, 
					x == 'Todas' ? this.parseJwt(localStorage.getItem('jwt')!).cias : this.$oldCompany.getValue().toString() == 'Todas' ? this.parseJwt(localStorage.getItem('jwt')!).cias :[],
					this.parseJwt(localStorage.getItem('jwt')!).user_nid,
					this.$sendSocket.getValue(),
					'TODAS'
				);
			}
			this.canIsendSocket(true);
		});
		this.øbserverSucursalSelected.subscribe((x:String | null)=>{
			this.soloLectura = x=='all' ? true : false;
			if ((this.$oldCompany.getValue().toString()!='') || (x == 'Todas')) {
			  	this.skNsCore.interChangeSucursal(
					x! as string, 
					this.parseJwt(localStorage.getItem('jwt')!)?.user_nid,
					this.$sendSocket.getValue()
				);
			}
			this.canIsendSocket(true);
		});
	}

	setInfoUser(){
		const parsedToken = this.parseJwt( localStorage.getItem('jwt') || '');
		parsedToken && (this.usuario = {
			user_nid: parsedToken['user_nid'],
			user_vmail: parsedToken['user_vmail'],
			expiresIn: parsedToken['expiresIn'],
			accesos: this.$accesos.getValue(),
			cias: [...parsedToken['cias']],
			sucursales: [...parsedToken['sucursales']],
			plataforma: navigator.userAgent,
		});
	}

	userLogin( _user: UserLogin ) {
		return this.http.post( this._prefix + '/auth/login', _user );
	}

	userRecover( _user: UserRecoverPass ) {
		return this.http.post( this._prefix + '/auth/changepassword', _user );
	}

	isValidToken( token: string ): Observable<any> {
		return this.http.post( this._prefix + '/auth/verifytoken', {token} ).pipe( take(1));
	}

	interchangeCia( cia_nid: string, cia_vnombre: string ) {
		this.$oldCompany.next(localStorage.getItem('cia') ?? '');
		localStorage.setItem('cia', cia_nid);
		localStorage.setItem('ciaName', cia_vnombre);
		this.$companySelected.next( cia_nid );
	}

	refreshToken() {
		this.isValidToken( localStorage.getItem('jwt') || '' ).toPromise().then((valor) => {
			if (valor) {
				// if (valor['user']['cias']) {
				// 	let cias = valor['user']['cias'];
				// 	localStorage.setItem('cia', cias[0]['cia_nid']);
				// }
				localStorage.setItem('jwt', valor['newToken']);
				localStorage.setItem('exp', valor['user']['expiresIn']);
				this.setInfoUser();
				this.$jwtUpdated.next();
			}
			return true;
		})
		.catch((err) => {
			console.log(err);
			this.logOut();
			return false;
		});
	}

	getCiasAsignadas( ) {
    	return this.http.post( this._prefix + '/getallciasbyuser', { user_nid: this.usuario && this.usuario.user_nid ? this.usuario.user_nid : 0});
	}

	parseJwt(token: string) {
		try {
			if (!(token && token.length > 0)) {
				return ;
			}
			let base64Url = token.split('.')[1];
			let base64 = base64Url.replace('-', '+').replace('_', '/');
			let tkn = JSON.parse(window.atob(base64));
			return tkn;
		} catch (error) {
			return;
		}
	}

	public setSession( authResult : any, skNsCore: SkNsCore ) {
		if ( authResult && authResult['type'] && authResult['type'] == 'success' ) {
			const cias = authResult['data']['_tcias'];
			const accesos = authResult['data']['_taccesos'];
			localStorage.setItem('jwt', authResult['data']['token']);
			cias && cias[0] && localStorage.setItem('cia', cias[this.searchCiaMain(cias)]['cia_nid']);
			cias && cias[0] && localStorage.setItem('ciaName', cias[this.searchCiaMain(cias)]['cia_vnombre']);
			if( accesos && accesos.length > 0 ) {
				this.$accesos.next(accesos);
				localStorage.setItem('accesos', JSON.stringify(accesos));
			}
			this.$sendSocket.next(false);
			this.setInfoUser();
			const acc = JSON.parse(localStorage.getItem('accesos') || '');

			if (authResult['data']['user_nsts'] === 1) {
				this.skNsCore?.connect();
				this.router.navigate(['/home/dashboard']);
			} else {
				this.router.navigate(['/recover']);
			}
		} else {
			localStorage.clear();
		}
	}

	logOut( skNsCore?: SkNsCore ) {
		localStorage.removeItem('jwt');
		localStorage.removeItem('exp');
		localStorage.removeItem('cia');
		localStorage.removeItem('ciaName');
		localStorage.removeItem('sucursal');
		localStorage.removeItem('accesos');
		this.skNsCore?.disconnect();
		if (this.usuario && this.usuario.cias) {
			this.usuario.cias = [];
			this.cia = 'Todas'
		}
		this.router.navigate(['/login']);
	}

	isValidCia(refreshToken: boolean = true) {
		let cias: string[] = [];
		try {
			if (!this.cia || this.cia != localStorage.getItem('cia')) {
				this.cia = localStorage.getItem('cia') || '';
			}
			refreshToken && this.refreshToken();
			const ciaIndex = this.usuario.cias.map(function(e: any) { return e.cia_nid; }).indexOf(this.cia.toString());
			if (ciaIndex > -1 ) {
				cias.push(this.cia.toString());
			} else if (this.cia === 'Todas') {
				cias = this.usuario.cias;
			} else {
				localStorage.setItem('cia', 'Todas');
				this.logOut();
				const message = 'Intento de cambio de compañía no asignada desde el localStorage';
			}
			return cias;
		} catch (error) {
			return cias;
		}
	}

	getSucursalSelected(refreshToken: boolean = true) {
		let sucursales: string[] = [];
		try {
			if (!this.sucursal || this.sucursal != localStorage.getItem('sucursal')) {
				this.sucursal = localStorage.getItem('sucursal') || '';
			}
			refreshToken && this.refreshToken();
			const sucuIndex = this.usuario.sucursales.map(function(e: any) { return e.sucu_nid; }).indexOf(this.sucursal.toString());
			if (sucuIndex > -1 ) {
				sucursales.push(this.sucursal.toString());
			} else if (this.sucursal === 'Todas') {
				sucursales = this.usuario.sucursales;
			} else {
				localStorage.setItem('sucursal', 'Todas');
				this.logOut();
				const message = 'Intento de cambio de compañía no asignada desde el localStorage';
			}
			return sucursales;
		} catch (error) {
			return sucursales;
		}
	}

	interchangeSucursal( sucu_nid: string ) {
		localStorage.setItem('sucursal', sucu_nid);
		this.$sucursalSelected.next( sucu_nid );
	}

	canIsendSocket( valor:boolean ) {
		this.$sendSocket.next(valor);
	}

	getCanISendSocketValue():boolean {
		return this.$sendSocket.getValue();
	}

	ngOnDestroy() {
		this.$destroy.next();
		this.$destroy.complete();
	}

	getUsuarioLog(){
		return { _tp_tusuarioLog:{
				user_nid: this.usuario.user_nid,
				user_vmail: this.usuario.user_vmail,
			}
		}
	}

	searchCiaMain(data: any[]): number{
		for (let i = 0; i < data.length; i++) {
			const cia = data[i];
			if (cia['_tasig_user_cia'] && cia['_tasig_user_cia']['usecia_npricipal'] > 0) {
				return i
			}
		}
		return 0;
	}
}

export interface TokenDecifrado {
	user_nid: string; 
	user_vmail: string;
	accesos: Array<string>;
	cias: Array<string>;
}

export interface Usuario {
	user_nid: string;
	user_vmail: string;
	accesos: string[];
	sucursales: string[];
	expiresIn : String;
	cias: string[];
	plataforma: string;
}

export enum From {
	localStorage= 1,
	token= 2
}
