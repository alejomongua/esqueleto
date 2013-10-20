var filesystem = require('fs');
var models = {};
var relationships = {};

var singleton = function singleton(){
  var Sequelize = require("sequelize");
  var sequelize = null;
  this.setup = function(){
    var absModelPath = __dirname + '/../models'
    var config = require('../config/config');
    var env = 'development';

    if (process.env.NODE_ENV) {
      env = process.env.NODE_ENV;
    }

    sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, {
      host: config[env].host,
      dialect: 'postgres',
      language: 'es',
      omitNull: true
    });

    console.log('Conectado a ' + config[env].database);

    filesystem.readdirSync(absModelPath).forEach(function(name){
      var object = require(absModelPath + "/" + name);
      var options = object.options || {}
      var modelName = name.replace(/\.js$/i, "");
      models[modelName] = sequelize.define(modelName, object.model, options);
      if("relations" in object){
        relationships[modelName] = object.relations;
      }
    });
    for(var name in relationships){
      var relation = relationships[name];
      for(var relName in relation){
        var related = relation[relName];
        if (related instanceof Array){
          for (var __i = 0; __i < related.length; __i++){
            var rel = related[__i];
            if(typeof rel === 'object'){
              var relatedModel = Object.keys(rel)[0]
              models[name][relName](models[relatedModel], rel[relatedModel]);
            } else {
              models[name][relName](models[rel]);
            }  
          }
        } else {
          if(typeof related === 'object'){
            var relatedModel = Object.keys(related)[0]
            models[name][relName](models[relatedModel], related[relatedModel]);
          } else {
            models[name][relName](models[related]);
          }
        }
      }
    }
  }

  this.model = function (name){
    return models[name];
  }

  this.Seq = function (){
    return Sequelize;
  }

  this.query = function(query,callee, options, replacements){
    return sequelize.query(query,callee, options, replacements);
  }

  if(singleton.caller != singleton.getInstance){
    throw new Error("This object cannot be instanciated");
  }
}

singleton.instance = null;

singleton.getInstance = function(){
  if(this.instance === null){
    this.instance = new singleton();
  }
  return this.instance;
}

module.exports = singleton.getInstance();