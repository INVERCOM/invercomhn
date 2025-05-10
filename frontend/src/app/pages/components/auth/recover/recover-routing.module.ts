import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RecoverComponent } from './recover.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RecoverComponent }
    ])],
    exports: [RouterModule]
})
export class LoginRoutingModule { }
