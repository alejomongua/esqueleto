var Seq = require('../helpers/db_setup_helper').Seq(),
    crypt = require('../helpers/crypt_helper');

module.exports = {
  model: {
    nombre: {
      type: Seq.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "no debe estar en blanco"
        },
        len: {
          args: [6, 50],
          msg: "debe tener entre 6 y 50 caracteres"
        }
      }
    },
    username: {
      type: Seq.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          msg: "debe ser alfanumérico"
        },
      }
    },
    genero: Seq.ENUM('Hombre', 'Mujer','', null),
    email: {
      type: Seq.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "debe ser un formato de correo electrónico válido"
        },
        notEmpty: {
          msg: "no debe estar en blanco"
        }
      }
    },
    password_digest: Seq.STRING,
    remember_token: Seq.STRING,
    superadministrador: {
      type: Seq.BOOLEAN,
      defaultValue: false
    },
    token: Seq.STRING,
    fecha_token: {
      type: Seq.DATE,
      defaultValue: new Date(0)
    },
    facebookUID: Seq.STRING,
    twitterUID: Seq.STRING,
    googleUID: Seq.STRING,
    lastLogin: Seq.DATE
  },
  options: {
    instanceMethods: {
      gravatar: function(s){
        var gravatar_id = crypt.md5Hex(this.email);
        return "https://secure.gravatar.com/avatar/" + gravatar_id + '?s=' + s;
      }
    },
    validate: {
      "La contraseña": function(){
        if(this.virtuals && (this.virtuals.password || this.virtuals.password_confirm)) {
          if(this.virtuals.password !== this.virtuals.password_confirm){
            throw new Error('no coincide con la confirmación');
          } else {
            if (this.virtuals.password.length < 6){
              throw new Error('es demasiado corta');
            }
          }
        }
      },
      // Pongo aqui la inicializacion porque no se donde más
      inicializar: function(){
        if(!this.remember_token){ 
          this.remember_token = crypt.token();
        }
        if(!this.token){ 
          this.token = crypt.token();
        }
        this.email = this.email.toLowerCase();
        this.username = this.username.toLowerCase();
      }
    },
    setterMethods: {
      password: function(v){
        if(v){
          this.dataValues.password_digest = crypt.cryptPassword(v);
          this.virtuals = this.virtuals || {};
          this.virtuals.password = v;
        }
      },
      password_confirm: function(v){
        this.virtuals = this.virtuals || {}
        this.virtuals.password_confirm = v;
      }
    }
  }
};