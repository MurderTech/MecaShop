'use strict'
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const fileUpload = require('express-fileupload')
const Busboy = require('busboy');
const fs = require('fs');

const cupon = require('./models/cupon');
const usuario = require('./models/usuario');
const servicio = require('./models/service');
const servxuser = require('./models/servxuser')
const trabajo = require('./models/trabajo')
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
app.use(fileUpload());


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

app.get('/registroperfiles', (req,res) => {
  res.render('registro_perfiles.pug');
})

app.get('/prestaserv', (req, res) => {
  res.render('prestaserv.pug');
});

app.get('/userinfo', (req, res) => {
  res.render('user_info.pug');
});

app.get('/mtrabajo', (req, res) => {
  res.render('mant_trabajo.pug');
});

app.get('/test', (req, res) => {
  res.render('test.pug');
});
//REDIRECCIONES


//PETICIONES
app.post('/test',(req,res) => {
  var busboy = new Busboy({ headers: req.headers });

  console.log(busboy);

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

    console.log('Entre al file');

    var saveTo = path.join('/images', filename);
    console.log('Uploading: ' + saveTo);
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on('error',function(){
    console.log('error');
  });
  busboy.on('finish', function() {
    console.log('Upload complete');
    res.writeHead(200, { 'Connection': 'close' });
    res.end("That's all folks!");
  });
  return req.pipe(busboy);
})

app.post('/list-trabajo', (req, res) => {
  const idCat = req.body.idCat;
  trabajo.find({"idCategory": idCat})
  .exec((err, work) => {
      if (err) {
          res.status(400).json({
              exito: false,
              err
          });
      }
      //console.log(`pase por cupones ${res.json}`);
      res.json({
        work,
      });
  });
});

app.post('/findTaskById', (req, res) => {
  const clave = req.body.clave;
  trabajo.findById(clave, function(err, findTask){
    if (err)
      console.log(err);
    
    //console.log(findUser);  
    res.json({
      findTask,
    });
  })
});

app.post('/findTask', (req, res) => {
  const filtro = req.body.clave;
  let qry;
  
  qry = { $or : [{"title": {$regex:'.*'+filtro+'.*'}}, {"descr": {$regex:'.*'+filtro+'.*'}}]};

  trabajo.find(qry)
  .exec(function (err,findTask){
    if (err)
      console.log(err);
    
    res.json({
      findTask,
    });
  });
});

app.post('/newWork', (req, res) => {
  const {idCat, title, descr} = req.body;
  
  var task = new trabajo();

  function newID(){
    trabajo.find().sort({id:-1}).limit(1)
    .exec((err, maxusr) => {
      if (err) {
        console.log(err);
      }
      if (maxusr[0] !== undefined){
        task.id = maxusr[0].id+1
      } else {
        task.id = 0;
      }
      task.idCategory = idCat
      task.title = title
      task.descr = descr

      task.save(function(err){
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


app.post('/UpdateTaskByID', (req, res) => {
  /*  Update User*/
    const filtro = req.body.clave;

    const title = req.body.title;
    const descr = req.body.descr;

    let qry = filtro;

    //console.log(filtro);
    //usuario.find({ $and : [{id: filtro}, {usuario: filtro}, {ruc: filtro}, {nombre: filtro}, {email: filtro}]})
    trabajo.findByIdAndUpdate(qry, {"title":title, "descr":descr},
      (err, updated) =>{
      if (err)
        return res.status(500).send({message:`error al instertar: ${err}`})
      
      //console.log(findUser);  
      res.status(200).send({producto:updated})
    })
    //.exec(function (err,findUser) {
    //});
  });


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

app.post('/addWorkToUser', (req, res) => {
  const {idUser, idServ, price} = req.body;
  
  var task = new servxuser();

  task.idUser = idUser
  task.idServ = idServ
  task.price = price

  task.save(function(err){
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

});

app.post('/workUser', (req, res) => {
  let idUser = req.body.idu;
  //console.log(idserv);

  let qry = {"idUser":idUser};

  servxuser.find(qry,"idServ")
  .exec(function (err,servxuser) {
    if (err)
      console.log(err);
    //console.log(servxuser[0].idUser);
    let i = 0;
    let filtro = '';
    if (servxuser.length > 0){
      while (i < servxuser.length){
        filtro = filtro + ',' + servxuser[0].idServ;
  
        i++;
      }
      filtro = filtro.substring(1, 999);
  
      let filtroJSON = JSON.parse("["+filtro+"]")
  
      trabajo.find({"id": {$in: filtroJSON}})
      .exec(function (err,workxuser){
        res.json({
          workxuser,
        });
      })
    } else {
      res.json({message:'No hay usuarios brindando este servicio en este momento'});
    }
    
  });
});


app.post('/servxuser', (req, res) => {
  let idserv = req.body.ids;
  //console.log(idserv);

  let qry = {"idCategory":idserv};

  
  //BUSCAMOS PRIMERO EN TRABAJOS
  trabajo.find(qry,"id")
  .exec(function(err, tWork){
    if (err)
      console.log(err);

    let jsWork = '';
    if (tWork.length > 0){
      let x = 0;
      while (x < tWork.length) {
        jsWork = jsWork + ',' + tWork[x].id;
        x++;
      }
      //console.log(jsWork);
      jsWork = jsWork.substring(1, 999);
      //console.log('Bien antes de 1');
      let fWork = JSON.parse("["+jsWork+"]");
      //console.log('Bien 1');
      //LUEGO EN SERVXUSER A VER QUE USUARIOS TINEN ESTOS TRABAJOS
      servxuser.find({"idServ": {$in: fWork}})
      .exec(function (err, SXU){
        if (SXU.length > 0) {
          let jsSXU = '';
          let x = 0;
          while (x < SXU.length) {
            jsSXU = jsSXU + ',' + SXU[x].idUser;
            x++;
          }
          jsSXU = jsSXU.substring(1, 999);
          let fSXU = JSON.parse("["+jsSXU+"]");
          //console.log('Bien 2');

          usuario.find({"id": {$in: fSXU}})
          .exec(function (err,servxuserF){
            
            //console.log(servxuserF);
            
            res.json({
              servxuserF,
            });
          })
        }
      }) 
    }
  })
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

app.post('/registrar_perfil', (req, res) =>{
  var srvxusr = new servxuser();
});
//PETICIONES


connectDb().then(() => {
  app.listen(port, () => {
    console.log(`La aplicacion esta ejecutando en el puerto: ${port}`);
  });
});