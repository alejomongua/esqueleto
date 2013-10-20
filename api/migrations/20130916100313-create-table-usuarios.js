var async = require('async');
module.exports = {
  up: function(migration, DataTypes, done) {
    async.series([
      function(cb){
        migration.createTable('Usuarios',{
          id: {
            type: 'SERIAL',
            primaryKey: true
          },
      	  nombre: {
      	    type: DataTypes.STRING,
      	    allowNull: false,
      	  },
      	  username: {
      	    type: DataTypes.STRING,
      	    unique: true,
      	  },
      	  genero: DataTypes.ENUM('Hombre', 'Mujer',''),
      	  email: {
      	    type: DataTypes.STRING,
      	    unique: true,
      	    allowNull: false,
      	  },
      	  password_digest: DataTypes.STRING,
      	  remember_token: DataTypes.STRING,
      	  superadministrador: {
      	    type: DataTypes.BOOLEAN,
      	    defaultValue: false
      	  },
      	  token: DataTypes.STRING,
      	  fecha_token: {
      	    type: DataTypes.DATE,
      	    defaultValue: new Date(0)
      	  },
          facebookUID: DataTypes.STRING,
          twitterUID: DataTypes.STRING,
          googleUID: DataTypes.STRING,
      	  lastLogin: DataTypes.DATE,
          createdAt: DataTypes.DATE,
          updatedAt: DataTypes.DATE
      	}).complete(cb);
      },
      function(cb) {
        migration.addIndex('Usuarios', ['email']).complete(cb);
      },
      function(cb) {
        migration.addIndex('Usuarios', ['remember_token']).complete(cb);
      },
      function(cb) {
        migration.addIndex('Usuarios', ['username']).complete(cb);
      }
    ], done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Usuarios', {cascade: true}).complete(done);
  }
}
