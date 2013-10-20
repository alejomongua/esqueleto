var http = require('request'),
    usuarios,
    url = 'http://api.localhost';

global.process.env.NODE_ENV = 'test';

describe("Usuarios", function(){

  var currentUser = null;

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
      usuarios = require("../api/helpers/db_helper").usuarios;
      //add some test data
      usuarios.create({
        email:'alejom.tv@gmail.com',
        nombre: 'Luis Alejandro',
        username: 'MonguaLopez',
        password: 'foobar',
        password_confirm: 'foobar'
      }, function(err, usuario){
        usuarios.findById(usuario.id,function(e,u){
          console.log(e);
          currentUser = u;
          done();
        });
      });
  });

  afterEach(function(done){
   var db = require('../api/helpers/db_setup_helper');
    db.query('DELETE FROM "Usuarios"').success(function(){
      done();
    }).error(done);
  });

  it("retrieves by email", function(done){
    usuarios.findByEmail(currentUser.email, function(err, doc){
      doc.email.should.equal('alejom.tv@gmail.com');
      done();
    });
  });

  it("retrieves by token", function(done){
    usuarios.findByRememberToken(currentUser.remember_token, function(err, doc){
      doc.email.should.equal('alejom.tv@gmail.com');
      done();
    });
  });

  it("authenticates and returns usuarios with valid login", function(done){
    http.post({
      'url': url + '/sesiones',
      json: true,
      body: {
        email: currentUser.email,
        password: 'foobar'
      }
    }, function(err,res,body){
      console.log(body)
      body.login.email.should.equal(currentUser.email);
      body.login.nombre.should.equal(currentUser.nombre);
      body.url.should.equal('/dashboard');
      body.login.should.not.have.property('password_digest');
      done();
    });
  });

  it("authenticates and returns usuarios with valid login (case insensitive)", function(done){
    http.post({
      'url': url + '/sesiones',
      json: true,
      body: {
        email: currentUser.email.toUpperCase(),
        password: 'foobar'
      }
    }, function(err,res,body){
      console.log(body)
      body.login.email.should.equal(currentUser.email);
      body.login.nombre.should.equal(currentUser.nombre);
      body.url.should.equal('/dashboard');
      body.login.should.not.have.property('password_digest');
      done();
    });
  });

  it("authenticates and returns usuarios with valid login (username)", function(done){
    http.post({
      'url': url + '/sesiones',
      json: true,
      body: {
        email: currentUser.username,
        password: 'foobar'
      }
    }, function(err,res,body){
      console.log(body)
      body.login.email.should.equal(currentUser.email);
      body.login.nombre.should.equal(currentUser.nombre);
      body.url.should.equal('/dashboard');
      body.login.should.not.have.property('password_digest');
      done();
    });
  });

  it("authenticates and returns usuarios with valid login (case insensitive)", function(done){
    http.post({
      'url': url + '/sesiones',
      json: true,
      body: {
        email: currentUser.username.toUpperCase(),
        password: 'foobar'
      }
    }, function(err,res,body){
      console.log(body)
      body.login.email.should.equal(currentUser.email);
      body.login.nombre.should.equal(currentUser.nombre);
      body.url.should.equal('/dashboard');
      body.login.should.not.have.property('password_digest');
      done();
    });
  });
  it("authenticates and returns fail with invalid login", function(done){
    http.post({
      'url': url + '/sesiones',
      json: true,
      body: {
        email: currentUser.email,
        password: 'failing'
      }
    }, function(err,res,body){
      body.should.not.have.property('login');
      body.mensaje.should.have.property('error');
      done();
    });
  });

  it('authenticates with cookie', function(done){
    http({
      url: url + '/dashboard',
      json: true,
      headers: {
        "X-Identificar": currentUser.remember_token
      }
    }, function (err, res, body) {
      if (err) throw("This shouldn't happen");
      body.should.not.have.property('url')
      done();
    });
  });
});