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
    fact_ndoc?: number;
    fact_nfactura?: number;
    fact_ndocreferencia?: number;
    fact_ntipo?: number;
    fact_nvendedor?: number;
    fact_ncobrador?: number;
    fact_vdocexoneracion?: number;
    fact_nordencompra?: number;
    fact_dcredito?: number;
    fact_dfecha?: number;
    fact_dfechacreacion?: number;
    fact_dfechavencimiento?: number;
    fact_vobservaciones?: number;
    fact_nisv?: number;
    fact_ntotal?: number;
    fact_vdocreferencia?: number;
    fact_vdocreferenciados?: number;
    fact_vdocreferenciatres?: number;
    fact_nsolocrearfactura?: number;
    fact_nsts?: number;
}

export interface FacturaSts {
    fact_nid?: number;
    fact_nsts?: number;
}