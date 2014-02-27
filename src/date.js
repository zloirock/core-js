/**
 * Alternatives:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 * https://github.com/andyearnshaw/Intl.js
 * http://momentjs.com/
 * http://habrahabr.ru/post/204162/
 * http://sugarjs.com/api/Date/format
 * http://mootools.net/docs/more/Types/Date#Date:format
 */
!function(formatRegExp, locales, current, getHours, getMonth){
  function format(template, lang /* = current */){
    var that   = this
      , locale = locales[lang && has(locales, lang) ? lang : current];
    return String(template).replace(formatRegExp, function(part){
      switch(part){
        case 'ms'   : return that.getMilliseconds();                            // mSec    : 1-999
        case 's'    : return that.getSeconds();                                 // Seconds : 1-59
        case 'ss'   : return lz2(that.getSeconds());                            // Seconds : 01-59
        case 'm'    : return that.getMinutes();                                 // Minutes : 1-59
        case 'mm'   : return lz2(that.getMinutes());                            // Minutes : 01-59
        case 'h'    : return that[getHours]()                                   // Hours   : 0-23
        case 'hh'   : return lz2(that[getHours]());                             // Hours   : 00-23
        case 'H'    : return that[getHours]() % 12 || 12;                       // Hours   : 1-12
        case 'HH'   : return lz2(that[getHours]() % 12 || 12);                  // Hours   : 01-12
        case 'a'    : return that[getHours]() < 12 ? 'AM' : 'PM';               // AM/PM
        case 'd'    : return that.getDate();                                    // Date    : 1-31
        case 'dd'   : return lz2(that.getDate());                               // Date    : 01-31
        case 'w'    : return locale.w[that.getDay()];                           // Day     : Понедельник
        case 'n'    : return that[getMonth]() + 1;                              // Month   : 1-12
        case 'nn'   : return lz2(that[getMonth]() + 1);                         // Month   : 01-12
        case 'M'    : return locale.M[that[getMonth]()];                        // Month   : Январь
        case 'MM'   : return locale.MM[that[getMonth]()];                       // Month   : Января
        case 'yy'   : return lz2(that.getFullYear() % 100);                     // Year    : 13
        case 'yyyy' : return that.getFullYear();                                // Year    : 2013
      }
      return part;
    });
  }
  function lz2(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    locales[lang] = {
      w : array(locale.w),
      M : array(locale.M).map(flexio(0)),
      MM: array(locale.M).map(flexio(1))
    };
    return Date;
  }
  function flexio(index){
    return function(it){
      return it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index];
      });
    }
  }
  $define(STATIC, 'Date', {
    locale: function(locale){
      if(has(locales, locale))current = locale;
      return current;
    },
    addLocale: addLocale
  });
  $define(PROTO, 'Date', {format: format});
  addLocale('en', {
    w: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    M: 'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    w: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    M: 'Январ+ь|я,Феврал+ь|я,Март+|а,Апрел+ь|я,Ма+й|я,Июн+ь|я,Июл+ь|я,Август+|а,Сентябр+ь|я,Октябр+ь|я,Ноябр+ь|я,Декабр+ь|я'
  });
}(/\b(\w\w*)\b/g, {}, 'en', 'getHours', 'getMonth');