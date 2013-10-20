var eventos = require('../helpers/db_helper').eventos;

/*
 * GET eventos
 */
exports.index = function(req, res){
  var events,
      cantidad_eventos,
      pagina_actual,
      por_pagina;

  // Verifica si tiene permiso para acceder a esta página
  if (req.usuario_actual.superadministrador) {
    if(req.query.vista) {
      res.send({
        template: 'eventos/index',
        titulo: 'Administrar eventos'
      });
    } else {
      // Cuenta el total de eventos (para la paginación)
      eventos.count(req.query.q, req.query.usuarios, req.query.desde, req.query.hasta, function(err, count){
        // Retorna con errores en caso de haber alguno
        if (err){
          console.log(err);
          res.send(500,{
            mensaje: {
              error: 'Hubo un error en la base de datos'
            }
          });
        } else {
          cantidad_eventos = count;
          // Verifica que página están solicitando
          pagina_actual = req.query.pagina || 1;
          por_pagina = req.query.por_pagina || 50;
          // Realiza el query
          eventos.paginate(pagina_actual, por_pagina, req.query.q, req.query.usuarios, req.query.desde, req.query.hasta, function(err,events){
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
                template: 'eventos/index',
                titulo: 'Listar eventos',
                pagina: pagina_actual,
                por_pagina: por_pagina,
                total: cantidad_eventos,
                eventos: events
              });
            }
          });
        }
      });
    }
  } else {
    // Redirige en caso de no tener autorización
    res.send(403, {
      url: '/dashboard',
      template: 'paginasEstaticas/dashboard',
      mensaje: {
        error: 'No autorizado'
      }
    });
  }
};
