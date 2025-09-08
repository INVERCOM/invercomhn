'use strict'
const Sequelize = require('../../database/postgres/conexion');
const FacturasModel = require('../../models/ventas/_tfacturas');
const FacturasDetalleModel = require('../../models/ventas/_tfacturas_detalle');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function saveFactura( req, res ) {
    console.log(req.body);

    const body = {...req.body};
    let noConsultarFactura = false
    const userLog = body['_tp_tusuarioLog'];
    delete body['_tp_tusuarioLog'];
    let result = false, accion = 0, factura = 0
    const facturas = body['facturas'];
    const t = await Sequelize.transaction();
    try {
        for await (const fact of facturas) {
            let sql ='', log_vquery = '', totalFacturaDet = 0, totalISVDet = 0;
            noConsultarFactura = fact['noConsultarFactura'];
            const facturasDetalle = fact['detalle'];
            const noCalcular = fact['noCalcular'];
            delete fact['detalle'];
            delete fact['turno'];
            delete fact['transaccion'];
            delete fact['transaccionExtra'];
            delete fact['backorderOV'];
            delete fact['firmaFactura'];
            delete fact['noCalcular'];
            delete fact['noConsultarFactura'];
            if (!noCalcular) {
                for await (const factDet of facturasDetalle) {
                    if (factDet['facdet_fimportetotal'] > 0 && factDet['facdet_fcantidad'] > 0) {
                        const costo =  factDet['mater_isvincluido'] && factDet['mater_isvincluido'] > 0 && factDet['facdet_fimportebruto'] > 0 ? (factDet['facdet_fimportebruto'] / factDet['facdet_fcantidad']) : factDet['facdet_fcosto'];
                        const facdet_fimportetotal = parseFloat(((factDet['facdet_fcantidad'] * costo) - factDet['facdet_fdescuento_valor'] ) + parseFloat(factDet['facdet_fimpuestostotal']))
                        if(factDet['facdet_fimportetotal'].toFixed(2) != facdet_fimportetotal.toFixed(2)){
                            console.log('NO CUADRA ==> ', factDet['facdet_fimportetotal'], facdet_fimportetotal, factDet)
                            // Esto es solo para fransol y toma en centa el calculo del isv solo el del total de la factura
                            if (userLog['cia_nid'] == '55'){
                                factDet['facdet_fimportetotal'] = facdet_fimportetotal;
                                console.log('CUADRA ==> ', factDet['facdet_fimportetotal'], facdet_fimportetotal, factDet);
                            }
                        }
                        totalFacturaDet = parseFloat(totalFacturaDet) + parseFloat(factDet['facdet_fimportetotal']);
                        fact['fact_vdocexoneracion'] && fact['fact_vdocexoneracion'] != '' && (factDet['facdet_fimpuestostotal'] = 0)
                        if (factDet['mater_isvincluido'] === 1 && !(factDet['facdet_fdescuento_valor'] > 0) && factDet['facdet_fimpuestosaplicados'] > 0){
                            factDet['facdet_fimporteneto'] = factDet['facdet_fimportetotal'] / (1 + (factDet['facdet_fimpuestosaplicados'] / 100))
                            factDet['facdet_fimpuestostotal'] = factDet['facdet_fimportetotal'] - factDet['facdet_fimporteneto']
                        }
                        totalISVDet = parseFloat(totalISVDet) + parseFloat(factDet['facdet_fimpuestostotal']);
                    }
                }
                fact['fact_ntotal'] != totalFacturaDet && totalFacturaDet > 0 && (fact['fact_ntotal'] = totalFacturaDet);
                fact['fact_nisv'] != totalISVDet && totalISVDet > 0 && (fact['fact_nisv'] = totalISVDet);
            }
            if (!fact['fact_nid'] || !(fact['fact_nid'] > 0)) {
                if ( !(fact['mone_nidlocal'] > 0)) {
                    fact['mone_nidlocal'] = fact['mone_nid']
                    fact['fact_nfactorcambio'] = 1;
                }
                fact['fact_dfecha'] = fact['fact_dfecha'] && fact['fact_dfecha'] != '' ? fact['fact_dfecha'].split('T').join(' ') : fact['fact_dfecha']; 
                if (fact['forpag_nid'] == 40) { fact['fact_ntipo'] = 2 } // TODO: Borrar esto despues
                factura = FacturasModel.build(fact);
                result = await factura.save({ logging: function (str) { sql = str}, transaction: t});
                accion = 1
            } else {
                factura = fact;
                result = await FacturasModel.update(factura, {where: { fact_nid: factura.fact_nid }, logging: function (str) { sql = str} });
                accion = 2
            }
            if (result) {
                log_vquery = sql + ' | ' + JSON.stringify(factura['dataValues'] + JSON.stringify({detalle: facturasDetalle}));
                await logsController.createLog('_tfacturas', factura.fact_nid, userLog['usu_nid'], accion, 1, 3, log_vquery, userLog['plata_name']);
                for await (const detalle of facturasDetalle) {
                    // La bodega se evalúa con distinto a vació porque aquí van juntos, tanto la bodega como la ubicación virtual
                    if (detalle.bode_nid && detalle.bode_nid != '' && detalle.lspr_nid > 0 && detalle.facdet_fcantidad > -1) {
                        const factDetalle = {
                            facdet_nid: detalle['facdet_nid'] > 0 ? detalle['facdet_nid'] : null,
                            fact_nid: factura['fact_nid'],
                            lspr_nid: detalle['lspr_nidselect'] > 0 ? detalle['lspr_nidselect'] : detalle['lspr_nid'],
                            bode_nid: detalle['bode_nid'].split('-').length > 1 ? detalle['bode_nid'].split('-')[0] : detalle['bode_nid'],
                            ubivir_nid: detalle['bode_nid'].split('-').length > 1 ? detalle['bode_nid'].split('-')[1] : (detalle['ubivir_nid'] && detalle['ubivir_nid'] > 0 ? detalle['ubivir_nid'] : 0),
                            facdet_fcantidad: detalle['facdet_fcantidad'],
                            // facdet_fcosto: detalle['mater_isvincluido'] && detalle['mater_isvincluido'] > 0 ? (detalle['facdet_fcosto'] - (detalle['facdet_fimpuestostotal'] / detalle['facdet_fcantidad'])) : detalle['facdet_fcosto'],
                            facdet_fcosto: detalle['mater_isvincluido'] && detalle['mater_isvincluido'] > 0 && detalle['facdet_fimportebruto'] > 0 ? (detalle['facdet_fimportebruto'] / detalle['facdet_fcantidad']) : (detalle['facdet_fcosto'] > 0 ? detalle['facdet_fcosto'] : 0),
                            facdet_fdescuento: detalle['facdet_fdescuento'],
                            facdet_fdescuentovalor: detalle['facdet_fdescuento_valor'],
                            facdet_fimpuestostotal: detalle['facdet_fimpuestostotal'],
                            facdet_fimpuestosaplicados: detalle['facdet_fimpuestosaplicados'],
                            facdet_vdescripcion: detalle['facdet_vdescripcion'] ? detalle['facdet_vdescripcion'] : '',
                            lotmat_nid: detalle['lotmat_nid'] > 0 ? detalle['lotmat_nid'] : null,
                            unimed_nidequiv: detalle['unimed_nidequiv'] > 0 ? detalle['unimed_nidequiv'] : null,
                            facdet_fequivalencia: detalle['facdet_fequivalencia'] > 0 ? detalle['facdet_fequivalencia'] : 1,
                            lspr_nidorigen: detalle['lspr_nidorigen'] > 0 ? detalle['lspr_nidorigen'] : null
                        }
                        const comisionesInfo = detalle['comisionesInfo'];
                        if (factDetalle['facdet_nid'] > 0 ) {
                            const detFactura = factDetalle;
                            await FacturasDetalleModel.update(detFactura, {where: { facdet_nid: detFactura.facdet_nid}, transaction: t});
                            await ComisionesFacturaDetalle.destroy({ where:{ facdet_nid: detFactura['facdet_nid'] } });
                            if (comisionesInfo && comisionesInfo['agen_nid'] > 0 && comisionesInfo['comdetfac_nporcentaje'] > 0){
                                comisionesInfo['facdet_nid'] = detalleOrdenVenta['facdet_nid'];
                                const comisionesFacturaDetalle = ComisionesFacturaDetalle.build(comisionesInfo);
                                await comisionesFacturaDetalle.save({transaction: t});
                            }
                        } else {
                            const detFactura = FacturasDetalleModel.build(factDetalle);
                            await detFactura.save({transaction: t});
                            if (comisionesInfo && comisionesInfo['agen_nid'] > 0 && comisionesInfo['comdetfac_nporcentaje'] > 0){
                                comisionesInfo['facdet_nid'] = detFactura['facdet_nid'];
                                const comisionesFacturaDetalle = ComisionesFacturaDetalle.build(comisionesInfo);
                                await comisionesFacturaDetalle.save({transaction: t});
                            }
                        }
                    }
                }
            }
        }
        // throw new Error('errorGeneradoRegistroContable');
        if (result) {
            await t.commit();
            // if (factura['fact_nsts'] == 1) {
            //     const generarMov = await generarMovimientoInventario( factura, userLog );
            //     if (!(generarMov && generarMov.status)) { throw new Error('errorGeneradoRegistro-'+generarMov.error) }

            //     const infoMovimiento = await MoviminetosCuentasCobrar.findAll({
            //         where:{
            //             movcuecob_facturaid: factura['fact_nid']
            //         },
            //         include:[{
            //             model:MoviminetosCuentasCobrarDetalle,
            //             as:'_tmovimientos_detalle',
            //             required: true
            //         }]
            //     })
            //     if (infoMovimiento && infoMovimiento.length > 0) {
            //         for await (const info of infoMovimiento) {
            //             if (info && info['movcuecob_nid'] > 0) {
            //                 info['_tp_tusuarioLog'] = userLog;
            //                 info['_movimiento_cuenta_detalle'] = info['_tmovimientos_detalle'];
            //                 const generarMovCxc = await GeneracionMovimientosContablesController.createInterconexionConceptoCXC(info['concuecob_nid'], info)
            //                 if (!generarMovCxc) {
            //                     throw new Error('errorGeneradoRegistroContable');
            //                 }
            //             }
            //         }
            //     }
            // }
            const data = factura; //noConsultarFactura ? factura : await getOneFacturaByID({ body : { fact_nid :result.fact_nid, return : true }  }, res );
            res.status(201).send({type:'success', title:'create.toast.title_saved', data:data, message:'create.toast.saved'});
            // const cia = data  && data['_tpuntos_emision'] && data['_tpuntos_emision']['_tsucursales'] ? data['_tpuntos_emision']['_tsucursales']['cia_nid'] : 0
            // cia > 0 && io.of('/Core').to('cia'+cia).emit(`/ventas/sharedFacturas+${cia}`, 'Upsert ejecutado');
            // if (factura['ordven_nid'] > 0) {
            //     await logsController.createLog('_tordenes_ventas', factura['ordven_nid'], userLog['usu_nid'], 8, 1, 3, '', userLog['plata_name']);
            // }
        }
    } catch (error) {
        global._globalDebug && console.log( `Error crear factura: ${error}`, req.body);
        res.status(500).send({type:'error', title:'create.toast.title_error' , message:'create.toast.srverror'});
        await t.rollback();
        // if(error['message'] === 'noRegistroFiscal'){
        //     res.status(200).send({type:'warning', title:'create.toast.noRegistroFiscal' , message:'create.toast.srnoRegistroFiscal'})
        //     await t.rollback();
        // } else if (error['message'] && error['message'].split(',') && error['message'].split(',')[0]  === 'registroFiscalVencido') {
        //     res.status(200).send({type:'warning', title:'create.toast.registroFiscalVencido' , message:'create.toast.srregistroFiscalVencido'})
        //     await t.rollback();
        // } else if (error['message'] === 'errorGeneradoRegistro') {
        //     res.status(200).send({type:'warning', title:'create.toast.errorGeneradoRegistro' , message:'create.toast.srerrorGeneradoRegistro'})
        //     if (factura && factura['fact_nid'] > 0) { await Sequelize.query(`select ventas._eliminar_factura(${factura['fact_nid']});`, { type: QueryTypes.SELECT }); }
        // } else if (error['message'].startsWith('errorGeneradoRegistro')) {
        //     const errorMensaje = error['message'].split('-');
        //     res.status(200).send({type:'warning', title:'create.toast.errorGeneradoRegistro' , message:(errorMensaje && errorMensaje.length > 1 ? errorMensaje[1] : error['message'])})
        //     if (factura && factura['fact_nid'] > 0) { await Sequelize.query(`select ventas._eliminar_factura(${factura['fact_nid']});`, { type: QueryTypes.SELECT }); }
        // } else if (error['message'] === 'errorGeneradoRegistroContable') {
        //     res.status(200).send({type:'warning', title:'create.toast.errorGeneradoRegistroContable' , message:'create.toast.srerrorGeneradoRegistroContable'})
        //     if (factura && factura['fact_nid'] > 0) { await Sequelize.query(`select ventas._eliminar_factura(${factura['fact_nid']});`, { type: QueryTypes.SELECT }); }
        // } else if (error['message'] === 'documentoCerrado') {
        //     console.log(`Documento cerrado volver a guardar: ${error}`);
        //     res.status(500).send({type:'warning', title:'create.toast.documentoCerrado', data:{text: 'documentoCerrado'} , message:'create.toast.documentoCerradoText'})
        //     await t.rollback();
        // }  else {
            
        // }
    }
}

// async function getOneFacturaByID( req, res ) {
//     try {
//         const data = await Facturas.findOne({ 
//                 where:{ fact_nid :  req.body['fact_nid'] },
//                 // attributes: {
//                 //     include: [
//                 //         [
//                 //             Sequelize.literal(`(
//                 //                 select LPAD(CAST((select regfisc_nrangoini from ventas."_tregistros_fiscales" where punemi_nid = _tfacturas.punemi_nid and tfiscdoc_nid = _tfacturas.tfiscdoc_nid and _tregistros_fiscales.tfiscdoc_nid = _tfacturas.tfiscdoc_nid and regfisc_nrangoini <= fact_nfactura and regfisc_nrangofin >= fact_nfactura limit 1) as VARCHAR),8,'0')
//                 //             )`),
//                 //             'rangoini'
//                 //         ],[
//                 //             Sequelize.literal(`(
//                 //                 select LPAD(CAST((select regfisc_nrangofin from ventas."_tregistros_fiscales" where punemi_nid = _tfacturas.punemi_nid and tfiscdoc_nid = _tfacturas.tfiscdoc_nid and _tregistros_fiscales.tfiscdoc_nid = _tfacturas.tfiscdoc_nid and regfisc_nrangoini <= fact_nfactura and regfisc_nrangofin >= fact_nfactura limit 1) as VARCHAR),8,'0')
//                 //             )`),
//                 //             'rangofin'
//                 //         ],[
//                 //             Sequelize.literal(`(
//                 //                 select regfisc_dfechalimite from ventas."_tregistros_fiscales" where punemi_nid = _tfacturas.punemi_nid and tfiscdoc_nid = _tfacturas.tfiscdoc_nid and _tregistros_fiscales.tfiscdoc_nid = _tfacturas.tfiscdoc_nid and regfisc_nrangoini <= fact_nfactura and regfisc_nrangofin >= fact_nfactura limit 1
//                 //             )`),
//                 //             'dateEmision'
//                 //         ],[
//                 //             Sequelize.literal(`(
//                 //                 SELECT SUM(CASE WHEN doccli_ntipo = 1 THEN doccli_fimporte ELSE 0 END) - SUM(CASE WHEN doccli_ntipo = 2 THEN doccli_fimporte ELSE 0 END) FROM cuentasxcobrar."_tdocumentos_cliente" WHERE cli_nid = _tfacturas.cli_nid AND doccli_nsts = 1 AND doccli_nstsfactura > 0
//                 //             )`),
//                 //             'saldoActualCXC'
//                 //         ],[
//                 //             Sequelize.literal(`(
//                 //                 SELECT COALESCE((SELECT doccli_fimporte FROM cuentasxcobrar."_tdocumentos_cliente" WHERE cli_nid = _tfacturas.cli_nid AND doccli_ntipo = 2 AND doccli_nstsfactura > 0 ORDER BY doccli_nid DESC LIMIT 1), 0)
//                 //             )`),
//                 //             'ultimoPago'
//                 //         ]
//                 //     ]
//                 // },
//                 as:'_tfacturas',
//                 include: [{
//                     model:TiposDocumentos,
//                     as:'_ttipos_documentos_fiscales',
//                 },{
//                     model:Puntos,
//                     as:'_tpuntos_emision',
//                     include: [{
//                             model:Sucursales,
//                             as:'_tsucursales',
//                             required: true,
//                             include: [{
//                                 model:Cias,
//                                 as:'_tp_tcias',
//                                 required: true,
//                             }]
//                         }
//                     ]
//                 },{
//                     model:Clientes,
//                     as:'_tp_tclientes',
//                     include: [{
//                         model:FormasPagos,
//                         as:'_tformas_pagos',
//                     }]
//                 },{
//                     model:Monedas,
//                     as:'_tp_tmonedas',
//                 },{
//                     model:Agentes,
//                     as:'_tagentes',
//                 },{
//                     model:FormasPagos,
//                     as:'_tforma_pago'
//                 },{
//                     model:Conceptos,
//                     as:'_tconceptos_inventario',
//                 },{
//                     model:Turnos,
//                     as:'_tturnos',
//                 },{
//                     model:FacturasDetalle,
//                     as:'_tfacturas_detalle',
//                     include: [{
//                         model:Precios,
//                         as:'tlista_precios',
//                         required: false,
//                         include: [{
//                             model:Materiales,
//                             as:'_tp_tmateriales',
//                             required: false
//                         },{
//                             model:UnidadesMedidas,
//                             as:'_tunidades',
//                             required: false
//                         }]
//                     },{
//                         model: Bodegas,
//                         as:'tbodegas',
//                         required: false
//                     },{
//                         model: UbicacionesVirtuales,
//                         as:'_ubicavirtu',
//                         required: false
//                     },{
//                         model: Lotesmateriales,
//                         as:'lotes_mater',
//                         required: false
//                     },{
//                         model: UnidadesMedidas,
//                         attributes:['unimed_nid', 'unimed_vdesc'],
//                         as: '_tunimed_equiv',
//                         required: false
//                     }]
//                 },{
//                     model:OrdenesVentas,
//                     as:'_tordven',
//                     required: false,
//                     include: [{
//                         model:OrdenesVentasDetalle,
//                         as:'_torvendet',
//                         where: { ordvendet_nsts : 1 },
//                         required: false,
//                         include:[{
//                             model:OrdenesProduccion,
//                             as:'_tordproinv',
//                             required: false,
//                             include:[{
//                                 model:Pinturas,
//                                 attributes:['pint_vcodigo','pint_vdescripcion','pint_vvehiculo'],
//                                 as:'_tpinturas',
//                                 required: false,
//                             }]
//                         }]
//                     }]
//                 }
//             ] 
//         });
//         if (req.body['return']) {
//             return data
//         }else{
//             res.status(200).json(data);
//         }
//     } catch (error) {
//         global._globalDebug && console.log( `Error ${error}` );
//         res.status(500).send({type:'error', title:'update.toast.title_error' , message:'update.toast.srverror'});   
//     }
// }

// function definirRelaciones() {
//     AgentesModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
//     CiaModel.hasMany(AgentesModel,{as:'agens', foreignKey : 'cia_nid'});
// }

// definirRelaciones();

module.exports = {
    saveFactura
}