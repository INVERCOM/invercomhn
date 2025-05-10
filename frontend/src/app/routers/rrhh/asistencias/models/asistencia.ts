export interface Asistencia {
    asis_nid?: number;
    cia_nid?: number;
    emp_nid?: number;
    asis_ttfechaentrada?: string;
    asis_nlatentrada?: string;
    asis_nlongentrada?: string;
    asis_ttfechasalida?: string;
    asis_nlatsalida?: string;
    asis_nlongsalida?: string;
    asis_nminutosreceso?: number;
    asis_nsts?: number;
}

export interface AsistenciaSts {
    asis_nid?: number;
    asis_nsts?: number;
}