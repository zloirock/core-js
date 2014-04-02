/**
 * Alternatives:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 * https://github.com/andyearnshaw/Intl.js
 * http://momentjs.com/
 * http://sugarjs.com/api/Date/format
 * http://mootools.net/docs/more/Types/Date#Date:format
 */
!function(formatRegExp, locales, current, Seconds, Minutes, Hours, $Date, Month, FullYear){
  function createFormat(UTC){
    return function(template, locale /* = current */){
      var that   = this
        , locale = locales[has(locales, locale) ? locale : current];
      function get(unit){
        return that[(UTC ? 'getUTC' : 'get') + unit]();
      }
      return String(template).replace(formatRegExp, function(part){
        switch(part){
          case 'ms'   : return get('Milliseconds');                             // Milliseconds : 1-999
          case 's'    : return get(Seconds);                                    // Seconds      : 1-59
          case 'ss'   : return lz2(get(Seconds));                               // Seconds      : 01-59
          case 'm'    : return get(Minutes);                                    // Minutes      : 1-59
          case 'mm'   : return lz2(get(Minutes));                               // Minutes      : 01-59
          case 'h'    : return get(Hours);                                      // Hours        : 0-23
          case 'hh'   : return lz2(get(Hours));                                 // Hours        : 00-23
          case 'H'    : return get(Hours) % 12 || 12;                           // Hours        : 1-12
          case 'HH'   : return lz2(get(Hours) % 12 || 12);                      // Hours        : 01-12
          case 'a'    : return get(Hours) < 12 ? 'AM' : 'PM';                   // AM/PM
          case 'd'    : return get($Date)                                       // Date         : 1-31
          case 'dd'   : return lz2(get($Date));                                 // Date         : 01-31
          case 'w'    : return locale.w[get('Day')];                            // Day          : Понедельник
          case 'n'    : return get(Month) + 1;                                  // Month        : 1-12
          case 'nn'   : return lz2(get(Month) + 1);                             // Month        : 01-12
          case 'M'    : return locale.M[get(Month)];                            // Month        : Январь
          case 'MM'   : return locale.MM[get(Month)];                           // Month        : Января
          case 'YY'   : return lz2(get(FullYear) % 100);                        // Year         : 13
          case 'YYYY' : return get(FullYear);                                   // Year         : 2013
        }
        return part;
      });
    }
  }
  function lz2(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    locales[lang] = {
      w : array(locale.w),
      M : flexio(locale.M, 0),
      MM: flexio(locale.M, 1)
    };
    return Date;
  }
  function flexio(locale, index){
    var result = [];
    $forEach(array(locale), function(it){
      result.push(it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index];
      }));
    });
    return result;
  }
  $define(STATIC, $Date, {
    locale: function(locale){
      return has(locales, locale) ? current = locale : current;
    },
    addLocale: addLocale
  });
  $define(PROTO, $Date, {
    format: createFormat(0),
    formatUTC: createFormat(1)
  });
  addLocale('en', {
    w: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    M: 'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    w: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    M: 'Январ+ь|я,Феврал+ь|я,Март+|а,Апрел+ь|я,Ма+й|я,Июн+ь|я,Июл+ь|я,Август+|а,Сентябр+ь|я,Октябр+ь|я,Ноябр+ь|я,Декабр+ь|я'
  });
}(/\b\w{1,4}\b/g, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear');