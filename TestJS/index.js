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

app.post('/logines', (req, res) => {
/*  res.json({message: `${logstart(user, data)}`});*/
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


app.post('/registrar', (req, res) => {
  /*  res.json({message: `${logstart(user, data)}`});*/

    var usr = new usuario();

    function newID(){
      usuario.find().sort({id:-1}).limit(1)
      .exec((err, maxusr) => {
        if (err) {
          console.log(err);
        }
        usr.id = maxusr[0].id+1
        usr.nombre = req.body.nombre
        usr.usuario = req.body.user
        usr.pass = req.body.pass
        usr.email = req.body.email
        usr.typeAcc = req.body.typeAcc

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
    
    //console.log(idAuto);
  });
//PETICIONES


connectDb().then(() => {
  app.listen(port, () => {
    console.log(`La aplicacion esta ejecutando en el puerto: ${port}`);
  });
});