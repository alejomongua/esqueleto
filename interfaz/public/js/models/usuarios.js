myApplication.Backbone.Usuario = Backbone.Model.extend({
  urlRoot: myApplication.apiUrl + '/usuarios'
});

myApplication.Backbone.Usuarios = myApplication.Backbone.PaginatedCollection.extend({
  model: myApplication.Backbone.Usuario,
  modelo: 'usuarios',
  parse: function(resp) {
    this.pagina = resp.pagina;
    this.total = resp.total;
    this.por_pagina = resp.por_pagina;
    this.mensaje = resp.mensaje;
    return resp.usuarios;
  },
  url: function(){
    return myApplication.apiUrl + '/' + this.modelo + '?' + $.param({
      pagina: this.pagina,
      por_pagina: this.por_pagina,
      q: this.filtro
    });
  }
});

myApplication.Backbone.UsuariosView = myApplication.Backbone.PaginatedView.extend({
  initialize: function() {
    _.bindAll(this, 'previous', 'next', 'first', 'last', 'detalles', 'borrar', 'render', 'filtrar');
    this.collection.bind('refresh', this.render);
  },
  events: {
    'click a.usuarios-first': 'first',
    'click a.usuarios-prev': 'previous',
    'click a.usuarios-next': 'next',
    'click a.usuarios-last': 'last',
    'click a.usuarios-detalles' : 'detalles',
    'click a.usuarios-borrar': 'borrar',
    'submit form#filtrar-usuarios-form': 'filtrar'
  },
  render: function() {
    var that = this;
    var elemento = $('#lista-usuarios');
    this.collection.fetch({
      beforeSend: function(req) {
        elemento.html('<div class="text-center"><img src="/images/ajax-loader.gif" title="cargando" alt="cargando" /></div>');
      },
      success: function(data){
        myApplication.renderTemplate('common/_paginacion', $('.paginacion'), that.collection.pageInfo());
        myApplication.flash(data.mensaje);
        if (data.models){
          var usuarios = data.toJSON();
          myApplication.renderTemplate('usuarios/lista', elemento, {usuarios: usuarios});
        }
      }
    });
  },

  detalles: function(e) {
    // Borra los detalles de los otros usuarios (si hay)
    $('.usuarios-mostrar-detalles').remove();
    // Encuentra el elemento clickeado
    var elemento = $(e.currentTarget);
    // Determina el elemento dentro de la coleccion
    var usuario = this.collection.get(elemento.attr('data-id'));
    // Agrega el div para mostrar los detalles
    elemento.parent().append('<div class="usuarios-mostrar-detalles"></div>');
    // muestra los detalles
    myApplication.renderTemplate('usuarios/show', $('.usuarios-mostrar-detalles'),{usuario: usuario.toJSON()})
    return false;
  },

  borrar: function(e) {
    if(!confirm("Este cambio no se puede deshacer\n¿Está seguro?")){
      return false;
    }
    var that = this;
    // Encuentra el elemento clickeado
    var elemento = $(e.currentTarget);
    // Determina el elemento dentro de la coleccion
    var usuario = this.collection.get(elemento.attr('data-id'));
    var userId = usuario.get('id');
    // Elimina el elemento
    this.collection.remove(usuario);
    usuario.destroy({      
      success: function(data){
        // Realiza el efecto de eliminacion
        elemento.parent().parent().html('<div class="alert alert-error">Usuario eliminado</div>');
        setTimeout(function(){
          if(Math.floor((that.collection.por_pagina/2) > that.collection.length) &&
           (that.collection.length < that.collection.total)){
            that.render();
          } else {
            $('#usuario-' + userId).remove();
          }
        },1000);
      }
    });
    return false;
  },

  filtrar: function() {
    this.collection.filtro = $('#filtrar-usuarios').val();
    this.render();
    return false;
  }
});

myApplication.Backbone.usuarios = new myApplication.Backbone.Usuarios();

myApplication.Backbone.usuariosView = new myApplication.Backbone.UsuariosView({
  collection: myApplication.Backbone.usuarios
});

myApplication.Backbone.router.route("usuarios", "usuariosIndex");
myApplication.Backbone.router.route("usuarios?*query", "usuariosIndex");

myApplication.Backbone.router.on('route:usuariosIndex', function() {
  var pagina = myApplication.getQueryVariable('pagina');
  var por_pagina = myApplication.getQueryVariable('por_pagina');
  var filtro = myApplication.getQueryVariable('q');
  if (pagina){
    myApplication.Backbone.usuarios.pagina = pagina;
  }
  if (por_pagina){
    myApplication.Backbone.usuarios.por_pagina = por_pagina;
  }
  if (filtro){
    myApplication.Backbone.usuarios.filtro = filtro;
  }
  // render user list
  myApplication.Backbone.usuariosView.render();
});

// Restart history
Backbone.history.stop();
Backbone.history.start({pushState: true});