var async = require('async');
module.exports = {
  up: function(migration, DataTypes, done) {
    async.series([
      function(cb) {
        migration.createTable('Eventos',{
          id: {
            type: 'SERIAL',
            primaryKey: true
          },
          UsuarioId: {
            type: DataTypes.INTEGER,
            references: 'Usuarios',
            onDelete: 'SET NULL'
          },
          contenido: DataTypes.TEXT,
          createdAt: DataTypes.DATE,
          updatedAt: DataTypes.DATE
        }).complete(cb);
      },
      function(cb) {
        migration.addIndex('Eventos', ['createdAt']).complete(cb);
      },
      function(cb) {
        migration.addIndex('Eventos', ['UsuarioId']).complete(cb);
      },
      function(cb) {
        migration.addIndex('Eventos', ['contenido']).complete(cb);
      },
    ], done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Eventos', {cascade: true}).complete(done);
  }
}
