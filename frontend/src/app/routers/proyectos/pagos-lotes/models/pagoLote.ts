export interface PagoLote {
    paglot_nid?: number;
    sucu_nid?: number;
    venlot_nid? : number;
    mone_nid?: number;
    paglot_vnumerodocumento?: string; 
    paglot_dfecha?: string;
    paglot_fimporte? : number;
    paglot_ffactorcambio? : number;
    paglot_fimportelocal? : number;
    paglot_vdocumentoreferecnia?: string;
    paglot_vobservaciones?: string;
    paglot_nsts?: number;
}

export interface PagoLoteSts {
    paglot_nid?: number;
    paglot_nsts?: number;
}
