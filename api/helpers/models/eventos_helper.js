const FIELDS = ['UsuarioId', 'contenido'];

var Eventos = function(Evento, db){
  var _count,
      _paginate,
      _create,
      _index;

  _count = function(filtro, usuarios, desde, hasta, callback){
    var condition = {};
    var from, to;
    if (!desde){
      from = new Date(0);
    } else {
      from = new Date(parseInt(desde));
    }
    if (!hasta){
      to = new Date();
    } else {
      to = new Date(parseInt(hasta));
    }
    if (filtro){
      if (usuarios) {
        var f = '%' + filtro.toLowerCase() + '%';
        condition.where = ['LOWER(contenido) like ? AND "UsuarioId" IN ? AND "createdAt" > ? AND "createdAt" <= ?', f, usuarios, from, to];
      } else {
        var f = '%' + filtro.toLowerCase() + '%';
        condition.where = ['LOWER(contenido) like ? AND "createdAt" > ? AND "createdAt" <= ?', f, from, to];
      }
    } else{
      condition.where = {
        createdAt:{
          between: [from, to]
        }
      }
      if (usuarios){
        condition.where.UsuarioId =  usuarios;
      }
    }
    Evento.count(condition).success(function(c){
      callback(null,c);
    }).error(callback);
  };

  _paginate = function(pagina_actual, por_pagina, filtro, usuarios, desde, hasta, callback){
    var condition = {
      order: '"createdAt" DESC',
      offset: por_pagina * (pagina_actual - 1),
      limit: por_pagina
    };
    var from, to;
    if (!desde){
      from = new Date(0);
    } else {
      from = new Date(parseInt(desde));
    }
    if (!hasta){
      to = new Date();
    } else {
      to = new Date(parseInt(hasta));
    }
    if (filtro){
      if (usuarios) {
        var f = '%' + filtro.toLowerCase() + '%';
        condition.where = ['LOWER(contenido) like ? AND "UsuarioId" IN ? AND "createdAt" > ? AND "createdAt" <= ?', f, usuarios, from, to];
      } else {
        var f = '%' + filtro.toLowerCase() + '%';
        condition.where = ['LOWER(contenido) like ? AND "createdAt" > ? AND "createdAt" <= ?', f, from, to];
      }
    } else{
      condition.where = {
        createdAt:{
          between: [from, to]
        }
      }
      if (usuarios){
        condition.where.UsuarioId =  usuarios;
      }
    }
    Evento.findAll(condition, {raw: true}).success(function(eventes){
      callback(null, eventes);
    }).error(callback);
  };


  _create = function(evento, callback){
    var evento = Evento.build(evento);
    var errores = evento.validate();
    if(errores){
      callback({validacion: errores});
    } else {
      evento.save(FIELDS).success(function(){
        callback(null, evento.values);
      }).error(callback);
    }
  };

  _index = function(callback){
    db.query('Select * from "Eventos"',null,{raw:true}).success(function(eventos){
      callback(null, eventos);
    }).error(callback);
  };

  return {
    count: _count,
    paginate: _paginate,
    create: _create,
    index: _index
  };
};

module.exports = Eventos;