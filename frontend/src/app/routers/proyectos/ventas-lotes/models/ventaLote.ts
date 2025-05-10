export interface VentaLote {
    venlot_nid?: number;
    lote_nid?: number;
    cli_nid? : number;
    venlot_dfecha?: string;
    venlot_fprecio?: string; 
    venlot_fprima?: string;
    venlot_fvalorfinal? : number;
    venlot_ftasainteresanual? : number;
    venlot_nnumeromeses? : number;
    venlot_ndiapago? : number;
    venlot_ndiamaxpago? : number;
    venlot_fcuotanivelada? : number;
    venlot_vobservaciones? : string;
    venlot_nsts?: number;
}

export interface VentaLoteSts {
    venlot_nid?: number;
    venlot_nsts?: number;
}
