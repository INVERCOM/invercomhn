import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  	providedIn: 'root'
})
export class JwtInterceptor implements HttpInterceptor {

	constructor() { }
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
		const tkn = localStorage.getItem('jwt');
		if (tkn) {
			const reqq = request.clone({
				setHeaders: {
					Authorization: `${tkn}`
				}
			});
			return next.handle(reqq);
		}
		return next.handle(request);
	}
}
