export interface RegistroFiscal {
    regfis_nid?: number;
    punemi_nid?: number;
    docfis_nid?: number;
    regfis_vcai?: string;
    regfis_vnumeroautorizacion?: string;
    regfis_ninicio?: number;
    regfis_nfin?: number;
    regfis_dfechamaxemision?: string;
    regfis_nsts?: number;
}

export interface RegistroFiscalSts {
    regfis_nid?: number;
    regfis_nsts?: number;
}