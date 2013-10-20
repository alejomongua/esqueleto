var http = require('request'),
    async = require('async'),
    usuarios = require("../api/helpers/db_helper").usuarios,
    eventos = require("../api/helpers/db_helper").eventos,
    url = 'http://api.localhost';

global.process.env.NODE_ENV = 'test';

describe("Eventos", function(){
  before(function(done){
    http.get(url, function(e,r,b){
      var db = require('../api/helpers/db_setup_helper');
      if (r.statusCode !== 200){
        require('../app.js');     
        db.query('DELETE FROM "Eventos"').success(function(){
          done();
        }).error(done);
      } else {
        db.query('DELETE FROM "Eventos"').success(function(){
          done();
        }).error(done);
      }
    });
  });
  
  beforeEach(function(cb){
    //add some test data
    usuarios.create({
      email:'admin1@example.com',
      nombre: 'Administrador1',
      username: 'MonguaLopez',
      password: 'foobar',
      password_confirm: 'foobar',
      superadministrador: true
    }, function(e, usuario){
      if(usuario){
        usuarios.findById(usuario.id, function(err,user){
          if(err){console.log(err)}
          admin = user;
          cb(err);
        });
      } else {
        console.log(e);
        cb(e)
      }
    });
  });

  afterEach(function(done){
    var db = require('../api/helpers/db_setup_helper');
    db.query('DELETE FROM "Usuarios"').success(function(){
      db.query('DELETE FROM "Eventos"').success(function(){
        done();
      }).error(done);
    }).error(done);
  });

  describe('Usuarios', function (){
    it('create, update and delete', function(done){
      var body, res, user;
      async.series([
        function(cb){
          http.post({
            url: url + '/usuarios',
            json: true,
            body: {
              email:'another@example.com',
              nombre: 'Jaimito',
              username: 'Gomez1',
              password: 'foobar',
              password_confirm: 'foobar'
            }
          }, function(err, res, body){
            console.log(err)
            user = body.usuario;
            cb(err);
          });
        },
        function(cb){
          http.put({
            url: url + '/usuarios/' + user.id,
            headers: {"X-Identificar": admin.remember_token},
            json: true,
            body: {
              email:'anotherOne@example.com',
              username: 'asdfgh',
            }
          }, cb);
        },
        function(cb){
          http.del({
            url: url + '/usuarios/' + user.id,
            headers: {"X-Identificar": admin.remember_token},
            json: true
          }, cb);
        },
        function(cb){
          http.get({
            url: url + '/eventos',
            headers: {"X-Identificar": admin.remember_token},
            json: true
          }, function(err, r, b){
            res = r;
            body = b;
            cb(err);
          });
        }
      ], function(err){
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.equal(200);
        Object.keys(body).should.include('eventos');
        body.eventos.length.should.be.equal(4);
        Object.keys(body.eventos[0]).should.include('UsuarioId');
        Object.keys(body.eventos[1]).should.include('contenido');
        Object.keys(body.eventos[2]).should.include('createdAt');
        JSON.stringify(body).should.include('asdfgh')
        done();
      });
    });
  });
});