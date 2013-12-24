(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('Array::at', function(){
    ok(isFunction(Array.prototype.at));
    ok([1, 2, 3].at(0) === 1);
    ok([1, 2, 3].at(2) === 3);
    ok([1, 2, 3].at(3) === void 8);
    ok([1, 2, 3].at(-1) === 3);
    ok([1, 2, 3].at(-3) === 1);
    return ok([1, 2, 3].at(-4) === void 8);
  });
  test('Array::props', function(){
    ok(isFunction(Array.prototype.props));
    deepEqual([1, 2, 321].props('length'), [void 8, void 8, void 8]);
    deepEqual([1, 2, void 8].props('length'), [void 8, void 8, void 8]);
    return deepEqual(['1', '2', '321'].props('length'), [1, 1, 3]);
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
    [1].reduceTo(function(){
      return ok(this === obj);
    }, obj = {});
    return deepEqual([3, 2, 1], [1, 2, 3].reduceTo((function(it){
      return this.unshift(it);
    }), []));
  });
  test('Array::indexSame', function(){
    ok(isFunction(Array.prototype.indexSame));
    ok([1, 2, 3, 4, 3, 2, 1].indexSame(3) === 2);
    ok([1, NaN, 3].indexSame(NaN) === 1);
    return ok([0, -0, 42].indexSame(-0) === 1);
  });
  test('Array::merge', function(){
    var arr;
    ok(isFunction(Array.prototype.merge));
    arr = [1, 2, 3];
    ok(arr === arr.merge([4, 5, 6]));
    deepEqual(arr, [1, 2, 3, 4, 5, 6]);
    arr = ['q', 'w', 'e'];
    ok(arr === arr.merge('asd'));
    return deepEqual(arr, ['q', 'w', 'e', 'a', 's', 'd']);
  });
  test('Array::sum', function(){
    ok(isFunction(Array.prototype.sum));
    ok([1, 2, 3].sum() === 6);
    ok(Object.is(['1', '2', 3].sum('length'), NaN));
    return ok(['1', '22', '333'].sum('length') === 6);
  });
  test('Array::avg', function(){
    ok(isFunction(Array.prototype.avg));
    ok([1, 2, 3].avg() === 2);
    ok(Object.is(['1', '22', 3].avg('length'), NaN));
    return ok(['1', '22', '333'].avg('length') === 2);
  });
  test('Array::min', function(){
    ok(isFunction(Array.prototype.min));
    ok([].min() === Infinity);
    ok([1, 2, 3, 2, 1].min() === 1);
    return ok(['1', '22', '333'].min('length') === 1);
  });
  test('Array::max', function(){
    ok(isFunction(Array.prototype.max));
    ok([].max() === -Infinity);
    ok([1, 2, 3, 2, 1].max() === 3);
    return ok(['1', '22', '333'].max('length') === 3);
  });
  test('Array::unique', function(){
    ok(isFunction(Array.prototype.unique));
    return deepEqual([1, 2, 3, 2, 1].unique(), [1, 2, 3]);
  });
  test('Array::cross', function(){
    ok(isFunction(Array.prototype.cross));
    deepEqual([1, 2, 3, 2, 1].cross([2, 5, 7, 1]), [1, 2]);
    deepEqual(['1', '2', '3', '2', '1'].cross('2571'), ['1', '2']);
    return deepEqual([1, 2, 3, 2, 1].cross(function(){
      return arguments;
    }(2, 5, 7, 1)), [1, 2]);
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('Array.concat', function(){
    var concat, arr, result;
    concat = Array.concat;
    ok(isFunction(concat));
    arr = [1, 2, 3];
    ok(arr !== (result = Array.concat(arr, [4, 5, 6])));
    deepEqual(result, [1, 2, 3, 4, 5, 6]);
    arr = ['q', 'w', 'e'];
    ok(arr !== (result = Array.concat(arr, ['a', 's', 'd'])));
    return deepEqual(result, ['q', 'w', 'e', 'a', 's', 'd']);
  });
  test('Array.join', function(){
    var join;
    join = Array.join;
    ok(isFunction(join));
    equal(join('123', '|'), '1|2|3');
    return equal(join(function(){
      return arguments;
    }(3, 2, 1), '|'), '3|2|1');
  });
  test('Array.pop', function(){
    var pop, args;
    pop = Array.pop;
    ok(isFunction(pop));
    equal(pop(args = function(){
      return arguments;
    }(1, 2, 3)), 3);
    return deepEqual(args, function(){
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
    return deepEqual(args, function(){
      return arguments;
    }(1, 2, 3, 4, 5));
  });
  test('Array.reverse', function(){
    var reverse;
    reverse = Array.reverse;
    ok(isFunction(reverse));
    return deepEqual(reverse(function(){
      return arguments;
    }(1, 2, 3)), function(){
      return arguments;
    }(3, 2, 1));
  });
  test('Array.shift', function(){
    var shift, args;
    shift = Array.shift;
    ok(isFunction(shift));
    equal(shift(args = function(){
      return arguments;
    }(1, 2, 3)), 1);
    return deepEqual(args, function(){
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
    return deepEqual(args, function(){
      return arguments;
    }(4, 5, 1, 2, 3));
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
    return deepEqual(slice(function(){
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
    deepEqual(args, function(){
      return arguments;
    }(1, 4, 5, 2, 3));
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 1, 4);
    deepEqual(args, function(){
      return arguments;
    }(1, 4, 3));
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 1);
    return deepEqual(args, function(){
      return arguments;
    }(1, 3));
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
    return deepEqual(sort(function(){
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
    equal(indexOf('111', '1'), 0);
    equal(indexOf('123', '1', 1), -1);
    equal(indexOf('123', '2', 1), 1);
    equal(indexOf(function(){
      return arguments;
    }(1, 1, 1), 1), 0);
    equal(indexOf(function(){
      return arguments;
    }(1, 2, 3), 1, 1), -1);
    return equal(indexOf(function(){
      return arguments;
    }(1, 2, 3), 2, 1), 1);
  });
  test('Array.lastIndexOf', function(){
    var lastIndexOf;
    lastIndexOf = Array.lastIndexOf;
    ok(isFunction(lastIndexOf));
    equal(lastIndexOf('111', '1'), 2);
    equal(lastIndexOf('123', '3', 1), -1);
    equal(lastIndexOf('123', '2', 1), 1);
    equal(lastIndexOf(function(){
      return arguments;
    }(1, 1, 1), 1), 2);
    equal(lastIndexOf(function(){
      return arguments;
    }(1, 2, 3), 3, 1), -1);
    return equal(lastIndexOf(function(){
      return arguments;
    }(1, 2, 3), 2, 1), 1);
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
    ok(every('123', Object.isString));
    ok(every('123', function(){
      return arguments[1] < 3;
    }));
    ok(!every('123', Object.isNumber));
    ok(!every('123', function(){
      return arguments[1] < 2;
    }));
    ok(every('123', function(){
      return arguments[2] == '123';
    }));
    return ok(every(function(){
      return arguments;
    }(1, 2, 3), Object.isNumber));
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
    ok(some('123', Object.isString));
    ok(some('123', function(){
      return arguments[1] > 1;
    }));
    ok(!some('123', Object.isNumber));
    ok(!some('123', function(){
      return arguments[1] > 3;
    }));
    ok(some('123', function(){
      return arguments[2] == '123';
    }));
    return ok(some(function(){
      return arguments;
    }(1, 2, 3), Object.isNumber));
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
      return ok(that === al);
    }, ctx = {});
    val = '';
    forEach('123', function(v, k, t){
      return val += v + k + t;
    });
    equal(val, '101232112332123');
    val = '';
    forEach(function(){
      return arguments;
    }(1, 2, 3), function(v, k, t){
      return val += v + k + t['2'];
    });
    equal(val, '468');
    val = '';
    forEach('123', function(v, k, t){
      return val += v + k + t + this;
    }, 1);
    return equal(val, '101231211231321231');
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
    return deepEqual(map(function(){
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
    return deepEqual(filter('123', function(){
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
    equal(reduce('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }), 6);
    equal(reduce(function(){
      return arguments;
    }(1, 2, 3), function(a, b){
      return '' + b * b + a;
    }), '941');
    return equal(reduce('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }, 1), 7);
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
    equal(reduceRight('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }), 6);
    equal(reduceRight(function(){
      return arguments;
    }(1, 2, 3), function(a, b){
      return '' + b * b + a;
    }), '143');
    return equal(reduceRight('123', function(a, b){
      a = +a;
      b = +b;
      return a + b;
    }, 1), 7);
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
    return ok(find('123', (function(it){
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
    return ok(findIndex('123', (function(it){
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
    ok(at('123', 0) === '1');
    ok(at('123', 2) === '3');
    ok(at('123', 3) === void 8);
    ok(at('123', -1) === '3');
    ok(at('123', -3) === '1');
    return ok(at('123', -4) === void 8);
  });
  test('Array.props', function(){
    var props;
    props = Array.props;
    ok(isFunction(props));
    deepEqual(props(function(){
      return arguments;
    }('1', '22', 3), 'length'), [1, 2, void 8]);
    return deepEqual(props('123', 'length'), [1, 1, 1]);
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
    }(1), function(){
      return ok(this === obj);
    }, obj = {});
    deepEqual([3, 2, 1], reduceTo(function(){
      return arguments;
    }(1, 2, 3), (function(it){
      return this.unshift(it);
    }), []));
    return deepEqual(['3', '2', '1'], reduceTo('123', (function(it){
      return this.unshift(it);
    }), []));
  });
  test('Array.indexSame', function(){
    var indexSame;
    indexSame = Array.indexSame;
    ok(isFunction(indexSame));
    ok(indexSame(function(){
      return arguments;
    }(1, 2, 3, 4, 3, 2, 1), 3) === 2);
    ok(indexSame(function(){
      return arguments;
    }(1, NaN, 3), NaN) === 1);
    ok(indexSame(function(){
      return arguments;
    }(0, -0, 42), -0) === 1);
    return ok(indexSame('1234321', '3') === 2);
  });
  test('Array.merge', function(){
    var merge, arr;
    merge = Array.merge;
    ok(isFunction(merge));
    arr = function(){
      return arguments;
    }(1, 2, 3);
    ok(arr === merge(arr, function(){
      return arguments;
    }(4, 5, 6)));
    return deepEqual(arr, function(){
      return arguments;
    }(1, 2, 3, 4, 5, 6));
  });
  test('Array.sum', function(){
    var sum;
    sum = Array.sum;
    ok(isFunction(sum));
    equal(sum('123'), 6);
    equal(sum('123', 'length'), 3);
    return equal(sum(function(){
      return arguments;
    }(1, 2, 3)), 6);
  });
  test('Array.avg', function(){
    var avg;
    avg = Array.avg;
    ok(isFunction(avg));
    equal(avg('123'), 2);
    equal(avg('123', 'length'), 1);
    return equal(avg(function(){
      return arguments;
    }(1, 2, 3)), 2);
  });
  test('Array.min', function(){
    var min;
    min = Array.min;
    ok(isFunction(min));
    ok(min(function(){
      return arguments;
    }(3, 2, 1, 2, 3)) === 1);
    return ok(min('123', 'length') === 1);
  });
  test('Array.max', function(){
    var max;
    max = Array.max;
    ok(isFunction(max));
    ok(max(function(){
      return arguments;
    }(1, 2, 3, 2, 1)) === 3);
    return ok(max('123', 'length') === 1);
  });
  test('Array.unique', function(){
    var unique;
    unique = Array.unique;
    ok(isFunction(unique));
    deepEqual(unique('12321'), ['1', '2', '3']);
    return deepEqual(unique(function(){
      return arguments;
    }(1, 2, 3, 2, 1)), [1, 2, 3]);
  });
  test('Array.cross', function(){
    var cross;
    cross = Array.cross;
    ok(isFunction(cross));
    deepEqual(cross(function(){
      return arguments;
    }(1, 2, 3, 2, 1), function(){
      return arguments;
    }(2, 5, 7, 1)), [1, 2]);
    return deepEqual(cross(function(){
      return arguments;
    }('1', '2', '3', '2', '1'), function(){
      return arguments;
    }('2', '5', '7', '1')), ['1', '2']);
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('Function.series', function(){
    var series;
    series = Function.series;
    ok(isFunction(series));
    series([
      function(next){
        ok(isFunction(next));
        return next.immediate(42);
      }, function(val, next){
        ok(val === 42);
        ok(isFunction(next));
        return next.immediate(1, 2);
      }, function(a, b){
        ok(a + b === 3);
        return start();
      }
    ]);
    stop();
    series([
      function(next){
        ok(isFunction(next));
        return next.immediate(null, 42);
      }, function(val, next){
        ok(val === 42);
        ok(isFunction(next));
        return next.immediate(43, 1, 2);
      }, function(){
        ok(false);
        return next.immediate(44);
      }
    ], function(err, a, b){
      ok(err === 43);
      ok(a + b === 3);
      return start();
    });
    return stop();
  });
  test('Function.parallel', function(){
    var parallel;
    parallel = Function.parallel;
    ok(isFunction(parallel));
    parallel([
      function(next){
        return next.immediate(null, 1);
      }, function(next){
        return next.immediate(null, 2);
      }, function(next){
        return next.immediate(null, 3);
      }
    ], function(err, result){
      ok(!err);
      deepEqual(result, [1, 2, 3]);
      return start();
    });
    stop();
    parallel([
      function(next){
        return next.immediate(42, 1);
      }, function(next){
        return next.immediate(null, 2);
      }
    ], function(err, result){
      ok(err === 42);
      deepEqual(result, [1, void 8]);
      return start();
    });
    return stop();
  });
  test('Array::asyncMap', function(){
    ok(isFunction(Array.prototype.asyncMap));
    [1, 2, 3].asyncMap(function(val, next){
      return next.immediate(null, Math.pow(val, 2));
    }, function(err, result){
      ok(!err);
      deepEqual(result, [1, 4, 9]);
      return start();
    });
    stop();
    [1, 2, 3].asyncMap(function(val, next){
      return next.immediate(val === 2 ? 42 : null, Math.pow(val, 2));
    }, function(err, result){
      ok(err === 42);
      deepEqual(result, [1, 4, void 8]);
      return start();
    });
    return stop();
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('console', function(){
    var assert, count, clear, debug, dir, dirxml, error, exception, group, groupCollapsed, groupEnd, info, log, table, trace, warn, markTimeline, profile, profileEnd, time, timeEnd, timeStamp, id;
    assert = console.assert, count = console.count, clear = console.clear, debug = console.debug, dir = console.dir, dirxml = console.dirxml, error = console.error, exception = console.exception, group = console.group, groupCollapsed = console.groupCollapsed, groupEnd = console.groupEnd, info = console.info, log = console.log, table = console.table, trace = console.trace, warn = console.warn, markTimeline = console.markTimeline, profile = console.profile, profileEnd = console.profileEnd, time = console.time, timeEnd = console.timeEnd, timeStamp = console.timeStamp;
    ok(isFunction(global.console));
    ok((function(){
      try {
        console('console');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        console.call({}, 'console in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.log));
    equal(console, console.log);
    ok(isFunction(console.warn));
    ok((function(){
      try {
        console.warn('console.warn');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        warn('console.warn in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.error));
    ok((function(){
      try {
        console.error('console.error');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        error('console.error in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.info));
    ok((function(){
      try {
        console.info('console.info');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        info('console.info in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.time));
    ok(isFunction(console.timeEnd));
    ok((function(){
      try {
        console.time(id = 'console.time');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        console.timeEnd(id);
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        time(id = 'console.time in another context');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        timeEnd(id);
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.assert));
    ok((function(){
      try {
        console.assert(false, 'console.assert');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        assert(false, 'console.assert in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.count));
    ok((function(){
      try {
        console.count('console.count');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        count('console.count in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.debug));
    ok((function(){
      try {
        console.debug('console.debug');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        debug('console.debug in another context');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.dir));
    ok((function(){
      try {
        console.dir({
          q: 1,
          w: 2,
          e: 3
        });
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        dir({
          q: 1,
          w: 2,
          e: 3
        });
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.dirxml));
    ok((function(){
      try {
        console.dirxml(typeof document != 'undefined' && document !== null ? document.getElementById('qunit-header') : void 8);
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        dirxml(typeof document != 'undefined' && document !== null ? document.getElementById('qunit-header') : void 8);
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.table));
    ok((function(){
      try {
        console.table([['q', 'w'], ['call', 'console.table']]);
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        table([['q', 'w'], ['call', 'console.table']]);
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.trace));
    ok((function(){
      try {
        console.trace();
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        trace();
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.group));
    ok((function(){
      try {
        console.group(id = 'console.group');
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.groupEnd));
    ok((function(){
      try {
        console.groupEnd(id);
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        group(id = 'console.group in another context');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        groupEnd(id);
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.groupCollapsed));
    ok((function(){
      try {
        console.groupCollapsed(id = 'console.groupCollapsed');
        console.groupEnd(id);
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        groupCollapsed(id = 'console.groupCollapsed in another context');
        groupEnd(id);
        return true;
      } catch (e$) {}
    }()));
    ok(isFunction(console.markTimeline));
    ok(isFunction(console.profile));
    ok(isFunction(console.profileEnd));
    ok((function(){
      try {
        console.profile('profile');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        console.profileEnd('profile');
        return true;
      } catch (e$) {}
    }()));
    ok((function(){
      try {
        profile('profile in another context');
        return true;
      } catch (e$) {}
    }()));
    return ok((function(){
      try {
        profileEnd('profile in another context');
        return true;
      } catch (e$) {}
    }()));
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('Date.locale', function(){
    ok(isFunction(Date.locale));
    Date.locale('ru');
    return equal(Date.locale(), 'ru');
  });
  test('Date.addLocale', function(){
    return ok(isFunction(Date.addLocale));
  });
  test('Date.format', function(){
    ok(isFunction(Date.format));
    return ok(Date.now() - Date.format('ms') > -10);
  });
  test('Date::format', function(){
    var date;
    ok(isFunction(Date.prototype.format));
    date = new Date(1, 2, 3, 4, 5, 6, 7);
    equal(date.format('dd.nn.yyyy'), '03.03.1901');
    Date.locale('en');
    equal(date.format('w, d M yyyy'), 'Sunday, 3 March 1901');
    equal(date.format('w, d M yyyy', 'ru'), 'Воскресенье, 3 Март 1901');
    Date.locale('ru');
    equal(date.format('w, d M yyyy'), 'Воскресенье, 3 Март 1901');
    equal(date.format('d MM'), '3 Марта');
    return equal(date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy yyyy'), '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 1901');
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
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
    return equal(getOwnPropertyDescriptor({}, 'toString'), void 8);
  });
  test('Object.defineProperty', function(){
    var rez, src;
    ok(isFunction(Object.defineProperty));
    equal(rez = Object.defineProperty(src = {}, 'q', {
      value: 42
    }), src);
    return equal(rez.q, 42);
  });
  test('Object.defineProperties', function(){
    var rez, src;
    ok(isFunction(Object.defineProperties));
    equal(rez = Object.defineProperties(src = {}, {
      q: {
        value: 42
      },
      w: {
        value: 33
      }
    }), src);
    return ok(rez.q === 42) && rez.w === 33;
  });
  test('Object.getPrototypeOf', function(){
    var create, getPrototypeOf, fn, obj;
    create = Object.create, getPrototypeOf = Object.getPrototypeOf;
    ok(isFunction(getPrototypeOf));
    equal(getPrototypeOf({}), Object.prototype);
    equal(getPrototypeOf(new (fn = (function(){
      fn.displayName = 'fn';
      var prototype = fn.prototype, constructor = fn;
      function fn(){}
      return fn;
    }()))), fn.prototype);
    equal(getPrototypeOf(create(obj = {
      q: 1
    })), obj);
    equal(getPrototypeOf(create(null)), null);
    return equal(getPrototypeOf(getPrototypeOf({})), null);
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
    return ok(in$('toString', getOwnPropertyNames(Object.prototype)));
  });
  test('Object.create', function(){
    var create, getPrototypeOf, getPropertyNames, isObject, isPrototype, obj, fn;
    create = Object.create, getPrototypeOf = Object.getPrototypeOf, getPropertyNames = Object.getPropertyNames, isObject = Object.isObject, isPrototype = Object.isPrototype;
    ok(isFunction(create));
    ok(isPrototype(obj = {
      q: 1
    }, create(obj)));
    equal(create(obj).q, 1);
    fn = function(){
      return this.a = 1;
    };
    ok(create(new fn) instanceof fn);
    equal(getPrototypeOf(getPrototypeOf(create(new fn))), fn.prototype);
    equal(create(new fn).a, 1);
    equal(create({}, {
      a: {
        value: 42
      }
    }).a, 42);
    ok(isObject(obj = create(null, {
      w: {
        value: 2
      }
    })));
    ok(!('toString' in obj));
    equal(obj.w, 2);
    return deepEqual(getPropertyNames(create(null)), []);
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
    return ok(!in$('toString', keys(Object.prototype)));
  });
  test('Function.prototype.bind', function(){
    var obj;
    ok(isFunction(Function.prototype.bind));
    equal(function(){
      return this.a;
    }.bind(obj = {
      a: 42
    })(), 42);
    equal(new (function(){}.bind(obj))().a, void 8);
    return equal(function(it){
      return it;
    }.bind(null, 42)(), 42);
  });
  test('Array.isArray', function(){
    var isArray;
    isArray = Array.isArray;
    ok(isFunction(Array.isArray));
    ok(!isArray({}));
    ok(!isArray(function(){
      return arguments;
    }()));
    return ok(isArray([]));
  });
  test('Array::indexOf', function(){
    ok(isFunction(Array.prototype.indexOf));
    equal([1, 1, 1].indexOf(1), 0);
    equal([1, 2, 3].indexOf(1, 1), -1);
    equal([1, 2, 3].indexOf(2, 1), 1);
    equal([NaN].indexOf(NaN), -1);
    return equal(Array(2).concat([1, 2, 3]).indexOf(2), 3);
  });
  test('Array::lastIndexOf', function(){
    ok(isFunction(Array.prototype.lastIndexOf));
    equal([1, 1, 1].lastIndexOf(1), 2);
    equal([1, 2, 3].lastIndexOf(3, 1), -1);
    equal([1, 2, 3].lastIndexOf(2, 1), 1);
    equal([NaN].lastIndexOf(NaN), -1);
    return equal([1, 2, 3].concat(Array(2)).lastIndexOf(2), 1);
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
    ok([1, 2, 3].every(Object.isNumber));
    ok([1, 2, 3].every((function(it){
      return it < 4;
    })));
    ok(![1, 2, 3].every((function(it){
      return it < 3;
    })));
    ok(![1, 2, 3].every(Object.isString));
    ok([1, 2, 3].every(function(){
      return +this === 1;
    }, 1));
    rez = '';
    [1, 2, 3].every(function(){
      return rez += arguments[1];
    });
    equal(rez, '012');
    return ok((arr = [1, 2, 3]).every(function(){
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
    ok([1, '2', 3].some(Object.isNumber));
    ok([1, 2, 3].some((function(it){
      return it < 3;
    })));
    ok(![1, 2, 3].some((function(it){
      return it < 0;
    })));
    ok(![1, 2, 3].some(Object.isString));
    ok(![1, 2, 3].some(function(){
      return +this !== 1;
    }, 1));
    rez = '';
    [1, 2, 3].some(function(){
      rez += arguments[1];
      return false;
    });
    equal(rez, '012');
    return ok(!(arr = [1, 2, 3]).some(function(){
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
      return ok(this === ctx);
    }, ctx = {});
    rez = '';
    [1, 2, 3].forEach(function(it){
      return rez += it;
    });
    equal(rez, '123');
    rez = '';
    [1, 2, 3].forEach(function(){
      return rez += arguments[1];
    });
    equal(rez, '012');
    rez = '';
    [1, 2, 3].forEach(function(){
      return rez += arguments[2];
    });
    equal(rez, '1,2,31,2,31,2,3');
    rez = '';
    [1, 2, 3].forEach(function(){
      return rez += this;
    }, 1);
    equal(rez, '111');
    rez = '';
    arr = [];
    arr[5] = '';
    arr.forEach(function(arg$, k){
      return rez += k;
    });
    return equal(rez, '5');
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
    deepEqual([1, 2, 3].map((function(it){
      return it + 1;
    })), [2, 3, 4]);
    deepEqual([1, 2, 3].map(curry$(function(x$, y$){
      return x$ + y$;
    })), [1, 3, 5]);
    deepEqual([1, 2, 3].map(function(){
      return arguments[2][2];
    }), [3, 3, 3]);
    return deepEqual([1, 2, 3].map(function(){
      return +this;
    }, 2), [2, 2, 2]);
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
    return deepEqual([1, 2, 3, 'q', {}, 4, true, 5].filter(Object.isNumber), [1, 2, 3, 4, 5]);
  });
  test('Array::reduce', function(){
    var a;
    ok(isFunction(Array.prototype.reduce));
    ok([5, 4, 3, 2, 1].reduce(curry$(function(x$, y$){
      return x$ - y$;
    })) === -5);
    (a = [1]).reduce(function(memo, val, key, that){
      ok(memo === 42);
      ok(val === 1);
      ok(key === 0);
      return ok(that === a);
    }, 42);
    return [42, 43].reduce(function(it){
      return ok(it === 42);
    });
  });
  test('Array::reduceRight', function(){
    var a;
    ok(isFunction(Array.prototype.reduceRight));
    ok([1, 2, 3, 4, 5].reduceRight(curry$(function(x$, y$){
      return x$ - y$;
    })) === -5);
    (a = [1]).reduceRight(function(memo, val, key, that){
      ok(memo === 42);
      ok(val === 1);
      ok(key === 0);
      return ok(that === a);
    }, 42);
    return [42, 43].reduceRight(function(it){
      return ok(it === 43);
    });
  });
  test('String.prototype.trim', function(){
    ok('trim' in String.prototype);
    return equal('   q w e \n  '.trim(), 'q w e');
  });
  test('Date.now', function(){
    ok(isFunction(Date.now));
    return ok(+new Date - Date.now() < 10);
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
  var isFunction;
  isFunction = Object.isFunction;
  test('Object.assign', function(){
    var assign, defineProperty, foo, foo2;
    assign = Object.assign, defineProperty = Object.defineProperty;
    ok(isFunction(assign));
    foo = {
      q: 1
    };
    ok(foo === assign(foo, {
      w: 2
    }));
    ok(foo.w === 2);
    if (Function.isNative(Object.getOwnPropertyDescriptor)) {
      foo = {
        q: 1
      };
      foo2 = defineProperty({}, 'w', {
        get: function(){
          return this.q + 1;
        }
      });
      assign(foo, foo2);
      return ok(foo.w === void 8);
    }
  });
  test('Object.is', function(){
    ok(isFunction(Object.is));
    ok(Object.is(1, 1));
    ok(!Object.is(0, -0));
    ok(Object.is(NaN, NaN));
    return ok(!Object.is({}, {}));
  });
  test('Object.mixin', function(){
    var mixin, defineProperty, foo, foo2;
    mixin = Object.mixin, defineProperty = Object.defineProperty;
    ok(isFunction(mixin));
    foo = {
      q: 1
    };
    ok(foo === mixin(foo, {
      w: 2
    }));
    ok(foo.w === 2);
    if (Function.isNative(Object.getOwnPropertyDescriptor)) {
      foo = {
        q: 1
      };
      foo2 = defineProperty({}, 'w', {
        get: function(){
          return this.q + 1;
        }
      });
      mixin(foo, foo2);
      return ok(foo.w === 2);
    }
  });
  /*
  if \__proto__ of Object:: or Function.isNative Object.setPrototypeOf
    test 'Object.setPrototypeOf' ->
      {setPrototypeOf} = Object
      ok isFunction setPrototypeOf
      ok \apply of setPrototypeOf {} Function::
      ok setPrototypeOf(a:2, {b: -> @a^2})b! == 4
      ok setPrototypeOf(tmp = {}, {a: 1}) is tmp
      ok !(\toString of setPrototypeOf {} null)
  */
  test('Number.EPSILON', function(){
    ok('EPSILON' in Number);
    equal(Number.EPSILON, 2.220446049250313e-16);
    ok(!(1 === 1 + Number.EPSILON));
    return ok(1 === 1 + Number.EPSILON / 2);
  });
  test('Number.isFinite', function(){
    var isFinite;
    isFinite = Number.isFinite;
    ok(isFunction(isFinite));
    ok(!isFinite(NaN));
    ok(isFinite(1));
    ok(isFinite(0.1));
    ok(isFinite(-1));
    ok(isFinite(Math.pow(2, 16)));
    ok(isFinite(Math.pow(2, 16) - 1));
    ok(isFinite(Math.pow(2, 31)));
    ok(isFinite(Math.pow(2, 31) - 1));
    ok(isFinite(Math.pow(2, 32)));
    ok(isFinite(Math.pow(2, 32) - 1));
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
    return ok(isFinite(-0));
  });
  test('Number.isInteger', function(){
    var isInteger;
    isInteger = Number.isInteger;
    ok(isFunction(isInteger));
    ok(!isInteger(NaN));
    ok(isInteger(1));
    ok(!isInteger(0.1));
    ok(isInteger(-1));
    ok(isInteger(Math.pow(2, 16)));
    ok(isInteger(Math.pow(2, 16) - 1));
    ok(isInteger(Math.pow(2, 31)));
    ok(isInteger(Math.pow(2, 31) - 1));
    ok(isInteger(Math.pow(2, 32)));
    ok(isInteger(Math.pow(2, 32) - 1));
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
    return ok(isInteger(-0));
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
    return ok(!isNaN(-0));
  });
  test('Number.isSafeInteger', function(){
    var isSafeInteger;
    isSafeInteger = Number.isSafeInteger;
    ok(isFunction(isSafeInteger));
    ok(!isSafeInteger(NaN));
    ok(isSafeInteger(1));
    ok(!isSafeInteger(0.1));
    ok(isSafeInteger(-1));
    ok(isSafeInteger(Math.pow(2, 16)));
    ok(isSafeInteger(Math.pow(2, 16) - 1));
    ok(isSafeInteger(Math.pow(2, 31)));
    ok(isSafeInteger(Math.pow(2, 31) - 1));
    ok(isSafeInteger(Math.pow(2, 32)));
    ok(isSafeInteger(Math.pow(2, 32) - 1));
    ok(isSafeInteger(9007199254740991));
    ok(isSafeInteger(-9007199254740991));
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
    return ok(isSafeInteger(-0));
  });
  test('Number.MAX_SAFE_INTEGER', function(){
    return equal(Number.MAX_SAFE_INTEGER, 9007199254740991);
  });
  test('Number.MIN_SAFE_INTEGER', function(){
    return equal(Number.MIN_SAFE_INTEGER, -9007199254740991);
  });
  test('Number.parseFloat', function(){
    return ok(isFunction(Number.parseFloat));
  });
  test('Number.parseInt', function(){
    return ok(isFunction(Number.parseInt));
  });
  test('Number::clz', function(){
    ok(isFunction(Number.prototype.clz));
    ok(0 .clz() === 32);
    ok(1 .clz() === 31);
    ok((-1).clz() === 0);
    ok(0.6.clz() === 32);
    ok((Math.pow(2, 32) - 1).clz() === 0);
    return ok(Math.pow(2, 32).clz() === 32);
  });
  test('Math.acosh', function(){
    return ok(isFunction(Math.acosh));
  });
  test('Math.asinh', function(){
    return ok(isFunction(Math.asinh));
  });
  test('Math.atanh', function(){
    return ok(isFunction(Math.atanh));
  });
  test('Math.cbrt', function(){
    return ok(isFunction(Math.cbrt));
  });
  test('Math.cosh', function(){
    return ok(isFunction(Math.cosh));
  });
  test('Math.expm1', function(){
    return ok(isFunction(Math.expm1));
  });
  test('Math.hypot', function(){
    return ok(isFunction(Math.hypot));
  });
  test('Math.imul', function(){
    return ok(isFunction(Math.imul));
  });
  test('Math.log1p', function(){
    return ok(isFunction(Math.log1p));
  });
  test('Math.log10', function(){
    return ok(isFunction(Math.log10));
  });
  test('Math.log2', function(){
    return ok(isFunction(Math.log2));
  });
  test('Math.sign', function(){
    var sign;
    sign = Math.sign;
    ok(isFunction(sign));
    ok(Object.is(sign(NaN), NaN));
    ok(Object.is(sign(-0), -0));
    ok(Object.is(sign(0), 0));
    ok(sign(Infinity) === 1);
    ok(sign(-Infinity) === -1);
    ok(sign(13510798882111488) === 1);
    ok(sign(-13510798882111488) === -1);
    ok(sign(42.5) === 1);
    return ok(sign(-42.5) === -1);
  });
  test('Math.sinh', function(){
    return ok(isFunction(Math.sinh));
  });
  test('Math.tanh', function(){
    return ok(isFunction(Math.tanh));
  });
  test('Math.trunc', function(){
    var trunc;
    trunc = Math.trunc;
    ok(isFunction(trunc));
    ok(Object.is(trunc(NaN), NaN));
    ok(Object.is(trunc(-0), -0));
    ok(Object.is(trunc(0), 0));
    ok(trunc(Infinity) === Infinity);
    ok(trunc(-Infinity) === -Infinity);
    ok(Object.is(trunc(-0.3), -0));
    ok(Object.is(trunc(0.3), 0));
    ok(trunc([]) === 0);
    ok(trunc(-42.42) === -42);
    return ok(trunc(13510798882111488) === 13510798882111488);
  });
  test('String::codePointAt', function(){
    return ok(isFunction(String.prototype.codePointAt));
  });
  test('String::contains', function(){
    ok(isFunction(String.prototype.contains));
    ok(!'abc'.contains());
    ok('aundefinedb'.contains());
    ok('abcd'.contains('b', 1));
    return ok(!'abcd'.contains('b', 2));
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
    return ok(!'abc'.endsWith('a', 'x'));
  });
  test('String::repeat', function(){
    var e;
    ok(isFunction(String.prototype.repeat));
    ok('qwe'.repeat(3) === 'qweqweqwe');
    ok('qwe'.repeat(2.5) === 'qweqwe');
    try {
      'qwe'.repeat(-1);
      return ok(false);
    } catch (e$) {
      e = e$;
      return ok(true);
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
    return ok('abc'.startsWith('a', 'x'));
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
    return deepEqual(from(function(){
      return arguments;
    }(1, 2, 3), (function(it){
      return Math.pow(it, 2);
    })), [1, 4, 9]);
  });
  test('Array.of', function(){
    ok(isFunction(Array.of));
    deepEqual(Array.of(1), [1]);
    return deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  });
  test('Array::fill', function(){
    ok(isFunction(Array.prototype.fill));
    deepEqual(Array(5).fill(5), [5, 5, 5, 5, 5]);
    deepEqual(Array(5).fill(5, 1), [void 8, 5, 5, 5, 5]);
    deepEqual(Array(5).fill(5, 1, 4), [void 8, 5, 5, 5, void 8]);
    deepEqual(Array(5).fill(5, 6, 1), [void 8, void 8, void 8, void 8, void 8]);
    return deepEqual(Array(5).fill(5, -3, 4), [void 8, void 8, 5, 5, void 8]);
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
    return ok([1, 3, NaN, 42, {}].find((function(it){
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
    return ok([1, 3, NaN, 42, {}].findIndex((function(it){
      return it === 42;
    })) === 3);
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('Map', function(){
    ok(isFunction(global.Map));
    ok('clear' in Map.prototype);
    ok('delete' in Map.prototype);
    ok('forEach' in Map.prototype);
    ok('get' in Map.prototype);
    ok('has' in Map.prototype);
    ok('set' in Map.prototype);
    ok(new Map instanceof Map);
    ok(Map() instanceof Map);
    ok(new Map([[1, 2], [2, 3], [1, 4]]).size === 2);
    ok(new Map([[1, 2], [2, 3], [1, 4]]).size === 2);
    return ok(new Map([[NaN, 2], [NaN, 3], [NaN, 4]]).size === 1);
  });
  test('Map::clear', function(){
    var M;
    ok(isFunction(Map.prototype.clear));
    M = new Map([[1, 2], [2, 3], [1, 4]]);
    M.clear();
    return ok(M.size === 0);
  });
  test('Map::delete', function(){
    var a, M;
    ok(isFunction(Map.prototype['delete']));
    a = [];
    M = new Map([[NaN, 1], [2, 1], [3, 1], [2, 5], [1, 4], [a, {}]]);
    ok(M.size === 5);
    M['delete'](NaN);
    ok(M.size === 4);
    M['delete'](4);
    ok(M.size === 4);
    M['delete']([]);
    ok(M.size === 4);
    M['delete'](a);
    return ok(M.size === 3);
  });
  test('Map::forEach', function(){
    var r, T, count, M;
    ok(isFunction(Map.prototype.forEach));
    r = {};
    count = 0;
    M = new Map([[NaN, 1], [2, 1], [3, 7], [2, 5], [1, 4], [{}, 9]]);
    M.forEach(function(value, key, ctx){
      T = ctx;
      count = count + 1;
      return r[value] = key;
    });
    ok(T === M);
    ok(count === 5);
    return deepEqual(r, {
      1: NaN,
      7: 3,
      5: 2,
      4: 1,
      9: {}
    });
  });
  test('Map::get', function(){
    var o, M;
    ok(isFunction(Map.prototype.get));
    o = {};
    M = new Map([[NaN, 1], [2, 1], [3, 1], [2, 5], [1, 4], [o, o]]);
    ok(M.get(NaN) === 1);
    ok(M.get(4) === void 8);
    ok(M.get({}) === void 8);
    ok(M.get(o) === o);
    return ok(M.get(2) === 5);
  });
  test('Map::has', function(){
    var o, M;
    ok(isFunction(Map.prototype.has));
    o = {};
    M = new Map([[NaN, 1], [2, 1], [3, 1], [2, 5], [1, 4], [o, o]]);
    ok(M.has(NaN));
    ok(!M.has(4));
    ok(!M.has({}));
    ok(M.has(o));
    return ok(M.has(2));
  });
  test('Map::set', function(){
    var o, M;
    ok(isFunction(Map.prototype.set));
    o = {};
    M = new Map([[NaN, 1], [2, 1], [3, 1], [2, 5], [1, 4], [o, o]]);
    ok(M.size === 5);
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
    return ok(M.get(o) === 27);
  });
  test('Set', function(){
    var S, r;
    ok(isFunction(global.Set));
    ok('add' in Set.prototype);
    ok('clear' in Set.prototype);
    ok('delete' in Set.prototype);
    ok('forEach' in Set.prototype);
    ok('has' in Set.prototype);
    ok(new Set instanceof Set);
    ok(Set() instanceof Set);
    ok(new Set([1, 2, 3, 2, 1]).size === 3);
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
    return ok(new Set([NaN, NaN, NaN]).size === 1);
  });
  test('Set::add', function(){
    var a, S;
    ok(isFunction(Set.prototype.add));
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    ok(S.size === 5);
    S.add(NaN);
    ok(S.size === 5);
    S.add(2);
    ok(S.size === 5);
    S.add(a);
    ok(S.size === 5);
    S.add([]);
    ok(S.size === 6);
    S.add(4);
    return ok(S.size === 7);
  });
  test('Set::clear', function(){
    var S;
    ok(isFunction(Set.prototype.clear));
    S = new Set([1, 2, 3, 2, 1]);
    S.clear();
    return ok(S.size === 0);
  });
  test('Set::delete', function(){
    var a, S;
    ok(isFunction(Set.prototype['delete']));
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    ok(S.size === 5);
    S['delete'](NaN);
    ok(S.size === 4);
    S['delete'](4);
    ok(S.size === 4);
    S['delete']([]);
    ok(S.size === 4);
    S['delete'](a);
    return ok(S.size === 3);
  });
  test('Set::forEach', function(){
    var r, T, count, S;
    ok(isFunction(Set.prototype.forEach));
    r = {};
    count = 0;
    S = new Set([1, 2, 3, 2, 1]);
    S.forEach(function(value, key, ctx){
      T = ctx;
      count = count + 1;
      return r[key] = value;
    });
    ok(T === S);
    ok(count === 3);
    return deepEqual(r, {
      1: 1,
      2: 2,
      3: 3
    });
  });
  test('Set::has', function(){
    var a, S;
    ok(isFunction(Set.prototype.has));
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    ok(S.has(NaN));
    ok(!S.has(4));
    ok(!S.has([]));
    ok(S.has(a));
    return ok(S.has(2));
  });
}).call(this);

(function(){
  var isFunction, join$ = [].join;
  isFunction = Object.isFunction;
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
    return ok(new B().constructor === B);
  });
  test('Function.isNative', function(){
    var isNative;
    isNative = Function.isNative;
    ok(isFunction(isNative));
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
    return ok(isNative(Object.prototype.hasOwnProperty));
  });
  test('Function::unbind', function(){
    ok(isFunction(Function.prototype.unbind));
    equal({}.toString.unbind()('qwe'), '[object String]');
    return equal([].reduce.unbind()('qwe', function(a, b){
      return b + a;
    }, ''), 'ewq');
  });
  test('Function::methodize', function(){
    var num;
    ok(isFunction(Function.prototype.methodize));
    equal({
      a: 42,
      fn: function(it){
        return it.a;
      }.methodize()
    }.fn(), 42);
    num = new Number(42);
    num.fn = function(a, b){
      return a + b;
    }.methodize();
    return equal(num.fn(21), 63);
  });
  test('Function::part', function(){
    var obj;
    ok(isFunction(Function.prototype.part));
    equal(Object.classof.part('qwe')(), 'String');
    obj = {
      a: 42
    };
    obj.fn = function(it){
      return this.a + it;
    }.part(21);
    return equal(obj.fn(), 63);
  });
  test('Function::partial', function(){
    var fn, fn1;
    ok(isFunction(Function.prototype.partial));
    fn = function(q, w, e, a, s, d){
      return q + w + e + a + s + d;
    };
    equal('qweasd', fn.partial([void 8, void 8, 'e', void 8, 's', 'd', 'z'])('q', 'w', 'a', 'x'));
    fn1 = function(q, w, e, a, s, d){
      return this + q + w + e + a + s + d;
    };
    return equal('zxcqweasd', fn1.partial([void 8, void 8, 'e', void 8, 's', 'd', 'z'], 'zxc')('q', 'w', 'a', 'x'));
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
    return ok(fn.only(2, 'x')('a', 'b', 'c') === 'xab');
  });
  test('Function::ctx', function(){
    var fn;
    ok(isFunction(Function.prototype.ctx));
    fn = function(){
      return this + join$.call(arguments, '');
    };
    return ok(fn.ctx('x')('a', 'b', 'c') === 'xabc');
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
    return deepEqual(C.invoke([1, 2]), new C(1, 2));
  });
  test('Function::getInstance', function(){
    var C;
    ok(isFunction(Function.prototype.getInstance));
    C = function(a){
      this.a = a;
    };
    ok(C.getInstance(3).a === 3);
    ok(C.getInstance() instanceof C);
    return ok(C.getInstance() === C.getInstance());
  });
  test('Function::once', function(){
    var F, ref$;
    ok(isFunction(Function.prototype.once));
    F = function(){
      return Math.random();
    }.once();
    ok(0 < (ref$ = F()) && ref$ < 1);
    return ok(F() === F());
  });
  test('Function::error', function(){
    var f;
    ok(isFunction(Function.prototype.error));
    f = function(){
      return 41;
    }.error(function(){
      return 42;
    });
    ok(f() === 41);
    f = function(){
      throw Error('unimplemented');
      return 41;
    }.error(function(){
      return 42;
    });
    ok(f() === 42);
    f = function(){
      throw 42;
    }.error(function(it){
      return it;
    });
    ok(f() === 42);
    f = function(){
      throw Error('unimplemented');
    }.error(function(arg$, args){
      return args;
    });
    return deepEqual(f(1, 2, 3), [1, 2, 3]);
  });
  test('Function::before', function(){
    var f;
    ok(isFunction(Function.prototype.before));
    f = function(it){
      return it + 'c';
    }.before(function(it){
      return it[0] += 'b';
    });
    return ok(f('a') === 'abc');
  });
  test('Function::after', function(){
    var f;
    ok(isFunction(Function.prototype.after));
    f = function(it){
      return it + 'b';
    }.after(function(result, args){
      return result + args[0];
    });
    return ok(f('a') === 'aba');
  });
  asyncTest('Function::timeout', 5, function(){
    var val;
    ok(isFunction(Function.prototype.timeout));
    ok(isFunction(function(it){
      ok(val === 1);
      return ok(it === 42);
    }.timeout(1, 42)));
    val = 1;
    (function(){
      return ok(false);
    }).timeout(1)();
    return setTimeout(function(){
      ok(true);
      return start();
    }, 20);
  });
  asyncTest('Function::interval', 8, function(){
    var i, clr;
    ok(isFunction(Function.prototype.interval));
    clr = function(it){
      ok(i < 4, 'i < 4');
      ok(it === 42, 'it is 42');
      if (i === 3) {
        clr();
        start();
      }
      return i = i + 1;
    }.interval(1, 42);
    ok(isFunction(clr));
    return i = 1;
  });
  asyncTest('Function::immediate', 5, function(){
    var val;
    ok(isFunction(Function.prototype.immediate));
    ok(isFunction(function(it){
      ok(val === 1);
      return ok(it === 42);
    }.immediate(42)));
    val = 1;
    (function(){
      return ok(false);
    }).immediate()();
    return setTimeout(function(){
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
    return ok(new B().constructor === B);
  });
}).call(this);

(function(){
  test('global', function(){
    var ref$;
    ok(typeof global != 'undefined' && global !== null);
    equal(global.global, global);
    global.__tmp__ = {};
    equal(__tmp__, global.__tmp__);
    return ref$ = global.__tmp__, delete global.__tmp__, ref$;
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
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
    return ok(toInteger(-0x20000000000001) === -0x20000000000001);
  });
  test('Number::div', function(){
    ok(isFunction(Number.prototype.div));
    equal((-7).div(3), -2);
    return equal(7 .div(3), 2);
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
    return deepEqual(5 .times(function(it){
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
    return ok(100 .times(function(){
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
    return ok(100 .times(function(){
      return 7 .rand(10);
    }).every((function(it){
      return it === 7 || it === 8 || it === 9 || it === 10;
    })));
  });
  test('Number::odd', function(){
    ok(isFunction(Number.prototype.odd));
    ok(!NaN.odd());
    ok(!Infinity.odd());
    ok(!(-1.5).odd());
    ok(!1.5.odd());
    ok(1 .odd());
    ok(111 .odd());
    ok(!2 .odd());
    return ok(!222 .odd());
  });
  test('Number::even', function(){
    ok(isFunction(Number.prototype.even));
    ok(!NaN.even());
    ok(!Infinity.even());
    ok(!(-1.5).even());
    ok(!1.5.even());
    ok(!1 .even());
    ok(!111 .even());
    ok(2 .even());
    return ok(222 .even());
  });
  test('Number::format', function(){
    ok(isFunction(Number.prototype.format));
    ok(NaN.format() === '0');
    ok(123 .format() === '123');
    ok((-123).format() === '-123');
    ok(123.45.format() === '123');
    ok((-123.45).format() === '-123');
    ok(NaN.format(3) === '0.000');
    ok(123 .format(3) === '123.000');
    ok((-123).format(3) === '-123.000');
    ok(123.45678.format(3) === '123.457');
    ok((-123.45678).format(3) === '-123.457');
    ok(NaN.format(7, ', ', '. ') === '0. 000, 000, 0');
    ok(1234 .format(7, ', ', '. ') === '1, 234. 000, 000, 0');
    ok((-1234).format(7, ', ', '. ') === '-1, 234. 000, 000, 0');
    ok(1234.45678.format(7, ', ', '. ') === '1, 234. 456, 780, 0');
    ok((-1234.45678).format(7, ', ', '. ') === '-1, 234. 456, 780, 0');
    return ok((-1234.45678).format(null, ', ', '. ') === '-1, 234');
  });
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
    return ok(isFunction(Number.prototype.trunc));
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
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
    return ok(!has({}, 'toString'));
  });
  test('Object.isEnumerable', function(){
    var isEnumerable;
    isEnumerable = Object.isEnumerable;
    ok(isFunction(isEnumerable));
    ok(isEnumerable({
      q: 1
    }, 'q'));
    ok(!isEnumerable({}, 'toString'));
    return ok(!isEnumerable(clone$({
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
    return ok(!isPrototype({}, clone$(function(){})));
  });
  test('Object.classof', function(){
    var classof;
    classof = Object.classof;
    ok(isFunction(classof));
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
    return ok(classof(TypeError()) === 'Error');
  });
  test('Object.getPropertyDescriptor', function(){
    var getPropertyDescriptor, create;
    getPropertyDescriptor = Object.getPropertyDescriptor, create = Object.create;
    ok(isFunction(getPropertyDescriptor));
    return deepEqual(getPropertyDescriptor(create({
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
    return deepEqual(descs.w, {
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
    return deepEqual(descs.w, {
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
    return ok(!in$('w', names));
  });
  test('Object.make', function(){
    var make, getPrototypeOf, object, foo;
    make = Object.make, getPrototypeOf = Object.getPrototypeOf;
    ok(isFunction(make));
    object = make(foo = {
      q: 1
    }, {
      w: 2
    });
    ok(getPrototypeOf(object) === foo);
    return ok(object.w === 2);
  });
  test('Object.plane', function(){
    var plane, getPrototypeOf, foo;
    plane = Object.plane, getPrototypeOf = Object.getPrototypeOf;
    ok(isFunction(plane));
    foo = plane({
      q: 1,
      w: 2
    });
    ok(getPrototypeOf(foo) === null);
    ok(foo.q === 1);
    return ok(foo.w === 2);
  });
  (function(){
    var clone, create, getPrototypeOf, defineProperty, getOwnPropertyDescriptor;
    clone = Object.clone, create = Object.create, getPrototypeOf = Object.getPrototypeOf, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    test('Object.clone(primitive)', function(){
      equal(clone(null), null);
      equal(clone(void 8), void 8);
      equal(clone('qwe'), 'qwe');
      equal(clone(123), 123);
      return ok(!clone(false));
    });
    test('Object.clone(Object(String|Number|Boolean))', function(){
      var i1, i2;
      i1 = new String('qwe');
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i1.valueOf(), i2.valueOf());
      i1 = new Number(123);
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i1.valueOf(), i2.valueOf());
      i1 = new Boolean(false);
      i2 = clone(i1);
      ok(i1 !== i2);
      return equal(i2.valueOf(), false);
    });
    test('Object.clone(Date)', function(){
      var i1, i2;
      i1 = new Date(1350861246986);
      i2 = clone(i1);
      ok(i1 !== i2);
      return equal(i2.getTime(), 1350861246986);
    });
    test('Object.clone(RegExp)', function(){
      var i1, i2;
      i1 = /q/i;
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i2.toString(), '/q/i');
      return ok(i2.test('Q'));
    });
    test('simple Object.clone(Array)', function(){
      var i1, i2;
      i1 = [1, 2, 3];
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i2[2], 3);
      equal(i2.length, 3);
      return equal(i2.constructor, Array);
    });
    test('simple Object.clone(Object)', function(){
      var i1, i2;
      i1 = {
        q: 123,
        w: 'qwe'
      };
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i2.q, 123);
      equal(i2.w, 'qwe');
      i1 = {
        q: {}
      };
      i2 = clone(i1);
      return ok(i1.q === i2.q);
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
      return ok(i1.q.q === i2.q.q);
    });
    test('deep Object.clone(Array)', function(){
      var i1, i2;
      i1 = [/^qwe$/];
      i2 = clone(i1, 1);
      ok(i1['0'] !== i2['0']);
      ok(i2[0].test('qwe'));
      return ok(!i2[0].test('qwer'));
    });
    test('deep Object.clone(instance)', function(){
      var fn, i1, i2;
      fn = function(){
        return this.q = 1;
      };
      i1 = new fn;
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i2.q, 1);
      equal(getPrototypeOf(i1), getPrototypeOf(i2));
      i1 = create({
        q: 1
      });
      i2 = clone(i1);
      ok(i1 !== i2);
      equal(i2.q, 1);
      return equal(getPrototypeOf(i1), getPrototypeOf(i2));
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
        return equal(typeof getOwnPropertyDescriptor(i2.q, 'q').get, 'undefined');
      });
      return test('deep Object.clone with descriptors', function(){
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
        equal(i2.q.q, 52);
        return equal(typeof getOwnPropertyDescriptor(i2.q, 'q').get, 'function');
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
      return ok(isFunction(merge));
    });
    test('simple Object.merge', function(){
      var i1, i2;
      i1 = new fn;
      i2 = merge(i1, obj);
      ok(i1 === i2);
      ok(i1.q === 1);
      ok(i1.r === 1);
      ok(i1.w === obj.w);
      return ok(i1.e === 1);
    });
    test('deep Object.merge', function(){
      var i1;
      i1 = merge(new fn, obj, 1);
      ok(i1.q === 1);
      ok(i1.r === 1);
      ok(i1.w !== obj.w);
      ok(i1.w.q === 2);
      return ok(i1.w.w === 2);
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
      return ok(i1.w.e !== 5);
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
      return ok(i1.w.e === 5);
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
    equal(obj.q, 1);
    equal(obj.w.q, 1);
    equal(obj.w.w, 2);
    return equal(obj.e, 3);
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
    return ok(~values({
      q: 1,
      w: 2,
      e: 3
    }).indexOf(3));
  });
  test('Object.invert', function(){
    var invert;
    invert = Object.invert;
    ok(isFunction(invert));
    return deepEqual(invert({
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
    var every, isNumber, obj, ctx;
    every = Object.every, isNumber = Object.isNumber;
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
    }, isNumber));
    return ok(!every({
      q: 1,
      w: '2',
      e: 3
    }, isNumber));
  });
  test('Object.filter', function(){
    var filter, obj, ctx;
    filter = Object.filter;
    ok(isFunction(filter));
    filter(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    return deepEqual(filter({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return it.odd();
    }), {
      q: 1,
      e: 3
    });
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
    return ok(find({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return it.even();
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
    return ok(findIndex({
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
      return ok(this === ctx);
    }, ctx = {});
    rez = {};
    forEach({
      q: 1,
      w: 2
    }, function(){
      return rez[arguments[1]] = arguments[0] + this;
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
      return rez && (rez = obj === arguments[2]);
    });
    ok(rez);
    rez = {};
    forEach(make({
      e: 3
    }, {
      q: 1,
      w: 2
    }), function(){
      return rez[arguments[1]] = arguments[0];
    });
    ok(!('e' in rez));
    rez = {};
    forEach([1, 2], function(){
      return rez[arguments[1]] = arguments[0];
    });
    ok(!('length' in rez));
    rez = {};
    forEach('123', function(){
      return rez[arguments[1]] = arguments[0];
    });
    return ok('2' in rez);
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
    return ok(indexOf({
      q: 1,
      w: 2,
      e: NaN
    }, NaN) === 'e');
  });
  test('Object.map', function(){
    var map, obj, ctx;
    map = Object.map;
    ok(isFunction(map));
    map(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    return deepEqual(map({
      q: 1,
      w: 2,
      e: 3
    }, (function(it){
      return Math.pow(it, 2);
    })), {
      q: 1,
      w: 4,
      e: 9
    });
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
    return deepEqual(memo, {
      1: 1,
      2: 2,
      3: 3
    });
  });
  test('Object.some', function(){
    var some, isString, obj, ctx;
    some = Object.some, isString = Object.isString;
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
    }, isString));
    return ok(some({
      q: 1,
      w: '2',
      e: 3
    }, isString));
  });
  test('Object.props', function(){
    var props;
    props = Object.props;
    ok(isFunction(props));
    deepEqual(props({
      q: 1,
      w: 22,
      e: 333
    }, 'length'), {
      q: void 8,
      w: void 8,
      e: void 8
    });
    deepEqual(props({
      q: 1,
      w: 22,
      e: void 8
    }, 'length'), {
      q: void 8,
      w: void 8,
      e: void 8
    });
    return deepEqual(props({
      q: '1',
      w: '22',
      e: '333'
    }, 'length'), {
      q: 1,
      w: 2,
      e: 3
    });
  });
  test('Object.reduceTo', function(){
    var reduceTo, obj;
    reduceTo = Object.reduceTo;
    ok(isFunction(reduceTo));
    reduceTo(obj = {
      q: 1
    }, function(val, key, that){
      deepEqual({}, this);
      ok(val === 1);
      ok(key === 'q');
      return ok(that === obj);
    });
    reduceTo({
      q: 1
    }, function(){
      return ok(this === obj);
    }, obj = {});
    return deepEqual({
      1: 1,
      2: 2,
      3: 3
    }, reduceTo({
      q: 1,
      w: 2,
      e: 3
    }, function(it){
      return this[it] = it;
    }));
  });
  test('Object.deepEqual', function(){
    var deepEqual, a, b;
    deepEqual = Object.deepEqual;
    ok(isFunction(deepEqual));
    ok(deepEqual(1, 1));
    ok(!deepEqual(1, 2));
    ok(!deepEqual(0, -0));
    ok(deepEqual({}, {}));
    ok(deepEqual({
      q: 1
    }, {
      q: 1
    }));
    ok(!deepEqual({
      q: 1
    }, {}));
    ok(!deepEqual({}, []));
    ok(deepEqual({
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
    ok(!deepEqual({
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
    return ok(deepEqual(a, b));
  });
  test('Object.isObject', function(){
    var isObject;
    isObject = Object.isObject;
    ok(isFunction(isObject));
    ok(!isObject(void 8));
    ok(!isObject(null));
    ok(!isObject(1));
    ok(isObject(new Number(1)));
    ok(!isObject(''));
    ok(isObject(new String(1)));
    ok(!isObject(false));
    ok(isObject(new Boolean(false)));
    ok(isObject({}));
    ok(isObject([]));
    ok(isObject(/./));
    return ok(isObject(new function(){}));
  });
  test('Object.isUndefined', function(){
    var isUndefined;
    isUndefined = Object.isUndefined;
    ok(isFunction(isUndefined));
    ok(isUndefined(void 8));
    ok(!isUndefined(null));
    ok(!isUndefined(1));
    ok(!isUndefined(''));
    ok(!isUndefined(false));
    return ok(!isUndefined({}));
  });
  test('Object.isNull', function(){
    var isNull;
    isNull = Object.isNull;
    ok(isFunction(isNull));
    ok(!isNull(void 8));
    ok(isNull(null));
    ok(!isNull(1));
    ok(!isNull(''));
    ok(!isNull(false));
    return ok(!isNull({}));
  });
  test('Object.isNumber', function(){
    var isNumber;
    isNumber = Object.isNumber;
    ok(isFunction(isNumber));
    ok(!isNumber(void 8));
    ok(!isNumber(null));
    ok(isNumber(1));
    ok(isNumber(new Number(1)));
    ok(!isNumber(''));
    ok(!isNumber(false));
    return ok(!isNumber({}));
  });
  test('Object.isString', function(){
    var isString;
    isString = Object.isString;
    ok(isFunction(isString));
    ok(!isString(void 8));
    ok(!isString(null));
    ok(!isString(1));
    ok(isString(''));
    ok(isString(new String('')));
    ok(!isString(false));
    return ok(!isString({}));
  });
  test('Object.isBoolean', function(){
    var isBoolean;
    isBoolean = Object.isBoolean;
    ok(isFunction(isBoolean));
    ok(!isBoolean(void 8));
    ok(!isBoolean(null));
    ok(!isBoolean(1));
    ok(!isBoolean(''));
    ok(isBoolean(false));
    ok(isBoolean(new Boolean(false)));
    return ok(!isBoolean({}));
  });
  test('Object.isArray', function(){
    var isArray;
    isArray = Object.isArray;
    ok(isFunction(isArray));
    ok(!isArray(void 8));
    ok(!isArray(null));
    ok(!isArray(1));
    ok(!isArray(''));
    ok(!isArray(false));
    ok(!isArray({}));
    ok(!isArray(function(){
      return arguments;
    }()));
    return ok(isArray([1]));
  });
  test('Object.isFunction', function(){
    var isFunction;
    isFunction = Object.isFunction;
    ok(typeof isFunction === 'function');
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
    return ok(isFunction(function(){}));
  });
  test('Object.isRegExp', function(){
    var isRegExp;
    isRegExp = Object.isRegExp;
    ok(isFunction(isRegExp));
    ok(!isRegExp(void 8));
    ok(!isRegExp(null));
    ok(!isRegExp(1));
    ok(!isRegExp(''));
    ok(!isRegExp(false));
    ok(!isRegExp({}));
    ok(!isRegExp(function(){
      return arguments;
    }()));
    ok(!isRegExp([1]));
    ok(isRegExp(/./));
    return ok(!isRegExp(function(){}));
  });
  test('Object.isDate', function(){
    var isDate;
    isDate = Object.isDate;
    ok(isFunction(isDate));
    ok(!isDate(void 8));
    ok(!isDate(null));
    ok(!isDate(1));
    ok(!isDate(''));
    ok(!isDate(false));
    ok(!isDate({}));
    ok(!isDate(function(){
      return arguments;
    }()));
    ok(!isDate([1]));
    ok(!isDate(/./));
    ok(!isDate(function(){}));
    return ok(isDate(new Date));
  });
  test('Object.isError', function(){
    var isError;
    isError = Object.isError;
    ok(isFunction(isError));
    ok(!isError(void 8));
    ok(!isError(null));
    ok(!isError(1));
    ok(!isError(''));
    ok(!isError(false));
    ok(!isError({}));
    ok(!isError(function(){
      return arguments;
    }()));
    ok(!isError([1]));
    ok(!isError(/./));
    ok(!isError(function(){}));
    ok(isError(Error()));
    return ok(isError(TypeError()));
  });
  test('Object.isArguments', function(){
    var isArguments;
    isArguments = Object.isArguments;
    ok(isFunction(isArguments));
    ok(!isArguments(void 8));
    ok(!isArguments(null));
    ok(!isArguments(1));
    ok(!isArguments(''));
    ok(!isArguments(false));
    ok(!isArguments({}));
    ok(isArguments(function(){
      return arguments;
    }()));
    ok(!isArguments([1]));
    ok(!isArguments(/./));
    return ok(!isArguments(function(){}));
  });
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('RegExp::getFlag', function(){
    ok(isFunction(RegExp.prototype.getFlag));
    equal(/./gmi.getFlag().length, 3);
    return equal(/qwe/i.getFlag(), 'i');
  });
  test('RegExp::fn', function(){
    ok(isFunction(/qwe/.fn()));
    ok(/qwe/.fn()('qwerty'));
    return ok(!/qwe/.fn()('asd'));
  });
}).call(this);

(function(){
  var isFunction;
  isFunction = Object.isFunction;
  test('String::trimLeft', function(){
    ok(isFunction(String.prototype.trimLeft));
    ok('   123   '.trimLeft() === '123   ');
    return ok('   \nasd\n   '.trimLeft() === 'asd\n   ');
  });
  test('String::trimRight', function(){
    ok(isFunction(String.prototype.trimRight));
    ok('   123   '.trimRight() === '   123');
    return ok('   \nasd\n   '.trimRight() === '   \nasd');
  });
  test('String::escapeHTML', function(){
    ok(isFunction(String.prototype.escapeHTML));
    ok('qwe, asd'.escapeHTML() === 'qwe, asd');
    ok('<div>qwe</div>'.escapeHTML() === '&lt;div&gt;qwe&lt;&#x2f;div&gt;');
    return ok("&<>\"'/".escapeHTML() === '&amp;&lt;&gt;&quot;&apos;&#x2f;');
  });
  test('String::unescapeHTML', function(){
    ok(isFunction(String.prototype.unescapeHTML));
    ok('qwe, asd'.unescapeHTML() === 'qwe, asd');
    ok('&lt;div&gt;qwe&lt;&#x2f;div&gt;'.unescapeHTML() === '<div>qwe</div>');
    return ok('&amp;&lt;&gt;&quot;&apos;&#x2f;'.unescapeHTML() === "&<>\"'/");
  });
  test('String::escapeURL', function(){
    return ok(isFunction(String.prototype.escapeURL));
  });
  test('String::unescapeURL', function(){
    return ok(isFunction(String.prototype.unescapeURL));
  });
  test('String::escapeRegExp', function(){
    ok(isFunction(String.prototype.escapeRegExp));
    ok('qwe asd'.escapeRegExp() === 'qwe asd');
    return ok('\\/\'*+?|()[]{}.^$'.escapeRegExp() === "\\\\\\/\\'\\*\\+\\?\\|\\(\\)\\[\\]\\{\\}\\.\\^\\$");
  });
  test('String::reverse', function(){
    ok(isFunction(String.prototype.reverse));
    return ok(' qwerty '.reverse() === ' ytrewq ');
  });
  test('String::at', function(){
    ok(isFunction(String.prototype.at));
    ok(''.at(-1) === '');
    ok(''.at(void 8) === '');
    ok('qwerty'.at(0) === 'q');
    ok('qwerty'.at(5) === 'y');
    ok('qwerty'.at(-1) === 'y');
    ok('qwerty'.at(-6) === 'q');
    ok('qwerty'.at(6) === '');
    return ok('qwerty'.at(-7) === '');
  });
}).call(this);

(function(){
  var isFunction, slice$ = [].slice;
  isFunction = Object.isFunction;
  asyncTest('setTimeout / clearTimeout', 2, function(){
    global.setTimeout(function(b, c){
      return ok(b + c === 'bc');
    }, 1, 'b', 'c');
    clearTimeout(partialize$.apply(global, [
      global.setTimeout, [
        void 8, 1, function(){
          return ok(false);
        }
      ], [0]
    ]));
    return global.setTimeout(function(){
      ok(true);
      return start();
    }, 20);
  });
  asyncTest('setInterval / clearInterval', 6, function(){
    var i, mark;
    i = 1;
    return mark = global.setInterval(function(it){
      ok(i < 4);
      ok(it === 42);
      if (i === 3) {
        clearInterval(mark);
        start();
      }
      return i = i + 1;
    }, 1, 42);
  });
  asyncTest('setImmediate / clearImmediate', 4, function(){
    ok(isFunction(global.setImmediate));
    ok(isFunction(global.clearImmediate));
    setImmediate(function(b, c){
      return ok(b + c === 'bc');
    }, 'b', 'c');
    clearImmediate(setImmediate(function(){
      return ok(false);
    }));
    return global.setTimeout(function(){
      ok(true);
      return start();
    }, 20);
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
