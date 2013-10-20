var http = require('request'),
    usuarios = require("../api/helpers/db_helper").usuarios,
    url = 'http://api.localhost';

global.process.env.NODE_ENV = 'test';

describe("Usuarios", function(){
  var currentUser = null,
      admin = null;

  before(function(done){
    http.get(url, function(e,r,b){
      if (r.statusCode !== 200){
        require('../app.js');     
        done();
      } else {
        done();
      }
    });
  });
  
  beforeEach(function(done){
    //add some test data    
    usuarios.create({
      email:'admin@example.com',
      nombre: 'Administrador',
      username: 'MonguaLopez',
      password: 'foobar',
      password_confirm: 'foobar',
      superadministrador: true
    }, function(e, usuario){
      if(usuario){
        usuarios.findById(usuario.id, function(err,user){
          if(err){console.log(err)}
          admin = user;
          done();
        });
      } else {
        console.log(e);
        done()
      }
    });
  });

  beforeEach(function(done){
    //add some test data    
    usuarios.create({
      email:'alejom.tv@gmail.com',
      nombre: 'Luis Alejandro',
      username: 'Mongua1Lopez',
      password: 'foobar',
      password_confirm: 'foobar'
    }, function(e, usuario){
      if(usuario){
        usuarios.findById(usuario.id, function(err,user){
          if(err){console.log(err)}
          currentUser = user;
          done();
        });
      } else {
        console.log(e);
        done()
      }
    });
  });

  afterEach(function(done){
    var db = require('../api/helpers/db_setup_helper');
    db.query('DELETE FROM "Usuarios"').success(function(){
      done();
    }).error(done);
  });

  describe('Update', function (){
    it('another user', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": admin.remember_token},
        json: true,
        body: {
          nombre: 'Pepito perez'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        Object.keys(body).should.include('usuario');
        Object.keys(body.usuario).should.not.include('password_digest');
        Object.keys(body.usuario).should.not.include('remember_token');
        done();
      });
    });

    it('itself', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          nombre: 'Pepito perez'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        Object.keys(body).should.include('login');
        Object.keys(body.login).should.not.include('password_digest');
        Object.keys(body.login).should.include('remember_token');
        done();
      });
    });

    it('should not update a its permisions', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          superadministrador: true
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update a its password_digest', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          password_digest: '$2a$10$lnbUnwioJTxVcnLoIeHN4eYS3h8VNYK/pc4hDAn28.1Lu/TXxB8dq'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update a its password_digest (not even admin)', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": admin.remember_token},
        json: true,
        body: {
          password_digest: '$2a$10$lnbUnwioJTxVcnLoIeHN4eYS3h8VNYK/pc4hDAn28.1Lu/TXxB8dq'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });
    
    it('should not update a its token', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          token: 'abc123'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update a its token (not even admin)', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": admin.remember_token},
        json: true,
        body: {
          token: '$2a$10$lnbUnwioJTxVcnLoIeHN4eYS3h8VNYK/pc4hDAn28.1Lu/TXxB8dq'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update a its remember_token', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          remember_token: '$2a$10$lnbUnwioJTxVcnLoIeHN4eYS3h8VNYK/pc4hDAn28.1Lu/TXxB8dq'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update a its remember_token (not even admin)', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": admin.remember_token},
        json: true,
        body: {
          remember_token: '$2a$10$lnbUnwioJTxVcnLoIeHN4eYS3h8VNYK/pc4hDAn28.1Lu/TXxB8dq'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update another user without permisions', function(done){
      http.put({
        url: url + '/usuarios/' + admin.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          nombre: 'Pepito perez'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('should not update another user\'s permisions', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          superadministrador: true
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('run validations on update', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          email: ''
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });

    it('run validations on update (email uniqueness)', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          email: admin.email
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        console.log(body);
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });

    it('run validations on update (password)', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          password: 'holatu',
          password_confirm: 'chaotu'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        if(body.usuario){
          Object.keys(body.usuario).should.not.include('password_digest');
          Object.keys(body.usuario).should.not.include('remember_token');
        }
        done();
      });
    });

    it('run validations on update (password 2)', function(done){
      http.put({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          password: 'holatu'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });
  });
  
  describe('Create', function (){
    it('should not create a user without permisions', function(done){
      http.post({
        url: url + '/usuarios',
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {
          email:'another@example.com',
          nombre: 'Jaimito',
          username: 'Gomez',
          password: 'foobar',
          password_confirm: 'foobar'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('creates user', function(done){
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
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        Object.keys(body).should.include('usuario');
        Object.keys(body.usuario).should.not.include('password_digest');
        Object.keys(body.usuario).should.not.include('remember_token');
        done();
      });
    });

    it('creates user without password', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email:'anotherone@example.com',
          nombre: 'Jaimito One',
          username: 'jaimito1',
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        Object.keys(body).should.include('usuario');
        Object.keys(body.usuario).should.not.include('password_digest');
        Object.keys(body.usuario).should.not.include('remember_token');
        done();
      });
    });

    it('should not create a user with an used email', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email: currentUser.email,
          nombre: 'Jaimito',
          username: 'Gomez2',
          password: 'foobar',
          password_confirm: 'foobar'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });

    it('should not create a user with an used username', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email:'another@example.com',
          nombre: 'Jaimito',
          username: currentUser.username,
          password: 'foobar',
          password_confirm: 'foobar'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.not.equal(200);
        done();
      });
    });

    it('run validations', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email:'admin@example.com',
          nombre: 'Jaimito',
          username: 'Gomez5',
          password: 'foobar',
          password_confirm: 'foobar'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });

    it('run validations (password)', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email:'another23@example.com',
          nombre: 'Jaimito',
          username: 'Gomez6',
          password: 'foobar',
          password_confirm: 'foovar'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });
    
    it('run validations (no password confirm)', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email:'another23@example.com',
          nombre: 'Jaimito',
          username: 'Gomez7',
          password: 'foobar'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });

    it('run validations (password too short)', function(done){
      http.post({
        url: url + '/usuarios',
        json: true,
        body: {
          email:'another23@example.com',
          nombre: 'Jaimito',
          username: 'Gomez8',
          password: 'toosh',
          password: 'toosh'
        }
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body).should.include('error');
        done();
      });
    });

  });

  describe('Delete', function (){


    it('should not delete a user without permisions', function(done){
      http.del({
        url: url + '/usuarios/' + admin.id,
        headers: {"X-Identificar": currentUser.remember_token},
        json: true,
        body: {}
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        Object.keys(body.mensaje).should.include('error');
        done();
      });
    });

    it('deletes a user', function(done){
      http.del({
        url: url + '/usuarios/' + currentUser.id,
        headers: {"X-Identificar": admin.remember_token},
        json: true,
        body: {}
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        Object.keys(body).should.include('usuario');
        Object.keys(body.usuario).should.not.include('password_digest');
        Object.keys(body.usuario).should.not.include('remember_token');
        done();
      });
    });

    it('delete itself', function(done){
      http.del({
        url: url + '/usuarios/' + admin.id,
        headers: {"X-Identificar": admin.remember_token},
        json: true,
        body: {}
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        done();
      });
    });
  });

  describe('Lista', function(){
    it('mostrar', function(done){
      usuarios.listar(function(e, users){
        if (e) {
          console.log(e);
          true.should.be(false);
        }
        users.length.should.be.equal(2);
        Object.keys(users[0]).should.include('id');
        Object.keys(users[1]).should.include('mostrar');
        done();
      });
    });

    it('desde el API', function(done){
      http.get({
        url: url + '/usuarios/listar',
        headers: {"X-Identificar": admin.remember_token},
        json: true
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.be.equal(200);
        body.length.should.be.equal(2);
        Object.keys(body[0]).should.include('id')
        Object.keys(body[1]).should.include('mostrar')
        done();
      });
    });

    it('desde el API sin permisos', function(done){
      http.get({
        url: url + '/usuarios/listar',
        json: true
      }, function (err, res, body) {
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.below(500);
        res.statusCode.should.not.be.equal(200);
        JSON.stringify(body).should.not.include('mostrar');
        done();
      });
    });
  });

  describe('Buscar', function(){
    it('filtra los resultados', function(done){
      http.get({
        url: url + '/usuarios?q=ADM',
        headers: {"X-Identificar": admin.remember_token},
        json: true
      }, function(err, res, body){
        if (err) throw("This shouldn't happen");
        res.statusCode.should.be.equal(200);
        body.usuarios.length.should.be.equal(1);
        done();
      });
    });
  });

});