(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Array::at', function(){
    ok(isFunction(Array.prototype.at), 'Is function');
    ok([1, 2, 3].at(0) === 1, '[1, 2, 3].at(0) is 1');
    ok([1, 2, 3].at(2) === 3, '[1, 2, 3].at(2) is 3');
    ok([1, 2, 3].at(3) === void 8, '[1, 2, 3].at(3) is undefined');
    ok([1, 2, 3].at(-1) === 3, '[1, 2, 3].at(-1) is 3');
    ok([1, 2, 3].at(-3) === 1, '[1, 2, 3].at(-3) is 1');
    ok([1, 2, 3].at(-4) === void 8, '[1, 2, 3].at(-4) is undefined');
  });
  test('Array::transform', function(){
    var arr, obj;
    ok(isFunction(Array.prototype.transform), 'Is function');
    (arr = [1]).transform(function(memo, val, key, that){
      deepEqual([], memo, 'Default memo is array');
      ok(val === 1, 'First argumert is value');
      ok(key === 0, 'Second argumert is index');
      return ok(that === arr, 'Third argumert is array');
    });
    [1].transform(function(memo){
      return ok(memo === obj, 'Can reduce to exist object');
    }, obj = {});
    deepEqual([3, 2, 1], [1, 2, 3].transform(function(memo, it){
      return memo.unshift(it);
    }), 'Reduce to object and return it');
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Array static are functions', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['concat', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'sort', 'splice', 'unshift', 'indexOf', 'lastIndexOf', 'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'reduceRight', 'fill', 'find', 'findIndex', 'at', 'transform']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(Array[x$]), "Array." + x$ + " is function");
    }
  });
  test('Array.join', function(){
    var join;
    join = Array.join;
    ok(join('123', '|') === '1|2|3');
    ok(join(function(){
      return arguments;
    }(3, 2, 1), '|') === '3|2|1');
  });
  test('Array.pop', function(){
    var pop, args;
    pop = Array.pop;
    ok(pop(args = function(){
      return arguments;
    }(1, 2, 3)) === 3);
    deepEqual(args, function(){
      return arguments;
    }(1, 2));
  });
  test('Array.push', function(){
    var push, args;
    push = Array.push;
    push(args = function(){
      return arguments;
    }(1, 2, 3), 4, 5);
    ok(args.length === 5);
    ok(args[0] === 1);
    ok(args[1] === 2);
    ok(args[2] === 3);
    ok(args[3] === 4);
    ok(args[4] === 5);
  });
  test('Array.reverse', function(){
    var reverse;
    reverse = Array.reverse;
    deepEqual(reverse(function(){
      return arguments;
    }(1, 2, 3)), function(){
      return arguments;
    }(3, 2, 1));
  });
  test('Array.shift', function(){
    var shift, args;
    shift = Array.shift;
    ok(shift(args = function(){
      return arguments;
    }(1, 2, 3)) === 1);
    deepEqual(args, function(){
      return arguments;
    }(2, 3));
  });
  test('Array.unshift', function(){
    var unshift, args;
    unshift = Array.unshift;
    unshift(args = function(){
      return arguments;
    }(1, 2, 3), 4, 5);
    ok(args.length === 5);
    ok(args[0] === 4);
    ok(args[1] === 5);
    ok(args[2] === 1);
    ok(args[3] === 2);
    ok(args[4] === 3);
  });
  test('Array.slice', function(){
    var slice;
    slice = Array.slice;
    deepEqual(slice('123'), ['1', '2', '3']);
    deepEqual(slice('123', 1), ['2', '3']);
    deepEqual(slice('123', 1, 2), ['2']);
    deepEqual(slice('123', 1, -1), ['2']);
    deepEqual(slice(function(){
      return arguments;
    }(1, 2, 3)), [1, 2, 3]);
    deepEqual(slice(function(){
      return arguments;
    }(1, 2, 3), 1), [2, 3]);
    deepEqual(slice(function(){
      return arguments;
    }(1, 2, 3), 1, 2), [2]);
    deepEqual(slice(function(){
      return arguments;
    }(1, 2, 3), 1, -1), [2]);
  });
  test('Array.splice', function(){
    var splice, args;
    splice = Array.splice;
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 0, 4, 5);
    ok(args.length === 5);
    ok(args[0] === 1);
    ok(args[1] === 4);
    ok(args[2] === 5);
    ok(args[3] === 2);
    ok(args[4] === 3);
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 1, 4);
    ok(args.length === 3);
    ok(args[0] === 1);
    ok(args[1] === 4);
    ok(args[2] === 3);
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 1);
    ok(args.length === 2);
    ok(args[0] === 1);
    ok(args[1] === 3);
  });
  test('Array.sort', function(){
    var sort;
    sort = Array.sort;
    deepEqual(sort(function(){
      return arguments;
    }(2, 1, 3)), function(){
      return arguments;
    }(1, 2, 3));
    deepEqual(sort(function(){
      return arguments;
    }(11, 2, 3)), function(){
      return arguments;
    }(11, 2, 3));
    deepEqual(sort(function(){
      return arguments;
    }(11, 2, 3), function(a, b){
      return a - b;
    }), function(){
      return arguments;
    }(2, 3, 11));
  });
  test('Array.indexOf', function(){
    var indexOf;
    indexOf = Array.indexOf;
    ok(indexOf('111', '1') === 0);
    ok(indexOf('123', '1', 1) === -1);
    ok(indexOf('123', '2', 1) === 1);
    ok(indexOf(function(){
      return arguments;
    }(1, 1, 1), 1) === 0);
    ok(indexOf(function(){
      return arguments;
    }(1, 2, 3), 1, 1) === -1);
    ok(indexOf(function(){
      return arguments;
    }(1, 2, 3), 2, 1) === 1);
  });
  test('Array.lastIndexOf', function(){
    var lastIndexOf;
    lastIndexOf = Array.lastIndexOf;
    ok(lastIndexOf('111', '1') === 2);
    ok(lastIndexOf('123', '3', 1) === -1);
    ok(lastIndexOf('123', '2', 1) === 1);
    ok(lastIndexOf(function(){
      return arguments;
    }(1, 1, 1), 1) === 2);
    ok(lastIndexOf(function(){
      return arguments;
    }(1, 2, 3), 3, 1) === -1);
    ok(lastIndexOf(function(){
      return arguments;
    }(1, 2, 3), 2, 1) === 1);
  });
  test('Array.every', function(){
    var every, al, ctx;
    every = Array.every;
    every(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    ok(every('123', function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }));
    ok(every('123', function(){
      return arguments[1] < 3;
    }));
    ok(!every('123', function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
    ok(!every('123', function(){
      return arguments[1] < 2;
    }));
    ok(every('123', function(){
      return arguments[2] == '123';
    }));
    ok(every(function(){
      return arguments;
    }(1, 2, 3), function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
  });
  test('Array.some', function(){
    var some, al, ctx;
    some = Array.some;
    some(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    ok(some('123', function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }));
    ok(some('123', function(){
      return arguments[1] > 1;
    }));
    ok(!some('123', function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
    ok(!some('123', function(){
      return arguments[1] > 3;
    }));
    ok(some('123', function(){
      return arguments[2] == '123';
    }));
    ok(some(function(){
      return arguments;
    }(1, 2, 3), function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
  });
  test('Array.forEach', function(){
    var forEach, al, ctx, val;
    forEach = Array.forEach;
    forEach(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      ok(that === al);
    }, ctx = {});
    val = '';
    forEach('123', function(v, k, t){
      val += v + k + t;
    });
    ok(val === '101232112332123');
    val = '';
    forEach(function(){
      return arguments;
    }(1, 2, 3), function(v, k, t){
      val += v + k + t['2'];
    });
    ok(val === '468');
    val = '';
    forEach('123', function(v, k, t){
      val += v + k + t + this;
    }, 1);
    ok(val === '101231211231321231');
  });
  test('Array.map', function(){
    var map, al, ctx;
    map = Array.map;
    map(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    deepEqual(map('123', (function(it){
      return Math.pow(it, 2);
    })), [1, 4, 9]);
    deepEqual(map(function(){
      return arguments;
    }(1, 2, 3), (function(it){
      return Math.pow(it, 2);
    })), [1, 4, 9]);
  });
  test('Array.filter', function(){
    var filter, al, ctx;
    filter = Array.filter;
    filter(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    deepEqual(filter('123', function(it){
      return it > 1;
    }), ['2', '3']);
    deepEqual(filter(function(){
      return arguments;
    }(1, 2, 3), function(it){
      return it < 3;
    }), [1, 2]);
    deepEqual(filter('123', function(){
      return arguments[1] !== 1;
    }), ['1', '3']);
  });
  test('Array.reduce', function(){
    var reduce, al, ctx;
    reduce = Array.reduce;
    reduce(al = function(){
      return arguments;
    }(1), function(memo, val, key, that){
      ok(memo === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    reduce(al = function(){
      return arguments;
    }(1, 2), function(memo){
      return ok(memo === 1);
    });
    ok(reduce('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }) === 6);
    ok(reduce(function(){
      return arguments;
    }(1, 2, 3), function(a, b){
      return '' + b * b + a;
    }) === '941');
    ok(reduce('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }, 1) === 7);
  });
  test('Array.reduceRight', function(){
    var reduceRight, al, ctx;
    reduceRight = Array.reduceRight;
    reduceRight(al = function(){
      return arguments;
    }(1), function(memo, val, key, that){
      ok(memo === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    reduceRight(al = function(){
      return arguments;
    }(1, 2), function(memo){
      return ok(memo === 2);
    });
    ok(reduceRight('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }) === 6);
    ok(reduceRight(function(){
      return arguments;
    }(1, 2, 3), function(a, b){
      return '' + b * b + a;
    }) === '143');
    ok(reduceRight('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }, 1) === 7);
  });
  test('Array.fill', function(){
    var fill;
    fill = Array.fill;
    deepEqual(fill(function(){
      return arguments;
    }(null, null, null), 5), function(){
      return arguments;
    }(5, 5, 5));
  });
  test('Array.find', function(){
    var find, al, ctx;
    find = Array.find;
    find(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    ok(find(function(){
      return arguments;
    }(1, 3, NaN, 42, {}), (function(it){
      return it === 42;
    })) === 42);
    ok(find('123', (function(it){
      return it === '2';
    })) === '2');
    ok(find('123', (function(it){
      return it === '4';
    })) === void 8);
  });
  test('Array.findIndex', function(){
    var findIndex, al, ctx;
    findIndex = Array.findIndex;
    findIndex(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    ok(findIndex(function(){
      return arguments;
    }(1, 3, NaN, 42, {}), (function(it){
      return it === 42;
    })) === 3);
    ok(findIndex('123', (function(it){
      return it === '2';
    })) === 1);
    ok(findIndex('123', (function(it){
      return it === '4';
    })) === -1);
  });
  test('Array.at', function(){
    var at;
    at = Array.at;
    ok(at(function(){
      return arguments;
    }(1, 2, 3), 0) === 1);
    ok(at(function(){
      return arguments;
    }(1, 2, 3), 2) === 3);
    ok(at(function(){
      return arguments;
    }(1, 2, 3), 3) === void 8);
    ok(at(function(){
      return arguments;
    }(1, 2, 3), -1) === 3);
    ok(at(function(){
      return arguments;
    }(1, 2, 3), -3) === 1);
    ok(at(function(){
      return arguments;
    }(1, 2, 3), -4) === void 8);
  });
  test('Array.transform', function(){
    var transform, al, obj;
    transform = Array.transform;
    transform(al = function(){
      return arguments;
    }(1), function(memo, val, key, that){
      deepEqual([], memo);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    });
    transform(al = '1', function(memo, val, key, that){
      deepEqual([], memo);
      ok(val === '1');
      ok(key === 0);
      return ok(that == al);
    });
    transform(function(){
      return arguments;
    }(1), function(it){
      return ok(it === obj);
    }, obj = {});
    deepEqual([3, 2, 1], transform(function(){
      return arguments;
    }(1, 2, 3), function(memo, it){
      return memo.unshift(it);
    }));
    deepEqual(['3', '2', '1'], transform('123', function(memo, it){
      return memo.unshift(it);
    }));
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Function::by', function(){
    ok(isFunction(Function.prototype.by), 'Is function');
  });
  test('Function::part', function(){
    var obj, $, fn, part;
    ok(isFunction(Function.prototype.part), 'Is function');
    ok(function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }.part('qwe')());
    obj = {
      a: 42
    };
    obj.fn = function(it){
      return this.a + it;
    }.part(21);
    ok(obj.fn() === 63);
    $ = _;
    fn = function(){
      return Array.prototype.map.call(arguments, String).join(' ');
    };
    part = fn.part($, 'Саша', $, 'шоссе', $, 'сосала');
    ok(isFunction(part), '.part with placeholders return function');
    ok(part('Шла', 'по') === 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders');
    ok(part('Шла', 'по', 'и') === 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders');
    ok(part('Шла', 'по', 'и', 'сушку') === 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders');
  });
  test('::tie', function(){
    ok(isFunction(Function.prototype.tie), 'Function::tie is function');
    ok(isFunction(Array.prototype.tie), 'Array::tie is function');
    ok(isFunction(RegExp.prototype.tie), 'RegExp::tie is function');
    ok(!('tie' in Object.prototype), 'tie not in Object:: before useTie call');
    C.useTie();
    ok(isFunction(Object.prototype.tie), 'Object::tie is function');
    delete Object.prototype.tie;
  });
  test('Object.tie', function(){
    var tie, array, push;
    tie = Object.tie;
    ok(isFunction(tie), 'Is function');
    array = [1, 2, 3];
    push = tie(array, 'push');
    ok(isFunction(push));
    ok(push(4) === 4);
    return deepEqual(array, [1, 2, 3, 4]);
  });
  test('Function::methodize', function(){
    var num;
    ok(isFunction(Function.prototype.methodize), 'Is function');
    ok({
      a: 42,
      fn: function(it){
        return it.a;
      }.methodize()
    }.fn() === 42);
    num = new Number(42);
    num.fn = function(a, b){
      return a + b;
    }.methodize();
    ok(num.fn(21) === 63);
  });
}).call(this);

(function(){
  var isFunction, isObject, methods, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isObject = function(it){
    return it === Object(it);
  };
  methods = ['assert', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupEnd', 'groupCollapsed', 'groupEnd', 'info', 'log', 'table', 'trace', 'warn', 'markTimeline', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp'];
  test('console', function(){
    ok(isObject(((typeof global != 'undefined' && global !== null) && global || window).console), 'global.console is object');
  });
  test('console.#{..} are functions', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = methods).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(console[x$]), "console." + x$ + " is function");
    }
  });
  test('call console.#{..}', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = methods).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok((fn$()), "call console." + x$);
    }
    function fn$(){
      try {
        console[x$]('foo');
        return true;
      } catch (e$) {}
    }
  });
  test('call unbound console.#{..}', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = methods).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok((fn$()), "call unbound console." + x$);
    }
    function fn$(){
      try {
        console[x$].call(void 8, 'foo');
        return true;
      } catch (e$) {}
    }
  });
  test('console as console.log shortcut', function(){
    ok(isFunction(console), 'console is function');
    ok(console === console.log, 'console is console.log shortcut');
    ok((function(){
      try {
        console('console');
        return true;
      } catch (e$) {}
    }()), 'call console');
  });
  test('console.{enable, disable}', function(){
    var enable, disable;
    enable = console.enable, disable = console.disable;
    ok(isFunction(enable), 'console.enable is function');
    ok(isFunction(disable), 'console.disable is function');
    ok((function(){
      try {
        disable();
        return true;
      } catch (e$) {}
    }()), 'disable console');
    ok((function(){
      try {
        return console('call disabled console') === void 8;
      } catch (e$) {}
    }()), 'call disabled console');
    ok((function(){
      try {
        enable();
        return true;
      } catch (e$) {}
    }()), 'enable console');
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Date.locale', function(){
    var locale;
    locale = Date.locale;
    ok(isFunction(locale), 'Is function');
    locale('en');
    ok(locale() === 'en', 'Date.locale() is "en"');
    ok(locale('ru') === 'ru', 'Date.locale("ru") is "ru"');
    ok(locale() === 'ru', 'Date.locale() is "ru"');
    ok(locale('xx') === 'ru', 'Date.locale("xx") is "ru"');
  });
  test('Date.addLocale', function(){
    var addLocale, locale;
    addLocale = Date.addLocale, locale = Date.locale;
    ok(isFunction(addLocale), 'Is function');
    ok(locale('en') === 'en');
    ok(locale('zz') === 'en');
    ok(addLocale('zz', {
      weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
      months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
    }) === Date);
    ok(locale('zz') === 'zz');
    ok(new Date(1, 2, 3, 4, 5, 6, 7).format('W, D MM YYYY') === 'Воскресенье, 3 Марта 1901');
  });
  test('Date::format', function(){
    var locale, date;
    locale = Date.locale;
    ok(isFunction(Date.prototype.format), 'Is function');
    date = new Date(1, 2, 3, 4, 5, 6, 7);
    ok(date.format('DD.NN.YYYY') === '03.03.1901', 'Works basic');
    locale('en');
    ok(date.format('ms s ss m mm h hh D DD W N NN M MM YY foo YYYY') === '007 6 06 5 05 4 04 3 03 Sunday 3 03 March March 01 foo 1901', 'Works with defaut locale');
    locale('ru');
    ok(date.format('ms s ss m mm h hh D DD W N NN M MM YY foo YYYY') === '007 6 06 5 05 4 04 3 03 Воскресенье 3 03 Март Марта 01 foo 1901', 'Works with set in Date.locale locale');
  });
  test('Date::formatUTC', function(){
    var date;
    ok(isFunction(Date.prototype.formatUTC), 'Is function');
    date = new Date(1, 2, 3, 4, 5, 6, 7);
    ok(date.formatUTC('h') === '' + date.getUTCHours(), 'Works');
  });
}).call(this);

(function(){
  var isObject, isFunction, toString$ = {}.toString;
  isObject = function(it){
    return it === Object(it);
  };
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  asyncTest('Function::timeout', 7, function(){
    var timeout, val;
    ok(isFunction(Function.prototype.timeout), 'Is function');
    timeout = function(it){
      ok(val === 1);
      return ok(it === 42);
    }.timeout(1, 42);
    ok(isObject(timeout));
    ok(isFunction(timeout.set));
    ok(isFunction(timeout.clear));
    val = 1;
    (function(){
      return ok(false);
    }).timeout(1).clear().set().clear();
    setTimeout(function(){
      ok(true);
      return start();
    }, 20);
  });
  asyncTest('Function::interval', 10, function(){
    var i, interval;
    ok(isFunction(Function.prototype.interval), 'Is function');
    interval = function(it){
      ok(i < 4);
      ok(it === 42);
      if (i === 3) {
        interval.clear();
        start();
      }
      return i = i + 1;
    }.interval(1, 42);
    ok(isObject(interval));
    ok(isFunction(interval.set));
    ok(isFunction(interval.clear));
    i = 1;
  });
  asyncTest('Function::immediate', 7, function(){
    var immediate, val;
    ok(isFunction(Function.prototype.immediate), 'Is function');
    immediate = function(it){
      ok(val === 1);
      return ok(it === 42);
    }.immediate(42);
    ok(isObject(immediate));
    ok(isFunction(immediate.set));
    ok(isFunction(immediate.clear));
    val = 1;
    (function(){
      return ok(false);
    }).immediate().clear().set().clear();
    setTimeout(function(){
      ok(true);
      return start();
    }, 20);
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Dict', function(){
    var foo;
    ok(isFunction(global.Dict), 'Is function');
    foo = Dict({
      q: 1,
      w: 2
    });
    ok(Object.getPrototypeOf(foo) === null);
    ok(foo.toString === void 8);
    ok(foo.q === 1);
    ok(foo.w === 2);
  });
  test('Dict.every', function(){
    var every, obj, ctx;
    every = Dict.every;
    ok(isFunction(every), 'Is function');
    every(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    ok(every({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
    ok(!every({
      q: 1,
      w: '2',
      e: 3
    }, function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
  });
  test('Dict.filter', function(){
    var filter, obj, ctx;
    filter = Dict.filter;
    ok(isFunction(filter), 'Is function');
    filter(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    deepEqual(filter({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return it % 2;
    }), Dict({
      q: 1,
      e: 3
    }));
  });
  test('Dict.find', function(){
    var find, obj, ctx;
    find = Dict.find;
    ok(isFunction(find), 'Is function');
    find(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    ok(find({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return !(it % 2);
    }) === 2);
  });
  test('Dict.findKey', function(){
    var findKey, obj, ctx;
    findKey = Dict.findKey;
    ok(isFunction(findKey), 'Is function');
    findKey(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    ok(findKey({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return it === 2;
    }) === 'w');
  });
  test('Dict.forEach', function(){
    var forEach, obj, ctx, rez;
    forEach = Dict.forEach;
    ok(isFunction(forEach), 'Is function');
    forEach(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      ok(this === ctx);
    }, ctx = {});
    rez = {};
    forEach({
      q: 1,
      w: 2
    }, function(){
      rez[arguments[1]] = arguments[0] + this;
    }, '_');
    deepEqual(rez, {
      q: '1_',
      w: '2_'
    });
    rez = true;
    forEach(obj = {
      q: 1,
      w: 2
    }, function(){
      var rez;
      rez && (rez = obj === arguments[2]);
    });
    ok(rez);
    rez = {};
    forEach(Object.make({
      e: 3
    }, {
      q: 1,
      w: 2
    }), function(){
      rez[arguments[1]] = arguments[0];
    });
    ok(!('e' in rez));
    rez = {};
    forEach([1, 2], function(){
      rez[arguments[1]] = arguments[0];
    });
    ok(!('length' in rez));
    rez = {};
    forEach('123', function(){
      rez[arguments[1]] = arguments[0];
    });
    ok('2' in rez);
  });
  test('Dict.keyOf', function(){
    var keyOf;
    keyOf = Dict.keyOf;
    ok(isFunction(keyOf), 'Is function');
    ok(keyOf({
      q: 1,
      w: 2,
      e: 3
    }, 2) === 'w');
    ok(keyOf({
      q: 1,
      w: 2,
      e: 3
    }, 4) === void 8);
    ok(keyOf({
      q: 1,
      w: 2,
      e: NaN
    }, NaN) === 'e');
  });
  test('Dict.map', function(){
    var map, obj, ctx;
    map = Dict.map;
    ok(isFunction(map), 'Is function');
    map(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    deepEqual(map({
      q: 1,
      w: 2,
      e: 3
    }, (function(it){
      return Math.pow(it, 2);
    })), Dict({
      q: 1,
      w: 4,
      e: 9
    }));
  });
  test('Dict.reduce', function(){
    var reduce, obj, foo, memo;
    reduce = Dict.reduce;
    ok(isFunction(reduce), 'Is function');
    reduce(obj = {
      a: 1
    }, function(memo, val, key, that){
      ok(memo === foo);
      ok(val === 1);
      ok(key === 'a');
      return ok(that === obj);
    }, foo = {});
    reduce({
      a: 1,
      b: 2
    }, function(memo, val, key){
      ok(memo === 1);
      ok(val === 2);
      return ok(key === 'b');
    });
    reduce({
      q: 1,
      w: 2,
      e: 3
    }, function(that, it){
      that[it] = it;
      return that;
    }, memo = {});
    deepEqual(memo, {
      1: 1,
      2: 2,
      3: 3
    });
  });
  test('Dict.some', function(){
    var some, obj, ctx;
    some = Dict.some;
    ok(isFunction(some), 'Is function');
    some(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    ok(!some({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }));
    ok(some({
      q: 1,
      w: '2',
      e: 3
    }, function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }));
  });
  test('Dict.transform', function(){
    var transform, obj;
    transform = Dict.transform;
    ok(isFunction(transform), 'Is function');
    transform(obj = {
      q: 1
    }, function(memo, val, key, that){
      deepEqual(memo, Dict());
      ok(val === 1);
      ok(key === 'q');
      return ok(that === obj);
    });
    transform({
      q: 1
    }, function(it){
      return ok(it === obj);
    }, obj = {});
    deepEqual(transform({
      q: 1,
      w: 2,
      e: 3
    }, function(memo, it){
      return memo[it] = it;
    }), Dict({
      1: 1,
      2: 2,
      3: 3
    }));
  });
  test('Dict.has', function(){
    var has;
    has = Dict.has;
    ok(isFunction(has), 'Is function');
    ok(has({
      q: 1
    }, 'q'));
    ok(!has({
      q: 1
    }, 'w'));
    ok(has([1], 0));
    ok(!has([], 0));
    ok(!has(clone$({
      q: 1
    }), 'q'));
    ok(!has({}, 'toString'));
  });
  test('Dict.get', function(){
    var get;
    get = Dict.get;
    ok(isFunction(get), 'Is function');
    ok(get({
      q: 1
    }, 'q') === 1);
    ok(get({
      q: 1
    }, 'w') === void 8);
    ok(get([1], 0) === 1);
    ok(get([], 0) === void 8);
    ok(get(clone$({
      q: 1
    }), 'q') === void 8);
    ok(get({}, 'toString') === void 8);
  });
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Object.getOwnPropertyDescriptor', function(){
    var getOwnPropertyDescriptor;
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    ok(isFunction(getOwnPropertyDescriptor), 'Is function');
    deepEqual(getOwnPropertyDescriptor({
      q: 42
    }, 'q'), {
      writable: true,
      enumerable: true,
      configurable: true,
      value: 42
    });
    ok(getOwnPropertyDescriptor({}, 'toString') === void 8);
  });
  test('Object.defineProperty', function(){
    var defineProperty, rez, src;
    defineProperty = Object.defineProperty;
    ok(isFunction(defineProperty), 'Is function');
    ok((rez = defineProperty(src = {}, 'q', {
      value: 42
    })) === src);
    ok(rez.q === 42);
  });
  test('Object.defineProperties', function(){
    var defineProperties, rez, src;
    defineProperties = Object.defineProperties;
    ok(isFunction(defineProperties), 'Is function');
    ok((rez = defineProperties(src = {}, {
      q: {
        value: 42
      },
      w: {
        value: 33
      }
    })) === src);
    ok(rez.q === 42) && rez.w === 33;
  });
  test('Object.getPrototypeOf', function(){
    var create, getPrototypeOf, fn, obj;
    create = Object.create, getPrototypeOf = Object.getPrototypeOf;
    ok(isFunction(getPrototypeOf), 'Is function');
    ok(getPrototypeOf({}) === Object.prototype);
    ok(getPrototypeOf([]) === Array.prototype);
    ok(getPrototypeOf(new (fn = (function(){
      fn.displayName = 'fn';
      var prototype = fn.prototype, constructor = fn;
      function fn(){}
      return fn;
    }()))) === fn.prototype);
    ok(getPrototypeOf(create(obj = {
      q: 1
    })) === obj);
    ok(getPrototypeOf(create(null)) === null);
    ok(getPrototypeOf(getPrototypeOf({})) === null);
  });
  test('Object.getOwnPropertyNames', function(){
    var getOwnPropertyNames, fn1, fn2;
    getOwnPropertyNames = Object.getOwnPropertyNames;
    ok(isFunction(getOwnPropertyNames), 'Is function');
    fn1 = function(w){
      this.w = w != null ? w : 2;
    };
    fn2 = function(toString){
      this.toString = toString != null ? toString : 2;
    };
    fn1.prototype.q = fn2.prototype.q = 1;
    deepEqual(getOwnPropertyNames([1, 2, 3]), ['0', '1', '2', 'length']);
    deepEqual(getOwnPropertyNames(new fn1(1)), ['w']);
    deepEqual(getOwnPropertyNames(new fn2(1)), ['toString']);
    ok(in$('toString', getOwnPropertyNames(Array.prototype)));
    ok(in$('toString', getOwnPropertyNames(Object.prototype)));
    ok(in$('constructor', getOwnPropertyNames(Object.prototype)));
  });
  test('Object.create', function(){
    var create, getPrototypeOf, getOwnPropertyNames, isObject, isPrototype, getPropertyNames, obj, fn;
    create = Object.create, getPrototypeOf = Object.getPrototypeOf, getOwnPropertyNames = Object.getOwnPropertyNames;
    isObject = function(it){
      return it === Object(it);
    };
    isPrototype = function(a, b){
      return {}.isPrototypeOf.call(a, b);
    };
    getPropertyNames = function(object){
      var result, i$, x$, ref$, len$;
      result = getOwnPropertyNames(object);
      while (object = getPrototypeOf(object)) {
        for (i$ = 0, len$ = (ref$ = getOwnPropertyNames(object)).length; i$ < len$; ++i$) {
          x$ = ref$[i$];
          in$(x$, result) || result.push(x$);
        }
      }
      return result;
    };
    ok(isFunction(create), 'Is function');
    ok(isPrototype(obj = {
      q: 1
    }, create(obj)));
    ok(create(obj).q === 1);
    fn = function(){
      return this.a = 1;
    };
    ok(create(new fn) instanceof fn);
    ok(fn.prototype === getPrototypeOf(getPrototypeOf(create(new fn))));
    ok(create(new fn).a === 1);
    ok(create({}, {
      a: {
        value: 42
      }
    }).a === 42);
    ok(isObject(obj = create(null, {
      w: {
        value: 2
      }
    })));
    ok(!('toString' in obj));
    ok(obj.w === 2);
    deepEqual(getPropertyNames(create(null)), []);
  });
  test('Object.keys', function(){
    var keys, fn1, fn2;
    keys = Object.keys;
    ok(isFunction(keys), 'Is function');
    fn1 = function(w){
      this.w = w != null ? w : 2;
    };
    fn2 = function(toString){
      this.toString = toString != null ? toString : 2;
    };
    fn1.prototype.q = fn2.prototype.q = 1;
    deepEqual(keys([1, 2, 3]), ['0', '1', '2']);
    deepEqual(keys(new fn1(1)), ['w']);
    deepEqual(keys(new fn2(1)), ['toString']);
    ok(!in$('push', keys(Array.prototype)));
  });
  test('Function.prototype.bind', function(){
    var obj;
    ok(isFunction(Function.prototype.bind), 'Is function');
    ok(42 === function(){
      return this.a;
    }.bind(obj = {
      a: 42
    })());
    ok(void 8 === new (function(){}.bind(obj))().a);
    ok(42 === function(it){
      return it;
    }.bind(null, 42)());
  });
  test('Array.isArray', function(){
    var isArray;
    isArray = Array.isArray;
    ok(isFunction(isArray), 'Is function');
    ok(!isArray({}));
    ok(!isArray(function(){
      return arguments;
    }()));
    ok(isArray([]));
  });
  test('ES5 Array prototype methods are functions', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['indexOf', 'lastIndexOf', 'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'reduceRight']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(Array.prototype[x$]), "Array::" + x$ + " is function");
    }
  });
  test('Array::indexOf', function(){
    ok(0 === [1, 1, 1].indexOf(1));
    ok(-1 === [1, 2, 3].indexOf(1, 1));
    ok(1 === [1, 2, 3].indexOf(2, 1));
    ok(-1 === [NaN].indexOf(NaN));
    ok(3 === Array(2).concat([1, 2, 3]).indexOf(2));
  });
  test('Array::lastIndexOf', function(){
    ok(2 === [1, 1, 1].lastIndexOf(1));
    ok(-1 === [1, 2, 3].lastIndexOf(3, 1));
    ok(1 === [1, 2, 3].lastIndexOf(2, 1));
    ok(-1 === [NaN].lastIndexOf(NaN));
    ok(1 === [1, 2, 3].concat(Array(2)).lastIndexOf(2));
  });
  test('Array::every', function(){
    var a, ctx, rez, arr;
    (a = [1]).every(function(val, key, that){
      ok(val === 1);
      ok(key === 0);
      ok(that === a);
      return ok(this === ctx);
    }, ctx = {});
    ok([1, 2, 3].every(function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
    ok([1, 2, 3].every((function(it){
      return it < 4;
    })));
    ok(![1, 2, 3].every((function(it){
      return it < 3;
    })));
    ok(![1, 2, 3].every(function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }));
    ok([1, 2, 3].every(function(){
      return +this === 1;
    }, 1));
    rez = '';
    [1, 2, 3].every(function(){
      return rez += arguments[1];
    });
    ok(rez === '012');
    ok((arr = [1, 2, 3]).every(function(){
      return arguments[2] === arr;
    }));
  });
  test('Array::some', function(){
    var a, ctx, rez, arr;
    (a = [1]).some(function(val, key, that){
      ok(val === 1);
      ok(key === 0);
      ok(that === a);
      return ok(this === ctx);
    }, ctx = {});
    ok([1, '2', 3].some(function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
    ok([1, 2, 3].some((function(it){
      return it < 3;
    })));
    ok(![1, 2, 3].some((function(it){
      return it < 0;
    })));
    ok(![1, 2, 3].some(function(it){
      return toString$.call(it).slice(8, -1) === 'String';
    }));
    ok(![1, 2, 3].some(function(){
      return +this !== 1;
    }, 1));
    rez = '';
    [1, 2, 3].some(function(){
      rez += arguments[1];
      return false;
    });
    ok(rez === '012');
    ok(!(arr = [1, 2, 3]).some(function(){
      return arguments[2] !== arr;
    }));
  });
  test('Array::forEach', function(){
    var a, ctx, rez, arr;
    (a = [1]).forEach(function(val, key, that){
      ok(val === 1);
      ok(key === 0);
      ok(that === a);
      ok(this === ctx);
    }, ctx = {});
    rez = '';
    [1, 2, 3].forEach(function(it){
      rez += it;
    });
    ok(rez === '123');
    rez = '';
    [1, 2, 3].forEach(function(){
      rez += arguments[1];
    });
    ok(rez === '012');
    rez = '';
    [1, 2, 3].forEach(function(){
      rez += arguments[2];
    });
    ok(rez === '1,2,31,2,31,2,3');
    rez = '';
    [1, 2, 3].forEach(function(){
      rez += this;
    }, 1);
    ok(rez === '111');
    rez = '';
    arr = [];
    arr[5] = '';
    arr.forEach(function(arg$, k){
      rez += k;
    });
    ok(rez === '5');
  });
  test('Array::map', function(){
    var a, ctx;
    (a = [1]).map(function(val, key, that){
      ok(val === 1);
      ok(key === 0);
      ok(that === a);
      return ok(this === ctx);
    }, ctx = {});
    deepEqual([2, 3, 4], [1, 2, 3].map((function(it){
      return it + 1;
    })));
    deepEqual([1, 3, 5], [1, 2, 3].map(curry$(function(x$, y$){
      return x$ + y$;
    })));
    deepEqual([2, 2, 2], [1, 2, 3].map(function(){
      return +this;
    }, 2));
  });
  test('Array::filter', function(){
    var a, ctx;
    (a = [1]).filter(function(val, key, that){
      ok(val === 1);
      ok(key === 0);
      ok(that === a);
      return ok(this === ctx);
    }, ctx = {});
    deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 'q', {}, 4, true, 5].filter(function(it){
      return toString$.call(it).slice(8, -1) === 'Number';
    }));
  });
  test('Array::reduce', function(){
    var a;
    ok(-5 === [5, 4, 3, 2, 1].reduce(curry$(function(x$, y$){
      return x$ - y$;
    })));
    (a = [1]).reduce(function(memo, val, key, that){
      ok(memo === 42);
      ok(val === 1);
      ok(key === 0);
      return ok(that === a);
    }, 42);
    [42, 43].reduce(function(it){
      return ok(it === 42);
    });
  });
  test('Array::reduceRight', function(){
    var a;
    ok(-5 === [1, 2, 3, 4, 5].reduceRight(curry$(function(x$, y$){
      return x$ - y$;
    })));
    (a = [1]).reduceRight(function(memo, val, key, that){
      ok(memo === 42);
      ok(val === 1);
      ok(key === 0);
      return ok(that === a);
    }, 42);
    [42, 43].reduceRight(function(it){
      return ok(it === 43);
    });
  });
  test('String.prototype.trim', function(){
    ok(isFunction(String.prototype.trim), 'Is function');
    ok('   q w e \n  '.trim() === 'q w e', 'Remove whitespaces at left & right side of string');
  });
  test('Date.now', function(){
    var now;
    now = Date.now;
    ok(isFunction(now), 'Is function');
    ok(+new Date - now() < 10, 'Date.now() ~ +new Date');
  });
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
}).call(this);

(function(){
  var isFunction, isNative, getOwnPropertyDescriptor, defineProperty, same, epsilon, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isNative = function(it){
    return /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/.test(it);
  };
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, defineProperty = Object.defineProperty;
  same = Object.is;
  epsilon = function(a, b, E){
    return Math.abs(a - b) <= (E != null ? E : 1e-11);
  };
  test('Object.assign', function(){
    var assign, foo;
    assign = Object.assign;
    ok(isFunction(assign), 'Is function');
    foo = {
      q: 1
    };
    ok(foo === assign(foo, {
      bar: 2
    }), 'assign return target');
    ok(foo.bar === 2, 'assign define properties');
    if (isNative(getOwnPropertyDescriptor)) {
      foo = {
        baz: 1
      };
      assign(foo, defineProperty({}, 'bar', {
        get: function(){
          return this.baz + 1;
        }
      }));
      ok(foo.bar === void 8, "assign don't copy descriptors");
    }
  });
  test('Object.is', function(){
    ok(isFunction(same), 'Is function');
    ok(same(1, 1), '1 is 1');
    ok(same(NaN, NaN), '1 is 1');
    ok(!same(0, -0), '0 isnt -0');
    ok(!same({}, {}), '{} isnt {}');
  });
  if (Object.setPrototypeOf) {
    test('Object.setPrototypeOf', function(){
      var setPrototypeOf, tmp;
      setPrototypeOf = Object.setPrototypeOf;
      ok(isFunction(setPrototypeOf), 'Is function');
      ok('apply' in setPrototypeOf({}, Function.prototype), 'Parent properties in target');
      ok(setPrototypeOf({
        a: 2
      }, {
        b: function(){
          return Math.pow(this.a, 2);
        }
      }).b() === 4, 'Child and parent properties in target');
      ok(setPrototypeOf(tmp = {}, {
        a: 1
      }) === tmp, 'setPrototypeOf return target');
      ok(!('toString' in setPrototypeOf({}, null)), 'Can set null as prototype');
    });
  }
  test('Number.EPSILON', function(){
    var EPSILON;
    EPSILON = Number.EPSILON;
    ok('EPSILON' in Number, 'EPSILON in Number');
    ok(EPSILON === Math.pow(2, -52), 'Is 2^-52');
    ok(1 !== 1 + EPSILON, '1 isnt 1 + EPSILON');
    ok(1 === 1 + EPSILON / 2, '1 is 1 + EPSILON / 2');
  });
  test('Number.isFinite', function(){
    var isFinite, i$, x$, ref$, len$, y$;
    isFinite = Number.isFinite;
    ok(isFunction(isFinite), 'Is function');
    for (i$ = 0, len$ = (ref$ = [1, 0.1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFinite(x$), "isFinite " + typeof x$ + " " + x$);
    }
    for (i$ = 0, len$ = (ref$ = [NaN, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$]).length; i$ < len$; ++i$) {
      y$ = ref$[i$];
      ok(!isFinite(y$), "not isFinite " + typeof y$ + " " + y$);
    }
    function fn$(){}
  });
  test('Number.isInteger', function(){
    var isInteger, i$, x$, ref$, len$, y$;
    isInteger = Number.isInteger;
    ok(isFunction(isInteger), 'Is function');
    for (i$ = 0, len$ = (ref$ = [1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isInteger(x$), "isInteger " + typeof x$ + " " + x$);
    }
    for (i$ = 0, len$ = (ref$ = [NaN, 0.1, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$]).length; i$ < len$; ++i$) {
      y$ = ref$[i$];
      ok(!isInteger(y$), "not isInteger " + typeof y$ + " " + y$);
    }
    function fn$(){}
  });
  test('Number.isNaN', function(){
    var isNaN, i$, x$, ref$, len$;
    isNaN = Number.isNaN;
    ok(isFunction(isNaN), 'Is function');
    ok(isNaN(NaN), 'Number.isNaN NaN');
    for (i$ = 0, len$ = (ref$ = [1, 0.1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(!isNaN(x$), "not Number.isNaN " + typeof x$ + " " + x$);
    }
    function fn$(){}
  });
  test('Number.isSafeInteger', function(){
    var isSafeInteger, i$, x$, ref$, len$, y$;
    isSafeInteger = Number.isSafeInteger;
    ok(isFunction(isSafeInteger), 'Is function');
    for (i$ = 0, len$ = (ref$ = [1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0, 9007199254740991, -9007199254740991]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isSafeInteger(x$), "isSafeInteger " + typeof x$ + " " + x$);
    }
    for (i$ = 0, len$ = (ref$ = [9007199254740992, -9007199254740992, NaN, 0.1, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$]).length; i$ < len$; ++i$) {
      y$ = ref$[i$];
      ok(!isSafeInteger(y$), "not isSafeInteger " + typeof y$ + " " + y$);
    }
    function fn$(){}
  });
  test('Number.MAX_SAFE_INTEGER', function(){
    ok(Number.MAX_SAFE_INTEGER === Math.pow(2, 53) - 1, 'Is 2^53 - 1');
  });
  test('Number.MIN_SAFE_INTEGER', function(){
    ok(Number.MIN_SAFE_INTEGER === -Math.pow(2, 53) + 1, 'Is -2^53 + 1');
  });
  test('Number.parseFloat', function(){
    ok(isFunction(Number.parseFloat), 'Is function');
  });
  test('Number.parseInt', function(){
    ok(isFunction(Number.parseInt), 'Is function');
  });
  test('ES6 Math methods are functions', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['acosh', 'asinh', 'atanh', 'cbrt', 'clz32', 'cosh', 'expm1', 'hypot', 'imul', 'log1p', 'log10', 'log2', 'sign', 'sinh', 'tanh', 'trunc']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(Math[x$]), "Math." + x$ + " is function");
    }
  });
  test('Math.acosh', function(){
    var acosh;
    acosh = Math.acosh;
    ok(same(acosh(NaN), NaN));
    ok(same(acosh(0.5), NaN));
    ok(same(acosh(-1), NaN));
    ok(same(acosh(1), 0));
    ok(same(acosh(Infinity), Infinity));
    ok(epsilon(acosh(1234), 7.811163220849231));
    ok(epsilon(acosh(8.88), 2.8737631531629235));
  });
  test('Math.asinh', function(){
    var asinh;
    asinh = Math.asinh;
    ok(same(asinh(NaN), NaN));
    ok(same(asinh(0), 0));
    ok(same(asinh(-0), -0));
    ok(same(asinh(Infinity), Infinity));
    ok(same(asinh(-Infinity), -Infinity));
    ok(epsilon(asinh(1234), 7.811163549201245));
    ok(epsilon(asinh(9.99), 2.997227420191335));
    ok(epsilon(asinh(1e150), 346.0809111296668));
    ok(epsilon(asinh(1e7), 16.811242831518268));
    ok(epsilon(asinh(-1e7), -16.811242831518268));
  });
  test('Math.atanh', function(){
    var atanh;
    atanh = Math.atanh;
    ok(same(atanh(NaN), NaN));
    ok(same(atanh(-2), NaN));
    ok(same(atanh(-1.5), NaN));
    ok(same(atanh(2), NaN));
    ok(same(atanh(1.5), NaN));
    ok(same(atanh(-1), -Infinity));
    ok(same(atanh(1), Infinity));
    ok(same(atanh(0), 0));
    ok(same(atanh(-0), -0));
    ok(same(atanh(-1e300), NaN));
    ok(same(atanh(1e300), NaN));
    ok(epsilon(atanh(0.5), 0.5493061443340549));
    ok(epsilon(atanh(-0.5), -0.5493061443340549));
    ok(epsilon(atanh(0.444), 0.47720201260109457));
  });
  test('Math.cbrt', function(){
    var cbrt;
    cbrt = Math.cbrt;
    ok(same(cbrt(NaN), NaN));
    ok(same(cbrt(0), 0));
    ok(same(cbrt(-0), -0));
    ok(same(cbrt(Infinity), Infinity));
    ok(same(cbrt(-Infinity), -Infinity));
    ok(same(cbrt(-8), -2));
    ok(same(cbrt(8), 2));
    ok(epsilon(cbrt(-1000), -10));
    ok(epsilon(cbrt(1000), 10));
  });
  test('Math.clz32', function(){
    var clz32;
    clz32 = Math.clz32;
    ok(clz32(0) === 32);
    ok(clz32(1) === 31);
    ok(clz32(-1) === 0);
    ok(clz32(0.6) === 32);
    ok(clz32(Math.pow(2, 32) - 1) === 0);
    ok(clz32(Math.pow(2, 32)) === 32);
  });
  test('Math.cosh', function(){
    var cosh;
    cosh = Math.cosh;
    ok(same(cosh(NaN), NaN));
    ok(same(cosh(0), 1));
    ok(same(cosh(-0), 1));
    ok(same(cosh(Infinity), Infinity));
    ok(epsilon(cosh(12), 81377.39571257407, 3e-11));
    ok(epsilon(cosh(22), 1792456423.065795780980053377, 1e-5));
    ok(epsilon(cosh(-10), 11013.23292010332313972137));
    ok(epsilon(cosh(-23), 4872401723.1244513000, 1e-5));
  });
  test('Math.expm1', function(){
    var expm1;
    expm1 = Math.expm1;
    ok(same(expm1(NaN), NaN));
    ok(same(expm1(0), 0));
    ok(same(expm1(-0), -0));
    ok(same(expm1(Infinity), Infinity));
    ok(same(expm1(-Infinity), -1));
    ok(epsilon(expm1(10), 22025.465794806718, ok(epsilon(expm1(-10), -0.9999546000702375))));
  });
  test('Math.hypot', function(){
    var hypot, sqrt;
    hypot = Math.hypot, sqrt = Math.sqrt;
    ok(same(hypot('', 0), 0));
    ok(same(hypot(0, ''), 0));
    ok(same(hypot(Infinity, 0), Infinity));
    ok(same(hypot(-Infinity, 0), Infinity));
    ok(same(hypot(0, Infinity), Infinity));
    ok(same(hypot(0, -Infinity), Infinity));
    ok(same(hypot(Infinity, NaN), Infinity));
    ok(same(hypot(NaN, -Infinity), Infinity));
    ok(same(hypot(NaN, 0), NaN));
    ok(same(hypot(0, NaN), NaN));
    ok(same(hypot(0, -0), 0));
    ok(same(hypot(0, 0), 0));
    ok(same(hypot(-0, -0), 0));
    ok(same(hypot(-0, 0), 0));
    ok(same(hypot(0, 1), 1));
    ok(same(hypot(0, -1), 1));
    ok(same(hypot(-0, 1), 1));
    ok(same(hypot(-0, -1), 1));
    ok(same(hypot(0), 0));
    ok(same(hypot(1), 1));
    ok(same(hypot(2), 2));
    ok(same(hypot(0, 0, 1), 1));
    ok(same(hypot(0, 1, 0), 1));
    ok(same(hypot(1, 0, 0), 1));
    ok(same(hypot(2, 3, 4), sqrt(2 * 2 + 3 * 3 + 4 * 4)));
    ok(same(hypot(2, 3, 4, 5), sqrt(2 * 2 + 3 * 3 + 4 * 4 + 5 * 5)));
    ok(epsilon(hypot(66, 66), 93.33809511662427));
    ok(epsilon(hypot(0.1, 100), 100.0000499999875));
  });
  test('Math.imul', function(){
    var imul;
    imul = Math.imul;
    ok(same(imul(0, 0), 0));
    ok(imul(123, 456) === 56088);
    ok(imul(-123, 456) === -56088);
    ok(imul(123, -456) === -56088);
    ok(imul(19088743, 4275878552) === 602016552);
    ok(imul(false, 7) === 0);
    ok(imul(7, false) === 0);
    ok(imul(false, false) === 0);
    ok(imul(true, 7) === 7);
    ok(imul(7, true) === 7);
    ok(imul(true, true) === 1);
    ok(imul(void 8, 7) === 0);
    ok(imul(7, void 8) === 0);
    ok(imul(void 8, void 8) === 0);
    ok(imul('str', 7) === 0);
    ok(imul(7, 'str') === 0);
    ok(imul({}, 7) === 0);
    ok(imul(7, {}) === 0);
    ok(imul([], 7) === 0);
    ok(imul(7, []) === 0);
    ok(imul(0xffffffff, 5) === -5);
    ok(imul(0xfffffffe, 5) === -10);
    ok(imul(2, 4) === 8);
    ok(imul(-1, 8) === -8);
    ok(imul(-2, -2) === 4);
    ok(imul(-0, 7) === 0);
    ok(imul(7, -0) === 0);
    ok(imul(0.1, 7) === 0);
    ok(imul(7, 0.1) === 0);
    ok(imul(0.9, 7) === 0);
    ok(imul(7, 0.9) === 0);
    ok(imul(1.1, 7) === 7);
    ok(imul(7, 1.1) === 7);
    ok(imul(1.9, 7) === 7);
    ok(imul(7, 1.9) === 7);
  });
  test('Math.log1p', function(){
    var log1p;
    log1p = Math.log1p;
    ok(same(log1p(''), log1p(0)));
    ok(same(log1p(NaN), NaN));
    ok(same(log1p(-2), NaN));
    ok(same(log1p(-1), -Infinity));
    ok(same(log1p(0), 0));
    ok(same(log1p(-0), -0));
    ok(same(log1p(Infinity), Infinity));
    ok(epsilon(log1p(5), 1.791759469228055));
    ok(epsilon(log1p(50), 3.9318256327243257));
  });
  test('Math.log10', function(){
    var log10;
    log10 = Math.log10;
    ok(same(log10(''), log10(0)));
    ok(same(log10(NaN), NaN));
    ok(same(log10(-1), NaN));
    ok(same(log10(0), -Infinity));
    ok(same(log10(-0), -Infinity));
    ok(same(log10(1), 0));
    ok(same(log10(Infinity), Infinity));
    ok(epsilon(log10(0.1), -1));
    ok(epsilon(log10(0.5), -0.3010299956639812));
    ok(epsilon(log10(1.5), 0.17609125905568124));
    ok(epsilon(log10(5), 0.6989700043360189));
    ok(epsilon(log10(50), 1.6989700043360187));
  });
  test('Math.log2', function(){
    var log2;
    log2 = Math.log2;
    ok(same(log2(''), log2(0)));
    ok(same(log2(NaN), NaN));
    ok(same(log2(-1), NaN));
    ok(same(log2(0), -Infinity));
    ok(same(log2(-0), -Infinity));
    ok(same(log2(1), 0));
    ok(same(log2(Infinity), Infinity));
    ok(same(log2(0.5), -1));
    ok(same(log2(32), 5));
    ok(epsilon(log2(5), 2.321928094887362));
  });
  test('Math.sign', function(){
    var sign;
    sign = Math.sign;
    ok(same(sign(NaN), NaN));
    ok(same(sign(), NaN));
    ok(same(sign(-0), -0));
    ok(same(sign(0), 0));
    ok(same(sign(Infinity), 1));
    ok(same(sign(-Infinity), -1));
    ok(sign(13510798882111488) === 1);
    ok(sign(-13510798882111488) === -1);
    ok(sign(42.5) === 1);
    ok(sign(-42.5) === -1);
  });
  test('Math.sinh', function(){
    var sinh;
    sinh = Math.sinh;
    ok(same(sinh(NaN), NaN));
    ok(same(sinh(0), 0));
    ok(same(sinh(-0), -0));
    ok(same(sinh(Infinity), Infinity));
    ok(same(sinh(-Infinity), -Infinity));
    ok(epsilon(sinh(-5), -74.20321057778875));
    ok(epsilon(sinh(2), 3.6268604078470186));
  });
  test('Math.tanh', function(){
    var tanh;
    tanh = Math.tanh;
    ok(same(tanh(NaN), NaN));
    ok(same(tanh(0), 0));
    ok(same(tanh(-0), -0));
    ok(same(tanh(Infinity), 1));
    ok(same(tanh(90), 1));
    ok(epsilon(tanh(10), 0.9999999958776927));
  });
  test('Math.trunc', function(){
    var trunc;
    trunc = Math.trunc;
    ok(same(trunc(NaN), NaN));
    ok(same(trunc(-0), -0));
    ok(same(trunc(0), 0));
    ok(same(trunc(Infinity), Infinity));
    ok(same(trunc(-Infinity), -Infinity));
    ok(trunc([]) === 0);
    ok(trunc(1.01) === 1);
    ok(trunc(1.99) === 1);
    ok(trunc(-555.555) === -555);
    ok(trunc(-1.99) === -1);
  });
  test('String::contains', function(){
    ok(isFunction(String.prototype.contains), 'Is function');
    ok(!'abc'.contains());
    ok('aundefinedb'.contains());
    ok('abcd'.contains('b', 1));
    ok(!'abcd'.contains('b', 2));
  });
  test('String::endsWith', function(){
    ok(isFunction(String.prototype.endsWith), 'Is function');
    ok('undefined'.endsWith());
    ok(!'undefined'.endsWith(null));
    ok('abc'.endsWith(''));
    ok('abc'.endsWith('c'));
    ok('abc'.endsWith('bc'));
    ok(!'abc'.endsWith('ab'));
    ok('abc'.endsWith('', NaN));
    ok(!'abc'.endsWith('c', -1));
    ok('abc'.endsWith('a', 1));
    ok('abc'.endsWith('c', Infinity));
    ok('abc'.endsWith('a', true));
    ok(!'abc'.endsWith('c', 'x'));
    ok(!'abc'.endsWith('a', 'x'));
  });
  test('String::repeat', function(){
    var e;
    ok(isFunction(String.prototype.repeat), 'Is function');
    ok('qwe'.repeat(3) === 'qweqweqwe');
    ok('qwe'.repeat(2.5) === 'qweqwe');
    try {
      'qwe'.repeat(-1);
      ok(false);
    } catch (e$) {
      e = e$;
      ok(true);
    }
  });
  test('String::startsWith', function(){
    ok(isFunction(String.prototype.startsWith), 'Is function');
    ok('undefined'.startsWith());
    ok(!'undefined'.startsWith(null));
    ok('abc'.startsWith(''));
    ok('abc'.startsWith('a'));
    ok('abc'.startsWith('ab'));
    ok(!'abc'.startsWith('bc'));
    ok('abc'.startsWith('', NaN));
    ok('abc'.startsWith('a', -1));
    ok(!'abc'.startsWith('a', 1));
    ok(!'abc'.startsWith('a', Infinity));
    ok('abc'.startsWith('b', true));
    ok('abc'.startsWith('a', 'x'));
  });
  test('Array.from', function(){
    var from, al, ctx;
    from = Array.from;
    ok(isFunction(from), 'Is function');
    deepEqual(from('123'), ['1', '2', '3']);
    deepEqual(from({
      length: 3,
      0: 1,
      1: 2,
      2: 3
    }), [1, 2, 3]);
    from(al = function(){
      return arguments;
    }(1), function(val, key){
      ok(this === ctx);
      ok(val === 1);
      return ok(key === 0);
    }, ctx = {});
    from([1], function(val, key){
      ok(this === ctx);
      ok(val === 1);
      return ok(key === 0);
    }, ctx = {});
    deepEqual(from({
      length: 3,
      0: 1,
      1: 2,
      2: 3
    }, (function(it){
      return Math.pow(it, 2);
    })), [1, 4, 9]);
    deepEqual(from(new Set([1, 2, 3, 2, 1])), [1, 2, 3], 'Works with iterators');
  });
  test('Array.of', function(){
    ok(isFunction(Array.of), 'Is function');
    deepEqual(Array.of(1), [1]);
    deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  });
  test('Array::fill', function(){
    ok(isFunction(Array.prototype.fill), 'Is function');
    deepEqual(Array(5).fill(5), [5, 5, 5, 5, 5]);
    deepEqual(Array(5).fill(5, 1), [void 8, 5, 5, 5, 5]);
    deepEqual(Array(5).fill(5, 1, 4), [void 8, 5, 5, 5, void 8]);
    deepEqual(Array(5).fill(5, 6, 1), [void 8, void 8, void 8, void 8, void 8]);
    deepEqual(Array(5).fill(5, -3, 4), [void 8, void 8, 5, 5, void 8]);
  });
  test('Array::find', function(){
    var arr, ctx;
    ok(isFunction(Array.prototype.find), 'Is function');
    (arr = [1]).find(function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === arr);
    }, ctx = {});
    ok([1, 3, NaN, 42, {}].find((function(it){
      return it === 42;
    })) === 42);
    ok([1, 3, NaN, 42, {}].find((function(it){
      return it === 43;
    })) === void 8);
  });
  test('Array::findIndex', function(){
    var arr, ctx;
    ok(isFunction(Array.prototype.findIndex), 'Is function');
    (arr = [1]).findIndex(function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === arr);
    }, ctx = {});
    ok([1, 3, NaN, 42, {}].findIndex((function(it){
      return it === 42;
    })) === 3);
  });
}).call(this);

(function(){
  var isFunction, isNative, getOwnPropertyDescriptor, that, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isNative = function(it){
    return /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/.test(it);
  };
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  that = (typeof global != 'undefined' && global !== null) && global || window;
  test('Map', function(){
    ok(isFunction(that.Map), 'Is function');
    ok('clear' in Map.prototype, 'clear in Map.prototype');
    ok('delete' in Map.prototype, 'delete in Map.prototype');
    ok('forEach' in Map.prototype, 'forEach in Map.prototype');
    ok('get' in Map.prototype, 'get in Map.prototype');
    ok('has' in Map.prototype, 'has in Map.prototype');
    ok('set' in Map.prototype, 'set in Map.prototype');
    ok(new Map instanceof Map, 'new Map instanceof Map');
  });
  test('Map::clear', function(){
    var M;
    ok(isFunction(Map.prototype.clear), 'Is function');
    M = new Map().set(1, 2).set(2, 3).set(1, 4);
    M.clear();
    ok(M.size === 0);
  });
  test('Map::delete', function(){
    var a, M;
    ok(isFunction(Map.prototype['delete']), 'Is function');
    a = [];
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(a, {});
    ok(M.size === 5);
    ok(M['delete'](NaN) === true);
    ok(M.size === 4);
    ok(M['delete'](4) === false);
    ok(M.size === 4);
    M['delete']([]);
    ok(M.size === 4);
    M['delete'](a);
    ok(M.size === 3);
  });
  test('Map::forEach', function(){
    var r, T, count, M, a;
    ok(isFunction(Map.prototype.forEach), 'Is function');
    r = {};
    count = 0;
    M = new Map().set(NaN, 1).set(2, 1).set(3, 7).set(2, 5).set(1, 4).set(a = {}, 9);
    M.forEach(function(value, key, ctx){
      T = ctx;
      count = count + 1;
      r[value] = key;
    });
    ok(T === M);
    ok(count === 5);
    deepEqual(r, {
      1: NaN,
      7: 3,
      5: 2,
      4: 1,
      9: a
    });
  });
  test('Map::get', function(){
    var o, M;
    ok(isFunction(Map.prototype.get), 'Is function');
    o = {};
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(o, o);
    ok(M.get(NaN) === 1);
    ok(M.get(4) === void 8);
    ok(M.get({}) === void 8);
    ok(M.get(o) === o);
    ok(M.get(2) === 5);
  });
  test('Map::has', function(){
    var o, M;
    ok(isFunction(Map.prototype.has), 'Is function');
    o = {};
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(o, o);
    ok(M.has(NaN));
    ok(M.has(o));
    ok(M.has(2));
    ok(!M.has(4));
    ok(!M.has({}));
  });
  test('Map::set', function(){
    var o, M, chain;
    ok(isFunction(Map.prototype.set), 'Is function');
    o = {};
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(o, o);
    ok(M.size === 5);
    chain = M.set(7, 2);
    ok(chain === M);
    M.set(7, 2);
    ok(M.size === 6);
    ok(M.get(7) === 2);
    ok(M.get(NaN) === 1);
    M.set(NaN, 42);
    ok(M.size === 6);
    ok(M.get(NaN) === 42);
    M.set({}, 11);
    ok(M.size === 7);
    ok(M.get(o) === o);
    M.set(o, 27);
    ok(M.size === 7);
    ok(M.get(o) === 27);
    ok(new Map().set(NaN, 2).set(NaN, 3).set(NaN, 4).size === 1);
  });
  test('Map::size', function(){
    var size, sizeDesc;
    size = new Map().set(2, 1).size;
    ok(typeof size === 'number', 'size is number');
    ok(size === 1, 'size is correct');
    if (isNative(getOwnPropertyDescriptor)) {
      sizeDesc = getOwnPropertyDescriptor(Map.prototype, 'size');
      ok(sizeDesc && sizeDesc.get, 'size is getter');
      ok(sizeDesc && !sizeDesc.set, 'size isnt setter');
    }
  });
  test('Set', function(){
    var S, r;
    ok(isFunction(that.Set), 'Is function');
    ok('add' in Set.prototype, 'add in Set.prototype');
    ok('clear' in Set.prototype, 'clear in Set.prototype');
    ok('delete' in Set.prototype, 'delete in Set.prototype');
    ok('forEach' in Set.prototype, 'forEach in Set.prototype');
    ok('has' in Set.prototype, 'has in Set.prototype');
    ok(new Set instanceof Set, 'new Set instanceof Set');
    ok(new Set([1, 2, 3, 2, 1]).size === 3, 'Init Set from array');
    S = new Set([1, 2, 3, 2, 1]);
    ok(S.size === 3);
    r = {};
    S.forEach(function(v, k){
      return r[k] = v;
    });
    deepEqual(r, {
      1: 1,
      2: 2,
      3: 3
    });
    ok(new Set([NaN, NaN, NaN]).size === 1);
  });
  test('Set::add', function(){
    var a, S, chain;
    ok(isFunction(Set.prototype.add), 'Is function');
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    ok(S.size === 5);
    chain = S.add(NaN);
    ok(chain === S);
    ok(S.size === 5);
    S.add(2);
    ok(S.size === 5);
    S.add(a);
    ok(S.size === 5);
    S.add([]);
    ok(S.size === 6);
    S.add(4);
    ok(S.size === 7);
  });
  test('Set::clear', function(){
    var S;
    ok(isFunction(Set.prototype.clear), 'Is function');
    S = new Set([1, 2, 3, 2, 1]);
    S.clear();
    ok(S.size === 0);
  });
  test('Set::delete', function(){
    var a, S;
    ok(isFunction(Set.prototype['delete']), 'Is function');
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    ok(S.size === 5);
    ok(S['delete'](NaN) === true);
    ok(S.size === 4);
    ok(S['delete'](4) === false);
    ok(S.size === 4);
    S['delete']([]);
    ok(S.size === 4);
    S['delete'](a);
    ok(S.size === 3);
  });
  test('Set::forEach', function(){
    var r, T, count, S;
    ok(isFunction(Set.prototype.forEach), 'Is function');
    r = {};
    count = 0;
    S = new Set([1, 2, 3, 2, 1]);
    S.forEach(function(value, key, ctx){
      T = ctx;
      count = count + 1;
      r[key] = value;
    });
    ok(T === S);
    ok(count === 3);
    deepEqual(r, {
      1: 1,
      2: 2,
      3: 3
    });
  });
  test('Set::has', function(){
    var a, S;
    ok(isFunction(Set.prototype.has), 'Is function');
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    ok(S.has(NaN));
    ok(S.has(a));
    ok(S.has(2));
    ok(!S.has(4));
    ok(!S.has([]));
  });
  test('Set::size', function(){
    var size, sizeDesc;
    size = new Set([1]).size;
    ok(typeof size === 'number', 'size is number');
    ok(size === 1, 'size is correct');
    if (isNative(getOwnPropertyDescriptor)) {
      sizeDesc = getOwnPropertyDescriptor(Set.prototype, 'size');
      ok(sizeDesc && sizeDesc.get, 'size is getter');
      ok(sizeDesc && !sizeDesc.set, 'size isnt setter');
    }
  });
  test('WeakMap', function(){
    ok(isFunction(that.WeakMap), 'Is function');
    ok('clear' in WeakMap.prototype, 'clear in WeakMap.prototype');
    ok('delete' in WeakMap.prototype, 'delete in WeakMap.prototype');
    ok('get' in WeakMap.prototype, 'get in WeakMap.prototype');
    ok('has' in WeakMap.prototype, 'has in WeakMap.prototype');
    ok('set' in WeakMap.prototype, 'set in WeakMap.prototype');
    ok(new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap');
  });
  test('WeakMap::clear', function(){
    var M, a, b;
    ok(isFunction(WeakMap.prototype.clear), 'Is function');
    M = new WeakMap().set(a = {}, 42).set(b = {}, 21);
    ok(M.has(a) && M.has(b), 'WeakMap has values before .delete()');
    M.clear();
    ok(!M.has(a) && !M.has(b), 'WeakMap has`nt values after .clear()');
  });
  test('WeakMap::delete', function(){
    var M, a, b;
    ok(isFunction(WeakMap.prototype['delete']), 'Is function');
    M = new WeakMap().set(a = {}, 42).set(b = {}, 21);
    ok(M.has(a) && M.has(b), 'WeakMap has values before .delete()');
    M['delete'](a);
    ok(!M.has(a) && M.has(b), 'WeakMap has`nt value after .delete()');
  });
  test('WeakMap::get', function(){
    var M, a;
    ok(isFunction(WeakMap.prototype.get), 'Is function');
    M = new WeakMap();
    ok(M.get({}) === void 8, 'WeakMap .get() before .set() return undefined');
    M.set(a = {}, 42);
    ok(M.get(a) === 42, 'WeakMap .get() return value');
    M['delete'](a);
    ok(M.get(a) === void 8, 'WeakMap .get() after .delete() return undefined');
  });
  test('WeakMap::has', function(){
    var M, a;
    ok(isFunction(WeakMap.prototype.has), 'Is function');
    M = new WeakMap();
    ok(M.has({}) === false, 'WeakMap .has() before .set() return false');
    M.set(a = {}, 42);
    ok(M.has(a), 'WeakMap .has() return true');
    M['delete'](a);
    ok(M.has(a) === false, 'WeakMap .has() after .delete() return false');
  });
  test('WeakMap::set', function(){
    var a, e;
    ok(isFunction(WeakMap.prototype.set), 'Is function');
    ok(new WeakMap().set(a = {}, 42), 'WeakMap.prototype.set works with object as keys');
    ok((function(){
      try {
        new WeakMap().set(42, 42);
        return false;
      } catch (e$) {
        e = e$;
        return true;
      }
    }()), 'WeakMap.prototype.set throw with primitive keys');
  });
  test('WeakSet', function(){
    var a;
    ok(isFunction(that.WeakSet), 'Is function');
    ok('add' in WeakSet.prototype, 'add in WeakSet.prototype');
    ok('clear' in WeakSet.prototype, 'clear in WeakSet.prototype');
    ok('delete' in WeakSet.prototype, 'delete in WeakSet.prototype');
    ok('has' in WeakSet.prototype, 'has in WeakSet.prototype');
    ok(new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet');
    ok(new WeakSet([a = {}]).has(a), 'Init WeakSet from array');
  });
  test('WeakSet::add', function(){
    var a, e;
    ok(isFunction(WeakSet.prototype.add), 'Is function');
    ok(new WeakSet().add(a = {}), 'WeakSet.prototype.add works with object as keys');
    ok((function(){
      try {
        new WeakSet().add(42);
        return false;
      } catch (e$) {
        e = e$;
        return true;
      }
    }()), 'WeakSet.prototype.add throw with primitive keys');
  });
  test('WeakSet::clear', function(){
    var M, a, b;
    ok(isFunction(WeakSet.prototype.clear), 'Is function');
    M = new WeakSet().add(a = {}).add(b = {});
    ok(M.has(a) && M.has(b), 'WeakSet has values before .clear()');
    M.clear();
    ok(!M.has(a) && !M.has(b), 'WeakSet has`nt values after .clear()');
  });
  test('WeakSet::delete', function(){
    var M, a, b;
    ok(isFunction(WeakSet.prototype['delete']), 'Is function');
    M = new WeakSet().add(a = {}).add(b = {});
    ok(M.has(a) && M.has(b), 'WeakSet has values before .delete()');
    M['delete'](a);
    ok(!M.has(a) && M.has(b), 'WeakSet has`nt value after .delete()');
  });
  test('WeakSet::has', function(){
    var M, a;
    ok(isFunction(WeakSet.prototype.has), 'Is function');
    M = new WeakSet();
    ok(!M.has({}), 'WeakSet has`nt value');
    M.add(a = {});
    ok(M.has(a), 'WeakSet has value after .add()');
    M['delete'](a);
    ok(!M.has(a), 'WeakSet has`nt value after .delete()');
  });
}).call(this);

(function(){

}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Promise', function(){
    ok(isFunction(((typeof global != 'undefined' && global !== null) && global || window).Promise), 'Is function');
    ok(isFunction(Promise.prototype.then), 'Promise::then is function');
    ok(isFunction(Promise.prototype['catch']), 'Promise::catch is function');
  });
  test('Promise.all', function(){
    ok(isFunction(Promise.all), 'Is function');
  });
  test('Promise.race', function(){
    ok(isFunction(Promise.race), 'Is function');
  });
  test('Promise.resolve', function(){
    ok(isFunction(Promise.resolve), 'Is function');
  });
  test('Promise.reject', function(){
    ok(isFunction(Promise.reject), 'Is function');
  });
}).call(this);

(function(){
  var isFunction, isNative, that, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isNative = function(it){
    return /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/.test(it);
  };
  that = (typeof global != 'undefined' && global !== null) && global || window;
  test('Symbol', function(){
    var s1, s2, o, count, i;
    ok(isFunction(that.Symbol), 'Is function');
    s1 = Symbol('foo');
    s2 = Symbol('foo');
    ok(s1 !== s2, 'Symbol("foo") !== Symbol("foo")');
    o = {};
    o[s1] = 42;
    ok(o[s1] === 42, 'Symbol() work as key');
    ok(o[s2] !== 42, 'Various symbols from one description are various keys');
    if (isNative(Object.defineProperty)) {
      count = 0;
      for (i in o) {
        count++;
      }
      ok(count === 0, 'object[Symbol()] is not enumerable');
    }
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Function.isFunction', function(){
    var isFunction, i$, x$, ref$, len$;
    isFunction = Function.isFunction;
    ok(typeof isFunction === 'function', 'Is function');
    ok(isFunction(function(){}), 'isFunction function');
    for (i$ = 0, len$ = (ref$ = [void 8, null, 1, '', false, {}, fn$(), [], /./]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(!isFunction(x$), "not isFunction " + toString$.call(x$).slice(8, -1));
    }
    function fn$(){
      return arguments;
    }
  });
  test('Function.isNative', function(){
    var isNative, i$, x$, ref$, len$;
    isNative = Function.isNative;
    ok(isFunction(isNative), 'Is function');
    ok(isNative(Object.prototype.hasOwnProperty), 'isNative native function');
    for (i$ = 0, len$ = (ref$ = [fn$, void 8, null, 1, '', false, {}, fn1$(), [], /./]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(!isNative(x$), "not isNative " + toString$.call(x$).slice(8, -1));
    }
    function fn$(){}
    function fn1$(){
      return arguments;
    }
  });
  test('Function::construct', function(){
    var C;
    ok(isFunction(Function.prototype.construct), 'Is function');
    C = (function(){
      C.displayName = 'C';
      var prototype = C.prototype, constructor = C;
      function C(a, b){
        this.a = a;
        this.b = b;
      }
      return C;
    }());
    ok(C.construct([]) instanceof C);
    deepEqual(C.construct([1, 2]), new C(1, 2));
  });
}).call(this);

(function(){
  test('global', function(){
    ok(typeof global != 'undefined' && global !== null, 'global is define');
    ok(global.global === global, 'global.global is global');
    global.__tmp__ = {};
    ok(__tmp__ === global.__tmp__, 'global object properties are global variables');
  });
}).call(this);

(function(){
  var isFunction, that, bzzzzz, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  that = (typeof global != 'undefined' && global !== null) && global || window;
  asyncTest('setImmediate / clearImmediate', 6, function(){
    var tmp1, id, tmp2, tmp3, tmp4;
    ok(isFunction(that.setImmediate), 'setImmediate is function');
    ok(isFunction(that.clearImmediate), 'clearImmediate is function');
    id = setImmediate(function(){
      tmp1 = 42;
    });
    ok(tmp1 === void 8, 'setImmediate is async');
    setImmediate(function(){
      tmp2 = true;
    });
    setTimeout(function(){
      ok(tmp2, 'setImmediate works');
    }, 70);
    setImmediate(function(b, c){
      tmp3 = b + c;
    }, 'b', 'c');
    setTimeout(function(){
      ok(tmp3 === 'bc', 'setImmediate works with additional params');
    }, 80);
    clearImmediate(setImmediate(function(){
      tmp4 = 42;
    }));
    setTimeout(function(){
      ok(tmp4 === void 8, 'clearImmediate works');
    }, 90);
    setTimeout(start, 100);
  });
  bzzzzz = function(){
    var x, now, inc;
    x = 0;
    now = Date.now();
    return (inc = function(){
      return setImmediate(function(){
        x = x + 1;
        if (Date.now() - now < 1000) {
          return inc();
        } else {
          return console("setImmediate: " + x + " per second");
        }
      });
    })();
  };
  if (typeof window != 'undefined' && window !== null) {
    window.onload = bzzzzz;
  } else {
    bzzzzz();
  }
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Number.toInteger', function(){
    var toInteger;
    toInteger = Number.toInteger;
    ok(isFunction(toInteger), 'Is function');
    ok(toInteger(null) === 0);
    ok(toInteger({}) === 0);
    ok(toInteger(NaN) === 0);
    ok(toInteger(-1) === -1);
    ok(Object.is(-0, toInteger(-0)));
    ok(toInteger(-1.9) === -1);
    ok(toInteger(-Infinity) === -Infinity);
    ok(toInteger(-0x20000000000001) === -0x20000000000001);
  });
  test('Number::times', function(){
    ok(isFunction(Number.prototype.times), 'Is function');
    deepEqual(5 .times(function(it){
      return it;
    }), [0, 1, 2, 3, 4]);
    deepEqual(5 .times(function(it){
      return it + arguments[1];
    }), [0, 2, 4, 6, 8]);
    deepEqual(5 .times(function(it){
      return it + arguments[1] + arguments[2];
    }), [5, 7, 9, 11, 13]);
    deepEqual(5 .times(function(it){
      return (this | 0) + it + arguments[1] + arguments[2];
    }), [5, 7, 9, 11, 13]);
    deepEqual(5 .times(function(it){
      return (this | 0) + it + arguments[1] + arguments[2];
    }, 1), [6, 8, 10, 12, 14]);
  });
  test('Number::random', function(){
    ok(isFunction(Number.prototype.random), 'Is function');
    ok(100 .times(function(){
      return 10 .random();
    }).every(function(it){
      return 0 <= it && it <= 10;
    }));
    ok(100 .times(function(){
      return 10 .random(7);
    }).every(function(it){
      return 7 <= it && it <= 10;
    }));
    ok(100 .times(function(){
      return 7 .random(10);
    }).every(function(it){
      return 7 <= it && it <= 10;
    }));
  });
  test('Math.randomInt', function(){
    var randomInt;
    randomInt = Math.randomInt;
    ok(isFunction(randomInt), 'Is function');
    ok(100 .times(function(){
      return randomInt();
    }).every((function(it){
      return it === 0;
    })));
    ok(100 .times(function(){
      return randomInt(10);
    }).every((function(it){
      return it === 0 || it === 1 || it === 2 || it === 3 || it === 4 || it === 5 || it === 6 || it === 7 || it === 8 || it === 9 || it === 10;
    })));
    ok(100 .times(function(){
      return randomInt(10, 7);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
    ok(100 .times(function(){
      return randomInt(7, 10);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
  });
  test('Number::{Math}', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['round', 'floor', 'ceil', 'abs', 'sin', 'asin', 'cos', 'acos', 'tan', 'atan', 'exp', 'sqrt', 'max', 'min', 'pow', 'atan2', 'acosh', 'asinh', 'atanh', 'cbrt', 'clz32', 'cosh', 'expm1', 'hypot', 'imul', 'log1p', 'log10', 'log2', 'sign', 'sinh', 'tanh', 'trunc', 'randomInt']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(Number.prototype[x$]), "Number::" + x$ + " is function");
    }
    ok(3 .max(2) === 3, 'context is argument of Number::{Math}');
    ok(3 .min(2) === 2, 'Number::{Math} works with first argument');
    ok(1 .max(2, 3, 4, 5, 6, 7) === 7, 'Number::{Math} works with various arguments length');
  });
  test('Number::randomInt', function(){
    ok(100 .times(function(){
      return 10 .randomInt();
    }).every((function(it){
      return it === 0 || it === 1 || it === 2 || it === 3 || it === 4 || it === 5 || it === 6 || it === 7 || it === 8 || it === 9 || it === 10;
    })));
    ok(100 .times(function(){
      return 10 .randomInt(7);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
    ok(100 .times(function(){
      return 7 .randomInt(10);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
  });
}).call(this);

(function(){
  var isFunction, isNative, getPrototypeOf, create, defineProperty, getOwnPropertyDescriptor, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isNative = function(it){
    return /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/.test(it);
  };
  getPrototypeOf = Object.getPrototypeOf, create = Object.create, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  test('Object.getPropertyDescriptor', function(){
    var getPropertyDescriptor, create;
    getPropertyDescriptor = Object.getPropertyDescriptor, create = Object.create;
    ok(isFunction(getPropertyDescriptor), 'Is function');
    deepEqual(getPropertyDescriptor(create({
      q: 1
    }), 'q'), {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1
    });
  });
  test('Object.getOwnPropertyDescriptors', function(){
    var getOwnPropertyDescriptors, make, descs;
    getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors, make = Object.make;
    ok(isFunction(getOwnPropertyDescriptors), 'Is function');
    descs = getOwnPropertyDescriptors(make({
      q: 1
    }, {
      w: 2
    }), 'q');
    ok(descs.q === void 8);
    deepEqual(descs.w, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 2
    });
  });
  test('Object.isEnumerable', function(){
    var isEnumerable;
    isEnumerable = Object.isEnumerable;
    ok(isFunction(isEnumerable), 'Is function');
    ok(isEnumerable({
      q: 1
    }, 'q'));
    ok(!isEnumerable({}, 'toString'));
    ok(!isEnumerable(clone$({
      q: 1
    }), 'q'));
  });
  test('Object.isPrototype', function(){
    var isPrototype, proto;
    isPrototype = Object.isPrototype;
    ok(isFunction(isPrototype), 'Is function');
    ok(isPrototype(Object.prototype, {}));
    ok(isPrototype(Object.prototype, []));
    ok(!isPrototype(Array.prototype, {}));
    ok(isPrototype(Array.prototype, []));
    ok(!isPrototype(Function.prototype, []));
    ok(isPrototype(proto = {}, clone$(proto)));
    ok(!isPrototype({}, clone$(function(){})));
  });
  test('Object.classof', function(){
    var classof;
    classof = Object.classof;
    ok(isFunction(classof), 'Is function');
    ok(classof({}) === 'Object');
    ok(classof(void 8) === 'Undefined');
    ok(classof(null) === 'Null');
    ok(classof(false) === 'Boolean');
    ok(classof(new Boolean(false)) === 'Boolean');
    ok(classof('') === 'String');
    ok(classof(new String('')) === 'String');
    ok(classof(7) === 'Number');
    ok(classof(new Number(7)) === 'Number');
    ok(classof([]) === 'Array');
    ok(classof(function(){}) === 'Function');
    ok(classof(/./) === 'RegExp');
    ok(classof(TypeError()) === 'Error');
    ok(classof(function(){
      return arguments;
    }()) === 'Arguments');
    ok(classof(new Set) === 'Set');
    ok(classof(new Map) === 'Map');
    ok(classof(new WeakSet) === 'WeakSet');
    ok(classof(new WeakMap) === 'WeakMap');
    ok(classof(new Promise(function(){})) === 'Promise');
    ok(classof(new Symbol) === 'Symbol');
    ok(classof(Symbol()) === 'Symbol');
    ok(classof([].entries()) === 'Array Iterator');
    ok(classof(new Set().entries()) === 'Set Iterator');
    ok(classof(new Map().entries()) === 'Map Iterator');
    ok(classof(Math) === 'Math');
    if (typeof JSON != 'undefined' && JSON !== null) {
      ok(classof(JSON) === 'JSON');
    }
  });
  test('Object.make', function(){
    var make, object, foo;
    make = Object.make;
    ok(isFunction(make), 'Is function');
    object = make(foo = {
      q: 1
    }, {
      w: 2
    });
    ok(getPrototypeOf(object) === foo);
    ok(object.w === 2);
  });
  test('Object.define', function(){
    var define, foo, foo2;
    define = Object.define;
    ok(isFunction(define), 'Is function');
    foo = {
      q: 1
    };
    ok(foo === define(foo, {
      w: 2
    }));
    ok(foo.w === 2);
    if (isNative(getOwnPropertyDescriptor)) {
      foo = {
        q: 1
      };
      foo2 = defineProperty({}, 'w', {
        get: function(){
          return this.q + 1;
        }
      });
      define(foo, foo2);
      ok(foo.w === 2);
    }
  });
  test('Object.isObject', function(){
    var isObject;
    isObject = Object.isObject;
    ok(isFunction(isObject), 'Is function');
    ok(!isObject(void 8));
    ok(!isObject(null));
    ok(!isObject(1));
    ok(!isObject(false));
    ok(!isObject(''));
    ok(isObject(new Number(1)));
    ok(isObject(new Boolean(false)));
    ok(isObject(new String(1)));
    ok(isObject({}));
    ok(isObject([]));
    ok(isObject(/./));
    ok(isObject(new function(){}));
  });
  test('Object.symbol', function(){
    var symbol;
    symbol = Object.symbol;
    ok(isFunction(symbol), 'Is function');
    ok(typeof symbol('foo') === 'string', "symbol('foo') return string");
    ok(symbol('foo') !== symbol('foo'), "symbol('foo') !== symbol('foo')");
    ok(symbol('foo').slice(0, 6) === '@@foo_', "symbol('foo') begin from @@foo_");
    ok(symbol('foo').length > 15, "symbol('foo')length > 15");
  });
  test('Object.hidden', function(){
    var hidden, o, desc;
    hidden = Object.hidden;
    ok(isFunction(hidden), 'Is function');
    o = {};
    ok(hidden(o, 'key', 42) === o, 'return target');
    ok(o.key === 42, 'hidden define property');
    if (isNative(getOwnPropertyDescriptor)) {
      desc = getOwnPropertyDescriptor(o, 'key');
      ok(!desc.enumerable, 'hidden define not enumerable property');
      ok(desc.writable, 'hidden define writable property');
      ok(desc.configurable, 'hidden define configurable property');
    }
  });
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('RegExp.escape', function(){
    var escape;
    escape = RegExp.escape;
    ok(isFunction(escape), 'Is function');
    ok(escape('qwe asd') === 'qwe asd', "Don't change simple string");
    ok(escape('\\-[]{}()*+?.,^$|') === "\\\\\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\,\\^\\$\\|", 'Escape all RegExp special chars');
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('String::escapeHTML', function(){
    ok(isFunction(String.prototype.escapeHTML), 'Is function');
    ok('qwe, asd'.escapeHTML() === 'qwe, asd');
    ok('<div>qwe</div>'.escapeHTML() === '&lt;div&gt;qwe&lt;/div&gt;');
    ok("&<>\"'".escapeHTML() === '&amp;&lt;&gt;&quot;&apos;');
  });
  test('String::unescapeHTML', function(){
    ok(isFunction(String.prototype.unescapeHTML), 'Is function');
    ok('qwe, asd'.unescapeHTML() === 'qwe, asd');
    ok('&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML() === '<div>qwe</div>');
    ok('&amp;&lt;&gt;&quot;&apos;'.unescapeHTML() === "&<>\"'");
  });
}).call(this);

(function(){
  var that, slice$ = [].slice;
  that = (typeof global != 'undefined' && global !== null) && global || window;
  asyncTest('setTimeout / clearTimeout', 2, function(){
    that.setTimeout(function(b, c){
      ok(b + c === 'bc');
    }, 1, 'b', 'c');
    clearTimeout(partialize$.apply(that, [
      that.setTimeout, [
        void 8, 1, function(){
          ok(false);
        }
      ], [0]
    ]));
    that.setTimeout(function(){
      ok(true);
      start();
    }, 20);
  });
  asyncTest('setInterval / clearInterval', 6, function(){
    var i, interval;
    i = 1;
    interval = that.setInterval(function(it){
      ok(i < 4);
      ok(it === 42);
      if (i === 3) {
        clearInterval(interval);
        start();
      }
      i = i + 1;
    }, 1, 42);
  });
  function partialize$(f, args, where){
    var context = this;
    return function(){
      var params = slice$.call(arguments), i,
          len = params.length, wlen = where.length,
          ta = args ? args.concat() : [], tw = where ? where.concat() : [];
      for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
      return len < wlen && len ?
        partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
    };
  }
}).call(this);
