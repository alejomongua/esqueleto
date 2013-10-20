$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};    

var myApplication = {};

//Localizacion
$.datepicker.setDefaults( $.datepicker.regional[ "es" ] );
moment.lang('es');

/* Rutas */
myApplication.interfaz = window.location.protocol + '//' + window.location.host;
myApplication.apiUrl = window.location.protocol + '//api.' + window.location.host;

/* utilidades */
myApplication.capitalizeFirstLetter = function(string)
{
  if (typeof string === 'string'){
    return string.charAt(0).toUpperCase() + string.slice(1);
  } else {
    return '';
  }
};

myApplication.isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};

$.ajaxPrefilter(function(op, originalOp){
  if(originalOp.addAuthHeader){
    op.beforeSend = function(request){
      if(myApplication.usuario_actual && myApplication.usuario_actual.remember_token) {
        request.setRequestHeader("X-Identificar", myApplication.usuario_actual.remember_token);
      } else {
        request.setRequestHeader("X-Identificar", $.cookie('identificar'));
      }
    }
  }
});

myApplication.getQueryVariable = function (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
          return decodeURIComponent(pair[1]);
      }
  }
  return false;
}

/* sesion */
myApplication.login = function(usuario){
  myApplication.usuario_actual = usuario;
  myApplication.renderTemplate('common/menu_usuario', $('#menu-usuario'), {usuario_actual: myApplication.usuario_actual});
  $.cookie("identificar", usuario.remember_token, {path: '/'});
};

myApplication.logout = function(){
  myApplication.renderTemplate('common/menu_usuario', $('#menu-usuario'), {usuario_actual: false});
  myApplication.usuario_actual = null;
  $.removeCookie("identificar", {path: '/'});
  $.removeCookie("connect.sid", {path: '/'});
};

/* plantillas */

/* Carga la vista desde la ruta 'template' y la pone
 * en 'dest' (jQuery instance).
 * Utiliza el contexto 'context' para llenar la plantilla
 * opciones: position:
 *    replace: Pone el resultado dentro de 'dest', remplazando
 *             lo que hubiera allì, opcion por defecto
 *    append: añade el resultado al contenido de 'dest'
 *    prepend: pone el resultado antes del contenido de 'dest'
 */
myApplication.renderTemplate = function(template, dest, context, options, callback){
  var posicion = 'replace';
  var url = '/_views/' + template + '.html';
  if (options){
    if(options.position){
      posicion = options.position;
    }
  }
  $.ajax({
    url: url,
    type: 'GET',
    success: function(data, b, c){
      var result = _.template(data, context);
      switch(posicion){
        case 'append':
          dest.append(result);
          break;
        case 'prepend':
          dest.prepend(result);
          break;
        default:
          dest.html(result);
          break;
      }
      if(callback){
        callback();
      }
    },
    error: function(e){
      if(callback){
        callback(e);
      }
    }
  });
};

myApplication.navegarA = function(destination, options, data){
  var operacion = 'push';
  var method = 'get';
  var contenedorPrincipal = $('#main-content');
  var d = myApplication.apiUrl + destination; // URL completa
  var url = destination;
  var navegarAjax = function(context){
    var t;
    var tit = 'Aplicacion';
    if(context){
      if(context.mensaje){
        myApplication.flash(context.mensaje);
      }
      if (context.titulo){
        tit = context.titulo + ' | ' + tit;
        $('#main-title').html(context.titulo);
      } else {
        $('#main-title').html('');
      }
      if(context.logout){
        myApplication.logout();
      } else if(context.login){
        myApplication.login(context.login);
      }
      if (context.template) {
        t = context.template;
      }
      if (context.url) {
        d = myApplication.apiUrl + context.url;
        url = context.url;
      }
    }
    $('title').html(tit);
    myApplication.renderTemplate(t, contenedorPrincipal, context, options, function(){
      if(myApplication.Backbone.router){
        Backbone.history.navigate(url.replace(/^\//,''), {trigger: true, replace: true})
      }
    })
    if (operacion === 'replace'){
      history.replaceState({
        url: url,
        template: t
      }, null, url);
    }else if (operacion === 'push'){
      history.pushState({
        url: url,
        template: t
      }, null, url);
      $("body").addClass("historypushed");
    }
    // Dispara los eventos de backbone
  }
  
  contenedorPrincipal.html('<div class="text-center"><img src="/images/ajax-loader.gif" title="cargando" alt="cargando" /></div>');
  
  if (options){
    if(options.operacion){
      operacion = options.operacion;
    }
    if(options.method){
      method = options.method;
    }
  }
  myApplication.flash(); // Borra los mensajes en el flash
  $.ajax({
    url: d,
    type: method,
    data: data,
    addAuthHeader: true,
    success: function(context){
      navegarAjax(context);
    },
    error: function(err){
      var context = err.responseJSON;      
      if(err.status === 404){
        myApplication.renderTemplate('common/404', contenedorPrincipal);
      } else if (context) {
        navegarAjax(context);
      } else {
        myApplication.renderTemplate('common/500', contenedorPrincipal);
      }
      console.log(err);
    }
  });
};

myApplication.flash = function(mensaje){
  var flashTemplate = 'common/flash';
  var flashDiv = $('#flash');
  if (typeof mensaje !== 'object' || myApplication.isEmpty(mensaje)){
    flashDiv.html('');
  } else {
    myApplication.renderTemplate(flashTemplate, flashDiv, {flash: mensaje});
  }
}

myApplication.modelToString = function(){
  $('.model-to-string').each(function(){
    var $self = $(this);
    var ruta = $self.attr('data-ruta');
    var campo = $self.attr('data-campo');
    var modelo = $self.attr('data-modelo');
    $.ajax({
      url: myApplication.apiUrl + ruta,
      addAuthHeader: true,
      success: function(data){
        if(modelo){
          $self.text(data[modelo][campo]);
        } else {
          $self.text(data[campo]);
        }
      },
      error: function(){
        var id = $self.attr('data-id');
        $self.text('No existe ' + modelo + '(' + id + ')');
      }
    });
  });
}

/* facebook */
myApplication.FB = {};

myApplication.FB.APPID = '400616776704742';

myApplication.FB.updateStatusCallback = function(response){
  myApplication.FB.response = response;
  if (response.status === 'connected') {
    FB.api('/me', function(data){
      if(!data.error){
        if (myApplication.FB.accion === 'registrar') {
          var usuario = {
            nombre: data.name,
            username: data.username,
            email: data.email,
            signed_request: response.authResponse.signedRequest,
            facebookUID: response.authResponse.userID
          }
          $.ajax({
            url: '/usuarios',
            type: 'POST',
            data: usuario,
            success: function(resp){
              myApplication.login(resp.login)
            },
            error: function(data){
              myApplication.flash(data)
              console.log(data);
            },
          });
        } else {
          var datos = {
            signed_request: response.authResponse.signedRequest,
            facebookUID: response.authResponse.userID
          };
          $.ajax({
            url: '/sesiones',
            type: 'POST',
            data: datos,
            success: function(resp){
              myApplication.login(resp.login)
            },
            error: function(data){
              console.log(data);
            },
          });
        }
      }
    });
  } else if (response.status === 'not_authorized') {
    console.log(response);
  } else {
    console.log(response);
  }
}

/* formularios */
myApplication.formularios = {};

myApplication.formularios.preparar = function() {
  var chosenOpts = {
    no_results_text: "No se encontraron resultados"
  };
  $("select.modelo").each(function(){
    var selectElement = $(this);
    var seleccionados = selectElement.attr('data-seleccionado').split(',');
    $.ajax({
      url: myApplication.apiUrl + $(this).attr('data-modelo'),
      addAuthHeader: true,
      success: function(data){
        selectElement.append('<option />');
        var o;
        for(var __i=0; __i < data.length; __i++){
          o = document.createElement('option');
          o.value = data[__i].id;
          o.text = data[__i].mostrar;
          if(seleccionados.indexOf(data[__i].id.toString()) > -1){
            o.setAttribute('selected', 'selected');
          }
          selectElement.append(o);
        }
      },
      error: function(e){
        console.log(e);
      },
      complete: function(){
        selectElement.attr('data-placeholder', 'Seleccione una opción')
        selectElement.chosen(chosenOpts);
      }
    });
  });
  $(".chosen-select").chosen(chosenOpts);
};


myApplication.formularios.campo = function(recurso, nombreDelCampo, tipo, valores, errores, options){
/*
<div class="row">
  <div class="col-xs-6 col-sm-6 col-md-5 col-lg-4">
    <%-label%>
  </div>
  <div class="col-xs-6 col-sm-6 col-md-5 col-lg-4">
    <%-input%>
  </div>
</div>
*/
  if (typeof valores === 'undefined') valores = {}
  if (typeof errores === 'undefined') errores = {}
  var stringAMostrar = myApplication.capitalizeFirstLetter(nombreDelCampo);
  var data = '';
  var multiple = '';
  var opciones = '';
  var clase = '';
  var input_class = '';
  var valor = ''
  var output, seleccionado;

  clase = errores[nombreDelCampo] ? 'row form-group has-error' : 'row form-group';
  if (options){
    if (options.label) {
      stringAMostrar = options.label;
    }
    if (options.data){
      for(var dato in options.data){
        data = data + ' data-' + dato + '="' + options.data[dato] + '"';
      }
    }
    if (options.clase) {
      clase = ' ' + options.clase;
    }
    if (options.input_class) {
      input_class = ' ' + options.input_class;
    }
    if (options.opciones){ // Opciones para los select
      if(options.includeBlank){
        opciones = '<option />'
      }
      for(var opcion in options.opciones){
        seleccionado = ''; // Verifica si la opción estaba previamente seleccionada
        if(valores[nombreDelCampo]){
          if((valores[nombreDelCampo] instanceof Array && valores[nombreDelCampo].indexOf(opcion) > -1) || // Si es un array
            (valores[nombreDelCampo] == opcion)) { // Si es un valor sencillo
            seleccionado = ' selected';
          }
        }
        opciones = opciones + '<option value="' + opcion + '"'+ seleccionado +'>' + options.opciones[opcion] + '</option>';
      }
    }
    if (options.multiple){
      multiple = ' multiple';
    }
  }

  if(!myApplication.isEmpty(errores)){
    input_class = input_class + ' changed';
  }

  if (valores[nombreDelCampo]){
    valor = ' value="' + valores[nombreDelCampo] + '"';
  }

  var input;
  if (tipo !== 'checkbox') {
    label = '<label class="control-label text-right" for="' + recurso + '_' + nombreDelCampo + '">' + 
                stringAMostrar + '</label>';
    switch(tipo){
      case 'texto':
        input = '<input id="' + recurso + '_' + nombreDelCampo + '"' +
                      ' class="form-control' + input_class + '"' +
                      ' name="' + nombreDelCampo + '"' +
                      ' size="30" type="text"' + valor + data + '>';
        break;
      case 'password':
        input = '<input id="' + recurso + '_' + nombreDelCampo + '"' +
                      ' class="form-control' + input_class + '"' +
                      ' name="' + nombreDelCampo + '"' +
                      ' size="30" type="password"' + valor + data + '>';
        break;
      case 'seleccion':
        input = '<select id="' + recurso + '_' + nombreDelCampo + '"' +
                ' class="form_control' + input_class + '"' + multiple + data +
                ' name="' + nombreDelCampo + '"' + '>' +
                opciones + '</select>';
        break;
      case 'textarea':
        valor = valores[nombreDelCampo] || '';
        input = '<textarea id="' + recurso + '_' + nombreDelCampo + '"' +
                      ' class="form-control' + input_class + '"' +
                      ' name="' + nombreDelCampo + '"' +
                      ' size="30"' + data + '>' + valor + '</textarea>';
        break;
      default:
        input = '';
        break;
    }

    output = '<div class="' + clase + '">' +
             '  <div class="col-xs-6 col-sm-6 col-md-5 col-lg-4">' +
             label +
             '  </div>' +
             '  <div class="col-xs-6 col-sm-6 col-md-5 col-lg-4">' +
             input +
             '  </div>' +
             '</div>';
  } else {
    input = '<input id="' + recurso + '_' + nombreDelCampo + '"' +
                      ' class="form-control' + input_class + '"' +
                      ' name="' + nombreDelCampo + '"' +
                      ' size="30" type="checkbox"' + valor + data + '>';

    output = '<div class="row' + clase + '">' +
             '  <div class="col-xs-6 col-sm-6 col-md-5 col-lg-4 text-right">' +
             input +
             '  </div>' +
             '  <div class="col-xs-6 col-sm-6 col-md-5 col-lg-4">' +
             stringAMostrar +
             '  </div>' +
             '</div>';
  }
  

  return output;
};

myApplication.formularios.errores = function(errores, options){
  var mensaje, stringAMostrar;
  if(typeof errores === 'string'){
    myApplication.flash({error: errores});
  } else if (typeof errores === 'object' && !myApplication.isEmpty(errores)){
    mensaje = 'Hay errores en el formulario' +
              '<ul>';
    for(var error in errores){
      stringAMostrar = myApplication.capitalizeFirstLetter(error);
      if (options && options[error]){
        if (options[error].label){
          stringAMostrar = options[error].label;
        }
      }
      for(var e in errores[error]){
        mensaje = mensaje + '<li>' + stringAMostrar + ' ' + errores[error][e] + '</li>'
      }
    }
    mensaje = mensaje + '</ul>';
    myApplication.flash({error: mensaje});
  }  
};

/* Inicializacion */ 
myApplication.inicializar = function($){
  if(history && history.pushState){
    // Navegacion ajax
    $(document).on('click', 'a', function(){
      var vinculo = $(this);
      if(!vinculo.hasClass('dropdown-toggle')){
        $('.dropdown.open .dropdown-toggle').dropdown('toggle');
      }
      if(!vinculo.hasClass('active')){
        if(vinculo.attr('data-remote')){
          $('a').removeClass('active');
          vinculo.addClass('active');
          var opciones = {}
          opciones.method = vinculo.attr('data-method') || 'GET';
          myApplication.navegarA(vinculo.attr('href'), opciones);
          return false;
        } else if(($(this).attr('data-accion') === 'registrar') || ($(this).attr('data-accion') === 'ingresar')){
          myApplication.FB.accion = $(this).attr('data-accion');
          FB.login(myApplication.FB.updateStatusCallback, {scope: "email"});
          return false;
        }
      } else {
        return false;
      }
    });

    // Enviar formularios ajax
    $(document).on('click', 'button', function(){
      if($(this).attr('data-remote') && $(this).attr('data-formulario')){
        var boton = $(this),
            idForm = boton.attr('data-formulario'),
            formulario = $('#' + idForm),
            method, destination, datos;
        if(formulario.length > 0){
          destination = formulario.attr('action');
          formulario.find('input, select, textarea').not('.changed').remove();
          datos = formulario.serializeObject();
          method = formulario.attr('data-method') || 'POST';
          myApplication.navegarA(destination, {method: method}, datos);
          return false;
        }
      }
    });
    // Detecta cuales atributos han cambiado en un formulario
    $(document).on('change', 'input, select, textarea', function(){
      $(this).addClass('changed');
    })
  }
  // Cargue el usuario actual si existe la cookie
  if($.cookie('identificar')) {
    $.ajax({
      url: myApplication.apiUrl + '/sesiones',
      type: 'GET',
      beforeSend: function(req){      
        req.setRequestHeader("X-Identificar", $.cookie('identificar'));
      },
      success: function(u){
        // si el valor no es válido, borre la cookie
        if (!u) { 
          myApplication.logout();
        } else {
          myApplication.usuario_actual = u;
          myApplication.usuario_actual.remember_token = $.cookie('identificar');
        }
      }
    });
    $(document).on('click', 'a.colorbox', function(){
      $.colorbox({
        html: $(this).attr('data-html'),
        maxWidth: '100%'
      });
      return false;
    });
  }
  // Cargue la librería de FB
  $.ajaxSetup({ cache: true });
  $.getScript('//connect.facebook.net/en_US/all.js', function(){
    FB.init({
      appId      : myApplication.FB.APPID, // App ID
      channelUrl : '//localhost/channel', // Channel File
      cookie     : true, // enable cookies to allow the server to access the session
    });
    //FB.Event.subscribe('auth.authResponseChange', asp.FB.updateStatusCallback);
  });
  // formularios
  // Cargar modelos dinámicamente:
  myApplication.formularios.preparar();
};

myApplication.inicializar.dashboard = function(){
  if(myApplication.usuario_actual){
    
  }
};

$(document).ready(myApplication.inicializar);

window.onpopstate = function(e){
  if(e.state && e.state.url){
    myApplication.navegarA(e.state.url, {operacion: 'pop'});
    $("body").addClass("historypushed");
  } else {
    if ($("body").hasClass("historypushed")){
      document.location.reload(true); 
    }
  }
}

// Backbone

myApplication.Backbone = {};

myApplication.Backbone.PaginatedCollection = Backbone.Collection.extend({
  initialize: function() {
    _.bindAll(this, 'parse', 'url', 'pageInfo', 'nextPage', 'previousPage');
    this.pagina = 1;
    typeof(this.por_pagina) !== 'undefined' || (this.por_pagina = 50);
    this.mensaje = null;
  },
  fetch: function(options) {
    typeof(options) !== 'undefined' || (options = {});
    this.trigger("fetching");
    var self = this;
    var success = options.success;
    options.success = function(resp) {
      self.trigger("fetched");
      if(success) { success.call(self, resp); }
    };
    return Backbone.Collection.prototype.fetch.call(this, options);
  },
  url: function() {
    return myApplication.apiUrl + '/' + this.modelo + '?' + $.param({
      pagina: this.pagina,
      por_pagina: this.por_pagina,
      q: this.filtro
    });
  },
  filtro: '',
  pageInfo: function() {
    var pagina = Number(this.pagina),
        total = Number(this.total),
        por_pagina = Number(this.por_pagina);

    var info = {
      total: total,
      pagina: pagina,
      por_pagina: por_pagina,
      paginas: Math.ceil(total / por_pagina),
      modelo: this.modelo,
      prev: false,
      next: false
    };
 
    var max = Math.min(total, pagina * por_pagina);
 
    if (total == info.paginas * por_pagina) {
      max = total;
    }
 
    info.range = [(pagina - 1) * por_pagina + 1, max];
 
    if (pagina > 1) {
      info.prev = pagina - 1;
    }
 
    if (pagina < info.paginas) {
      info.next = pagina + 1;
    }
 
    return info;
  },
  nextPage: function() {
    if (!this.pageInfo().next) {
      return false;
    }    
    this.pagina = Number(this.pagina) + 1;
    return this.pagina;
  },
  lastPage: function() {
    var info = this.pageInfo();
    if (!info.next) {
      return false;
    }    
    this.pagina = info.paginas;
    return this.pagina;
  },
  previousPage: function() {
    if (!this.pageInfo().prev) {
      return false;
    }
    this.pagina = Number(this.pagina) - 1;
    return this.pagina;
  },
  firstPage: function() {
    if (!this.pageInfo().prev) {
      return false;
    }
    this.pagina = 1;
    return this.pagina;
  }
});

myApplication.Backbone.PaginatedView = Backbone.View.extend({
  el: '#main-content',
  first: function() {
    if(this.collection.firstPage()){
      this.render();
    }
    return false;
  },

  previous: function() {
    if(this.collection.previousPage()){
      this.render();
    }
    return false;
  },
 
  next: function() {
    if(this.collection.nextPage()){
      this.render();
    }
    return false;
  },

  last: function() {
    if(this.collection.lastPage()) {
      this.render();
    }
    return false;
  }
});

myApplication.Backbone.oldSync = Backbone.sync;

Backbone.sync = function( method, model, options ) {
  options.addAuthHeader = true;
  return myApplication.Backbone.oldSync.apply(this, [method, model, options]);
};

myApplication.Backbone.router = new Backbone.Router();

Backbone.history.start({pushState: true});