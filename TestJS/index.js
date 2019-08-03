'use strict'
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const cupon = require('./models/cupon');
const usuario = require('./models/usuario');
const { connectDb } = require('./mongoose');
const { test } = require('./utils');
const app = express();
const port = 2525;

// Configuraciones
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Enabling JSON bodyParser
app.use(bodyParser());

// Archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/style', express.static(path.join(__dirname, 'style')));


// REDIRECCIONES
app.get('/', (req, res) => {
  res.render('menu.pug');
});

app.get('/login', (req, res) => {
  res.render('login.pug');
});

app.get('/registro', (req, res) => {
  res.render('registro.pug');
});

app.get('/musers', (req, res) => {
  res.render('mant_user.pug');
});
//REDIRECCIONES


//PETICIONES
app.post('/cupones', (req, res) => {
  //const { project } = req.body;
  cupon.find({})
  .exec((err, cupones) => {
      if (err) {
          res.status(400).json({
              exito: false,
              err
          });
      }
      //console.log(`pase por cupones ${res.json}`);
      res.json({
          cupones,
      });
  });
});

app.post('/list_user', (req, res) => {
  //PARA LISTAR TODOS LOS USUARIOS
  usuario.find({})
  .exec((err, user) => {
      if (err) {
          res.status(400).json({
              exito: false,
              err
          });
      }
      //console.log(`pase por cupones ${res.json}`);
      res.json({
          user,
      });
  });
});

app.post('/logines', (req, res) => {
/*  PROCESO DE LOGIN*/
  const { user, pass } = req.body;
  usuario.find({ $and: [ 
    { usuario: user }, 
    { pass: pass } 
  ] })
  .exec((err, logines) => {
      if (err) {
          res.status(400).json({
              exito: false,
              err
          });
      }
      //console.log(`pase por login ${res.json}`);
      res.json({
        logines,
      });
  });
});

app.post('/findUser', (req, res) => {
  /*  PROCESO FILTRAR USUARIO*/
    const filtro = req.body.clave;
    let qry;

    if (isNaN(filtro)){
      qry = { $or : [{"usuario": {$regex:'.*'+filtro+'.*'}}, {"ruc": {$regex:'.*'+filtro+'.*'}}, {"nombre": {$regex:'.*'+filtro+'.*'}}, {"email": {$regex:'.*'+filtro+'.*'}}]};
    } else {
      qry = { $or : [{"id": filtro}, {"usuario": {$regex:'.*'+filtro+'.*'}}, {"ruc": {$regex:'.*'+filtro+'.*'}}, {"nombre": {$regex:'.*'+filtro+'.*'}}, {"email": {$regex:'.*'+filtro+'.*'}}]};
    }

    //console.log(filtro);
    //usuario.find({ $and : [{id: filtro}, {usuario: filtro}, {ruc: filtro}, {nombre: filtro}, {email: filtro}]})
    usuario.find(qry)
    .exec(function (err,findUser) {
      if (err)
        console.log(err);
        
      res.json({
        findUser,
      });
    });
  });

app.post('/findUserByID', (req, res) => {
  /*  Buscar por ID*/
    const filtro = req.body.clave;
    let qry = filtro;

    //console.log(filtro);
    //usuario.find({ $and : [{id: filtro}, {usuario: filtro}, {ruc: filtro}, {nombre: filtro}, {email: filtro}]})
    usuario.findById(qry, function(err, findUser){
      if (err)
        console.log(err);
      
      //console.log(findUser);  
      res.json({
        findUser,
      });
    })
    //.exec(function (err,findUser) {
    //});
  });

app.post('/UpdateUserByID', (req, res) => {
  /*  Update User*/
    const filtro = req.body.clave;

    const nom = req.body.nombre;
    const ema = req.body.email;
    const Ruc = req.body.ruc;
    const typ = req.body.typeAcc;
    const est = req.body.estatus;

    let qry = filtro;

    //console.log(filtro);
    //usuario.find({ $and : [{id: filtro}, {usuario: filtro}, {ruc: filtro}, {nombre: filtro}, {email: filtro}]})
    usuario.findByIdAndUpdate(qry, {"nombre":nom, "email":ema, "ruc":Ruc, "typeAcc":typ, "estatus":est},
      (err, updated) =>{
      if (err)
        return res.status(500).send({message:`error al instertar: ${err}`})
      
      //console.log(findUser);  
      res.status(200).send({producto:updated})
    })
    //.exec(function (err,findUser) {
    //});
  });


app.post('/registrar', (req, res) => {
  /* AQUI SE REGISTRAN LOS NUEVOS USUARIOS */

    var usr = new usuario();

    function newID(){
      usuario.find().sort({id:-1}).limit(1)
      .exec((err, maxusr) => {
        if (err) {
          console.log(err);
        }
        if (maxusr[0] !== undefined){
          usr.id = maxusr[0].id+1
        } else {
          usr.id = 0;
        }
        usr.nombre = req.body.nombre
        usr.usuario = req.body.user
        usr.pass = req.body.pass
        usr.email = req.body.email
        usr.typeAcc = req.body.typeAcc
        usr.ruc = req.body.ruc
        usr.estatus = 1

        usr.save(function(err){
          if (err) {
            console.log('bad');
            res.status(400).json({
              exito: false,
              err
            });
          }else{
            console.log('fine');
            res.status(200).json({
              exito: true})
          }
        })
      })
    }

    newID();
    
  });
//PETICIONES


connectDb().then(() => {
  app.listen(port, () => {
    console.log(`La aplicacion esta ejecutando en el puerto: ${port}`);
  });
});