import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mytimezone'
})
export class MytimezonePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return new Date(new Date(value).setUTCHours((new Date(value).getUTCHours() + new Date().getTimezoneOffset()/60) + Number(localStorage.getItem('timezone')!=null?localStorage.getItem('timezone'):'0')));
  }

}
