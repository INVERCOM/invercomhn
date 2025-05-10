export interface ConceptoInventario {
    coninv_nid ?: number;
    cia_nid?: number;
    coninv_vdescripcion?: string;
    coninv_vobservaciones?: string;
    coninv_ntipo?: number;
    coninv_nbodegaconfigurada?: number;
    coninv_nisvencosteo?: number;
    coninv_ndevolucion?: number;
    coninv_nsts?: number;
}

export interface ConceptoInventarioSts {
    coninv_nid?: number;
    coninv_nsts?: number;
}