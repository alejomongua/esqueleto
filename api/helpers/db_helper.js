var db = require('./db_setup_helper'),
    Usuarios = require('./models/usuarios_helper'),
    Eventos = require('./models/eventos_helper');

db.setup();

var Usuario = db.model('Usuario');
var Evento = db.model('Evento');

exports.eventos = Eventos(Evento, db);
exports.usuarios = Usuarios(Usuario, exports.eventos, db);
