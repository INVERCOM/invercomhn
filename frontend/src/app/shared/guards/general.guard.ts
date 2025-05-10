import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, From, TokenDecifrado } from "../services/auth.service";
import { API_HOST } from 'src/environments/environment';

@Injectable({
  	providedIn: 'root'
})
export class GeneralGuard implements CanActivate {
  private token!:TokenDecifrado;
  private tokenCoded!:string
  constructor(private router: Router, private authS: AuthService){}
  
  canActivate(next: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		// if ( API_HOST == "http://localhost:4000") { return true; } {
		// 	return true
		// }
		this.tokenCoded = localStorage.getItem('jwt') || '';
		this.token = this.authS.parseJwt(this.tokenCoded);
		let accesos = JSON.parse(localStorage.getItem('accesos') || '');
		if(accesos.indexOf(next['data']['url']) > -1){ 
			return this.authS.isValidToken( this.tokenCoded ).toPromise().then((valor)=>{
				let accesos = valor['accesos'];
				localStorage.setItem("jwt",valor['newToken']);
				localStorage.setItem("exp",valor['user']['exp']);
				if( accesos.length > 0 ){
					this.authS.$accesos.next(accesos);
					localStorage.setItem("accesos",JSON.stringify(accesos));
				}
				this.authS.$jwtUpdated.next();
				return true;
			})
			.catch((err)=>{    
				console.log(err);
				this.router.navigate(['/main']);
				return false;
			})
		}else{
			this.router.navigate(['/403']);
			return false;
		}
	}
}
