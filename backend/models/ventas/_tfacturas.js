// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

const _tpuntos_emision = require('./_tpuntos_emision');
const _tregistros_fiscales = require('./_tregistros_fiscales');
const _tdocumentos_fiscales = require('./_tdocumentos_fiscales');
const _tclientes = require('./_tclientes');
const _tmonedas = require('../admin/_tmonedas');
const _tformas_pagos = require('../ventas/_tformas_pagos');

// Modelo de la tabla de registros de autorizaciones fiscales
const _tfacturas = db.define('_tfacturas', {
    fact_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la factura'
    },
    punemi_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tpuntos_emision,
            key: 'punemi_nid'
          },
        comment: 'Id del punto de emision'
    },
    regfis_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tregistros_fiscales,
            key: 'regfis_nid'
          },
        comment: 'Id del registro fiscal'
    },
    docfis_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tdocumentos_fiscales,
            key: 'docfis_nid'
          },
        comment: 'Id del documento fiscal'
    },
    cli_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tclientes,
            key: 'cli_nid'
          },
        comment: 'Id del cliente'
    },
    mone_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tmonedas,
            key: 'mone_nid'
          },
        comment: 'Id de la moneda'
    },
    mone_nidlocal: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tmonedas,
            key: 'mone_nid'
          },
        comment: 'Id de la moneda local de la cia'
    },
    forpag_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tformas_pagos,
            key: 'forpag_nid'
          },
        comment: 'Id de la forma de pago de la factura'
    },
    fact_nfactorcambio : {
        type: 'NUMERIC(10,4)',
        comment: 'Factor de cambio de la factura',
        defaultValue: 1
    },
    fact_ncai : {
        type: Sequelize.STRING,
        comment: 'CAI'
    },
    fact_ndoc : {
        type: Sequelize.STRING,
        comment: 'Numero de documento'
    },
    fact_nfactura : {
        type: Sequelize.BIGINT,
        comment: 'Numero de la factura'
    },
    fact_ndocreferencia : {
        type: Sequelize.STRING,
        comment: 'Numero de la factura de referencia'
    },
    fact_ntipo : {
        type: Sequelize.SMALLINT,
        comment: 'Tipo de factura (1: contado, 2: al crédito)'
    },
    fact_nvendedor : {
        type: Sequelize.BIGINT,
        comment: 'Vendedor'
    },
    fact_ncobrador : {
        type: Sequelize.BIGINT,
        comment: 'Cobrador'
    },
    fact_vdocexoneracion : {
        type: Sequelize.STRING,
        comment: 'Documento de exoneración'
    },
    fact_nordencompra : {
        type: Sequelize.STRING,
        comment: 'Orden de compra digitada'
    },
    fact_dcredito : {
        type: Sequelize.INTEGER,
        comment: 'Dias de crédito'
    },
    fact_dfecha : {
        type: 'TIMESTAMP',
        comment: 'Fecha de la factura',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    fact_dfechacreacion : {
        type: 'TIMESTAMP',
        comment: 'Fecha de creacion de la factura',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    fact_dfechavencimiento : {
        type: Sequelize.DATEONLY,
        comment: 'Fecha de vencimiento de la factura'
    },
    fact_vobservaciones : {
        type: Sequelize.STRING,
        comment: 'Observaciones'
    },
    fact_nisv : {
        type: 'NUMERIC(10,2)',
        comment: 'ISV de la factura',
        default: 0
    },
    fact_ntotal : {
        type: 'NUMERIC(10,2)',
        comment: 'Total de la factura'
    },
    fact_vdocreferencia : {
        type: Sequelize.STRING,
        comment: 'Documento de referencia #1'
    },
    fact_vdocreferenciados : {
        type: Sequelize.STRING,
        comment: 'Documento de referencia #2'
    },
    fact_vdocreferenciatres : {
        type: Sequelize.STRING,
        comment: 'Documento de referencia #3'
    },
    fact_nsolocrearfactura : {
        type: Sequelize.STRING,
        comment: 'Campo para parametrizar cuando solo se desea crear la factura sin movimientos en los otros módulos 1 -> SI, 0 -> NO',
        defaultValue: 0
    },
    fact_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la factura'
    }
},{
    schema: 'ventas',
    comment: 'Tabla de facturas, en donde se almacenara todas las facturas'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tfacturas;