export interface Lote {
    lote_nid?: number;
    proy_nid?: number;
    unimed_nid? : number;
    lote_vcodigo?: string;
    lote_vnombre?: string; 
    lote_vgeopath?: string;
    lote_fmedida? : number;
    lote_flargo? : number;
    lote_fancho? : number;
    lote_fprecio_unidad? : number;
    lote_fprecio? : number;
    lote_nsts?: number;
}

export interface LoteSts {
    lote_nid?: number;
    lote_nsts?: number;
}
