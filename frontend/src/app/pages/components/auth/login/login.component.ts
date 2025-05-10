import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserLogin, Usuario } from '../../../../routers/admin/usuarios/models/usuario';
import { take, takeUntil, map } from 'rxjs/operators';
import { AuthService } from '../../../../shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { SkNsCore } from 'src/app/shared/services/sockets.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `],
    providers: [MessageService]
})
export class LoginComponent implements OnDestroy{
    public valForm: FormGroup;
    private userLoging: UserLogin = {
        user_vmail: '',
        user_vpass: ''
    };
    private $destroy: Subject<void> = new Subject();
    constructor(public layoutService: LayoutService, fb: FormBuilder, private authS: AuthService, private skNsCore: SkNsCore, private messageService: MessageService ) {
        this.valForm = fb.group({
            user_vmail: [null, Validators.compose([Validators.required])],
            user_vpass: [null, Validators.required]
        });
        this.authS.logOut( skNsCore );
    }

    submitForm($ev : any, value: any) {
        this.userLoging = {
            user_vmail: value['user_vmail']?.trim(),
            user_vpass: value['user_vpass']?.trim()
        }
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }
        if (this.valForm.valid) {
            try {
                this.authS.userLogin(this.userLoging).pipe(take(1)).subscribe({next: (res: any) => {
                        res && res['type'] == 'success' && this.authS.setSession(res, this.skNsCore);
                    }, error :(err) => {
                        console.log(err);
                        this.messageService.add({ severity: 'error', summary: 'Ha ocurrido un error', detail: err, life: 3000 })
                    }
                })
            } catch (error) {
                console.log('Error en auth service', error);      
            }
        }
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

}
