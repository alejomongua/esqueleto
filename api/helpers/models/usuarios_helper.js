var crypt = require('../crypt_helper');

const BASICOS = ['id', 'nombre', 'email', 'username', 'genero', 'superadministrador', 'createdAt', 'updatedAt', 'lastLogin'];
const BASICOS_CON_RT = ['id', 'nombre', 'email', 'username', 'genero', 'superadministrador', 'remember_token', 'createdAt', 'updatedAt', 'lastLogin'];
const FIELDS = ['nombre', 'email', 'username', 'genero', 'superadministrador', 'remember_token', 'token', 'fecha_token', 'password_digest', 'lastLogin'];
const UNIQUE_REGEX = /Key (.*) already exists./;
const UNIQUE_REGEX_detail = /\((.+)\)=\((.+)\)/;

var Usuarios = function (Usuario, Evento, db){
  var _update,
      _findByEmail,
      _findByEmailOrUserName,
      _findById,
      _findByFBUID,
      _findByIdAndRemove,
      _findByRememberToken,
      _resetRememberToken,
      _updateLastLogin,
      _count,
      _paginate,
      _create,
      _listar;

  _findByEmail = function(email, callback) {
    Usuario.find({where: {'email': email}}).success(function(usuario){
      if(usuario){
        callback(null, usuario.values);
      } else {
        callback();
      }
    }).error(callback);
  };

  _findByEmailOrUserName = function(criterio, callback) {
    var where = {};
    if(criterio.indexOf('@') > -1) { // Si contiene @ busca en los emails
      where.email = criterio.toLowerCase();
    } else { // si no busca por username
      where.username = criterio.toLowerCase();
    }
    Usuario.find({ where: where }).success(function(usuario){
      if(usuario){
        callback(null, usuario.values);
      } else {
        callback();
      }
    }).error(callback);
  };

  _update = function(id, atributos, usuario_actual, callback){
    Usuario.find(id).success(function(usuario){
      if(usuario){
        var oldUser = usuario.values;
        var llaves = []
        for(var key in atributos){
          if((FIELDS.indexOf(key) > -1) || (key === 'password') || (key === 'password_confirm')){
            usuario[key] = atributos[key];
            if(key === 'password' || key === 'password_confirm'){
              llaves.push('password_digest');
            } else {
              llaves.push(key);
            }
          }
        }
        var errores = usuario.validate();
        if(errores){
          callback({validacion: errores});
        } else {
          usuario.save(llaves).success(function(){
            var user = usuario.values;

            // Evento actualizar usuario            
            var eventoContent = 'Actualizado usuario ' + user.id + ':\n';
            var changed = {};
            delete llaves.updatedAt;
            for(var __i = 0; __i < llaves.length; __i++){
              changed[llaves[__i]] = [oldUser[llaves[__i]], user[llaves[__i]]]
            }
            eventoContent += JSON.stringify(changed);

            Evento.create({
              UsuarioId: usuario_actual,
              contenido: eventoContent
            }, function(e){console.error(e)});
            // fin evento
            delete user['password_digest'];
            delete user['fecha_token'];
            delete user['token'];
            callback(null, user);
          }).error(function(er){
            var e, test, campo, salida;
            e = er.pop();
            if(e.detail) {
              test = e.detail.match(UNIQUE_REGEX);
              if(test){
                campo = test[1].match(UNIQUE_REGEX_detail)[1];
                salida = {};
                salida[campo] = ['ya está en uso']
                callback({validacion: salida});
              } else {
                callback(e);
              }
            } else {
              callback(e);
            }
          });
        }
      } else {
        callback("Usuario no encontrado");
      }
    }).error(callback);
  };

  _findByRememberToken = function (rt, callback) {
    Usuario.find({where: {'remember_token': rt}, attributes: BASICOS})
    .success(function(doc) {
      var user;
      if(doc){
        user = doc.values;
      }
      callback(null, user);
    })
    .error(callback);
  };

  // Encontrar por ID
  _findById = function (id, callback) {
    Usuario.find(id).success(function(usuario){
      if(usuario){
        callback(null,usuario.values);
      } else {
        callback()
      }
    }).error(callback);
  };

  // Encontrar por Facebook UID
  _findByFBUID = function (fbuid, callback) {
    Usuario.find({where: {facebookUID: fbuid}}).success(function(usuario){
      if(usuario){
        callback(null,usuario.values);
      } else {
        callback();
      }
    }).error(callback);
  };

  _resetRememberToken = function(id, callback){
    var newRT = crypt.token();
    Usuario.find(id).success(function(usuario){
      usuario.updateAttributes({remember_token: newRT})
      .success(function(){
        callback(null, newRT);
      });
    }).error(callback);
  };

  _updateLastLogin = function(id, callback){
    Usuario.find(id).success(function(usuario) {
      if (usuario){
        usuario.lastLogin = new Date();
        usuario.token = crypt.token();
        usuario.fecha_token = new Date(0);
        usuario.save().success(function(){
          var user = usuario.values;

          delete user['password_digest'];
          delete user['fecha_token'];
          delete user['token'];

          callback(null, user);
        }).error(function(e){
          callback(e)
        });
      } else {
        callback('No se encontró el usuario');
      }
    }).error(callback);
  };

  _count = function(filtro, callback){
    var condition;
    if (filtro) {
      var f = '%' + filtro.toLowerCase() + '%';
      condition = {
        where: ["(LOWER(nombre) like ? or LOWER(email) like ? or LOWER(username) like ?)", f, f, f]
      }
    }
    Usuario.count(condition).success(function(c){
      callback(null,c);
    }).error(callback);
  };

  _findByIdAndRemove = function(id, usuario_actual, callback){
    Usuario.find(id).success(function(usuario){
      if (usuario){
        usuario.destroy().success(function(){
          var user = usuario.values;
          // Evento eliminar usuario
          var eventoContent = 'Eliminado usuario ' + user.id;

          Evento.create({
            UsuarioId: usuario_actual,
            contenido: eventoContent
          }, function(e){console.error(e)});
          // Fin evento
          delete user['remember_token'];
          delete user['password_digest'];
          delete user['fecha_token'];
          delete user['token'];

          callback(null, user);

        }).error(callback);
      } else {
        callback("No se encontró el usuario")
      }
    }).error(callback);
  };

  _paginate = function(pagina_actual, por_pagina, filtro, callback){
    var options = {
      offset: por_pagina * (pagina_actual - 1),
      limit: por_pagina,
      attributes: ['id', 'nombre', 'email', 'username', 'genero', 'createdAt', 'updatedAt']
    }
    if (filtro) {
      var f = '%' + filtro.toLowerCase() + '%';
      options.where = ["LOWER(nombre) like ? or LOWER(email) like ? or LOWER(username) like ?", f, f, f];
    }
    Usuario.findAll(options,{raw: true}).success(function(usuarios){
      callback(null, usuarios);
    }).error(callback);
  };

  _create = function(usuario, callback){
    var usuario = Usuario.build(usuario);
    var errores = usuario.validate();
    if(errores){
      callback({validacion: errores});
    } else {
      usuario.save(FIELDS).success(function(){
        var user;
        user = usuario.values;
        // Evento crear usuario
        var eventoContent = 'Creado usuario ' + user.id + ':\n';
        eventoContent += JSON.stringify(user);

        Evento.create({
          contenido: eventoContent
        }, function(e){console.error(e)});

        // fin evento
        delete user['remember_token'];
        delete user['password_digest'];
        delete user['fecha_token'];
        delete user['token'];
        callback(null, user);
      }).error(function(e){
        var test, campo, salida;
        if(e.detail) {
          test = e.detail.match(UNIQUE_REGEX);
          if(test){
            campo = test[1].match(UNIQUE_REGEX_detail)[1];
            salida = {};
            salida[campo] = ['ya está en uso']
            callback({validacion: salida});
          } else {
            callback(e);
          }
        } else {
          callback(e);
        }
      });
    }
  };

  _listar = function(callback){
    db.query('select id, (nombre || \' (\' || username || \')\') as mostrar from "Usuarios"',null,{raw:true}).success(function(usuarios){
      callback(null, usuarios);
    }).error(callback);
  }

  return {
    update: _update,
    updateLastLogin: _updateLastLogin,
    count: _count,
    findById: _findById,
    findByFBUID: _findByFBUID,
    findByIdAndRemove: _findByIdAndRemove,
    findByEmail: _findByEmail,
    findByEmailOrUserName: _findByEmailOrUserName,
    findByRememberToken: _findByRememberToken,
    resetRememberToken: _resetRememberToken,
    paginate: _paginate,
    create: _create,
    listar: _listar
  };
};

module.exports = Usuarios;