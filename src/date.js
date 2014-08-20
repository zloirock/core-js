!function(formatRegExp, flexioRegExp, locales, current, SECONDS, MINUTES, HOURS, MONTH, YEAR){
  function createFormat(UTC){
    return function(template, locale /* = current */){
      var that = this
        , dict = locales[has(locales, locale) ? locale : current];
      function get(unit){
        return that[(UTC ? 'getUTC' : 'get') + unit]();
      }
      return String(template).replace(formatRegExp, function(part){
        switch(part){
          case 'ms'   : var ms = get('Milliseconds');                           // Milliseconds : 000-999
            return ms > 99 ? ms : '0' + lz(ms);
          case 's'    : return get(SECONDS);                                    // Seconds      : 0-59
          case 'ss'   : return lz(get(SECONDS));                                // Seconds      : 00-59
          case 'm'    : return get(MINUTES);                                    // Minutes      : 0-59
          case 'mm'   : return lz(get(MINUTES));                                // Minutes      : 00-59
          case 'h'    : return get(HOURS);                                      // Hours        : 0-23
          case 'hh'   : return lz(get(HOURS));                                  // Hours        : 00-23
          case 'D'    : return get(DATE)                                        // Date         : 1-31
          case 'DD'   : return lz(get(DATE));                                   // Date         : 01-31
          case 'W'    : return dict.W[get('Day')];                              // Day          : Понедельник
          case 'N'    : return get(MONTH) + 1;                                  // Month        : 1-12
          case 'NN'   : return lz(get(MONTH) + 1);                              // Month        : 01-12
          case 'M'    : return dict.M[get(MONTH)];                              // Month        : Январь
          case 'MM'   : return dict.MM[get(MONTH)];                             // Month        : Января
          case 'YY'   : return lz(get(YEAR) % 100);                             // Year         : 14
          case 'YYYY' : return get(YEAR);                                       // Year         : 2014
        } return part;
      });
    }
  }
  function lz(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    function split(index){
      return turn.call(array(locale.months), function(memo, it){
        memo.push(it.replace(flexioRegExp, '$' + index));
      });
    }
    locales[lang] = {
      W : array(locale.weekdays),
      MM: split(1),
      M : split(2)
    };
    return Date;
  }
  $define(STATIC, DATE, {
    locale: function(locale){
      return has(locales, locale) ? current = locale : current;
    },
    addLocale: addLocale
  });
  $define(PROTO, DATE, {
    format:    createFormat(false),
    formatUTC: createFormat(true)
  });
  addLocale(current, {
    weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    months:   'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    months:   'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
  });
}(/\b\w{1,4}\b/g, /:(.*)\|(.*)$/, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Month', 'FullYear');