import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { DbapiService } from '../services/dbapi.service';
import { UnidadMedida } from '../models/unidadMedida';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-create-unidades-medidas',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateUnidadesMedidasComponent implements OnInit, OnChanges, OnDestroy {
    public createForm: FormGroup;
    public guardando: boolean = false;
    public itemDialog: boolean = false;
    public submitted: boolean = false;
    public companias: CheesyObject[] = [];
    private $destroy: Subject<void> = new Subject();
    @Input() UnidadMedida: UnidadMedida = {}; // Aquí recibimos un m modulo para reutilizar este formulario para edición
    @Output() edit: EventEmitter<any> = new EventEmitter();
    constructor(
        private dbapi: DbapiService,
        private _builder: FormBuilder,
        public authS: AuthService,
        private skNsCore: SkNsCore
    ) {
        this.createForm = _builder.group({
            unimed_nid:  [0],
            cia_nid:  ['', Validators.required],
            unimed_vdescripcion:  ['', Validators.required],
            unimed_ntipo:  [''],
            unimed_nsts:  ['']
          });
        authS.øbserverCompanySelected.pipe( takeUntil(this.$destroy) ).subscribe((x: any) => {
            this.getCompanias();
        });
    }

    ngOnInit() {

    }

    getCompanias() {
        this.companias = [];
        this.cia_nid?.setValue('');
        this.dbapi.getCompanias().pipe(take(1)).subscribe({ next: (data: any) => {
                if ( !data || data == null || data === '' ) {
                    console.log('Error consultando compañías');
                    return;
                }
                for (const key in data) {
                    const item={id:data[key]['cia_nid'], text:data[key]['cia_vnombre'], obj:data[key]}
                    this.companias = [ ...this.companias, item ];
                }
                this.companias.length == 1 && this.cia_nid?.setValue(this.companias[0]);
            }, error: (err) => {
                console.log(err);
                this.edit.emit({ type: 'error', title: 'Ha ocurrido un error', message: err })
            }
        });
    }

    ngOnChanges() {
        if (this.UnidadMedida && this.UnidadMedida?.unimed_nid && this.UnidadMedida?.unimed_nid > 0) {
            this.unimed_nid?.setValue(this.UnidadMedida?.unimed_nid)
            this.cia_nid?.setValue(this.UnidadMedida?.cia_nid)
            this.unimed_vdescripcion?.setValue(this.UnidadMedida?.unimed_vdescripcion)
            this.unimed_ntipo?.setValue(this.UnidadMedida?.unimed_ntipo)
            this.unimed_nsts?.setValue(this.UnidadMedida?.unimed_nsts)
        }
    }

    save(){
        if (this.createForm.valid && !this.guardando) {
            this.guardando = true;
            const _UnidadMedida: UnidadMedida = {
                unimed_nid: this.unimed_nid?.value > 0 ? this.unimed_nid?.value : null,
                cia_nid: this.cia_nid?.value.id,
                unimed_vdescripcion: this.unimed_vdescripcion?.value.trim().toUpperCase(),
                unimed_ntipo: this.unimed_ntipo?.value > 0 ? this.unimed_ntipo?.value : 0,
                unimed_nsts: 1
            }
            this.dbapi.save(_UnidadMedida).pipe(take(1)).subscribe({ next: (res: any) => {
                    if (res.type == 'success') {
                        this.skNsCore.notificarUpsert('/inventario/unidadesmedidas', this.authS.isValidCia(false).toString(), this.authS.usuario.user_nid.toString(), true)
                        this.limpiarForm();
                    }
                    this.edit.emit(res)
                    this.guardando = false;
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
        this.unimed_nid?.setValue(0);
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

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
      }

    get unimed_nid() { return this.createForm.get('unimed_nid') };
    get cia_nid() { return this.createForm.get('cia_nid') };
    get unimed_vdescripcion() { return this.createForm.get('unimed_vdescripcion') };
    get unimed_ntipo() { return this.createForm.get('unimed_ntipo') };
    get unimed_nsts() { return this.createForm.get('unimed_nsts') };

}
