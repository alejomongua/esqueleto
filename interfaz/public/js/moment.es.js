// moment.js language configuration
// language : spanish (es)
// author : Julio Napurí : https://github.com/julionc
!function(){
  function e(e){
    e.lang("es",{
      months:"enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
      monthsShort:"ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
      weekdays:"domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado".split("_"),
      weekdaysShort:"dom._lun._mar._mi\xe9._jue._vie._s\xe1b.".split("_"),
      weekdaysMin:"Do_Lu_Ma_Mi_Ju_Vi_S\xe1".split("_"),
      longDateFormat:{
        LT:"H:mm",
        L:"DD/MM/YYYY",
        LL:"D [de] MMMM [de] YYYY",
        LLL:"D [de] MMMM [de] YYYY LT",
        LLLL:"dddd, D [de] MMMM [de] YYYY LT"
      },
      calendar:{
        sameDay:function(){
          return"[hoy a la"+(1!==this.hours()?"s":"")+"] LT"
        },
        nextDay:function(){
          return"[ma\xf1ana a la"+(1!==this.hours()?"s":"")+"] LT"
        },
        nextWeek:function(){
          return"dddd [a la"+(1!==this.hours()?"s":"")+"] LT"
        },
        lastDay:function(){
          return"[ayer a la"+(1!==this.hours()?"s":"")+"] LT"
        },
        lastWeek:function(){
          return"[el] dddd [pasado a la"+(1!==this.hours()?"s":"")+"] LT"
        },
        sameElse:"L"
      },
      relativeTime:{
        future:"en %s",
        past:"hace %s",
        s:"unos segundos",
        m:"un minuto",
        mm:"%d minutos",
        h:"una hora",
        hh:"%d horas",
        d:"un d\xeda",
        dd:"%d d\xedas",
        M:"un mes",
        MM:"%d meses",
        y:"un a\xf1o",
        yy:"%d a\xf1os"
      },
      ordinal:"%d\xba",
      week:{
        dow:1,
        doy:4
      }
    })
  }
  "function"==typeof define&&define.amd&&define(["moment"],e),
  "undefined"!=typeof window&&window.moment&&e(window.moment)
}();