'use strict'
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const cupon = require('./models/cupon');
const usuario = require('./models/usuario');
const servicio = require('./models/service');
const servxuser = require('./models/servxuser')
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

app.get('/mservices', (req, res) => {
  res.render('mant_services.pug');
});

app.get('/registroservicio', (req, res) => {
  res.render('registro_servicio.pug');
//  res.render('mant_service.pug');
});

app.get('/prestaserv', (req, res) => {
  res.render('prestaserv.pug');
});

app.get('/userinfo', (req, res) => {
  res.render('user_info.pug');
});

app.get('/mperfiles', (req, res) => {
  res.render('mant_perfiles.pug');
});
//REDIRECCIONES


//PETICIONES
app.post('/services', (req, res) => {
  //const { project } = req.body;
  servicio.find({})
  .exec((err, service) => {
      if (err) {
          res.status(400).json({
              exito: false,
              err
          });
      }
      //console.log(`pase por cupones ${res.json}`);
      res.json({
          service,
      });
  });
});

app.post('/servxuser', (req, res) => {
  let idserv = req.body.ids;
  //console.log(idserv);

  let qry = {"idServ":idserv};

  servxuser.find(qry,"idUser")
  .exec(function (err,servxuser) {
    if (err)
      console.log(err);
    //console.log(servxuser[0].idUser);
    let i = 0;
    let filtro = '';
    if (servxuser.length > 0){
      while (i < servxuser.length){
        filtro = filtro + ',' + servxuser[0].idUser;
  
        i++;
      }
      filtro = filtro.substring(1, 999);
  
      let filtroJSON = JSON.parse("["+filtro+"]")
  
      usuario.find({"id": {$in: filtroJSON}})
      .exec(function (err,servxuserF){
        //console.log(servxuserF);
        res.json({
          servxuserF,
        });
      })
    } else {
      res.json({message:'No hay usuarios brindando este servicio en este momento'});
    }
    
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

app.post('/list_service', (req, res) => {
  servicio.find({})
  .exec((err,service) => {
    if (err) {
      res.status(400).json({
        exito: false,
        err
      });
    }

    res.json({
      service
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

app.post('/findService', (req, res) => {
  const filtro = req.body.clave;
  let qry;
  
  if (isNaN(filtro)){
    qry = { $or : [{"title": {$regex:'.*'+filtro+'.*'}}, {"desc": {$regex:'.*'+filtro+'.*'}}]};
  } else {
    qry = { $or : [{"id": filtro}, {"title": {$regex:'.*'+filtro+'.*'}}, {"desc": {$regex:'.*'+filtro+'.*'}}]};
  }

  servicio.find(qry)
  .exec(function (err,findService){
    if (err)
      console.log(err);
    
    res.json({
      findService,
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

app.post('/findServiceByID', (req, res) => {
  const filtro = req.body.clave;
  let qry = filtro;

  servicio.findById(qry, function(err,findService){
    if (err)
      console.log(err);
    
    res.json({
      findService,
    });
  })
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

  app.post('/UpdateServiceByID', (req, res) => {
    /*  Update User*/
      const filtro = req.body.clave;
  
      const title = req.body.title;
      const desc = req.body.desc;
  
      let qry = filtro;
  
      //console.log(filtro);
      //usuario.find({ $and : [{id: filtro}, {usuario: filtro}, {ruc: filtro}, {nombre: filtro}, {email: filtro}]})
      servicio.findByIdAndUpdate(qry, {"title":title, "desc":desc},
        (err, updated) =>{
        if (err)
          return res.status(500).send({message:`error al actualizar servicio: ${err}`})
        
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

app.post('/registrar_servicio', (req, res) => {
  /* AQUI SE REGISTRAN LOS NUEVOS SERVICIOS */
    var srv = new servicio();

    function newID(){
      servicio.find().sort({id:-1}).limit(1)
      .exec((err, maxsrv) => {
        if (err) {
          console.log(err);
        }
        if (maxsrv[0] !== undefined){
          srv.id = maxsrv[0].id+1
        } else {
          srv.id = 0;
        }
        srv.title = req.body.title
        srv.desc = req.body.desc

        console.log(srv.title);
        console.log(srv.desc);

        srv.save(function(err){
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