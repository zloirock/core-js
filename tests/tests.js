(function(){
  var isFunction;
  isFunction = Function.isFunction;
  test('Array::at', function(){
    ok(isFunction(Array.prototype.at, 'Array::at is function'));
    ok([1, 2, 3].at(0) === 1, '[1, 2, 3].at(0) is 1');
    ok([1, 2, 3].at(2) === 3, '[1, 2, 3].at(2) is 3');
    ok([1, 2, 3].at(3) === void 8, '[1, 2, 3].at(3) is undefined');
    ok([1, 2, 3].at(-1) === 3, '[1, 2, 3].at(-1) is 3');
    ok([1, 2, 3].at(-3) === 1, '[1, 2, 3].at(-3) is 1');
    ok([1, 2, 3].at(-4) === void 8, '[1, 2, 3].at(-4) is undefined');
  });
  test('Array::pluck', function(){
    ok(isFunction(Array.prototype.pluck));
    deepEqual([1, 2, 321].pluck('length'), [void 8, void 8, void 8]);
    deepEqual([1, 2, void 8].pluck('length'), [void 8, void 8, void 8]);
    deepEqual(['1', '2', '321'].pluck('length'), [1, 1, 3]);
  });
  test('Array::reduceTo', function(){
    var arr, obj;
    ok(isFunction(Array.prototype.reduceTo));
    (arr = [1]).reduceTo(function(val, key, that){
      deepEqual({}, this);
      ok(val === 1);
      ok(key === 0);
      return ok(that === arr);
    });
    [1].reduceTo(obj = {}, function(){
      return ok(this === obj);
    });
    deepEqual([3, 2, 1], [1, 2, 3].reduceTo([], (function(it){
      return this.unshift(it);
    })));
  });
  test('Array::merge', function(){
    var arr;
    ok(isFunction(Array.prototype.merge));
    arr = [1, 2, 3];
    ok(arr === arr.merge([4, 5, 6]));
    deepEqual(arr, [1, 2, 3, 4, 5, 6]);
    arr = ['q', 'w', 'e'];
    ok(arr === arr.merge('asd'));
    deepEqual(arr, ['q', 'w', 'e', 'a', 's', 'd']);
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = Function.isFunction;
  test('Array.join', function(){
    var join;
    join = Array.join;
    ok(isFunction(join));
    ok(join('123', '|') === '1|2|3');
    ok(join(function(){
      return arguments;
    }(3, 2, 1), '|') === '3|2|1');
  });
  test('Array.pop', function(){
    var pop, args;
    pop = Array.pop;
    ok(isFunction(pop));
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
    ok(isFunction(push));
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
    ok(isFunction(reverse));
    deepEqual(reverse(function(){
      return arguments;
    }(1, 2, 3)), function(){
      return arguments;
    }(3, 2, 1));
  });
  test('Array.shift', function(){
    var shift, args;
    shift = Array.shift;
    ok(isFunction(shift));
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
    ok(isFunction(unshift));
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
    ok(isFunction(slice));
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
    ok(isFunction(splice));
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
    ok(isFunction(sort));
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
    ok(isFunction(indexOf));
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
    ok(isFunction(lastIndexOf));
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
    ok(isFunction(every));
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
    ok(isFunction(some));
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
    ok(isFunction(forEach));
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
    ok(isFunction(map));
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
    ok(isFunction(filter));
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
    ok(isFunction(reduce));
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
    ok(isFunction(reduceRight));
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
    ok(isFunction(fill));
    deepEqual(fill(function(){
      return arguments;
    }(null, null, null), 5), function(){
      return arguments;
    }(5, 5, 5));
  });
  test('Array.find', function(){
    var find, al, ctx;
    find = Array.find;
    ok(isFunction(find));
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
    ok(isFunction(findIndex));
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
    ok(isFunction(at));
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
  test('Array.pluck', function(){
    var pluck;
    pluck = Array.pluck;
    ok(isFunction(pluck));
    deepEqual(pluck(function(){
      return arguments;
    }('1', '22', 3), 'length'), [1, 2, void 8]);
    deepEqual(pluck('123', 'length'), [1, 1, 1]);
  });
  test('Array.reduceTo', function(){
    var reduceTo, al, obj;
    reduceTo = Array.reduceTo;
    ok(isFunction(reduceTo));
    reduceTo(al = function(){
      return arguments;
    }(1), function(val, key, that){
      deepEqual({}, this);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    });
    reduceTo(al = '1', function(val, key, that){
      deepEqual({}, this);
      ok(val === '1');
      ok(key === 0);
      return ok(that == al);
    });
    reduceTo(function(){
      return arguments;
    }(1), obj = {}, function(){
      return ok(this === obj);
    });
    deepEqual([3, 2, 1], reduceTo(function(){
      return arguments;
    }(1, 2, 3), [], (function(it){
      return this.unshift(it);
    })));
    deepEqual(['3', '2', '1'], reduceTo('123', [], (function(it){
      return this.unshift(it);
    })));
  });
  test('Array.merge', function(){
    var merge, args;
    merge = Array.merge;
    ok(isFunction(merge));
    args = function(){
      return arguments;
    }(1, 2, 3);
    ok(args === merge(args, function(){
      return arguments;
    }(4, 5, 6)));
    ok(args.length === 6);
    ok(args[0] === 1);
    ok(args[1] === 2);
    ok(args[2] === 3);
    ok(args[3] === 4);
    ok(args[4] === 5);
    ok(args[5] === 6);
  });
}).call(this);

(function(){
  var isFunction, isObject, id, toString$ = {}.toString;
  isFunction = Function.isFunction;
  isObject = Object.isObject;
  test('console', function(){
    ok(isObject(global.console), 'global.console is object');
  });
  test('console.{...} are functions', function(){
    var assert, count, clear, debug, dir, dirxml, error, exception, group, groupCollapsed, groupEnd, info, log, table, trace, warn, markTimeline, profile, profileEnd, time, timeEnd, timeStamp;
    assert = console.assert, count = console.count, clear = console.clear, debug = console.debug, dir = console.dir, dirxml = console.dirxml, error = console.error, exception = console.exception, group = console.group, groupCollapsed = console.groupCollapsed, groupEnd = console.groupEnd, info = console.info, log = console.log, table = console.table, trace = console.trace, warn = console.warn, markTimeline = console.markTimeline, profile = console.profile, profileEnd = console.profileEnd, time = console.time, timeEnd = console.timeEnd, timeStamp = console.timeStamp;
    ok(isFunction(log), 'console.log is function');
    ok(isFunction(warn), 'console.warn is function');
    ok(isFunction(error), 'console.error is function');
    ok(isFunction(info), 'console.info is function');
    ok(isFunction(time), 'console.time is function');
    ok(isFunction(timeEnd), 'console.timeEnd is function');
    ok(isFunction(assert), 'console.assert is function');
    ok(isFunction(count), 'console.count is function');
    ok(isFunction(debug), 'console.debug is function');
    ok(isFunction(dir), 'console.dir is function');
    ok(isFunction(dirxml), 'console.dirxml is function');
    ok(isFunction(table), 'console.table is function');
    ok(isFunction(trace), 'console.trace is function');
    ok(isFunction(group), 'console.group is function');
    ok(isFunction(groupEnd), 'console.groupEnd is function');
    ok(isFunction(groupCollapsed), 'console.groupCollapsed is function');
    ok(isFunction(markTimeline), 'console.markTimeline is function');
    ok(isFunction(profile), 'console.profile is function');
    ok(isFunction(profileEnd), 'console.profileEnd is function');
    ok(isFunction(clear), 'console.clear is function');
  });
  test('console.{...} call', function(){
    ok((function(){
      try {
        console.log('console.log');
        return true;
      } catch (e$) {}
    }()), 'call console.log');
    ok((function(){
      try {
        console.warn('console.warn');
        return true;
      } catch (e$) {}
    }()), 'call console.warn');
    ok((function(){
      try {
        console.error('console.error');
        return true;
      } catch (e$) {}
    }()), 'call console.error');
    ok((function(){
      try {
        console.info('console.info');
        return true;
      } catch (e$) {}
    }()), 'call console.info');
    ok((function(){
      try {
        console.time(id = 'console.time');
        return true;
      } catch (e$) {}
    }()), 'call console.time');
    ok((function(){
      try {
        console.timeEnd(id);
        return true;
      } catch (e$) {}
    }()), 'call console.timeEnd');
    ok((function(){
      try {
        console.assert(true, true, 'console.assert');
        return true;
      } catch (e$) {}
    }()), 'call console.assert');
    ok((function(){
      try {
        console.count('console.count');
        return true;
      } catch (e$) {}
    }()), 'call console.count');
    ok((function(){
      try {
        console.debug('console.debug');
        return true;
      } catch (e$) {}
    }()), 'call console.debug');
    ok((function(){
      try {
        console.dir({
          q: 1,
          w: 2,
          e: 3
        });
        return true;
      } catch (e$) {}
    }()), 'call console.dir');
    ok((function(){
      try {
        console.dirxml(typeof document != 'undefined' && document !== null ? document.getElementById('qunit-header') : void 8);
        return true;
      } catch (e$) {}
    }()), 'call console.dirxml');
    ok((function(){
      try {
        console.table([['q', 'w'], ['call', 'console.table']]);
        return true;
      } catch (e$) {}
    }()), 'call console.table');
    ok((function(){
      try {
        console.trace();
        return true;
      } catch (e$) {}
    }()), 'call console.trace');
    ok((function(){
      try {
        console.group(id = 'console.group');
        return true;
      } catch (e$) {}
    }()), 'call console.group');
    ok((function(){
      try {
        console.groupEnd(id);
        return true;
      } catch (e$) {}
    }()), 'call console.groupEnd');
    ok((function(){
      try {
        console.groupCollapsed(id = 'console.groupCollapsed');
        console.groupEnd(id);
        return true;
      } catch (e$) {}
    }()), 'call console.groupCollapsed');
    ok((function(){
      try {
        console.profile('profile');
        return true;
      } catch (e$) {}
    }()), 'call console.profile');
    ok((function(){
      try {
        console.profileEnd('profile');
        return true;
      } catch (e$) {}
    }()), 'call console.profileEnd');
    ok((function(){
      try {
        console.clear();
        return true;
      } catch (e$) {}
    }()), 'call console.clear');
  });
  test('console.{...} are unbound', function(){
    var assert, count, clear, debug, dir, dirxml, error, exception, group, groupCollapsed, groupEnd, info, log, table, trace, warn, markTimeline, profile, profileEnd, time, timeEnd, timeStamp;
    assert = console.assert, count = console.count, clear = console.clear, debug = console.debug, dir = console.dir, dirxml = console.dirxml, error = console.error, exception = console.exception, group = console.group, groupCollapsed = console.groupCollapsed, groupEnd = console.groupEnd, info = console.info, log = console.log, table = console.table, trace = console.trace, warn = console.warn, markTimeline = console.markTimeline, profile = console.profile, profileEnd = console.profileEnd, time = console.time, timeEnd = console.timeEnd, timeStamp = console.timeStamp;
    ok((function(){
      try {
        log('log');
        return true;
      } catch (e$) {}
    }()), 'call log');
    ok((function(){
      try {
        warn('warn');
        return true;
      } catch (e$) {}
    }()), 'call warn');
    ok((function(){
      try {
        error('error');
        return true;
      } catch (e$) {}
    }()), 'call error');
    ok((function(){
      try {
        info('info');
        return true;
      } catch (e$) {}
    }()), 'call info');
    ok((function(){
      try {
        time(id = 'time');
        return true;
      } catch (e$) {}
    }()), 'call time');
    ok((function(){
      try {
        timeEnd(id);
        return true;
      } catch (e$) {}
    }()), 'call timeEnd');
    ok((function(){
      try {
        assert(true, true, 'assert');
        return true;
      } catch (e$) {}
    }()), 'call assert');
    ok((function(){
      try {
        count('count');
        return true;
      } catch (e$) {}
    }()), 'call count');
    ok((function(){
      try {
        debug('debug');
        return true;
      } catch (e$) {}
    }()), 'call debug');
    ok((function(){
      try {
        dir({
          q: 1,
          w: 2,
          e: 3
        });
        return true;
      } catch (e$) {}
    }()), 'call dir');
    ok((function(){
      try {
        dirxml(typeof document != 'undefined' && document !== null ? document.getElementById('qunit-header') : void 8);
        return true;
      } catch (e$) {}
    }()), 'call dirxml');
    ok((function(){
      try {
        table([['q', 'w'], ['call', 'table']]);
        return true;
      } catch (e$) {}
    }()), 'call table');
    ok((function(){
      try {
        trace();
        return true;
      } catch (e$) {}
    }()), 'call trace');
    ok((function(){
      try {
        group(id = 'group');
        return true;
      } catch (e$) {}
    }()), 'call group');
    ok((function(){
      try {
        groupEnd(id);
        return true;
      } catch (e$) {}
    }()), 'call groupEnd');
    ok((function(){
      try {
        groupCollapsed(id = 'groupCollapsed');
        groupEnd(id);
        return true;
      } catch (e$) {}
    }()), 'call groupCollapsed');
    ok((function(){
      try {
        profile('profile');
        return true;
      } catch (e$) {}
    }()), 'call profile');
    ok((function(){
      try {
        profileEnd('profile');
        return true;
      } catch (e$) {}
    }()), 'call profileEnd');
    ok((function(){
      try {
        clear();
        return true;
      } catch (e$) {}
    }()), 'call clear');
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
  test('console.enabled', function(){
    ok(toString$.call(console.enabled).slice(8, -1) === 'Boolean', 'console.enabled is boolean');
    ok(console.enabled === true, 'console.enabled is true');
    console.enabled = false;
    ok((function(){
      try {
        return console('call disabled console') === void 8;
      } catch (e$) {}
    }()), 'call disabled console');
    console.enabled = true;
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Function.isFunction;
  test('Date.locale', function(){
    ok(isFunction(Date.locale));
    Date.locale('ru');
    ok(Date.locale() === 'ru');
  });
  test('Date.addLocale', function(){
    ok(isFunction(Date.addLocale));
  });
  test('Date::format', function(){
    var date;
    ok(isFunction(Date.prototype.format));
    date = new Date(1, 2, 3, 4, 5, 6, 7);
    ok(date.format('dd.nn.yyyy') === '03.03.1901');
    Date.locale('en');
    ok(date.format('w, d MM yyyy') === 'Sunday, 3 March 1901');
    ok(date.format('w, d MM yyyy', 'ru') === 'Воскресенье, 3 Марта 1901');
    Date.locale('ru');
    ok(date.format('w, d MM yyyy') === 'Воскресенье, 3 Марта 1901');
    ok(date.format('d MM') === '3 Марта');
    ok(date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy yyyy') === '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 1901');
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  isFunction = Function.isFunction;
  test('Object.getOwnPropertyDescriptor', function(){
    var getOwnPropertyDescriptor;
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    ok(isFunction(getOwnPropertyDescriptor));
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
    ok(isFunction(defineProperty));
    ok((rez = defineProperty(src = {}, 'q', {
      value: 42
    })) === src);
    ok(rez.q === 42);
  });
  test('Object.defineProperties', function(){
    var defineProperties, rez, src;
    defineProperties = Object.defineProperties;
    ok(isFunction(defineProperties));
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
    ok(isFunction(getPrototypeOf));
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
    ok(isFunction(getOwnPropertyNames));
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
    var create, getPrototypeOf, getPropertyNames, isObject, isPrototype, obj, fn;
    create = Object.create, getPrototypeOf = Object.getPrototypeOf, getPropertyNames = Object.getPropertyNames, isObject = Object.isObject, isPrototype = Object.isPrototype;
    ok(isFunction(create));
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
    ok(isFunction(keys));
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
    ok(!in$('join', keys(Array.prototype)));
  });
  test('Function.prototype.bind', function(){
    var obj;
    ok(isFunction(Function.prototype.bind));
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
    ok(isFunction(isArray));
    ok(!isArray({}));
    ok(!isArray(function(){
      return arguments;
    }()));
    ok(isArray([]));
  });
  test('Array::indexOf', function(){
    ok(isFunction(Array.prototype.indexOf));
    ok(0 === [1, 1, 1].indexOf(1));
    ok(-1 === [1, 2, 3].indexOf(1, 1));
    ok(1 === [1, 2, 3].indexOf(2, 1));
    ok(-1 === [NaN].indexOf(NaN));
    ok(3 === Array(2).concat([1, 2, 3]).indexOf(2));
  });
  test('Array::lastIndexOf', function(){
    ok(isFunction(Array.prototype.lastIndexOf));
    ok(2 === [1, 1, 1].lastIndexOf(1));
    ok(-1 === [1, 2, 3].lastIndexOf(3, 1));
    ok(1 === [1, 2, 3].lastIndexOf(2, 1));
    ok(-1 === [NaN].lastIndexOf(NaN));
    ok(1 === [1, 2, 3].concat(Array(2)).lastIndexOf(2));
  });
  test('Array::every', function(){
    var a, ctx, rez, arr;
    ok(isFunction(Array.prototype.every));
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
    ok(isFunction(Array.prototype.some));
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
    ok(isFunction(Array.prototype.forEach));
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
    ok(isFunction(Array.prototype.map));
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
    ok(isFunction(Array.prototype.filter));
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
    ok(isFunction(Array.prototype.reduce));
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
    ok(isFunction(Array.prototype.reduceRight));
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
    ok('trim' in String.prototype);
    ok('   q w e \n  '.trim() === 'q w e');
  });
  test('Date.now', function(){
    var now;
    now = Date.now;
    ok(isFunction(now));
    ok(+new Date - now() < 10);
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
  var isFunction, isNative, getOwnPropertyDescriptor, defineProperty, same, epsilon;
  isFunction = Function.isFunction, isNative = Function.isNative;
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, defineProperty = Object.defineProperty;
  same = Object.is;
  epsilon = function(a, b){
    return Math.abs(a - b) <= Number.EPSILON;
  };
  test('Object.assign', function(){
    var assign, foo, foo2;
    assign = Object.assign;
    ok(isFunction(assign));
    foo = {
      q: 1
    };
    ok(foo === assign(foo, {
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
      assign(foo, foo2);
      ok(foo.w === void 8);
    }
  });
  test('Object.is', function(){
    ok(isFunction(same));
    ok(same(1, 1));
    ok(same(NaN, NaN));
    ok(!same(0, -0));
    ok(!same({}, {}));
  });
  if (Object.setPrototypeOf) {
    test('Object.setPrototypeOf', function(){
      var setPrototypeOf, tmp;
      setPrototypeOf = Object.setPrototypeOf;
      ok(isFunction(setPrototypeOf));
      ok('apply' in setPrototypeOf({}, Function.prototype));
      ok(setPrototypeOf({
        a: 2
      }, {
        b: function(){
          return Math.pow(this.a, 2);
        }
      }).b() === 4);
      ok(setPrototypeOf(tmp = {}, {
        a: 1
      }) === tmp);
      ok(!('toString' in setPrototypeOf({}, null)));
    });
  }
  test('Number.EPSILON', function(){
    ok('EPSILON' in Number);
    ok(Number.EPSILON === 2.220446049250313e-16);
    ok(1 !== 1 + Number.EPSILON);
    ok(1 === 1 + Number.EPSILON / 2);
  });
  test('Number.isFinite', function(){
    var isFinite;
    isFinite = Number.isFinite;
    ok(isFunction(isFinite));
    ok(isFinite(1));
    ok(isFinite(0.1));
    ok(isFinite(-1));
    ok(isFinite(Math.pow(2, 16)));
    ok(isFinite(Math.pow(2, 16) - 1));
    ok(isFinite(Math.pow(2, 31)));
    ok(isFinite(Math.pow(2, 31) - 1));
    ok(isFinite(Math.pow(2, 32)));
    ok(isFinite(Math.pow(2, 32) - 1));
    ok(isFinite(-0));
    ok(!isFinite(NaN));
    ok(!isFinite(Infinity));
    ok(!isFinite('NaN'));
    ok(!isFinite('5'));
    ok(!isFinite(false));
    ok(!isFinite(new Number(NaN)));
    ok(!isFinite(new Number(Infinity)));
    ok(!isFinite(new Number(5)));
    ok(!isFinite(new Number(0.1)));
    ok(!isFinite(void 8));
    ok(!isFinite(null));
    ok(!isFinite({}));
    ok(!isFinite(function(){}));
  });
  test('Number.isInteger', function(){
    var isInteger;
    isInteger = Number.isInteger;
    ok(isFunction(isInteger));
    ok(isInteger(1));
    ok(isInteger(-1));
    ok(isInteger(Math.pow(2, 16)));
    ok(isInteger(Math.pow(2, 16) - 1));
    ok(isInteger(Math.pow(2, 31)));
    ok(isInteger(Math.pow(2, 31) - 1));
    ok(isInteger(Math.pow(2, 32)));
    ok(isInteger(Math.pow(2, 32) - 1));
    ok(!isInteger(NaN));
    ok(!isInteger(0.1));
    ok(!isInteger(Infinity));
    ok(!isInteger('NaN'));
    ok(!isInteger('5'));
    ok(!isInteger(false));
    ok(!isInteger(new Number(NaN)));
    ok(!isInteger(new Number(Infinity)));
    ok(!isInteger(new Number(5)));
    ok(!isInteger(new Number(0.1)));
    ok(!isInteger(void 8));
    ok(!isInteger(null));
    ok(!isInteger({}));
    ok(!isInteger(function(){}));
    ok(isInteger(-0));
  });
  test('Number.isNaN', function(){
    var isNaN;
    isNaN = Number.isNaN;
    ok(isFunction(isNaN));
    ok(isNaN(NaN));
    ok(!isNaN(1));
    ok(!isNaN(0.1));
    ok(!isNaN(-1));
    ok(!isNaN(Math.pow(2, 16)));
    ok(!isNaN(Math.pow(2, 16) - 1));
    ok(!isNaN(Math.pow(2, 31)));
    ok(!isNaN(Math.pow(2, 31) - 1));
    ok(!isNaN(Math.pow(2, 32)));
    ok(!isNaN(Math.pow(2, 32) - 1));
    ok(!isNaN(Infinity));
    ok(!isNaN('NaN'));
    ok(!isNaN('5'));
    ok(!isNaN(false));
    ok(!isNaN(new Number(NaN)));
    ok(!isNaN(new Number(Infinity)));
    ok(!isNaN(new Number(5)));
    ok(!isNaN(new Number(0.1)));
    ok(!isNaN(void 8));
    ok(!isNaN(null));
    ok(!isNaN({}));
    ok(!isNaN(function(){}));
    ok(!isNaN(-0));
  });
  test('Number.isSafeInteger', function(){
    var isSafeInteger;
    isSafeInteger = Number.isSafeInteger;
    ok(isFunction(isSafeInteger));
    ok(isSafeInteger(1));
    ok(isSafeInteger(-1));
    ok(isSafeInteger(Math.pow(2, 16)));
    ok(isSafeInteger(Math.pow(2, 16) - 1));
    ok(isSafeInteger(Math.pow(2, 31)));
    ok(isSafeInteger(Math.pow(2, 31) - 1));
    ok(isSafeInteger(Math.pow(2, 32)));
    ok(isSafeInteger(Math.pow(2, 32) - 1));
    ok(isSafeInteger(9007199254740991));
    ok(isSafeInteger(-9007199254740991));
    ok(isSafeInteger(-0));
    ok(!isSafeInteger(NaN));
    ok(!isSafeInteger(0.1));
    ok(!isSafeInteger(9007199254740992));
    ok(!isSafeInteger(-9007199254740992));
    ok(!isSafeInteger(Infinity));
    ok(!isSafeInteger('NaN'));
    ok(!isSafeInteger('5'));
    ok(!isSafeInteger(false));
    ok(!isSafeInteger(new Number(NaN)));
    ok(!isSafeInteger(new Number(Infinity)));
    ok(!isSafeInteger(new Number(5)));
    ok(!isSafeInteger(new Number(0.1)));
    ok(!isSafeInteger(void 8));
    ok(!isSafeInteger(null));
    ok(!isSafeInteger({}));
    ok(!isSafeInteger(function(){}));
  });
  test('Number.MAX_SAFE_INTEGER', function(){
    ok(Number.MAX_SAFE_INTEGER === 9007199254740991);
  });
  test('Number.MIN_SAFE_INTEGER', function(){
    ok(Number.MIN_SAFE_INTEGER === -9007199254740991);
  });
  test('Number.parseFloat', function(){
    ok(isFunction(Number.parseFloat));
  });
  test('Number.parseInt', function(){
    ok(isFunction(Number.parseInt));
  });
  test('Math.acosh', function(){
    var acosh;
    acosh = Math.acosh;
    ok(isFunction(acosh));
    ok(same(acosh(NaN), NaN));
    ok(same(acosh(0.5), NaN));
    ok(same(acosh(-1), NaN));
    ok(same(acosh(1), 0));
    ok(same(acosh(Infinity), Infinity));
  });
  test('Math.asinh', function(){
    var asinh;
    asinh = Math.asinh;
    ok(isFunction(asinh));
    ok(same(asinh(NaN), NaN));
    ok(same(asinh(0), 0));
    ok(same(asinh(-0), -0));
    ok(same(asinh(Infinity), Infinity));
    ok(same(asinh(-Infinity), -Infinity));
  });
  test('Math.atanh', function(){
    var atanh;
    atanh = Math.atanh;
    ok(isFunction(atanh));
    ok(same(atanh(NaN), NaN));
    ok(same(atanh(-2), NaN));
    ok(same(atanh(-1.5), NaN));
    ok(same(atanh(2), NaN));
    ok(same(atanh(1.5), NaN));
    ok(same(atanh(-1), -Infinity));
    ok(same(atanh(1), Infinity));
    ok(same(atanh(0), 0));
    ok(same(atanh(-0), -0));
  });
  test('Math.cbrt', function(){
    var cbrt;
    cbrt = Math.cbrt;
    ok(isFunction(cbrt));
    ok(same(cbrt(NaN), NaN));
    ok(same(cbrt(0), 0));
    ok(same(cbrt(-0), -0));
    ok(same(cbrt(Infinity), Infinity));
    ok(same(cbrt(-Infinity), -Infinity));
  });
  test('Math.clz32', function(){
    var clz32;
    clz32 = Math.clz32;
    ok(isFunction(clz32));
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
    ok(isFunction(cosh));
    ok(same(cosh(NaN), NaN));
    ok(same(cosh(0), 1));
    ok(same(cosh(-0), 1));
    ok(same(cosh(Infinity), Infinity));
    ok(same(cosh(-Infinity), Infinity));
  });
  test('Math.expm1', function(){
    var expm1;
    expm1 = Math.expm1;
    ok(isFunction(expm1));
    ok(same(expm1(NaN), NaN));
    ok(same(expm1(0), 0));
    ok(same(expm1(-0), -0));
    ok(same(expm1(Infinity), Infinity));
    ok(same(expm1(-Infinity), -1));
  });
  test('Math.hypot', function(){
    var hypot, sqrt;
    hypot = Math.hypot, sqrt = Math.sqrt;
    ok(isFunction(hypot));
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
  });
  test('Math.imul', function(){
    var imul;
    imul = Math.imul;
    ok(isFunction(imul));
    ok(same(imul(0, 0), 0));
    ok(imul(123, 456) === 56088);
    ok(imul(-123, 456) === -56088);
    ok(imul(123, -456) === -56088);
    ok(imul(19088743, 4275878552) === 602016552);
  });
  test('Math.log1p', function(){
    var log1p;
    log1p = Math.log1p;
    ok(isFunction(log1p));
    ok(same(log1p(''), log1p(0)));
    ok(same(log1p(NaN), NaN));
    ok(same(log1p(-2), NaN));
    ok(same(log1p(-1), -Infinity));
    ok(same(log1p(0), 0));
    ok(same(log1p(-0), -0));
    ok(same(log1p(Infinity), Infinity));
  });
  test('Math.log10', function(){
    var log10;
    log10 = Math.log10;
    ok(isFunction(log10));
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
  });
  test('Math.log2', function(){
    var log2;
    log2 = Math.log2;
    ok(isFunction(log2));
    ok(same(log2(''), log2(0)));
    ok(same(log2(NaN), NaN));
    ok(same(log2(-1), NaN));
    ok(same(log2(0), -Infinity));
    ok(same(log2(-0), -Infinity));
    ok(same(log2(1), 0));
    ok(same(log2(Infinity), Infinity));
    ok(same(log2(0.5), -1));
  });
  test('Math.sign', function(){
    var sign;
    sign = Math.sign;
    ok(isFunction(sign));
    ok(same(sign(NaN), NaN));
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
    ok(isFunction(sinh));
    ok(same(sinh(NaN), NaN));
    ok(same(sinh(0), 0));
    ok(same(sinh(-0), -0));
    ok(same(sinh(Infinity), Infinity));
    ok(same(sinh(-Infinity), -Infinity));
  });
  test('Math.tanh', function(){
    var tanh;
    tanh = Math.tanh;
    ok(isFunction(tanh));
    ok(same(tanh(NaN), NaN));
    ok(same(tanh(0), 0));
    ok(same(tanh(-0), -0));
    ok(same(tanh(Infinity), 1));
    ok(same(tanh(-Infinity), -1));
  });
  test('Math.trunc', function(){
    var trunc;
    trunc = Math.trunc;
    ok(isFunction(trunc));
    ok(same(trunc(NaN), NaN));
    ok(same(trunc(-0), -0));
    ok(same(trunc(0), 0));
    ok(same(trunc(Infinity), Infinity));
    ok(same(trunc(-Infinity), -Infinity));
    ok(same(trunc(-0.3), -0));
    ok(same(trunc(0.3), 0));
    ok(trunc([]) === 0);
    ok(trunc(-42.42) === -42);
    ok(trunc(13510798882111488) === 13510798882111488);
  });
  test('String::contains', function(){
    ok(isFunction(String.prototype.contains));
    ok(!'abc'.contains());
    ok('aundefinedb'.contains());
    ok('abcd'.contains('b', 1));
    ok(!'abcd'.contains('b', 2));
  });
  test('String::endsWith', function(){
    ok(isFunction(String.prototype.endsWith));
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
    ok(isFunction(String.prototype.repeat));
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
    ok(isFunction(String.prototype.startsWith));
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
    ok(isFunction(from));
    deepEqual(from('123'), ['1', '2', '3']);
    deepEqual(from(function(){
      return arguments;
    }(1, 2, 3)), [1, 2, 3]);
    from(al = function(){
      return arguments;
    }(1), function(val, key, that){
      ok(this === ctx);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    }, ctx = {});
    deepEqual(from(function(){
      return arguments;
    }(1, 2, 3), (function(it){
      return Math.pow(it, 2);
    })), [1, 4, 9]);
  });
  test('Array.of', function(){
    ok(isFunction(Array.of));
    deepEqual(Array.of(1), [1]);
    deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  });
  test('Array::fill', function(){
    ok(isFunction(Array.prototype.fill));
    deepEqual(Array(5).fill(5), [5, 5, 5, 5, 5]);
    deepEqual(Array(5).fill(5, 1), [void 8, 5, 5, 5, 5]);
    deepEqual(Array(5).fill(5, 1, 4), [void 8, 5, 5, 5, void 8]);
    deepEqual(Array(5).fill(5, 6, 1), [void 8, void 8, void 8, void 8, void 8]);
    deepEqual(Array(5).fill(5, -3, 4), [void 8, void 8, 5, 5, void 8]);
  });
  test('Array::find', function(){
    var arr, ctx;
    ok(isFunction(Array.prototype.find));
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
    ok(isFunction(Array.prototype.findIndex));
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
  var isFunction, isNative, getOwnPropertyDescriptor;
  isFunction = Function.isFunction, isNative = Function.isNative;
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  test('Map', function(){
    ok(isFunction(global.Map), 'Map is function');
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
    ok(isFunction(Map.prototype.clear), 'Map::clear is function');
    M = new Map().set(1, 2).set(2, 3).set(1, 4);
    M.clear();
    ok(M.size === 0);
  });
  test('Map::delete', function(){
    var a, M;
    ok(isFunction(Map.prototype['delete']), 'Map::delete is function');
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
    ok(isFunction(Map.prototype.forEach), 'Map::forEach is function');
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
    ok(isFunction(Map.prototype.get), 'Map::get is function');
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
    ok(isFunction(Map.prototype.has), 'Map::has is function');
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
    ok(isFunction(Map.prototype.set), 'Map::set is function');
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
    ok(isFunction(global.Set), 'Set is function');
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
    ok(isFunction(Set.prototype.add), 'Set::add is function');
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
    ok(isFunction(Set.prototype.clear), 'Set::clear is function');
    S = new Set([1, 2, 3, 2, 1]);
    S.clear();
    ok(S.size === 0);
  });
  test('Set::delete', function(){
    var a, S;
    ok(isFunction(Set.prototype['delete']), 'Set::delete is function');
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
    ok(isFunction(Set.prototype.forEach), 'Set::forEach is function');
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
    ok(isFunction(Set.prototype.has), 'Set::has is function');
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
    ok(isFunction(global.WeakMap), 'WeakMap is function');
    ok('clear' in WeakMap.prototype, 'clear in WeakMap.prototype');
    ok('delete' in WeakMap.prototype, 'delete in WeakMap.prototype');
    ok('get' in WeakMap.prototype, 'get in WeakMap.prototype');
    ok('has' in WeakMap.prototype, 'has in WeakMap.prototype');
    ok('set' in WeakMap.prototype, 'set in WeakMap.prototype');
    ok(new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap');
  });
  test('WeakMap::clear', function(){
    var M, a, b;
    ok(isFunction(WeakMap.prototype.clear), 'WeakMap::clear is function');
    M = new WeakMap().set(a = {}, 42).set(b = {}, 21);
    ok(M.has(a) && M.has(b), 'WeakMap has values before .delete()');
    M.clear();
    ok(!M.has(a) && !M.has(b), 'WeakMap has`nt values after .clear()');
  });
  test('WeakMap::delete', function(){
    var M, a, b;
    ok(isFunction(WeakMap.prototype['delete'], 'WeakMap::delete is function'));
    M = new WeakMap().set(a = {}, 42).set(b = {}, 21);
    ok(M.has(a) && M.has(b), 'WeakMap has values before .delete()');
    M['delete'](a);
    ok(!M.has(a) && M.has(b), 'WeakMap has`nt value after .delete()');
  });
  test('WeakMap::get', function(){
    var M, a;
    ok(isFunction(WeakMap.prototype.get, 'WeakMap::get is function'));
    M = new WeakMap();
    ok(M.get({}) === void 8, 'WeakMap .get() before .set() return undefined');
    M.set(a = {}, 42);
    ok(M.get(a) === 42, 'WeakMap .get() return value');
    M['delete'](a);
    ok(M.get(a) === void 8, 'WeakMap .get() after .delete() return undefined');
  });
  test('WeakMap::has', function(){
    var M, a;
    ok(isFunction(WeakMap.prototype.has, 'WeakMap::has is function'));
    M = new WeakMap();
    ok(M.has({}) === false, 'WeakMap .has() before .set() return false');
    M.set(a = {}, 42);
    ok(M.has(a), 'WeakMap .has() return true');
    M['delete'](a);
    ok(M.has(a) === false, 'WeakMap .has() after .delete() return false');
  });
  test('WeakMap::set', function(){
    var a, e;
    ok(isFunction(WeakMap.prototype.set, 'WeakMap.prototype.set is function'));
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
    ok(isFunction(global.WeakSet), 'WeakSet is function');
    ok('add' in WeakSet.prototype, 'add in WeakSet.prototype');
    ok('clear' in WeakSet.prototype, 'clear in WeakSet.prototype');
    ok('delete' in WeakSet.prototype, 'delete in WeakSet.prototype');
    ok('has' in WeakSet.prototype, 'has in WeakSet.prototype');
    ok(new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet');
    ok(new WeakSet([a = {}]).has(a), 'Init WeakSet from array');
  });
  test('WeakSet::add', function(){
    var a, e;
    ok(isFunction(WeakSet.prototype.add, 'WeakSet.prototype.add is function'));
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
    ok(isFunction(WeakSet.prototype.clear, 'WeakSet::clear is function'));
    M = new WeakSet().add(a = {}).add(b = {});
    ok(M.has(a) && M.has(b), 'WeakSet has values before .clear()');
    M.clear();
    ok(!M.has(a) && !M.has(b), 'WeakSet has`nt values after .clear()');
  });
  test('WeakSet::delete', function(){
    var M, a, b;
    ok(isFunction(WeakSet.prototype['delete'], 'WeakSet::delete is function'));
    M = new WeakSet().add(a = {}).add(b = {});
    ok(M.has(a) && M.has(b), 'WeakSet has values before .delete()');
    M['delete'](a);
    ok(!M.has(a) && M.has(b), 'WeakSet has`nt value after .delete()');
  });
  test('WeakSet::has', function(){
    var M, a;
    ok(isFunction(WeakSet.prototype.has, 'WeakSet::has is function'));
    M = new WeakSet();
    ok(!M.has({}), 'WeakSet has`nt value');
    M.add(a = {});
    ok(M.has(a), 'WeakSet has value after .add()');
    M['delete'](a);
    ok(!M.has(a), 'WeakSet has`nt value after .delete()');
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Function.isFunction;
  test('Object.getPropertyDescriptor', function(){
    var getPropertyDescriptor, create;
    getPropertyDescriptor = Object.getPropertyDescriptor, create = Object.create;
    ok(isFunction(getPropertyDescriptor));
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
    ok(isFunction(getOwnPropertyDescriptors));
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
  test('Object.getPropertyDescriptors', function(){
    var getPropertyDescriptors, make, descs;
    getPropertyDescriptors = Object.getPropertyDescriptors, make = Object.make;
    ok(isFunction(getPropertyDescriptors));
    descs = getPropertyDescriptors(make({
      q: 1
    }, {
      w: 2
    }), 'q');
    deepEqual(descs.q, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1
    });
    deepEqual(descs.w, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 2
    });
  });
  test('Object.getPropertyNames', function(){
    var getPropertyNames, names;
    getPropertyNames = Object.getPropertyNames;
    ok(isFunction(getPropertyNames));
    names = getPropertyNames({
      q: 1
    });
    ok(in$('q', names));
    ok(in$('toString', names));
    ok(!in$('w', names));
  });
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);

(function(){
  var isObject, isFunction, toString$ = {}.toString, join$ = [].join;
  isObject = Object.isObject;
  isFunction = Function.isFunction;
  test('Function.inherits', function(){
    var inherits, A, B;
    inherits = Function.inherits;
    ok(isFunction(inherits));
    A = function(){};
    B = function(){};
    B.prototype.prop = 42;
    inherits(B, A);
    ok(new B instanceof B);
    ok(new B instanceof A);
    ok(new B().prop === 42);
    ok(new B().constructor === B);
  });
  test('Function.isFunction', function(){
    var isFunction;
    isFunction = Function.isFunction;
    ok(typeof isFunction === 'function');
    ok(isFunction(function(){}));
    ok(!isFunction(void 8));
    ok(!isFunction(null));
    ok(!isFunction(1));
    ok(!isFunction(''));
    ok(!isFunction(false));
    ok(!isFunction({}));
    ok(!isFunction(function(){
      return arguments;
    }()));
    ok(!isFunction([1]));
    ok(!isFunction(/./));
  });
  test('Function.isNative', function(){
    var isNative;
    isNative = Function.isNative;
    ok(isFunction(isNative));
    ok(isNative(Object.prototype.hasOwnProperty));
    ok(!isNative(void 8));
    ok(!isNative(null));
    ok(!isNative(1));
    ok(!isNative(''));
    ok(!isNative(false));
    ok(!isNative({}));
    ok(!isNative(function(){
      return arguments;
    }()));
    ok(!isNative([1]));
    ok(!isNative(/./));
    ok(!isNative(function(){}));
  });
  test('Function::methodize', function(){
    var num;
    ok(isFunction(Function.prototype.methodize));
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
  test('Function::part', function(){
    var obj, $, fn, part;
    ok(isFunction(Function.prototype.part));
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
    $ = Function._;
    fn = function(){
      return Array.map(arguments, String).join(' ');
    };
    part = fn.part($, 'Саша', $, 'шоссе', $, 'сосала');
    ok(isFunction(part), '.part with placeholders return function');
    ok(part('Шла', 'по') === 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders');
    ok(part('Шла', 'по', 'и') === 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders');
    ok(part('Шла', 'по', 'и', 'сушку') === 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders');
  });
  test('Function::only', function(){
    var fn;
    ok(isFunction(Function.prototype.only));
    fn = function(){
      return join$.call(arguments, '');
    };
    ok(fn.only(2)('a', 'b', 'c') === 'ab');
    ok(fn.only(2)() === '');
    fn = function(){
      return this + join$.call(arguments, '');
    };
    ok(fn.only(2, 'x')('a', 'b', 'c') === 'xab');
  });
  test('Function::invoke', function(){
    var C;
    ok(isFunction(Function.prototype.invoke));
    C = (function(){
      C.displayName = 'C';
      var prototype = C.prototype, constructor = C;
      function C(a, b){
        this.a = a;
        this.b = b;
      }
      return C;
    }());
    ok(C.invoke() instanceof C);
    deepEqual(C.invoke([1, 2]), new C(1, 2));
  });
  asyncTest('Function::timeout', 7, function(){
    var timeout, val;
    ok(isFunction(Function.prototype.timeout));
    timeout = function(it){
      ok(val === 1);
      return ok(it === 42);
    }.timeout(1, 42).run();
    ok(isObject(timeout));
    ok(isFunction(timeout.run));
    ok(isFunction(timeout.stop));
    val = 1;
    (function(){
      return ok(false);
    }).timeout(1).run().stop();
    setTimeout(function(){
      ok(true);
      return start();
    }, 20);
  });
  asyncTest('Function::interval', 10, function(){
    var i, interval;
    ok(isFunction(Function.prototype.interval));
    interval = function(it){
      ok(i < 4);
      ok(it === 42);
      if (i === 3) {
        interval.stop();
        start();
      }
      return i = i + 1;
    }.interval(1, 42).run();
    ok(isObject(interval));
    ok(isFunction(interval.run));
    ok(isFunction(interval.stop));
    i = 1;
  });
  asyncTest('Function::immediate', 7, function(){
    var immediate, val;
    ok(isFunction(Function.prototype.immediate));
    immediate = function(it){
      ok(val === 1);
      return ok(it === 42);
    }.immediate(42).run();
    ok(isObject(immediate));
    ok(isFunction(immediate.run));
    ok(isFunction(immediate.stop));
    val = 1;
    (function(){
      return ok(false);
    }).immediate().run().stop();
    setTimeout(function(){
      ok(true);
      return start();
    }, 20);
  });
  test('Function::inherits', function(){
    var A, B;
    ok(isFunction(Function.prototype.inherits));
    A = function(){};
    B = function(){};
    B.prototype.prop = 42;
    B.inherits(A);
    ok(new B instanceof B);
    ok(new B instanceof A);
    ok(new B().prop === 42);
    ok(new B().constructor === B);
  });
}).call(this);

(function(){
  test('global', function(){
    ok(typeof global != 'undefined' && global !== null);
    ok(global.global === global);
    global.__tmp__ = {};
    ok(__tmp__ === global.__tmp__);
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Function.isFunction;
  test('Number.toInteger', function(){
    var toInteger;
    toInteger = Number.toInteger;
    ok(isFunction(toInteger));
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
    ok(isFunction(Number.prototype.times));
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
    ok(isFunction(Number.prototype.random));
    ok(100 .times(function(){
      return 10 .rand();
    }).every(function(it){
      return 0 <= it && it <= 10;
    }));
    ok(100 .times(function(){
      return 10 .rand(7);
    }).every(function(it){
      return 7 <= it && it <= 10;
    }));
    ok(100 .times(function(){
      return 7 .rand(10);
    }).every(function(it){
      return 7 <= it && it <= 10;
    }));
  });
  test('Number::rand', function(){
    ok(isFunction(Number.prototype.rand));
    ok(100 .times(function(){
      return 10 .rand();
    }).every((function(it){
      return it === 0 || it === 1 || it === 2 || it === 3 || it === 4 || it === 5 || it === 6 || it === 7 || it === 8 || it === 9 || it === 10;
    })));
    ok(100 .times(function(){
      return 10 .rand(7);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
    ok(100 .times(function(){
      return 7 .rand(10);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
  });
  /*
  test 'Number::isOdd' !->
    ok isFunction Number::isOdd
    ok 1.isOdd!
    ok 111.isOdd!
    ok (-1)isOdd!
    ok not NaN.isOdd!
    ok not Infinity.isOdd!
    ok not (-1.5)isOdd!
    ok not (1.5)isOdd!
    ok not 2.isOdd!
    ok not 222.isOdd!
  test 'Number::isEven' !->
    ok isFunction Number::isEven
    ok 2.isEven!
    ok 222.isEven!
    ok (-2)isEven!
    ok not NaN.isEven!
    ok not Infinity.isEven!
    ok not (-1.5)isEven!
    ok not (1.5)isEven!
    ok not 1.isEven!
    ok not 111.isEven!
  test 'Number::format' !->
    ok isFunction Number::format
    ok NaN.format! is \NaN
    ok (-Infinity)format! is \-Infinity
    ok 123.format! is \123
    ok (-123)format! is \-123
    ok 123.45.format! is \123
    ok (-123.45)format! is \-123
    ok NaN.format(3) is \NaN
    ok (-Infinity)format(3) is \-Infinity
    ok NaN.format(7 ', ' '. ') is \NaN
    ok (-Infinity)format(7 ', ' '. ') is \-Infinity
    ok 123.format(3) is '123.000'
    ok (-123)format(3) is '-123.000'
    ok 123.45678.format(3) is '123.457'
    ok (-123.45678)format(3) is '-123.457'
    ok 1234.format(7 ', ' '. ') is '1, 234. 000, 000, 0'
    ok (-1234)format(7 ', ' '. ') is '-1, 234. 000, 000, 0'
    ok 1234.45678.format(7 ', ' '. ') is '1, 234. 456, 780, 0'
    ok (-1234.45678)format(7 ', ' '. ') is '-1, 234. 456, 780, 0'
    ok (-1234.45678)format(null ', ' '. ') is '-1, 234'
    ok (0.1 ^ 10)format(6 \. \,) is '0,000.000'
  */
  test('Number:: <<< Math', function(){
    ok(isFunction(Number.prototype.round));
    ok(isFunction(Number.prototype.floor));
    ok(isFunction(Number.prototype.ceil));
    ok(isFunction(Number.prototype.abs));
    ok(isFunction(Number.prototype.sin));
    ok(isFunction(Number.prototype.asin));
    ok(isFunction(Number.prototype.cos));
    ok(isFunction(Number.prototype.acos));
    ok(isFunction(Number.prototype.tan));
    ok(isFunction(Number.prototype.atan));
    ok(isFunction(Number.prototype.exp));
    ok(isFunction(Number.prototype.pow));
    ok(isFunction(Number.prototype.sqrt));
    ok(isFunction(Number.prototype.max));
    ok(isFunction(Number.prototype.min));
    ok(isFunction(Number.prototype.pow));
    ok(isFunction(Number.prototype.atan2));
    ok(isFunction(Number.prototype.acosh));
    ok(isFunction(Number.prototype.asinh));
    ok(isFunction(Number.prototype.atanh));
    ok(isFunction(Number.prototype.cbrt));
    ok(isFunction(Number.prototype.cosh));
    ok(isFunction(Number.prototype.expm1));
    ok(isFunction(Number.prototype.hypot));
    ok(isFunction(Number.prototype.imul));
    ok(isFunction(Number.prototype.log1p));
    ok(isFunction(Number.prototype.log10));
    ok(isFunction(Number.prototype.log2));
    ok(isFunction(Number.prototype.sign));
    ok(isFunction(Number.prototype.sinh));
    ok(isFunction(Number.prototype.tanh));
    ok(isFunction(Number.prototype.trunc));
  });
}).call(this);

(function(){
  var isFunction, isNative, getPrototypeOf, create, defineProperty, getOwnPropertyDescriptor, toString$ = {}.toString;
  isFunction = Function.isFunction, isNative = Function.isNative;
  getPrototypeOf = Object.getPrototypeOf, create = Object.create, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  test('Object.has', function(){
    var has;
    has = Object.has;
    ok(isFunction(has));
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
  test('Object.isEnumerable', function(){
    var isEnumerable;
    isEnumerable = Object.isEnumerable;
    ok(isFunction(isEnumerable));
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
    ok(isFunction(isPrototype));
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
    ok(isFunction(classof));
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
  });
  test('Object.tie', function(){
    var tie, array, push;
    tie = Object.tie;
    ok(isFunction(tie));
    array = [1, 2, 3];
    push = tie(array, 'push');
    ok(isFunction(push));
    ok(push(4) === 4);
    return deepEqual(array, [1, 2, 3, 4]);
  });
  test('Object.make', function(){
    var make, object, foo;
    make = Object.make;
    ok(isFunction(make));
    object = make(foo = {
      q: 1
    }, {
      w: 2
    });
    ok(getPrototypeOf(object) === foo);
    ok(object.w === 2);
  });
  test('Object.plane', function(){
    var plane, foo;
    plane = Object.plane;
    ok(isFunction(plane));
    foo = plane({
      q: 1,
      w: 2
    });
    ok(getPrototypeOf(foo) === null);
    ok(foo.q === 1);
    ok(foo.w === 2);
  });
  test('Object.mixin', function(){
    var mixin, foo, foo2;
    mixin = Object.mixin;
    ok(isFunction(mixin));
    foo = {
      q: 1
    };
    ok(foo === mixin(foo, {
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
      mixin(foo, foo2);
      ok(foo.w === 2);
    }
  });
  (function(){
    var clone;
    clone = Object.clone;
    test('Object.clone(primitive)', function(){
      ok(clone(null) === null);
      ok(clone(void 8) === void 8);
      ok(clone('qwe') === 'qwe');
      ok(clone(123), 123);
      ok(!clone(false));
    });
    test('Object.clone(Object(String|Number|Boolean))', function(){
      var i1, i2;
      i1 = new String('qwe');
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i1.valueOf() === i2.valueOf());
      i1 = new Number(123);
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i1.valueOf() === i2.valueOf());
      i1 = new Boolean(false);
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2.valueOf() === false);
    });
    test('Object.clone(Date)', function(){
      var i1, i2;
      i1 = new Date(1350861246986);
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2.getTime() === 1350861246986);
    });
    test('Object.clone(RegExp)', function(){
      var i1, i2;
      i1 = /q/i;
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2.toString() === '/q/i');
      ok(i2.test('Q'));
    });
    test('simple Object.clone(Array)', function(){
      var i1, i2;
      i1 = [1, 2, 3];
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2[2] === 3);
      ok(i2.length === 3);
      ok(i2.constructor === Array);
      ok(Array.isArray(i2));
    });
    test('simple Object.clone(Object)', function(){
      var i1, i2;
      i1 = {
        q: 123,
        w: 'qwe'
      };
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2.q === 123);
      ok(i2.w === 'qwe');
      i1 = {
        q: {}
      };
      i2 = clone(i1);
      ok(i1.q === i2.q);
    });
    test('deep Object.clone(Object)', function(){
      var i1, i2;
      i1 = {
        q: {
          q: 1
        }
      };
      i2 = clone(i1, 1);
      ok(i1.q !== i2.q);
      ok(i1.q.q === i2.q.q);
    });
    test('deep Object.clone(Array)', function(){
      var i1, i2;
      i1 = [/^qwe$/];
      i2 = clone(i1, 1);
      ok(i1[0] !== i2[0]);
      ok(i2[0].test('qwe'));
      ok(!i2[0].test('qwer'));
    });
    test('deep Object.clone(instance)', function(){
      var fn, i1, i2;
      fn = function(){
        return this.q = 1;
      };
      i1 = new fn;
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2.q === 1);
      ok(getPrototypeOf(i1) === getPrototypeOf(i2));
      i1 = create({
        q: 1
      });
      i2 = clone(i1);
      ok(i1 !== i2);
      ok(i2.q === 1);
      ok(getPrototypeOf(i1) === getPrototypeOf(i2));
    });
    if (Function.isNative(Object.getOwnPropertyDescriptor)) {
      test('deep Object.clone without descriptors', function(){
        var i1, i2;
        i1 = {
          q: defineProperty({}, 'q', {
            get: function(){
              return 42;
            },
            enumerable: true
          })
        };
        i2 = clone(i1, 1, 0);
        ok(i1.q !== i2.q);
        ok(i2.q.q === 42);
        ok(getOwnPropertyDescriptor(i2.q, 'q').get === void 8);
      });
      test('deep Object.clone with descriptors', function(){
        var i1, i2;
        i1 = {
          q: defineProperty({}, 'q', {
            get: function(){
              return 52;
            }
          })
        };
        i2 = clone(i1, 1, 1);
        ok(i1.q !== i2.q);
        ok(i2.q.q === 52);
        ok(typeof getOwnPropertyDescriptor(i2.q, 'q').get === 'function');
      });
    }
  })();
  (function(){
    var merge, fn, obj;
    merge = Object.merge;
    fn = (function(){
      fn.displayName = 'fn';
      var prototype = fn.prototype, constructor = fn;
      prototype.w = {
        q: 1,
        w: 2
      };
      prototype.q = 1;
      prototype.e = 2;
      function fn(){}
      return fn;
    }());
    obj = {
      w: {
        q: 2,
        e: 5
      },
      r: 1,
      e: 1
    };
    test('Object.merge', function(){
      ok(isFunction(merge));
    });
    test('simple Object.merge', function(){
      var i1, i2;
      i1 = new fn;
      i2 = merge(i1, obj);
      ok(i1 === i2);
      ok(i1.q === 1);
      ok(i1.r === 1);
      ok(i1.w === obj.w);
      ok(i1.e === 1);
    });
    test('deep Object.merge', function(){
      var i1;
      i1 = merge(new fn, obj, 1);
      ok(i1.q === 1);
      ok(i1.r === 1);
      ok(i1.w !== obj.w);
      ok(i1.w.q === 2);
      ok(i1.w.w === 2);
    });
    test('reverse Object.merge', function(){
      var i1;
      i1 = merge({
        w: {
          q: 1,
          w: 2
        },
        q: 1,
        e: 2
      }, obj, 0, 1);
      ok(i1.q === 1);
      ok(i1.r === 1);
      ok(i1.e === 2);
      ok(i1.w.q === 1);
      ok(i1.w.w === 2);
      ok(i1.w.e !== 5);
    });
    return test('reverse deep Object.merge', function(){
      var i1;
      i1 = merge({
        w: {
          q: 1,
          w: 2
        },
        q: 1,
        e: 2
      }, obj, 1, 1);
      ok(i1.q === 1);
      ok(i1.r === 1);
      ok(i1.e === 2);
      ok(i1.w.q === 1);
      ok(i1.w.w === 2);
      ok(i1.w.e === 5);
    });
  })();
  test('Object.defaults', function(){
    var defaults, obj;
    defaults = Object.defaults;
    ok(isFunction(defaults));
    obj = defaults({
      q: 1,
      w: {
        q: 1
      }
    }, {
      q: 2,
      w: {
        w: 2
      },
      e: 3
    });
    ok(obj.q === 1);
    ok(obj.w.q === 1);
    ok(obj.w.w === 2);
    ok(obj.e === 3);
  });
  test('Object.values', function(){
    var values;
    values = Object.values;
    ok(isFunction(values));
    ok(values({
      q: 1,
      w: 2,
      e: 3
    }).length === 3);
    ok(~values({
      q: 1,
      w: 2,
      e: 3
    }).indexOf(3));
  });
  test('Object.invert', function(){
    var invert;
    invert = Object.invert;
    ok(isFunction(invert));
    deepEqual(invert({
      q: 'a',
      w: 's',
      e: 'd'
    }), {
      a: 'q',
      s: 'w',
      d: 'e'
    });
  });
  test('Object.every', function(){
    var every, obj, ctx;
    every = Object.every;
    ok(isFunction(every));
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
  test('Object.filter', function(){
    var filter, plane, obj, ctx;
    filter = Object.filter, plane = Object.plane;
    ok(isFunction(filter));
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
    }), plane({
      q: 1,
      e: 3
    }));
  });
  test('Object.find', function(){
    var find, obj, ctx;
    find = Object.find;
    ok(isFunction(find));
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
  test('Object.findIndex', function(){
    var findIndex, obj, ctx;
    findIndex = Object.findIndex;
    ok(isFunction(findIndex));
    findIndex(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    ok(findIndex({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return it === 2;
    }) === 'w');
  });
  test('Object.forEach', function(){
    var forEach, make, obj, ctx, rez;
    forEach = Object.forEach, make = Object.make;
    ok(isFunction(forEach));
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
    forEach(make({
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
  test('Object.indexOf', function(){
    var indexOf;
    indexOf = Object.indexOf;
    ok(isFunction(indexOf));
    ok(indexOf({
      q: 1,
      w: 2,
      e: 3
    }, 2) === 'w');
    ok(indexOf({
      q: 1,
      w: 2,
      e: 3
    }, 4) === void 8);
    ok(indexOf({
      q: 1,
      w: 2,
      e: NaN
    }, NaN) === 'e');
  });
  test('Object.map', function(){
    var map, plane, obj, ctx;
    map = Object.map, plane = Object.plane;
    ok(isFunction(map));
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
    })), plane({
      q: 1,
      w: 4,
      e: 9
    }));
  });
  test('Object.reduce', function(){
    var reduce, obj, foo, memo;
    reduce = Object.reduce;
    ok(isFunction(reduce));
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
  test('Object.some', function(){
    var some, obj, ctx;
    some = Object.some;
    ok(isFunction(some));
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
  test('Object.pluck', function(){
    var pluck, plane;
    pluck = Object.pluck, plane = Object.plane;
    ok(isFunction(pluck));
    deepEqual(pluck({
      q: 1,
      w: 22,
      e: 333
    }, 'length'), plane({
      q: void 8,
      w: void 8,
      e: void 8
    }));
    deepEqual(pluck({
      q: 1,
      w: 22,
      e: void 8
    }, 'length'), plane({
      q: void 8,
      w: void 8,
      e: void 8
    }));
    deepEqual(pluck({
      q: '1',
      w: '22',
      e: '333'
    }, 'length'), plane({
      q: 1,
      w: 2,
      e: 3
    }));
  });
  test('Object.reduceTo', function(){
    var reduceTo, plane, obj;
    reduceTo = Object.reduceTo, plane = Object.plane;
    ok(isFunction(reduceTo));
    reduceTo(obj = {
      q: 1
    }, function(val, key, that){
      deepEqual(this, plane());
      ok(val === 1);
      ok(key === 'q');
      return ok(that === obj);
    });
    reduceTo({
      q: 1
    }, obj = {}, function(){
      return ok(this === obj);
    });
    deepEqual(reduceTo({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return this[it] = it;
    }), plane({
      1: 1,
      2: 2,
      3: 3
    }));
  });
  test('Object.isObject', function(){
    var isObject;
    isObject = Object.isObject;
    ok(isFunction(isObject));
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
  test('Object.isEqual', function(){
    var isEqual, a, b;
    isEqual = Object.isEqual;
    ok(isFunction(isEqual));
    ok(isEqual(1, 1));
    ok(!isEqual(1, 2));
    ok(!isEqual(0, -0));
    ok(isEqual({}, {}));
    ok(isEqual({
      q: 1
    }, {
      q: 1
    }));
    ok(!isEqual({
      q: 1
    }, {}));
    ok(!isEqual({}, []));
    ok(isEqual({
      q: 1,
      w: {
        q: 1
      }
    }, {
      q: 1,
      w: {
        q: 1
      }
    }));
    ok(!isEqual({
      q: 1,
      w: {
        q: 1
      }
    }, {
      q: 1,
      w: {
        q: 1,
        w: 2
      }
    }));
    a = {
      y: 1
    };
    a.x = a;
    b = {
      y: 1
    };
    b.x = b;
    ok(isEqual(a, b));
  });
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
}).call(this);

(function(){
  var isFunction;
  isFunction = Function.isFunction;
  test('Promise constructor', function(){
    ok(isFunction(global.Promise), 'Promise is function');
    ok(Promise.length === 1, 'Promise.length is 1');
  });
  test('Promise.all', function(){
    ok(isFunction(Promise.all), 'Promise.all is function');
  });
  test('Promise.race', function(){
    ok(isFunction(Promise.race), 'Promise.race is function');
  });
  test('Promise.resolve', function(){
    ok(isFunction(Promise.resolve), 'Promise.resolve is function');
  });
  test('Promise.reject', function(){
    ok(isFunction(Promise.reject), 'Promise.reject is function');
  });
  test('Promise.cast', function(){
    ok(isFunction(Promise.cast), 'Promise.cast is function');
  });
  test('Promise::then', function(){
    ok(isFunction(Promise.prototype.then), 'Promise::then is function');
  });
  test('Promise::catch', function(){
    ok(isFunction(Promise.prototype['catch']), 'Promise::catch is function');
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Function.isFunction;
  test('String::at', function(){
    ok(isFunction(String.prototype.at));
    ok(''.at(-1) === '');
    ok(''.at(void 8) === '');
    ok('qwerty'.at(0) === 'q');
    ok('qwerty'.at(5) === 'y');
    ok('qwerty'.at(-1) === 'y');
    ok('qwerty'.at(-6) === 'q');
    ok('qwerty'.at(6) === '');
    ok('qwerty'.at(-7) === '');
  });
  test('String::escapeHTML', function(){
    ok(isFunction(String.prototype.escapeHTML));
    ok('qwe, asd'.escapeHTML() === 'qwe, asd');
    ok('<div>qwe</div>'.escapeHTML() === '&lt;div&gt;qwe&lt;&#x2f;div&gt;');
    ok("&<>\"'/".escapeHTML() === '&amp;&lt;&gt;&quot;&apos;&#x2f;');
  });
  test('String::unescapeHTML', function(){
    ok(isFunction(String.prototype.unescapeHTML));
    ok('qwe, asd'.unescapeHTML() === 'qwe, asd');
    ok('&lt;div&gt;qwe&lt;&#x2f;div&gt;'.unescapeHTML() === '<div>qwe</div>');
    ok('&amp;&lt;&gt;&quot;&apos;&#x2f;'.unescapeHTML() === "&<>\"'/");
  });
  test('String::escapeURL', function(){
    ok(isFunction(String.prototype.escapeURL));
  });
  test('String::unescapeURL', function(){
    ok(isFunction(String.prototype.unescapeURL));
  });
  test('String::escapeRegExp', function(){
    ok(isFunction(String.prototype.escapeRegExp));
    ok('qwe asd'.escapeRegExp() === 'qwe asd');
    ok('\\/\'*+?|()[]{}.^$'.escapeRegExp() === "\\\\\\/\\'\\*\\+\\?\\|\\(\\)\\[\\]\\{\\}\\.\\^\\$");
  });
}).call(this);

(function(){
  var isFunction, bzzzzz, slice$ = [].slice;
  isFunction = Function.isFunction;
  asyncTest('setTimeout / clearTimeout', 2, function(){
    global.setTimeout(function(b, c){
      ok(b + c === 'bc');
    }, 1, 'b', 'c');
    clearTimeout(partialize$.apply(global, [
      global.setTimeout, [
        void 8, 1, function(){
          ok(false);
        }
      ], [0]
    ]));
    global.setTimeout(function(){
      ok(true);
      start();
    }, 20);
  });
  asyncTest('setInterval / clearInterval', 6, function(){
    var i, interval;
    i = 1;
    interval = global.setInterval(function(it){
      ok(i < 4);
      ok(it === 42);
      if (i === 3) {
        clearInterval(interval);
        start();
      }
      i = i + 1;
    }, 1, 42);
  });
  asyncTest('setImmediate / clearImmediate', 6, function(){
    var tmp1, id, tmp2, tmp3, tmp4;
    ok(isFunction(global.setImmediate), 'setImmediate is function');
    ok(isFunction(global.clearImmediate), 'clearImmediate is function');
    id = setImmediate(function(){
      tmp1 = 42;
    });
    ok(tmp1 === void 8, 'setImmediate is async');
    setImmediate(function(){
      tmp2 = true;
    });
    setTimeout(function(){
      ok(tmp2, 'setImmediate works');
    }, 20);
    setImmediate(function(b, c){
      tmp3 = b + c;
    }, 'b', 'c');
    setTimeout(function(){
      ok(tmp3 === 'bc', 'setImmediate works with additional params');
    }, 20);
    clearImmediate(setImmediate(function(){
      tmp4 = 42;
    }));
    setTimeout(function(){
      ok(tmp4 === void 8, 'clearImmediate works');
    }, 20);
    setTimeout(start, 50);
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
