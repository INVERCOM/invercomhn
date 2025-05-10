import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  constructor( public toasterService: ToastrService ) {
  }
  toast(t?:string,h?:string,b?:string):void{
		t = ((t && (t == 'success' || t == 'warning' || t == 'error' || t == 'wait'))? t : '');
		h = ((h && h.length == 0 ? "Ginger" : h) ) || "Ginger";
		b = ((b && b.length == 0 ? "..." : b) ) || "...";
    if ( t == 'success' ) {
        this.toasterService.toastrConfig.positionClass ="toast-bottom-right";
        this.toasterService.toastrConfig.progressBar = true
        this.toasterService.success(b, h);
        }else if( t == 'warning' ) {
            this.toasterService.warning(b, h);
        }else if( t == 'info' ){
            this.toasterService.info(b, h);
        }else if( t == 'error' ){
            this.toasterService.error(b, h);
        }
	};
}
