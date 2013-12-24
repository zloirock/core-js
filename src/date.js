!function(){
  function format(template, lang /* = current */){
    var that = isDate(this) ? this : new Date
      , locale = locales[has(locales, lang) ? lang : current];
    return String(template).replace(formatRegExp, function(part, key){
      switch(key){
        case 'ms'   : return that.getMilliseconds();                  // mSec    : 1-999
        case 's'    : return that[getSeconds]();                      // Seconds : 1-59
        case 'ss'   : return leadZero(that[getSeconds](), 2);         // Seconds : 01-59
        case 'm'    : return that[getMinutes]();                      // Minutes : 1-59
        case 'mm'   : return leadZero(that[getMinutes](), 2);         // Minutes : 01-59
        case 'h'    : return that[getHours]() % 12 || 12              // Hours   : 1-23
        case 'hh'   : return leadZero(that[getHours]() % 12 || 12, 2);// Hours   : 01-23
        case 'H'    : return that[getHours]();                        // Hours   : 1-11
        case 'HH'   : return leadZero(that[getHours](), 2);           // Hours   : 01-11
        case 'd'    : return that.getDate();                          // Date    : 1-31
        case 'dd'   : return leadZero(that.getDate(), 2);             // Date    : 01-31
        case 'w'    : return locale.w[that.getDay()];                 // Day     : Понедельник
        case 'n'    : return that[getMonth]() + 1;                    // Month   : 1-12
        case 'nn'   : return leadZero(that[getMonth]() + 1, 2);       // Month   : 01-12
        case 'M'    : return locale.M[that[getMonth]()];              // Month   : Январь
        case 'MM'   : return locale.MM[that[getMonth]()];             // Month   : Января
        case 'yy'   : return leadZero(that[getFullYear]() % 100, 2);  // Year    : 13
        case 'yyyy' : return that[getFullYear]()                      // Year    : 2013
      }
      return part
    })
  }
  function addLocale(lang, locale){
    locales[lang] = {
      w : splitComma(locale.w),
      M : splitComma(locale.M).map(flexio(0)),
      MM: splitComma(locale.M).map(flexio(1))
    }
  }
  function flexio(index){
    return function(it){
      return it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index]
      })
    }
  }
  var formatRegExp = /\b(\w\w*)\b/g
    , current = 'en'
    , locales = {}
    , getSeconds = 'getSeconds'
    , getMinutes = 'getMinutes'
    , getHours = 'getHours'
    , getMonth = 'getMonth'
    , getFullYear = 'getFullYear';
  extendBuiltInObject(Date, {
    locale: function(locale){
      if(has(locales, locale))current = locale;
      return current
    },
    addLocale: addLocale,
    format: format
  });
  extendBuiltInObject(Date[prototype], {format: format});
  addLocale('en', {
    w: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    M: 'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    w: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    M: 'Январ+ь|я,Феврал+ь|я,Март+|а,Апрел+ь|я,Ма+й|я,Июн+ь|я,Июл+ь|я,Август+|а,Сентябр+ь|я,Октябр+ь|я,Ноябр+ь|я,Декабр+ь|я'
  });
}();