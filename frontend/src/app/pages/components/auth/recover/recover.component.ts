import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserLoginRecover, Usuario } from '../../../../routers/admin/usuarios/models/usuario';
import { take, takeUntil, map } from 'rxjs/operators';
import { MustMatch } from '../_helpers/must-match.validator';
import { AuthService } from '../../../../shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-recover',
    templateUrl: './recover.component.html',
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
export class RecoverComponent implements OnDestroy{
    public valForm: FormGroup;
    private userLoging: UserLoginRecover = {
        user_vmail: '',
        user_vpassactual: '',
        user_vpassnueva: ''
    };
    private $destroy: Subject<void> = new Subject();
    constructor(public layoutService: LayoutService, fb: FormBuilder, private authS: AuthService, private skNsCore: SkNsCore, private messageService: MessageService, private router: Router, ) {
        this.valForm = fb.group({
            user_vmail: [null, Validators.compose([Validators.required])],
            user_vpassactual: [null, Validators.required],
            user_vpassnueva: [null, Validators.required],
            user_vpassconfirmar: [null, Validators.required],
        },{
            validator: MustMatch('user_vpassnueva', 'user_vpassconfirmar')
        });
    }

    submitForm($ev : any, value: any) {
        this.userLoging = {
            user_vmail: value['user_vmail']?.trim(),
            user_vpassactual: value['user_vpassactual']?.trim(),
            user_vpassnueva: value['user_vpassnueva']?.trim()
        }
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }
        if (this.valForm.valid) {
            try {
                this.authS.userRecover(this.userLoging).pipe(take(1)).subscribe({ next: (res: any) => {
                    this.messageService.add({ severity: res['type'], summary: res['title'], detail: res['message'], life: 3000 })
                        if(res && res['type'] == 'success'){
                            alert('Contraseña cambiada exitosamente, vuelva a ingresar con su nueva contraseña!');
                            this.router.navigate(['/login']);
                        }
                    }, error: (err) => {
                        console.log(err);
                        this.messageService.add({ severity: 'error', summary: 'Ha ocurrido un error', detail: err, life: 3000 })
                    }
                })
            } catch (error) {
                console.log('Error en auth service', error); 
                this.messageService.add({ severity: 'error', summary: 'Ha ocurrido un error', life: 3000 })     
            }
        }
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    get user_vmail() { return this.valForm.get('user_vmail') };
    get user_vpassactual() { return this.valForm.get('user_vpassactual') };
    get user_vpassnueva() { return this.valForm.get('user_vpassnueva') };
    get user_vpassconfirmar() { return this.valForm.get('user_vpassconfirmar') };

}
