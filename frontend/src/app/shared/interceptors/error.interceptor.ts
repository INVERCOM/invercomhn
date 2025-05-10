import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { SkNsCore } from '../services/sockets.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {

  private authS!: AuthService;
  constructor(
    private injector: Injector,
    private skNsCore: SkNsCore
  ) { 
    setTimeout(() => {
      this.authS = this.injector.get(AuthService);
    })
  }

  handleError( err: HttpErrorResponse ) {
    // this.authS.showToast(err.error);
    if(err.status === 401){
        this.authS.logOut( this.skNsCore );
    }

    const error = err.error.message || err.statusText;
    return throwError(error);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(request)
    .pipe(
      catchError(err => {
        // this.authS.showToast(err.error)
        if(err.status === 401){
            this.authS.logOut( this.skNsCore );
        }
        const error = err.error.message || err.statusText;
        return throwError(error);

      })
    )
  }
  
}
