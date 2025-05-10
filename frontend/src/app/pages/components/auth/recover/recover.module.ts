import { NgModule } from '@angular/core';;
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './recover-routing.module';
import { RecoverComponent } from './recover.component';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
    imports: [
        CommonModule,
        LoginRoutingModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        PasswordModule,
        ToastModule
    ],
    declarations: [RecoverComponent]
})
export class RecoverModule { }
