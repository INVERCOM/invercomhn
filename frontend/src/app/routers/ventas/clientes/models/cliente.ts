export interface Cliente {
    cli_nid?: number;
    cia_nid?: number;
    cli_vnombre?: string;
    cli_videntidad?: string;
    cli_vrtn?: string;
    cli_vdireccion?: string;
    cli_vtelefono?: string;
    cli_nsts?: number;
}

export interface ClienteSts {
    cli_nid?: number;
    cli_nsts?: number;
}