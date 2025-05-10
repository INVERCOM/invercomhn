export interface DocumentoFiscal {
    docfis_nid?: number;
    cia_nid?: number;
    docfis_vcodigo?: string;
    docfis_vdescripcion?: string;
    docfis_nrebajarinventarios?: number;
    docfis_ngenerarcxc?: number;
    docfis_nsts?: number;
}

export interface DocumentoFiscalSts {
    docfis_nid?: number;
    docfis_nsts?: number;
}