!function(){
  function format(template/*?*/,locale){
    var that=this;
    locale=own(locales,locale)?locale:current||'en';
    return String(template).replace(/\{([^{]+)\}/g,function(part,key){
      switch(key){
        case'ms'   :return that.getMilliseconds();
        case's'    :return that.getSeconds();
        case'ss'   :return numberFormat(that.getSeconds(),0,2);
        case'm'    :return that.getMinutes();
        case'mm'   :return numberFormat(that.getMinutes(),0,2);
        case'h'    :return that.getHours()%12||12
        case'hh'   :return numberFormat(that.getHours()%12||12,0,2);
        case'H'    :return that.getHours();
        case'HH'   :return numberFormat(that.getHours(),0,2);
        case'd'    :return that.getDate();
        case'dd'   :return numberFormat(that.getDate(),0,2);
        case'Week' :return locales[locale].week[that.getDay()];
        case'w'    :return that.getDay();
        case'M'    :return that.getMonth()+1;
        case'MM'   :return numberFormat(that.getMonth()+1,0,2);
        case'Month':return locales[locale].month[that.getMonth()];
        case'month':return locales[locale].ofMonth[that.getMonth()];
        case'yy'   :return numberFormat(that.getFullYear()%100,0,2);
        case'yyyy' :return that.getFullYear()
      }
      return part
    })
  }
  function addLocale(lang,locale){
    locale.week=locale.week.split(',');
    locale.ofMonth=(locale.ofMonth||locale.month).split(',');
    locale.month=locale.month.split(',');
    locales[lang]=locale
  }
  extendBuiltInObject(Date,{
    locale:function(locale){
      if(own(locales,locale))current=locale;
      return current
    },
    addLocale:addLocale,
    format:function(){
      return format.apply(new Date,arguments)
    }
  });
  extendBuiltInObject(Date[prototype],{format:format});
  var key,current='en',
      locales={},
      baseLocales={
        ru:{
          week:'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
          month:'Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь',
          ofMonth:'Января,Февраля,Марта,Апреля,Мая,Июня,Июля,Августа,Сентября,Октября,Ноября,Декабря'
        },
        en:{
          week:'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
          month:'January,February,March,April,May,June,July,August,September,October,November,December'
        }/*,
        de:{
          week:'Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag',
          month:'Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember'
        }*/
      };
  for(key in baseLocales)own(baseLocales,key)&&addLocale(key,baseLocales[key]);
}();