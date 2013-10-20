var usuarios = require('../helpers/db_helper').usuarios;
var crypt = require('../helpers/crypt_helper');
var fb = require('../helpers/fb_helper');
/*
 * GET recuperar_password
 */
var gravatar = function (email, size){
  var s = size || 100;
  var gravatarid = crypt.md5Hex(email);
  return "https://secure.gravatar.com/avatar/" + gravatarid + '?s=' + s
};

exports.recuperarPassword = function(req, res){
  if(!req.query.id || !req.query.t){
    res.send(404);
  } else {
    usuarios.findById(req.query.id,function(error, usuario){
      if (error){
        console.log(err);
        res.send(500,{
          mensaje: {
            error: 'Hubo un error con la base de datos'
          }
        });
      } else {
        if(usuario && (usuario.fecha_token > Date.now()) && (usuario.token === req.query.t) ) {
          remember_token = usuario.remember_token;
          usuarios.updateLastLogin(usuario.id, function(err, u){
            if (err){
              console.log(err);
              res.send(500);
            } else {
              req.usuario_actual = u;
              res.send({
                url: '/usuarios/' + req.usuario_actual.id + '/modificar_password',
                template: 'usuarios/modificarPassword',
                login: u,
                mensaje: {
                  success: 'Asigne una nueva contraseña'
                }
              });
            }
          });
        } else {
          res.send(404);
        }
      }
    });
  }
};

/*
 * GET usuarios/:id/modificar_password
 */
exports.modificarPassword = function(req, res){
  var usuario = {};
  if (req.usuario_actual.superadministrador ||
      req.params.id == req.usuario_actual.id) {


    usuarios.findById(req.params.id, function(err, usuario){
      if (err){
        console.log(err);
        res.send(500,{
          mensaje: {
            error: 'Hubo un error con la base de datos'
          }
        });
      } else {
        if (usuario) {
          res.send({
            titulo: 'Modificar contraseña',
            template: 'usuarios/modificarPassword', 
            usuario: usuario,
            error: {}
          });
        } else {
          res.send(404);
        }
      }
    });
  } else {
    res.send(403,{
      url: '/dashboard',
      template: 'paginasEstaticas/dashboard',
      mensaje: {
        error: "Ya está identificado"
      },
    });
  }
};

/*
 * GET usuarios
 */
exports.index = function(req, res){
  // Verifica si tiene permiso para acceder a esta página
  if(req.usuario_actual){

    var users,
      cantidad_usuarios,
      pagina_actual,
      por_pagina;

    // Cuenta el total de usuarios (para la paginación)
    usuarios.count(req.query.q, function(err, count){
      // Retorna con errores en caso de haber alguno
      if (err){
        console.log(err);
        res.send(500,{
          mensaje: {
            error: 'Hubo un error en la base de datos'
          }
        });
      } else {
        if(req.query.vista) {
          res.send({
            template: 'usuarios/index',
            titulo: 'Administrar usuarios'
          });
        } else {
          cantidad_usuarios = count;
          // Verifica que página están solicitando
          pagina_actual = req.query.pagina || 1;
          por_pagina = req.query.por_pagina || 50;
          // Realiza el query
          usuarios.paginate(pagina_actual, por_pagina, req.query.q, function(err,users){
            // Retorna con errores en caso de haber alguno
            if (err){
              console.log(err);
              res.send(500,{
                mensaje: {
                  error: 'Hubo un error en la base de datos'
                }  
              });
            } else {
              // Retorna con el dato solicitado
              
              res.send({
                template: 'usuarios/index',
                titulo: 'Administrar usuarios',
                pagina: pagina_actual,
                por_pagina: por_pagina,
                total: cantidad_usuarios,
                usuarios: users
              });
            }
          });
        }
      }
    });
  } else {
    // Redirige en caso de no tener autorización
    res.send(403, {
      url: '/ingresar',
      template: 'sesiones/new',
      mensaje: {
        error: 'Debe iniciar sesión para entrar en esta página'
      }
    });
  }
};

/*
 * GET usuarios/new
 */
exports.new = function(req, res){
  if (!req.usuario_actual) {
    res.send({
      template: 'usuarios/new',
      titulo: 'Crear nuevo usuario'
    });
  } else {
    res.send(403, {
      mensaje: {
        error: "Ya está identificado"
      },
      url: '/dashboard',
      template: 'paginasEstaticas/dashboard'
    });
  }
};

/*
 * GET usuarios/:id
 */
exports.show = function(req, res){
  if (req.usuario_actual) {
    usuarios.findById(req.params.id, function(err, usuario){
      if (err){
        console.log(err);
        res.send(500,{
          mensaje: {
            error: 'Hubo un error con la base de datos'
          }
        });
      } else {
        if (usuario) {
          res.send({
            titulo: usuario.nombre,
            template: 'usuarios/show',
            usuario: usuario
          });
        } else {
          res.send(404)
        }
      }
    });
  } else {
    res.send(403,{
      url: '/ingresar',
      template: 'sesiones/new',
      mensaje: {
        error: 'Debe iniciar sesión para entrar en esta página'
      }
    });
  }
};

/*
 * GET usuarios/:id/edit
 */
exports.edit = function(req, res){
  if ((req.params.id == req.usuario_actual.id) ||
    req.usuario_actual.superadministrador) {
    usuarios.findById(req.params.id, function(err, usuario){
      if (err){
        console.log(err);
        res.send(500,{
          mensaje: {
            error: 'Hubo un error en la base de datos'
          }
        });
      } else {
        if (usuario) {
          res.send({
            titulo: 'Editar ' + usuario.nombre,
            template: 'usuarios/edit',
            usuario: usuario,
            error: {}
          });
        } else {
          res.send(404)
        }
      }
    });

  } else {
    res.send(403, {
      url: '/ingresar',
      template: 'sesiones/new',
      mensaje: {
        error: 'Debe iniciar sesión para entrar en esta página'
      }
    });
  }
};

/*
 * POST usuarios
 */
exports.create = function(req, res){
  if (!req.usuario_actual) {
    if(req.body.facebookUID){
      if (req.body.usuario.signed_request){
        if (!fb.signatureOK(req.body.usuario.signed_request)){
          res.send(400);
          return;
        }
      } else {
        res.send(400);
        return;
      }
    } 
    usuarios.create(req.body, function(err, usuario){
      if (err){
        if(err.validacion){
          res.send(302, {
            titulo: 'Regístrate',
            url: '/usuarios/new',
            template: 'usuarios/new',
            error: err.validacion,
            usuario: req.body
          });
        } else {
          res.send(500,{
            mensaje: {
              error: 'Hubo un error en la base de datos'
            }
          });
        }
      } else {
        res.send({
          url: '/usuarios/' + usuario.id,
          template: 'usuarios/show',
          usuario: usuario,
          login: usuario
        });
      }
    });
  } else {
    res.send(403, {
      url: '/dashboard',
      template: 'paginasEstaticas/dashboard',
      mensaje: {
        error: "Ya está identificado"
      }
    });
  }
};

/*
 * PUT usuarios/:id
 */
exports.update = function(req, res){
  if ((req.usuario_actual &&
   ((req.params.id == req.usuario_actual.id) || // Que sea el mismo usuario
    req.usuario_actual.superadministrador)) &&  // O un superadministrador
     !req.body.superadministrador &&            // Que no este tratando de actualizar sus permisos
     !req.body.password_digest &&
     !req.body.remember_token &&
     !req.body.token &&
     !req.body.fecha_token) {
    usuarios.update(req.params.id, req.body, req.usuario_actual.id, function(err, usuario){
      if(err){
        if(err.validacion){
          req.body.id = req.params.id;
          res.send(302, {
            template: 'usuarios/edit',
            titulo: 'Editar usuario',
            error: err.validacion,
            usuario: req.body
          });
        } else {
          console.log(err);
          res.send(500,{
            mensaje: {
              error: 'Hubo un error en la base de datos'
            }
          });
        }
      } else {
        if (usuario){
          var response = {
            mensaje: {
              success: 'Usuario actualizado exitosamente'
            },
            url: '/usuarios/' + usuario.id,
            template: 'usuarios/show',
          };
          if(req.usuario_actual.id == req.params.id){
            response.login = usuario;
            response.usuario = usuario;
          } else {
            delete usuario.remember_token;
            response.usuario = usuario;
          }
          res.send(response);
        } else {
          res.send(404);
        }
      }
    });
  } else {
    res.send(403, {
      url: '/ingresar',
      template: 'sesiones/new',
      mensaje: {
        error: 'Debe iniciar sesión para entrar en esta página'
      }
    });
  }
};

/*
 * DELETE usuarios/:id
 */
exports.destroy = function(req, res){
  if ((req.usuario_actual.superadministrador) ||
    (req.usuario_actual.id == req.params.id)) {
    
    usuarios.findByIdAndRemove(req.params.id, req.usuario_actual.id, function (err, usuario) {
      if (err) {
        console.log(err);
        res.send(500,{
          mensaje: {
            error: 'Hubo un error en la base de datos'
          }
        });
      } else {
        if (usuario) {
          if (usuario.id == req.usuario_actual.id){
            res.send({
              logout: usuario
            });
          } else {
            res.send({
              usuario: usuario
            });
          }
        } else {
          res.send(404)
        }
      }
    });
  } else {
    res.send(403, {
      url: '/',
      template: 'paginasEstaticas/index',
      mensaje: {
        error: 'No autorizado'
      }
    });
  }
};

exports.gravatar = function (req, res){
  usuarios.findById(req.params.id,function(err, doc){
    if(err) {
      res.send(500,{
        mensaje: {
          error: 'Hubo un error en la base de datos'
        }
      });
    } else {
      if (doc) {
        res.send(301,{url:gravatar(doc.email,req.query.size)});
      } else {
        res.send(404)
      }
    }
  });
};

exports.listar = function(req,res){
  if(req.usuario_actual){
    usuarios.listar(function(e, users){
      if(e){
        res.send(500, e);
      } else {
        res.send(users)
      }
    });
  } else {
    res.send(403);
  }
}