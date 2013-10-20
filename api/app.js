/* API server */

/**
 * Module dependencies.
 */
var express = require('express')
  , paginasEstaticasController = require('./controllers/paginasEstaticasController')
  , sesionesController = require('./controllers/sesionesController')
  , usuariosController = require('./controllers/usuariosController')
  , eventosController = require('./controllers/eventosController')
  , sesion_helper = require('./helpers/sesion_helper')
  , http = require('http')
  , path = require('path')

var app = express();

// all environments
app.set('port', process.env.PORT || 23456);
app.use(express.logger('dev'));
app.use(express.bodyParser());

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-Identificar, Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Content-Type", "application/json");
  if (req.method !== 'OPTIONS'){
    // Identifica el usuario con el header
    sesion_helper.identificar_con_header(req, function(err){
      if (err){
        console.log(err);      
        next();
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// El middleware referente a peticiones tiene que ir antes de esta
// instruccion
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.options('*', function(req, res) {
  res.send({});
});

// Paginas estaticas:
app.get('/', paginasEstaticasController.index);
app.get('/olvide_password', paginasEstaticasController.olvidePassword);
app.get('/dashboard', paginasEstaticasController.dashboard);
app.get('/terminos-y-condiciones', paginasEstaticasController.dashboard);
app.get('/ayuda', paginasEstaticasController.dashboard);
app.post('/olvide_password', paginasEstaticasController.enviarCorreo);

// Sesiones
app.post('/sesiones', sesionesController.create);
app.delete('/sesiones', sesionesController.destroy);
app.get('/sesiones', sesionesController.show);
app.get('/ingresar', sesionesController.show);

// Usuarios
app.get('/recuperar_password', usuariosController.recuperarPassword);
app.get('/usuarios', usuariosController.index);
app.get('/usuarios/new', usuariosController.new);
app.get('/usuarios/listar', usuariosController.listar);
app.get('/usuarios/:id', usuariosController.show);
//app.get('/mi-perfil', usuariosController.miPerfil);
app.get('/usuarios/:id/edit', usuariosController.edit);
app.get('/usuarios/:id/modificar_password', usuariosController.modificarPassword);
app.get('/usuarios/:id/gravatar', usuariosController.gravatar);
app.put('/usuarios/:id', usuariosController.update);
app.post('/usuarios', usuariosController.create);
app.delete('/usuarios/:id', usuariosController.destroy);

// Eventos
app.get('/eventos', eventosController.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('API server listening on port ' + app.get('port'));
});
