/**
 * Alternatives:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 * https://github.com/andyearnshaw/Intl.js
 * http://momentjs.com/
 * http://sugarjs.com/api/Date/format
 * http://mootools.net/docs/more/Types/Date#Date:format
 */
!function(formatRegExp, flexioRegExp, locales, current, Seconds, Minutes, Hours, _Date, Month, FullYear){
  function createFormat(UTC){
    return function(template, locale /* = current */){
      var that = this
        , dict = locales[has(locales, locale) ? locale : current];
      function get(unit){
        return that[(UTC ? 'getUTC' : 'get') + unit]();
      }
      return String(template).replace(formatRegExp, function(part){
        switch(part){
          case 'mmm'  : var ms = get('Milliseconds');                           // Milliseconds : 001-999
            return ms > 99 ? ms : ms > 9 ? '0' + ms : '00' + ms;
          case 's'    : return get(Seconds);                                    // Seconds      : 1-59
          case 'ss'   : return lz(get(Seconds));                                // Seconds      : 01-59
          case 'm'    : return get(Minutes);                                    // Minutes      : 1-59
          case 'mm'   : return lz(get(Minutes));                                // Minutes      : 01-59
          case 'h'    : return get(Hours);                                      // Hours        : 0-23
          case 'hh'   : return lz(get(Hours));                                  // Hours        : 00-23
          case 'H'    : return get(Hours) % 12 || 12;                           // Hours        : 1-12
          case 'HH'   : return lz(get(Hours) % 12 || 12);                       // Hours        : 01-12
          case 'a'    : return get(Hours) < 12 ? 'AM' : 'PM';                   // AM/PM
          case 'D'    : return get(_Date)                                       // Date         : 1-31
          case 'DD'   : return lz(get(_Date));                                  // Date         : 01-31
          case 'W'    : return dict.W[get('Day')];                              // Day          : Понедельник
          case 'N'    : return get(Month) + 1;                                  // Month        : 1-12
          case 'NN'   : return lz(get(Month) + 1);                              // Month        : 01-12
          case 'M'    : return dict.M[get(Month)];                              // Month        : Январь
          case 'MM'   : return dict.MM[get(Month)];                             // Month        : Января
          case 'YY'   : return lz(get(FullYear) % 100);                         // Year         : 13
          case 'YYYY' : return get(FullYear);                                   // Year         : 2013
        }
        return part;
      });
    }
  }
  function lz(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    locales[lang] = {
      W : array(locale.weekdays),
      MM: flexio(locale.months, 1),
      M : flexio(locale.months, 2)
    };
    return Date;
  }
  function flexio(locale, index){
    return transform.call(array(locale), function(memo, it){
      memo.push(it.replace(flexioRegExp, '$' + index));
    });
  }
  $define(STATIC, _Date, {
    locale: function(locale){
      return has(locales, locale) ? current = locale : current;
    },
    addLocale: addLocale
  });
  $define(PROTO, _Date, {
    format:    createFormat(0),
    formatUTC: createFormat(1)
  });
  addLocale(current, {
    weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    months:   'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    months:   'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
  });
}(/\b\w{1,4}\b/g, /:(.*)\|(.*)$/, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear');