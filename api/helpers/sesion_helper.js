var usuarios = require('./db_helper').usuarios;
var crypt = require('./crypt_helper');
var fb = require('./fb_helper');

exports.identificar_con_header = function (req, cb) {
  if (typeof req.headers['x-identificar'] !== 'undefined'){
    usuarios.findByRememberToken(req.headers['x-identificar'], function(err, u){
      if (err){
        cb(err);
      } else {
        if(u){
          req.usuario_actual = u;
          cb();
        } else {
          cb();
        }
      }
    });
  } else {
    cb();
  }
};

exports.identificar = function (req, res, callback) {
  var remember_token = null;

  if (req.body.email && req.body.password ) {
    usuarios.findByEmailOrUserName(req.body.email,function(err, usuario){
      var u;
      if (err){
        console.error(err)
        callback(err);
      } else {
        if (usuario) {
          var digest = usuario.password_digest || '';
          crypt.comparePassword(req.body.password, digest, function(err, resp) {
            if (err) {
              callback('Hubo un error de encripción');
              console.log(err);
            } else if (resp) {
              remember_token = usuario.remember_token;
              usuarios.updateLastLogin(usuario.id, function(err, doc){
                req.usuario_actual = doc;
                callback(null,doc);
              });
            } else {
              callback('Contraseña incorrecta');
            }
          });
        } else {
          callback('Usuario no encontrado');
        }
      }
    });
  } else {
    callback('Datos insuficientes');
  }
};

exports.loginFacebook = function(fbuid, signed_request, callback){
  if (signed_request){
    if (fb.signatureOK(signed_request)){
      usuarios.findByFBUID(fbuid,function(usuario){
        if (usuario) {
          callback(null, usuario);
        } else {
          callback('Usuario no encontrado');
        }
      },function(err){
        callback(err);
      });
    } else {
      callback('Firma erronea');
    }
  } else {
    callback('Datos insuficientes');
  }
}