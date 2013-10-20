myApplication.Backbone.Evento = Backbone.Model.extend({
  urlRoot: myApplication.apiUrl + '/eventos'
});

myApplication.Backbone.Eventos = myApplication.Backbone.PaginatedCollection.extend({
  model: myApplication.Backbone.Evento,
  modelo: 'eventos',
  parse: function(resp) {
    this.pagina = resp.pagina;
    this.total = resp.total;
    this.por_pagina = resp.por_pagina;
    this.mensaje = resp.mensaje;
    return resp.eventos;
  },
  url: function(){
    return myApplication.apiUrl + '/' + this.modelo + '?' + $.param({
      pagina: this.pagina,
      por_pagina: this.por_pagina,
      q: this.filtro,
      usuarios: this.usuarios,
      desde: this.desde,
      hasta: this.hasta
    });
  }
});

myApplication.Backbone.EventosView = myApplication.Backbone.PaginatedView.extend({
  initialize: function() {
    _.bindAll(this, 'previous', 'next', 'first', 'last', 'render', 'filtrar');
    this.collection.bind('refresh', this.render);
  },
  events: {
    'click a.eventos-first': 'first',
    'click a.eventos-prev': 'previous',
    'click a.eventos-next': 'next',
    'click a.eventos-last': 'last',
    'click a.eventos-detalles' : 'detalles',
    'click a.eventos-borrar': 'borrar',
    'submit form#filtrar-eventos-form': 'filtrar'
  },
  render: function() {
    var that = this;
    var elemento = $('#lista-eventos');
    this.collection.fetch({
      beforeSend: function(req) {
        elemento.html('<div class="text-center"><img src="/images/ajax-loader.gif" title="cargando" alt="cargando" /></div>');
      },
      success: function(data){
        myApplication.renderTemplate('common/_paginacion', $('.paginacion'), that.collection.pageInfo());
        myApplication.flash(data.mensaje);
        if (data.models){
          var eventos = data.toJSON();
          myApplication.renderTemplate('eventos/lista', elemento, {eventos: eventos});
        }
        history.pushState({
          url: '/eventos?' + $.param({pagina: that.collection.pagina, por_pagina: that.collection.por_pagina}),
          template: 'eventos/index'
        }, null, '/eventos?' + $.param({pagina: that.collection.pagina, por_pagina: that.collection.por_pagina}))
      }
    });
  },

  filtrar: function() {
    this.collection.filtro = $('#filtrar-eventos').val();
    this.collection.usuarios = $('#filtrar-eventos_usuarios').val();
    var desde = $('#filtrar-eventos-desde').val();
    if(desde){
      this.collection.desde = Date.parse(desde);
    }
    var hasta = $('#filtrar-eventos-hasta').val();
    if (hasta){
      this.collection.hasta = Date.parse(hasta);
    }
    this.render();
    return false;
  }
});

myApplication.Backbone.eventos = new myApplication.Backbone.Eventos();

myApplication.Backbone.eventosView = new myApplication.Backbone.EventosView({
  collection: myApplication.Backbone.eventos
});

myApplication.Backbone.router.route("eventos", "eventosIndex");
myApplication.Backbone.router.route("eventos?*query", "eventosIndex");

myApplication.Backbone.router.on('route:eventosIndex', function() {
  var pagina = myApplication.getQueryVariable('pagina');
  var por_pagina = myApplication.getQueryVariable('por_pagina');
  if (pagina){
    myApplication.Backbone.eventos.pagina = pagina;
  }
  if (por_pagina){
    myApplication.Backbone.eventos.por_pagina = por_pagina;
  }
  // render user list
  myApplication.Backbone.eventosView.render();
});

// Restart history
Backbone.history.stop();
Backbone.history.start({pushState: true});