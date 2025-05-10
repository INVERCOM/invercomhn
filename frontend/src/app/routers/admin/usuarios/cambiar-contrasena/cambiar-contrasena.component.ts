import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { UserChangePass, Usuario } from '../models/usuario';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}

@Component({
    selector: 'app-cambiar-contrasena-usuario',
    templateUrl: './cambiar-contrasena.component.html',
    styleUrls: ['./cambiar-contrasena.component.scss']
})
export class CambiarContrasenaUsuarioComponent implements OnInit, OnChanges {
    public createForm: FormGroup;
    public tiempos: CheesyObject[] = [];
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    @Input() usuario: Usuario = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            user_nid:  ['', Validators.required],
            user_vmail: ['', Validators.required],
            user_vpass: ['', Validators.required],
          });
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.usuario && this.usuario?.user_nid && this.usuario?.user_nid > 0) {
            this.user_nid?.setValue(this.usuario?.user_nid)
            this.user_vmail?.setValue(this.usuario?.user_vmail)
            this.user_vpass?.setValue('')
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _usuarioChangePass: UserChangePass = {
                user_vpass: this.user_vpass?.value,
                user_nsts: 2
            }
            this.dbapi.changePassword(this.user_nid?.value ,_usuarioChangePass).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/admin/usuarios', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString())
                        this.limpiarForm();
                    }
                    this.guardando = false;
                    this.edit.emit(res)
                }, error: (err) => {
                    console.log(err);
                    this.guardando = false;
                    this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
                }
            })
        }
    }

    limpiarForm(){
        this.createForm.reset();
        this.user_nid?.setValue(0);
    }

    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
    }

    searchById(id: any, array: any[]) {
        for (let index = 0; index < array.length; index++) {
            const row = array[index];
            if (row.id == id) {
                return row;
            }
        }
        return '';
    }

    get user_nid() { return this.createForm.get('user_nid') };
    get user_vmail() { return this.createForm.get('user_vmail') };
    get user_vpass() { return this.createForm.get('user_vpass') };
    get user_nsts() { return this.createForm.get('user_nsts') };

}
