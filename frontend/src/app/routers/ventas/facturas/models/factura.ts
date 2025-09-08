export interface Factura {
    fact_nid?: number;
    punemi_nid?: number;
    regfis_nid?: number;
    docfis_nid?: number;
    cli_nid?: number;
    mone_nid?: number;
    mone_nidlocal?: number;
    forpag_nid?: number;
    fact_nfactorcambio?: number;
    fact_ncai?: number;
    fact_ndoc?: string | null;
    fact_nfactura?: string | null;
    fact_ndocreferencia?: string | null;
    fact_ntipo?: number;
    fact_nvendedor?: number;
    fact_ncobrador?: number;
    fact_vdocexoneracion?: string;
    fact_nordencompra?: string;
    fact_dcredito?: number;
    fact_dfecha?: any;
    fact_dfechacreacion?: any;
    fact_dfechavencimiento?: any;
    fact_vobservaciones?: string;
    fact_nisv?: number;
    fact_ntotal?: number;
    fact_vdocreferencia?: string;
    fact_vdocreferenciados?: string;
    fact_vdocreferenciatres?: string;
    fact_nsolocrearfactura?: number;
    fact_nsts?: number;
    _tfacturas_detalle?: any[];
}

export interface FacturaSts {
    fact_nid?: number;
    fact_nsts?: number;
}