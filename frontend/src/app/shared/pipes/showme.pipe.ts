import { Pipe, PipeTransform } from '@angular/core';
import { API_HOST } from 'src/environments/environment';

@Pipe({
  name: 'showme'
})
export class ShowmePipe implements PipeTransform {

  transform(url: string, ...args: unknown[]): boolean {
    // if ( API_HOST == "http://localhost:4000") { return true; }
    return true; 
    const accesos = JSON.parse(localStorage.getItem('accesos') || '');
    if ( accesos && accesos.indexOf(url) > -1 ) {
      return true;
    } else {
      return false;
    }
  }

}
