var sesion = require('../helpers/sesion_helper');

/*
 * POST sesiones
 */
exports.create = function(req, res){
  if(req.body.facebookUID){
    sesion.loginFacebook(req.body.facebookUID && req.body.signed_request, function(err, res){
      if (err){                        // fail
        res.send(400, {
          mensaje: {
            error: err
          },
          template: 'sesiones/new',
          url: '/ingresar'
        });
      } else {                          // success
        res.send({
          titulo: 'Bienvenido ' + req.usuario_actual.nombre,
          url: '/dashboard',
          template: 'paginasEstaticas/dashboard',
          login: u
        });
      }
    });
  } else {
    sesion.identificar(req, res, function(err, u){ 
      if (err){                        // fail
        res.send(400, {
          mensaje: {
            error: err
          },
          template: 'sesiones/new',
          url: '/ingresar'
        });
      } else {                          // success
        res.send({
          titulo: 'Bienvenido ' + req.usuario_actual.nombre,
          url: '/dashboard',
          template: 'paginasEstaticas/dashboard',
          login: u
        });
      }
    });
  }
};

/*
 * DELETE sesiones
 */
exports.destroy = function(req, res){
  usuarios = require('../helpers/db_helper').usuarios;
  usuarios.resetRememberToken(req.usuario_actual.id, function(err){
    delete req.usuario_actual;

    res.send({
      url: '/',
      template: 'paginasEstaticas/index',
      mensaje: {
        success: "Sesion terminada"
      },
      logout: true
    });
  });  
};

/*
 * GET ingresar
 */
exports.new = function(req, res){
  if (req.usuario_actual) {
    res.send(302, {
      mensaje: {
        error: "Ya está identificado"
      },
      url: '/dashboard',
      template: 'paginasEstaticas/dashboard'
    });
  } else {
    res.send({
      template: 'sesiones/new',
      titulo: 'Identifíquese'
    });
  }
}; 

/*
 * GET sesiones
 */
exports.show = function(req, res){
  res.send(req.usuario_actual);
} 