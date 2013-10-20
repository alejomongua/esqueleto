var capitalizeFirstLetter = function(string)
{
  if (typeof string === 'string'){
    return string.charAt(0).toUpperCase() + string.slice(1);
  } else {
    return '';
  }
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

var formularios = {};
/* 
 * 
 * 
 * 
 */
formularios.campo = function(recurso, nombreDelCampo, tipo, valores, errores, options){
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
  var stringAMostrar = capitalizeFirstLetter(nombreDelCampo);
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

  if(!isEmpty(errores)){
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

/* Maneja los errores en el siguiente formato: 
 * {
 *   'nombre': ['demasiado corto',
 *              'no debe tener tildes']
 *    'password': ['no coinicide con la confirmacion']
 *  }
 */

formularios.errores = function(flash, errores, options){
  var mensaje, stringAMostrar;
  if(typeof errores === 'undefined') {
    errores = {};
  }
  if (!isEmpty(errores)){
    mensaje = 'Hay errores en el formulario' +
              '<ul>';
    for(var error in errores){
      stringAMostrar = capitalizeFirstLetter(error);
      if (options && options[error]){
        if (options[error].label){
          stringAMostrar = options[error].label;
        }
      }
      for(var e in errores[error]){
        mensaje = mensaje + '<li>' + stringAMostrar + ' ' + e + '</li>'
      }
    }
    mensaje = mensaje + '</ul>';
    flash['error'] =  mensaje;
  }  
};

module.exports = formularios;