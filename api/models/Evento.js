var Seq = require('../helpers/db_setup_helper').Seq();

module.exports = {
  model: {
    contenido: Seq.TEXT
  },
  relations: {
    belongsTo: 'Usuario'
  }
};