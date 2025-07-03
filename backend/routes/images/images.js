'use strict'
const express = require('express');
const fs = require('fs');
const path = require('path');

const api = express.Router();

api.get('/companias/:id', (req, res, next) => {
	const dir = path.join(__dirname, '../../images/cias-' + req.params.id + '.jpg');
	if (fs.existsSync(dir)) {
		res.sendFile(dir)
		return;
	} else {
		console.log('Archivo inexistente');
		res.sendFile(path.join(__dirname, '../../FTP/default-images/default-0.png') )
	}
});

api.get('/proyectos/:id', (req, res, next) => {
	const dir = path.join(__dirname, '../../images/proyectos-' + req.params.id + '.jpg');
	if (fs.existsSync(dir)) {
		res.sendFile(dir)
		return;
	} else {
		console.log('Archivo inexistente');
		res.sendFile(path.join(__dirname, '../../FTP/default-images/default-0.png') )
	}
});

api.get('/lotes/:id', (req, res, next) => {
	const dir = path.join(__dirname, '../../images/lotes-' + req.params.id + '.jpg');
	if (fs.existsSync(dir)) {
		res.sendFile(dir)
		return;
	} else {
		console.log('Archivo inexistente');
		res.sendFile(path.join(__dirname, '../../FTP/default-images/default-0.png') )
	}
});


module.exports=api