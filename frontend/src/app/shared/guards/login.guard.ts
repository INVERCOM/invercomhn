import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService, TokenDecifrado } from "../services/auth.service";

@Injectable({
	providedIn: 'root'
})
export class LoginGuard implements CanActivate {
	private token!: TokenDecifrado;
	constructor(private router: Router, private authS: AuthService ){}

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot):boolean {
		this.token = this.authS.parseJwt(localStorage.getItem('jwt') || '');
		if (!this.token) {
			this.router.navigate(['/main']);
			return false;
		}
		return true;
	}	
}