(function(){
  var from, iterator, toString$ = {}.toString;
  QUnit.module('$for');
  from = Array.from;
  iterator = Symbol.iterator;
  test('$for', function(){
    var set, iter;
    ok(typeof $for === 'function', 'Is function');
    ok(iterator in $for.prototype);
    set = new Set(['1', '2', '3', '2', '1']);
    iter = $for(set);
    ok(iter instanceof $for);
    ok(toString$.call(iter[iterator]()).slice(8, -1) === 'Set Iterator');
    deepEqual(['1', '2', '3'], from(iter));
  });
  test('$for#filter', function(){
    var set, iter, o;
    ok(typeof $for.prototype.filter === 'function', 'Is function');
    set = new Set(['1', '2', '3', '2', '1']);
    iter = $for(set).filter((function(it){
      return it % 2;
    }));
    ok(iter instanceof $for);
    deepEqual(['1', '3'], from(iter));
    deepEqual([[1, 2]], from($for([1, 2, 3].entries(), true).filter(function(k, v){
      return k % 2;
    })));
    $for([1]).filter(function(){
      return ok(this === o);
    }, o = {});
  });
  test('$for#map', function(){
    var set, iter, o;
    ok(typeof $for.prototype.map === 'function', 'Is function');
    set = new Set(['1', '2', '3', '2', '1']);
    iter = $for(set).map((function(it){
      return it * 2;
    }));
    ok(iter instanceof $for);
    deepEqual([2, 4, 6], from(iter));
    deepEqual([[0, 1], [2, 4], [4, 9]], from($for([1, 2, 3].entries(), true).map(function(k, v){
      return [k * 2, v * v];
    })));
    $for([1]).map(function(){
      return ok(this === o);
    }, o = {});
  });
  test('$for#array', function(){
    var set, o;
    ok(typeof $for.prototype.array === 'function', 'Is function');
    set = new Set([1, 2, 3, 2, 1]);
    deepEqual([[1, 1], [2, 2], [3, 3]], $for(set.entries()).array());
    deepEqual([2, 4, 6], $for(set).array((function(it){
      return it * 2;
    })));
    deepEqual([[0, 1], [2, 4], [4, 9]], $for([1, 2, 3].entries(), true).array(function(k, v){
      return [k * 2, v * v];
    }));
    $for([1]).array(function(){
      return ok(this === o);
    }, o = {});
  });
  test('$for#of', function(){
    var set, counter1, string1, counter2, string2, o;
    ok(typeof $for.prototype.of === 'function', 'Is function');
    set = new Set(['1', '2', '3', '2', '1']);
    counter1 = 0;
    string1 = '';
    $for(set).of(function(it){
      counter1++;
      string1 += it;
    });
    ok(counter1 === 3);
    ok(string1 === '123');
    counter2 = 0;
    string2 = '';
    $for(set.entries()).of(function(it){
      counter2++;
      string2 += it[0] + it[1];
    });
    ok(counter2 === 3);
    ok(string2 === '112233');
    $for([1].entries(), true).of(function(key, val){
      ok(this === o);
      ok(key === 0);
      return ok(val === 1);
    }, o = {});
  });
  test('$for chaining', function(){
    deepEqual([2, 10], $for([1, 2, 3]).map((function(it){
      return Math.pow(it, 2);
    })).filter((function(it){
      return it % 2;
    })).map((function(it){
      return it + 1;
    })).array());
    deepEqual([[1, 1], [3, 9]], $for([1, 2, 3].entries(), true).map(function(k, v){
      return [k, Math.pow(v, 2)];
    }).filter(function(k, v){
      return v % 2;
    }).map(function(k, v){
      return [k + 1, v];
    }).array());
  });
  test('$for.isIterable', function(){
    var isIterable, _Symbol, I, o;
    isIterable = $for.isIterable;
    ok(typeof isIterable === 'function', 'Is function');
    ok(!isIterable({}));
    ok(isIterable([]));
    ok(isIterable(function(){
      return arguments;
    }()));
    _Symbol = Symbol;
    I = Math.random();
    o = {
      0: 'a',
      1: 'b',
      2: 'c',
      length: 3
    };
    o[I] = Array.prototype.values;
    ok(!isIterable(o));
    global.Symbol = {
      iterator: I
    };
    ok(isIterable(o));
    global.Symbol = _Symbol;
    ok(!isIterable(o));
  });
  test('$for.getIterator', function(){
    var getIterator, iter, _Symbol, I, O, e;
    getIterator = $for.getIterator;
    ok(typeof getIterator === 'function', 'Is function');
    throws(function(){
      getIterator({});
    }, TypeError);
    iter = getIterator([]);
    ok('next' in iter);
    iter = getIterator(function(){
      return arguments;
    }());
    ok('next' in iter);
    _Symbol = Symbol;
    I = Math.random();
    O = {
      0: 'a',
      1: 'b',
      2: 'c',
      length: 3
    };
    O[I] = Array.prototype.values;
    throws(function(){
      getIterator(O);
    }, TypeError);
    global.Symbol = {
      iterator: I
    };
    try {
      getIterator(O);
      ok(true);
    } catch (e$) {
      e = e$;
      ok(false);
    }
    deepEqual(Array.from(O), ['a', 'b', 'c']);
    global.Symbol = _Symbol;
    throws(function(){
      getIterator(O);
    }, TypeError);
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  QUnit.module('Array');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('#turn', function(){
    var arr, obj;
    ok(isFunction(Array.prototype.turn), 'Is function');
    (arr = [1]).turn(function(memo, val, key, that){
      deepEqual([], memo, 'Default memo is array');
      ok(val === 1, 'First argumert is value');
      ok(key === 0, 'Second argumert is index');
      return ok(that === arr, 'Third argumert is array');
    });
    [1].turn(function(memo){
      return ok(memo === obj, 'Can reduce to exist object');
    }, obj = {});
    deepEqual([3, 2, 1], [1, 2, 3].turn(function(memo, it){
      return memo.unshift(it);
    }), 'Reduce to object and return it');
    ok('turn' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
}).call(this);

(function(){
  var isFunction, slice, toString$ = {}.toString;
  QUnit.module('Array statics');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  slice = Array.prototype.slice;
  test('are functions', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['concat', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'sort', 'splice', 'unshift', 'indexOf', 'lastIndexOf', 'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'reduceRight', 'copyWithin', 'fill', 'find', 'findIndex', 'keys', 'values', 'entries', 'turn', 'includes']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(Array[x$]), "Array." + x$ + " is function");
    }
  });
  test('.join', function(){
    var join;
    join = Array.join;
    ok(join('123') === '1,2,3');
    ok(join('123', '|') === '1|2|3');
    ok(join(function(){
      return arguments;
    }(3, 2, 1), '|') === '3|2|1');
  });
  test('.pop', function(){
    var pop, args;
    pop = Array.pop;
    ok(pop(args = function(){
      return arguments;
    }(1, 2, 3)) === 3);
    deepEqual(args, function(){
      return arguments;
    }(1, 2));
  });
  test('.push', function(){
    var push, args;
    push = Array.push;
    push(args = function(){
      return arguments;
    }(1, 2, 3), 4, 5);
    deepEqual(slice.call(args), [1, 2, 3, 4, 5]);
  });
  test('.reverse', function(){
    var reverse;
    reverse = Array.reverse;
    deepEqual(reverse(function(){
      return arguments;
    }(1, 2, 3)), function(){
      return arguments;
    }(3, 2, 1));
  });
  test('.shift', function(){
    var shift, args;
    shift = Array.shift;
    ok(shift(args = function(){
      return arguments;
    }(1, 2, 3)) === 1);
    deepEqual(args, function(){
      return arguments;
    }(2, 3));
  });
  test('.unshift', function(){
    var unshift, args;
    unshift = Array.unshift;
    unshift(args = function(){
      return arguments;
    }(1, 2, 3), 4, 5);
    deepEqual(slice.call(args), [4, 5, 1, 2, 3]);
  });
  test('.slice', function(){
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
  test('.splice', function(){
    var splice, args;
    splice = Array.splice;
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 0, 4, 5);
    deepEqual(slice.call(args), [1, 4, 5, 2, 3]);
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 1, 4);
    deepEqual(slice.call(args), [1, 4, 3]);
    splice(args = function(){
      return arguments;
    }(1, 2, 3), 1, 1);
    deepEqual(slice.call(args), [1, 3]);
  });
  test('.sort', function(){
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
  test('.indexOf', function(){
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
  test('.lastIndexOf', function(){
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
  test('.every', function(){
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
  test('.some', function(){
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
  test('.forEach', function(){
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
  test('.map', function(){
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
  test('.filter', function(){
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
  test('.reduce', function(){
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
  test('.reduceRight', function(){
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
  test('.copyWithin', function(){
    var copyWithin, a;
    copyWithin = Array.copyWithin;
    ok(copyWithin(a = function(){
      return arguments;
    }(1, 2, 3), 0) === a);
    deepEqual(copyWithin(function(){
      return arguments;
    }(1, 2, 3), -2), function(){
      return arguments;
    }(1, 1, 2));
    deepEqual(copyWithin(function(){
      return arguments;
    }(1, 2, 3), 0, 1), function(){
      return arguments;
    }(2, 3, 3));
    deepEqual(copyWithin(function(){
      return arguments;
    }(1, 2, 3), 0, 1, 2), function(){
      return arguments;
    }(2, 2, 3));
  });
  test('.fill', function(){
    var fill, a;
    fill = Array.fill;
    ok(fill(a = function(){
      return arguments;
    }(1, 2, 3), 0) === a);
    deepEqual(fill(Array(3), 5), [5, 5, 5]);
  });
  test('.find', function(){
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
  test('.findIndex', function(){
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
  test('.keys', function(){
    var keys, iter1, iter2;
    keys = Array.keys;
    ok(typeof keys === 'function', 'Is function');
    iter1 = keys(function(){
      return arguments;
    }('q', 'w', 'e'));
    ok(typeof iter1 === 'object', 'Iterator is object');
    ok(typeof iter1.next === 'function', 'Iterator has .next method');
    deepEqual(iter1.next(), {
      value: 0,
      done: false
    });
    deepEqual(iter1.next(), {
      value: 1,
      done: false
    });
    deepEqual(iter1.next(), {
      value: 2,
      done: false
    });
    deepEqual(iter1.next(), {
      value: void 8,
      done: true
    });
    iter2 = keys('qwe');
    deepEqual(iter2.next(), {
      value: 0,
      done: false
    });
    deepEqual(iter2.next(), {
      value: 1,
      done: false
    });
    deepEqual(iter2.next(), {
      value: 2,
      done: false
    });
    deepEqual(iter2.next(), {
      value: void 8,
      done: true
    });
  });
  test('.values', function(){
    var values, iter1, iter2;
    values = Array.values;
    ok(typeof values === 'function', 'Is function');
    iter1 = values(function(){
      return arguments;
    }('q', 'w', 'e'));
    ok(typeof iter1 === 'object', 'Iterator is object');
    ok(typeof iter1.next === 'function', 'Iterator has .next method');
    deepEqual(iter1.next(), {
      value: 'q',
      done: false
    });
    deepEqual(iter1.next(), {
      value: 'w',
      done: false
    });
    deepEqual(iter1.next(), {
      value: 'e',
      done: false
    });
    deepEqual(iter1.next(), {
      value: void 8,
      done: true
    });
    iter2 = values('qwe');
    deepEqual(iter2.next(), {
      value: 'q',
      done: false
    });
    deepEqual(iter2.next(), {
      value: 'w',
      done: false
    });
    deepEqual(iter2.next(), {
      value: 'e',
      done: false
    });
    deepEqual(iter2.next(), {
      value: void 8,
      done: true
    });
  });
  test('.entries', function(){
    var entries, iter1, iter2;
    entries = Array.entries;
    ok(typeof entries === 'function', 'Is function');
    iter1 = entries(function(){
      return arguments;
    }('q', 'w', 'e'));
    ok(typeof iter1 === 'object', 'Iterator is object');
    ok(typeof iter1.next === 'function', 'Iterator has .next method');
    deepEqual(iter1.next(), {
      value: [0, 'q'],
      done: false
    });
    deepEqual(iter1.next(), {
      value: [1, 'w'],
      done: false
    });
    deepEqual(iter1.next(), {
      value: [2, 'e'],
      done: false
    });
    deepEqual(iter1.next(), {
      value: void 8,
      done: true
    });
    iter2 = entries('qwe');
    deepEqual(iter2.next(), {
      value: [0, 'q'],
      done: false
    });
    deepEqual(iter2.next(), {
      value: [1, 'w'],
      done: false
    });
    deepEqual(iter2.next(), {
      value: [2, 'e'],
      done: false
    });
    deepEqual(iter2.next(), {
      value: void 8,
      done: true
    });
  });
  test('.turn', function(){
    var turn, al, obj;
    turn = Array.turn;
    turn(al = function(){
      return arguments;
    }(1), function(memo, val, key, that){
      deepEqual([], memo);
      ok(val === 1);
      ok(key === 0);
      return ok(that === al);
    });
    turn(al = '1', function(memo, val, key, that){
      deepEqual([], memo);
      ok(val === '1');
      ok(key === 0);
      return ok(that == al);
    });
    turn(function(){
      return arguments;
    }(1), function(it){
      return ok(it === obj);
    }, obj = {});
    deepEqual([3, 2, 1], turn(function(){
      return arguments;
    }(1, 2, 3), function(memo, it){
      return memo.unshift(it);
    }));
    deepEqual(['3', '2', '1'], turn('123', function(memo, it){
      return memo.unshift(it);
    }));
  });
  test('.includes', function(){
    var includes, args, o, str;
    includes = Array.includes;
    ok(isFunction(includes), 'Is function');
    args = function(){
      return arguments;
    }(1, 2, 3, -0, NaN, o = {});
    ok(includes(args, 1));
    ok(includes(args, -0));
    ok(includes(args, 0));
    ok(includes(args, NaN));
    ok(includes(args, o));
    ok(!includes(args, 4));
    ok(!includes(args, -0.5));
    ok(!includes(args, {}));
    str = 'qwe';
    ok(includes(str, 'q'));
    ok(!includes(str, 'r'));
  });
}).call(this);

(function(){
  var isFunction, DESC, slice, toString$ = {}.toString, slice$ = [].slice;
  QUnit.module('Binding');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  DESC = /\[native code\]\s*\}\s*$/.test(Object.defineProperty);
  slice = Array.prototype.slice;
  test('Function#by', function(){
    var $, array, push, foo, bar, o, fn;
    $ = _;
    ok(isFunction(Function.prototype.by), 'Is function');
    array = [1, 2, 3];
    push = array.push.by(array);
    ok(isFunction(push));
    ok(push(4) === 4);
    deepEqual(array, [1, 2, 3, 4]);
    foo = {
      bar: function(a, b, c, d){
        ok(this === foo);
        return deepEqual(slice.call(arguments), [1, 2, 3, 4]);
      }
    };
    bar = foo.bar.by(foo, 1, $, 3);
    bar(2, 4);
    o = {
      a: '1'
    };
    fn = function(b, c){
      return this.a + b + c;
    };
    ok(fn.by(o, '2')('3') === '123');
    ok(fn.by($)(o, '2', '3') === '123');
    ok(fn.by($, '2')(o, '3') === '123');
  });
  test('Function#part', function(){
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
  test('Function#only', function(){
    var fn, f, that, o, c;
    ok(isFunction(Function.prototype.only), 'Is function');
    fn = function(){
      var args;
      args = slice$.call(arguments);
      return args.reduce(curry$(function(x$, y$){
        return x$ + y$;
      }));
    };
    f = fn.only(2);
    ok(f(1, 2, 3) === 3);
    ok(f(1) === 1);
    that = function(){
      return this;
    };
    o = {
      f: that.only(1)
    };
    ok(o.f() === o);
    o = {
      f: that.only(1, c = {})
    };
    ok(o.f() === c);
  });
  test('#[_]', function(){
    var $, fn, ctx, array, push, foo, bar;
    $ = _;
    ok(isFunction(Object.prototype[_]), 'Object::[_] is function');
    fn = function(it){
      ok(this === ctx);
      return ok(it === 1);
    }[_]('call');
    fn(ctx = {}, 1);
    array = [1, 2, 3];
    push = array[_]('push');
    ok(isFunction(push));
    push(4, 5);
    deepEqual(array, [1, 2, 3, 4, 5]);
    ok([1, 2].every(/\d/[_]('test')));
    ok(![1, 'q'].every(/\d/[_]('test')));
    foo = {
      bar: function(a, b){
        ok(this === foo);
        return deepEqual(slice.call(arguments), [1, 2]);
      }
    };
    bar = foo[_]('bar');
    bar(1, 2);
  });
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
  var isFunction, isObject, methods, toString$ = {}.toString;
  if (toString$.call(this.process).slice(8, -1) !== 'process') {
    QUnit.module('Console');
    isFunction = function(it){
      return toString$.call(it).slice(8, -1) === 'Function';
    };
    isObject = function(it){
      return it === Object(it);
    };
    methods = ['assert', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupEnd', 'groupCollapsed', 'groupEnd', 'info', 'log', 'table', 'trace', 'warn', 'markTimeline', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp'];
    test('is object', function(){
      ok(isObject(((typeof global != 'undefined' && global !== null) && global || window).console), 'global.console is object');
    });
    test('console.{..} are functions', function(){
      var i$, x$, ref$, len$;
      for (i$ = 0, len$ = (ref$ = methods).length; i$ < len$; ++i$) {
        x$ = ref$[i$];
        ok(isFunction(console[x$]), "console." + x$ + " is function");
      }
    });
    test('call console.{..}', function(){
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
          return console.log('call disabled console') === void 8;
        } catch (e$) {}
      }()), 'call disabled console');
      ok((function(){
        try {
          enable();
          return true;
        } catch (e$) {}
      }()), 'enable console');
    });
  }
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  QUnit.module('Date');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('.locale', function(){
    var locale;
    locale = core.locale;
    ok(isFunction(locale), 'Is function');
    locale('en');
    ok(locale() === 'en', '.locale() is "en"');
    ok(locale('ru') === 'ru', '.locale("ru") is "ru"');
    ok(locale() === 'ru', '.locale() is "ru"');
    ok(locale('xx') === 'ru', '.locale("xx") is "ru"');
  });
  test('.addLocale', function(){
    var locale, addLocale;
    locale = core.locale, addLocale = core.addLocale;
    ok(isFunction(locale), 'Is function');
    ok(locale('en') === 'en');
    ok(locale('zz') === 'en');
    addLocale('zz', {
      weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
      months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
    });
    ok(locale('zz') === 'zz');
    ok(new Date(1, 2, 3, 4, 5, 6, 7).format('W, D MM Y') === 'Воскресенье, 3 Марта 1901');
  });
  test('#format', function(){
    var locale, date;
    locale = core.locale;
    ok(isFunction(Date.prototype.format), 'Is function');
    date = new Date(1, 2, 3, 4, 5, 6, 7);
    ok(date.format('DD.NN.Y') === '03.03.1901', 'Works basic');
    locale('en');
    ok(date.format('s ss m mm h hh D DD W N NN M MM YY foo Y') === '6 06 5 05 4 04 3 03 Sunday 3 03 March March 01 foo 1901', 'Works with defaut locale');
    locale('ru');
    ok(date.format('s ss m mm h hh D DD W N NN M MM YY foo Y') === '6 06 5 05 4 04 3 03 Воскресенье 3 03 Март Марта 01 foo 1901', 'Works with set in Date.locale locale');
  });
  test('#formatUTC', function(){
    var date;
    ok(isFunction(Date.prototype.formatUTC), 'Is function');
    date = new Date(1, 2, 3, 4, 5, 6, 7);
    ok(date.formatUTC('h') === '' + date.getUTCHours(), 'Works');
  });
}).call(this);

(function(){
  var isFunction, keys, create, assign, from, toStringTag, global, toString$ = {}.toString;
  QUnit.module('Dict');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  keys = Object.keys, create = Object.create, assign = Object.assign;
  from = Array.from;
  toStringTag = Symbol.toStringTag;
  global = this;
  test('Dict', function(){
    var dict1, dict2, dict3;
    ok(isFunction(global.Dict), 'Is function');
    dict1 = Dict();
    ok(!(dict1 instanceof Object));
    deepEqual(keys(dict1), []);
    dict2 = Dict({
      q: 1,
      w: 2
    });
    ok(!(dict2 instanceof Object));
    deepEqual(keys(dict2), ['q', 'w']);
    ok(dict2.q === 1);
    ok(dict2.w === 2);
    dict3 = Dict(new Set([1, 2]).entries());
    ok(!(dict3 instanceof Object));
    deepEqual(keys(dict3), ['1', '2']);
    ok(dict3[1] === 1);
    ok(dict3[2] === 2);
  });
  test('.every', function(){
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
  test('.filter', function(){
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
  test('.find', function(){
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
  test('.findKey', function(){
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
  test('.forEach', function(){
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
  test('.keyOf', function(){
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
    }, NaN) === void 8);
  });
  test('.map', function(){
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
  test('.mapPairs', function(){
    var mapPairs, obj, ctx;
    mapPairs = Dict.mapPairs;
    ok(isFunction(mapPairs), 'Is function');
    mapPairs(obj = {
      q: 1
    }, function(val, key, that){
      ok(val === 1);
      ok(key === 'q');
      ok(that === obj);
      return ok(this === ctx);
    }, ctx = {});
    deepEqual(mapPairs({
      q: 1,
      w: 2,
      e: 3
    }, function(v, k){
      return v !== 2 && [k + k, v * v];
    }), Dict({
      qq: 1,
      ee: 9
    }));
  });
  test('.reduce', function(){
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
  test('.some', function(){
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
  test('.turn', function(){
    var turn, obj;
    turn = Dict.turn;
    ok(isFunction(turn), 'Is function');
    turn(obj = {
      q: 1
    }, function(memo, val, key, that){
      deepEqual(memo, Dict());
      ok(val === 1);
      ok(key === 'q');
      return ok(that === obj);
    });
    turn({
      q: 1
    }, function(it){
      return ok(it === obj);
    }, obj = {});
    deepEqual(turn({
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
  test('.includes', function(){
    var includes, dict, o;
    includes = Dict.includes;
    ok(isFunction(includes), 'Is function');
    dict = {
      q: 1,
      w: NaN,
      e: -0,
      r: o = {}
    };
    ok(includes(dict, 1));
    ok(includes(dict, -0));
    ok(includes(dict, 0));
    ok(includes(dict, NaN));
    ok(includes(dict, o));
    ok(!includes(dict, 4));
    ok(!includes(dict, -0.5));
    ok(!includes(dict, {}));
  });
  test('.has', function(){
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
  test('.get', function(){
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
  test('.values', function(){
    var values, iter;
    values = Dict.values;
    ok(isFunction(values), 'Is function');
    iter = values({});
    ok(iter[toStringTag] === 'Dict Iterator');
    ok('next' in iter);
    deepEqual(from(values({
      q: 1,
      w: 2,
      e: 3
    })), [1, 2, 3]);
    deepEqual(from(values(new String('qwe'))), ['q', 'w', 'e']);
    deepEqual(from(values(assign(create({
      q: 1,
      w: 2,
      e: 3
    }), {
      a: 4,
      s: 5,
      d: 6
    }))), [4, 5, 6]);
  });
  test('.keys', function(){
    var keys, iter;
    keys = Dict.keys;
    ok(isFunction(keys), 'Is function');
    iter = keys({});
    ok(iter[toStringTag] === 'Dict Iterator');
    ok('next' in iter);
    deepEqual(from(keys({
      q: 1,
      w: 2,
      e: 3
    })), ['q', 'w', 'e']);
    deepEqual(from(keys(new String('qwe'))), ['0', '1', '2']);
    deepEqual(from(keys(assign(create({
      q: 1,
      w: 2,
      e: 3
    }), {
      a: 4,
      s: 5,
      d: 6
    }))), ['a', 's', 'd']);
  });
  test('.entries', function(){
    var entries, iter;
    entries = Dict.entries;
    ok(isFunction(entries), 'Is function');
    iter = entries({});
    ok(iter[toStringTag] === 'Dict Iterator');
    ok('next' in iter);
    deepEqual(from(entries({
      q: 1,
      w: 2,
      e: 3
    })), [['q', 1], ['w', 2], ['e', 3]]);
    deepEqual(from(entries(new String('qwe'))), [['0', 'q'], ['1', 'w'], ['2', 'e']]);
    deepEqual(from(entries(assign(create({
      q: 1,
      w: 2,
      e: 3
    }), {
      a: 4,
      s: 5,
      d: 6
    }))), [['a', 4], ['s', 5], ['d', 6]]);
  });
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  QUnit.module('ES5');
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
  test('Object.seal', function(){
    var seal, a;
    seal = Object.seal;
    ok(isFunction(seal), 'Is function');
    equal(seal(a = {}), a);
  });
  test('Object.freeze', function(){
    var freeze, a;
    freeze = Object.freeze;
    ok(isFunction(freeze), 'Is function');
    equal(freeze(a = {}), a);
  });
  test('Object.preventExtensions', function(){
    var preventExtensions, a;
    preventExtensions = Object.preventExtensions;
    ok(isFunction(preventExtensions), 'Is function');
    equal(preventExtensions(a = {}), a);
  });
  test('Object.isSealed', function(){
    var isSealed;
    isSealed = Object.isSealed;
    ok(isFunction(isSealed), 'Is function');
    equal(isSealed({}), false);
  });
  test('Object.isFrozen', function(){
    var isFrozen;
    isFrozen = Object.isFrozen;
    ok(isFunction(isFrozen), 'Is function');
    equal(isFrozen({}), false);
  });
  test('Object.isExtensible', function(){
    var isExtensible;
    isExtensible = Object.isExtensible;
    ok(isFunction(isExtensible), 'Is function');
    equal(isExtensible({}), true);
  });
  test('Function#bind', function(){
    var obj;
    ok(isFunction(Function.prototype.bind), 'Is function');
    obj = {
      a: 42
    };
    ok(42 === function(){
      return this.a;
    }.bind(obj)());
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
  test('Array#indexOf', function(){
    ok(0 === [1, 1, 1].indexOf(1));
    ok(-1 === [1, 2, 3].indexOf(1, 1));
    ok(1 === [1, 2, 3].indexOf(2, 1));
    ok(-1 === [NaN].indexOf(NaN));
    ok(3 === Array(2).concat([1, 2, 3]).indexOf(2));
    ok(-1 === Array(1).indexOf(void 8));
  });
  test('Array#lastIndexOf', function(){
    equal(2, [1, 1, 1].lastIndexOf(1));
    equal(-1, [1, 2, 3].lastIndexOf(3, 1));
    equal(1, [1, 2, 3].lastIndexOf(2, 1));
    equal(-1, [NaN].lastIndexOf(NaN));
    equal(1, [1, 2, 3].concat(Array(2)).lastIndexOf(2));
  });
  test('Array#every', function(){
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
  test('Array#some', function(){
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
  test('Array#forEach', function(){
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
  test('Array#map', function(){
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
  test('Array#filter', function(){
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
  test('Array#reduce', function(){
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
  test('Array#reduceRight', function(){
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
  test('String#trim', function(){
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
  'use strict';
  var eq, deq, sameEq, strict, isFunction, isIterator, getOwnPropertyDescriptor, defineProperty, create, iterator, toStringTag, epsilon, descriptors, toString$ = {}.toString;
  QUnit.module('ES6');
  eq = strictEqual;
  deq = deepEqual;
  sameEq = function(a, b, c){
    return ok(Object.is(a, b), c);
  };
  strict = typeof function(){
    return this;
  }.call(void 8) === 'undefined';
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isIterator = function(it){
    return typeof it === 'object' && typeof it.next === 'function';
  };
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, defineProperty = Object.defineProperty, create = Object.create;
  iterator = Symbol.iterator, toStringTag = Symbol.toStringTag;
  epsilon = function(a, b, E){
    return Math.abs(a - b) <= (E != null ? E : 1e-11);
  };
  descriptors = /\[native code\]\s*\}\s*$/.test(defineProperty);
  test('Object.assign', function(){
    var assign, foo, str;
    assign = Object.assign;
    ok(isFunction(assign), 'Is function');
    foo = {
      q: 1
    };
    eq(foo, assign(foo, {
      bar: 2
    }), 'assign return target');
    eq(foo.bar, 2, 'assign define properties');
    if (descriptors) {
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
    deq(assign({}, {
      q: 1
    }, {
      w: 2
    }), {
      q: 1,
      w: 2
    });
    deq(assign({}, 'qwe'), {
      0: 'q',
      1: 'w',
      2: 'e'
    });
    throws(function(){
      return assign(null, {
        q: 1
      });
    }, TypeError);
    throws(function(){
      return assign(void 8, {
        q: 1
      });
    }, TypeError);
    str = assign('qwe', {
      q: 1
    });
    eq(typeof str, 'object');
    eq(String(str), 'qwe');
    eq(str.q, 1);
  });
  test('Object.is', function(){
    var same;
    same = Object.is;
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
      eq(setPrototypeOf({
        a: 2
      }, {
        b: function(){
          return Math.pow(this.a, 2);
        }
      }).b(), 4, 'Child and parent properties in target');
      eq(setPrototypeOf(tmp = {}, {
        a: 1
      }), tmp, 'setPrototypeOf return target');
      ok(!('toString' in setPrototypeOf({}, null)), 'Can set null as prototype');
    });
  }
  test('Object#toString', function(){
    var toString, Class, BadClass;
    toString = Object.prototype.toString;
    eq(toString.call(true), '[object Boolean]', 'classof bool is `Boolean`');
    eq(toString.call('string'), '[object String]', 'classof string is `String`');
    eq(toString.call(7), '[object Number]', 'classof number is `Number`');
    eq(toString.call(Symbol()), '[object Symbol]', 'classof symbol is `Symbol`');
    eq(toString.call(new Boolean(false)), '[object Boolean]', 'classof new Boolean is `Boolean`');
    eq(toString.call(new String('')), '[object String]', 'classof new String is `String`');
    eq(toString.call(new Number(7)), '[object Number]', 'classof new Number is `Number`');
    eq('' + {}, '[object Object]', 'classof {} is `Object`');
    eq(toString.call([]), '[object Array]', 'classof array is `Array`');
    eq(toString.call(function(){}), '[object Function]', 'classof function is `Function`');
    eq(toString.call(/./), '[object RegExp]', 'classof regexp is `Undefined`');
    eq(toString.call(TypeError()), '[object Error]', 'classof new TypeError is `RegExp`');
    eq(toString.call(function(){
      return arguments;
    }()), '[object Arguments]', 'classof arguments list is `Arguments`');
    eq('' + new Set, '[object Set]', 'classof undefined is `Map`');
    eq('' + new Map, '[object Map]', 'classof map is `Undefined`');
    eq('' + new WeakSet, '[object WeakSet]', 'classof weakset is `WeakSet`');
    eq('' + new WeakMap, '[object WeakMap]', 'classof weakmap is `WeakMap`');
    eq('' + new Promise(function(){}), '[object Promise]', 'classof promise is `Promise`');
    eq('' + ''[Symbol.iterator](), '[object String Iterator]', 'classof String Iterator is `String Iterator`');
    eq('' + [].entries(), '[object Array Iterator]', 'classof Array Iterator is `Array Iterator`');
    eq('' + new Set().entries(), '[object Set Iterator]', 'classof Set Iterator is `Set Iterator`');
    eq('' + new Map().entries(), '[object Map Iterator]', 'classof Map Iterator is `Map Iterator`');
    eq('' + Math, '[object Math]', 'classof Math is `Math`');
    if (typeof JSON != 'undefined' && JSON !== null) {
      eq(toString.call(JSON), '[object JSON]', 'classof JSON is `JSON`');
    }
    Class = (function(){
      Class.displayName = 'Class';
      var prototype = Class.prototype, constructor = Class;
      Class.prototype[Symbol.toStringTag] = 'Class';
      function Class(){}
      return Class;
    }());
    eq('' + new Class, '[object Class]', 'classof user class is [Symbol.toStringTag]');
    BadClass = (function(){
      BadClass.displayName = 'BadClass';
      var prototype = BadClass.prototype, constructor = BadClass;
      BadClass.prototype[Symbol.toStringTag] = 'Array';
      function BadClass(){}
      return BadClass;
    }());
    eq('' + new BadClass, '[object ~Array]', 'safe [[Class]]');
  });
  test('Number.EPSILON', function(){
    var EPSILON;
    EPSILON = Number.EPSILON;
    ok('EPSILON' in Number, 'EPSILON in Number');
    ok(EPSILON === Math.pow(2, -52), 'Is 2^-52');
    ok(1 !== 1 + EPSILON, '1 isnt 1 + EPSILON');
    ok(1 === 1 + EPSILON / 2, '1 is 1 + EPSILON / 2');
  });
  test('Number.isFinite', function(){
    var isFinite, i$, x$, ref$, len$, y$, e;
    isFinite = Number.isFinite;
    ok(isFunction(isFinite), 'Is function');
    for (i$ = 0, len$ = (ref$ = [1, 0.1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFinite(x$), "isFinite " + typeof x$ + " " + x$);
    }
    for (i$ = 0, len$ = (ref$ = [NaN, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$, create(null)]).length; i$ < len$; ++i$) {
      y$ = ref$[i$];
      ok(!isFinite(y$), "not isFinite " + typeof y$ + " " + (fn1$()));
    }
    function fn$(){}
    function fn1$(){
      try {
        return String(y$);
      } catch (e$) {
        e = e$;
        return 'Object.create(null)';
      }
    }
  });
  test('Number.isInteger', function(){
    var isInteger, i$, x$, ref$, len$, y$, e;
    isInteger = Number.isInteger;
    ok(isFunction(isInteger), 'Is function');
    for (i$ = 0, len$ = (ref$ = [1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isInteger(x$), "isInteger " + typeof x$ + " " + x$);
    }
    for (i$ = 0, len$ = (ref$ = [NaN, 0.1, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$, create(null)]).length; i$ < len$; ++i$) {
      y$ = ref$[i$];
      ok(!isInteger(y$), "not isInteger " + typeof y$ + " " + (fn1$()));
    }
    function fn$(){}
    function fn1$(){
      try {
        return String(y$);
      } catch (e$) {
        e = e$;
        return 'Object.create(null)';
      }
    }
  });
  test('Number.isNaN', function(){
    var isNaN, i$, x$, ref$, len$, e;
    isNaN = Number.isNaN;
    ok(isFunction(isNaN), 'Is function');
    ok(isNaN(NaN), 'Number.isNaN NaN');
    for (i$ = 0, len$ = (ref$ = [1, 0.1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$, create(null)]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(!isNaN(x$), "not Number.isNaN " + typeof x$ + " " + (fn1$()));
    }
    function fn$(){}
    function fn1$(){
      try {
        return String(x$);
      } catch (e$) {
        e = e$;
        return 'Object.create(null)';
      }
    }
  });
  test('Number.isSafeInteger', function(){
    var isSafeInteger, i$, x$, ref$, len$, y$, e;
    isSafeInteger = Number.isSafeInteger;
    ok(isFunction(isSafeInteger), 'Is function');
    for (i$ = 0, len$ = (ref$ = [1, -1, Math.pow(2, 16), Math.pow(2, 16) - 1, Math.pow(2, 31), Math.pow(2, 31) - 1, Math.pow(2, 32), Math.pow(2, 32) - 1, -0, 9007199254740991, -9007199254740991]).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isSafeInteger(x$), "isSafeInteger " + typeof x$ + " " + x$);
    }
    for (i$ = 0, len$ = (ref$ = [9007199254740992, -9007199254740992, NaN, 0.1, Infinity, 'NaN', '5', false, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void 8, null, {}, fn$, create(null)]).length; i$ < len$; ++i$) {
      y$ = ref$[i$];
      ok(!isSafeInteger(y$), "not isSafeInteger " + typeof y$ + " " + (fn1$()));
    }
    function fn$(){}
    function fn1$(){
      try {
        return String(y$);
      } catch (e$) {
        e = e$;
        return 'Object.create(null)';
      }
    }
  });
  test('Number.MAX_SAFE_INTEGER', function(){
    eq(Number.MAX_SAFE_INTEGER, Math.pow(2, 53) - 1, 'Is 2^53 - 1');
  });
  test('Number.MIN_SAFE_INTEGER', function(){
    eq(Number.MIN_SAFE_INTEGER, -Math.pow(2, 53) + 1, 'Is -2^53 + 1');
  });
  test('Number.parseFloat', function(){
    ok(isFunction(Number.parseFloat), 'Is function');
  });
  test('Number.parseInt', function(){
    ok(isFunction(Number.parseInt), 'Is function');
  });
  test('Math.acosh', function(){
    var acosh;
    acosh = Math.acosh;
    ok(isFunction(acosh), 'Is function');
    sameEq(acosh(NaN), NaN);
    sameEq(acosh(0.5), NaN);
    sameEq(acosh(-1), NaN);
    sameEq(acosh(-1e300), NaN);
    sameEq(acosh(1), 0);
    eq(acosh(Infinity), Infinity);
    ok(epsilon(acosh(1234), 7.811163220849231));
    ok(epsilon(acosh(8.88), 2.8737631531629235));
  });
  test('Math.asinh', function(){
    var asinh;
    asinh = Math.asinh;
    ok(isFunction(asinh), 'Is function');
    sameEq(asinh(NaN), NaN);
    sameEq(asinh(0), 0);
    sameEq(asinh(-0), -0);
    eq(asinh(Infinity), Infinity);
    eq(asinh(-Infinity), -Infinity);
    ok(epsilon(asinh(1234), 7.811163549201245));
    ok(epsilon(asinh(9.99), 2.997227420191335));
    ok(epsilon(asinh(1e150), 346.0809111296668));
    ok(epsilon(asinh(1e7), 16.811242831518268));
    ok(epsilon(asinh(-1e7), -16.811242831518268));
  });
  test('Math.atanh', function(){
    var atanh;
    atanh = Math.atanh;
    ok(isFunction(atanh), 'Is function');
    sameEq(atanh(NaN), NaN);
    sameEq(atanh(-2), NaN);
    sameEq(atanh(-1.5), NaN);
    sameEq(atanh(2), NaN);
    sameEq(atanh(1.5), NaN);
    eq(atanh(-1), -Infinity);
    eq(atanh(1), Infinity);
    sameEq(atanh(0), 0);
    sameEq(atanh(-0), -0);
    sameEq(atanh(-1e300), NaN);
    sameEq(atanh(1e300), NaN);
    ok(epsilon(atanh(0.5), 0.5493061443340549));
    ok(epsilon(atanh(-0.5), -0.5493061443340549));
    ok(epsilon(atanh(0.444), 0.47720201260109457));
  });
  test('Math.cbrt', function(){
    var cbrt;
    cbrt = Math.cbrt;
    ok(isFunction(cbrt), 'Is function');
    sameEq(cbrt(NaN), NaN);
    sameEq(cbrt(0), 0);
    sameEq(cbrt(-0), -0);
    eq(cbrt(Infinity), Infinity);
    eq(cbrt(-Infinity), -Infinity);
    eq(cbrt(-8), -2);
    eq(cbrt(8), 2);
    ok(epsilon(cbrt(-1000), -10));
    ok(epsilon(cbrt(1000), 10));
  });
  test('Math.clz32', function(){
    var clz32;
    clz32 = Math.clz32;
    ok(isFunction(clz32), 'Is function');
    eq(clz32(0), 32);
    eq(clz32(1), 31);
    sameEq(clz32(-1), 0);
    eq(clz32(0.6), 32);
    sameEq(clz32(Math.pow(2, 32) - 1), 0);
    eq(clz32(Math.pow(2, 32)), 32);
  });
  test('Math.cosh', function(){
    var cosh;
    cosh = Math.cosh;
    ok(isFunction(cosh), 'Is function');
    sameEq(cosh(NaN), NaN);
    eq(cosh(0), 1);
    eq(cosh(-0), 1);
    eq(cosh(Infinity), Infinity);
    eq(cosh(-Infinity), Infinity);
    ok(epsilon(cosh(12), 81377.39571257407, 3e-11));
    ok(epsilon(cosh(22), 1792456423.065795780980053377, 1e-5));
    ok(epsilon(cosh(-10), 11013.23292010332313972137));
    ok(epsilon(cosh(-23), 4872401723.1244513000, 1e-5));
  });
  test('Math.expm1', function(){
    var expm1;
    expm1 = Math.expm1;
    ok(isFunction(expm1), 'Is function');
    sameEq(expm1(NaN), NaN);
    sameEq(expm1(0), 0);
    sameEq(expm1(-0), -0);
    eq(expm1(Infinity), Infinity);
    eq(expm1(-Infinity), -1);
    ok(epsilon(expm1(10), 22025.465794806718, ok(epsilon(expm1(-10), -0.9999546000702375))));
  });
  if (typeof Float32Array != 'undefined' && Float32Array !== null) {
    test('Math.fround', function(){
      var fround, maxFloat32, minFloat32;
      fround = Math.fround;
      ok(isFunction(fround), 'Is function');
      sameEq(fround(void 8), NaN);
      sameEq(fround(NaN), NaN);
      sameEq(fround(0), 0);
      sameEq(fround(-0), -0);
      sameEq(fround(Number.MIN_VALUE), 0);
      sameEq(fround(-Number.MIN_VALUE), -0);
      eq(fround(Infinity), Infinity);
      eq(fround(-Infinity), -Infinity);
      eq(fround(1.7976931348623157e+308), Infinity);
      eq(fround(-1.7976931348623157e+308), -Infinity);
      eq(fround(3.4028235677973366e+38), Infinity);
      eq(fround(3), 3);
      eq(fround(-3), -3);
      maxFloat32 = 3.4028234663852886e+38;
      minFloat32 = 1.401298464324817e-45;
      eq(fround(maxFloat32), maxFloat32);
      eq(fround(-maxFloat32), -maxFloat32);
      eq(fround(maxFloat32 + Math.pow(2, Math.pow(2, 8 - 1) - 1 - 23 - 2)), maxFloat32);
      eq(fround(minFloat32), minFloat32);
      eq(fround(-minFloat32), -minFloat32);
      sameEq(fround(minFloat32 / 2), 0);
      sameEq(fround(-minFloat32 / 2), -0);
      eq(fround(minFloat32 / 2 + Math.pow(2, -202)), minFloat32);
      eq(fround(-minFloat32 / 2 - Math.pow(2, -202)), -minFloat32);
    });
  }
  test('Math.hypot', function(){
    var hypot, sqrt;
    hypot = Math.hypot, sqrt = Math.sqrt;
    ok(isFunction(hypot), 'Is function');
    sameEq(hypot('', 0), 0);
    sameEq(hypot(0, ''), 0);
    eq(hypot(Infinity, 0), Infinity);
    eq(hypot(-Infinity, 0), Infinity);
    eq(hypot(0, Infinity), Infinity);
    eq(hypot(0, -Infinity), Infinity);
    eq(hypot(Infinity, NaN), Infinity);
    eq(hypot(NaN, -Infinity), Infinity);
    sameEq(hypot(NaN, 0), NaN);
    sameEq(hypot(0, NaN), NaN);
    sameEq(hypot(0, -0), 0);
    sameEq(hypot(0, 0), 0);
    sameEq(hypot(-0, -0), 0);
    sameEq(hypot(-0, 0), 0);
    eq(hypot(0, 1), 1);
    eq(hypot(0, -1), 1);
    eq(hypot(-0, 1), 1);
    eq(hypot(-0, -1), 1);
    sameEq(hypot(0), 0);
    eq(hypot(1), 1);
    eq(hypot(2), 2);
    eq(hypot(0, 0, 1), 1);
    eq(hypot(0, 1, 0), 1);
    eq(hypot(1, 0, 0), 1);
    eq(hypot(2, 3, 4), sqrt(2 * 2 + 3 * 3 + 4 * 4));
    eq(hypot(2, 3, 4, 5), sqrt(2 * 2 + 3 * 3 + 4 * 4 + 5 * 5));
    ok(epsilon(hypot(66, 66), 93.33809511662427));
    ok(epsilon(hypot(0.1, 100), 100.0000499999875));
    eq(hypot(1e+300, 1e+300), 1.4142135623730952e+300);
    eq(hypot(1e-300, 1e-300), 1.4142135623730952e-300);
    eq(hypot(1e+300, 1e+300, 2, 3), 1.4142135623730952e+300);
  });
  test('Math.imul', function(){
    var imul;
    imul = Math.imul;
    ok(isFunction(imul), 'Is function');
    sameEq(imul(0, 0), 0);
    eq(imul(123, 456), 56088);
    eq(imul(-123, 456), -56088);
    eq(imul(123, -456), -56088);
    eq(imul(19088743, 4275878552), 602016552);
    sameEq(imul(false, 7), 0);
    sameEq(imul(7, false), 0);
    sameEq(imul(false, false), 0);
    eq(imul(true, 7), 7);
    eq(imul(7, true), 7);
    eq(imul(true, true), 1);
    sameEq(imul(void 8, 7), 0);
    sameEq(imul(7, void 8), 0);
    sameEq(imul(void 8, void 8), 0);
    sameEq(imul('str', 7), 0);
    sameEq(imul(7, 'str'), 0);
    sameEq(imul({}, 7), 0);
    sameEq(imul(7, {}), 0);
    sameEq(imul([], 7), 0);
    sameEq(imul(7, []), 0);
    eq(imul(0xffffffff, 5), -5);
    eq(imul(0xfffffffe, 5), -10);
    eq(imul(2, 4), 8);
    eq(imul(-1, 8), -8);
    eq(imul(-2, -2), 4);
    sameEq(imul(-0, 7), 0);
    sameEq(imul(7, -0), 0);
    sameEq(imul(0.1, 7), 0);
    sameEq(imul(7, 0.1), 0);
    sameEq(imul(0.9, 7), 0);
    sameEq(imul(7, 0.9), 0);
    eq(imul(1.1, 7), 7);
    eq(imul(7, 1.1), 7);
    eq(imul(1.9, 7), 7);
    eq(imul(7, 1.9), 7);
  });
  test('Math.log1p', function(){
    var log1p;
    log1p = Math.log1p;
    ok(isFunction(log1p), 'Is function');
    sameEq(log1p(''), log1p(0));
    sameEq(log1p(NaN), NaN);
    sameEq(log1p(-2), NaN);
    sameEq(log1p(-1), -Infinity);
    sameEq(log1p(0), 0);
    sameEq(log1p(-0), -0);
    sameEq(log1p(Infinity), Infinity);
    ok(epsilon(log1p(5), 1.791759469228055));
    ok(epsilon(log1p(50), 3.9318256327243257));
  });
  test('Math.log10', function(){
    var log10;
    log10 = Math.log10;
    ok(isFunction(log10), 'Is function');
    sameEq(log10(''), log10(0));
    sameEq(log10(NaN), NaN);
    sameEq(log10(-1), NaN);
    sameEq(log10(0), -Infinity);
    sameEq(log10(-0), -Infinity);
    sameEq(log10(1), 0);
    sameEq(log10(Infinity), Infinity);
    ok(epsilon(log10(0.1), -1));
    ok(epsilon(log10(0.5), -0.3010299956639812));
    ok(epsilon(log10(1.5), 0.17609125905568124));
    ok(epsilon(log10(5), 0.6989700043360189));
    ok(epsilon(log10(50), 1.6989700043360187));
  });
  test('Math.log2', function(){
    var log2;
    log2 = Math.log2;
    ok(isFunction(log2), 'Is function');
    sameEq(log2(''), log2(0));
    sameEq(log2(NaN), NaN);
    sameEq(log2(-1), NaN);
    sameEq(log2(0), -Infinity);
    sameEq(log2(-0), -Infinity);
    sameEq(log2(1), 0);
    sameEq(log2(Infinity), Infinity);
    sameEq(log2(0.5), -1);
    sameEq(log2(32), 5);
    ok(epsilon(log2(5), 2.321928094887362));
  });
  test('Math.sign', function(){
    var sign;
    sign = Math.sign;
    ok(isFunction(sign), 'Is function');
    sameEq(sign(NaN), NaN);
    sameEq(sign(), NaN);
    sameEq(sign(-0), -0);
    sameEq(sign(0), 0);
    eq(sign(Infinity), 1);
    eq(sign(-Infinity), -1);
    eq(sign(13510798882111488), 1);
    eq(sign(-13510798882111488), -1);
    eq(sign(42.5), 1);
    eq(sign(-42.5), -1);
  });
  test('Math.sinh', function(){
    var sinh;
    sinh = Math.sinh;
    ok(isFunction(sinh), 'Is function');
    sameEq(sinh(NaN), NaN);
    sameEq(sinh(0), 0);
    sameEq(sinh(-0), -0);
    eq(sinh(Infinity), Infinity);
    eq(sinh(-Infinity), -Infinity);
    ok(epsilon(sinh(-5), -74.20321057778875));
    ok(epsilon(sinh(2), 3.6268604078470186));
  });
  test('Math.tanh', function(){
    var tanh;
    tanh = Math.tanh;
    ok(isFunction(tanh), 'Is function');
    sameEq(tanh(NaN), NaN);
    sameEq(tanh(0), 0);
    sameEq(tanh(-0), -0);
    eq(tanh(Infinity), 1);
    eq(tanh(90), 1);
    ok(epsilon(tanh(10), 0.9999999958776927));
  });
  test('Math.trunc', function(){
    var trunc;
    trunc = Math.trunc;
    ok(isFunction(trunc), 'Is function');
    sameEq(trunc(NaN), NaN, 'NaN -> NaN');
    sameEq(trunc(-0), -0, '-0 -> -0');
    sameEq(trunc(0), 0, '0 -> 0');
    sameEq(trunc(Infinity), Infinity, 'Infinity -> Infinity');
    sameEq(trunc(-Infinity), -Infinity, '-Infinity -> -Infinity');
    sameEq(trunc(null), 0, 'null -> 0');
    sameEq(trunc({}), NaN, '{} -> NaN');
    eq(trunc([]), 0, '[] -> 0');
    eq(trunc(1.01), 1, '1.01 -> 0');
    eq(trunc(1.99), 1, '1.99 -> 0');
    eq(trunc(-1), -1, '-1 -> -1');
    eq(trunc(-1.99), -1, '-1.99 -> -1');
    eq(trunc(-555.555), -555, '-555.555 -> -555');
    eq(trunc(0x20000000000001), 0x20000000000001, '0x20000000000001 -> 0x20000000000001');
    eq(trunc(-0x20000000000001), -0x20000000000001, '-0x20000000000001 -> -0x20000000000001');
  });
  test('String.fromCodePoint', function(){
    var fromCodePoint, tmp, counter, result;
    fromCodePoint = String.fromCodePoint;
    ok(isFunction(fromCodePoint), 'Is function');
    eq(fromCodePoint(''), '\0');
    eq(fromCodePoint(), '');
    eq(fromCodePoint(-0), '\0');
    eq(fromCodePoint(0), '\0');
    eq(fromCodePoint(0x1D306), '\uD834\uDF06');
    eq(fromCodePoint(0x1D306, 0x61, 0x1D307), '\uD834\uDF06a\uD834\uDF07');
    eq(fromCodePoint(0x61, 0x62, 0x1D307), 'ab\uD834\uDF07');
    eq(fromCodePoint(false), '\0');
    eq(fromCodePoint(null), '\0');
    throws(function(){
      return fromCodePoint('_');
    }, RangeError);
    throws(function(){
      return fromCodePoint('+Infinity');
    }, RangeError);
    throws(function(){
      return fromCodePoint('-Infinity');
    }, RangeError);
    throws(function(){
      return fromCodePoint(-1);
    }, RangeError);
    throws(function(){
      return fromCodePoint(0x10FFFF + 1);
    }, RangeError);
    throws(function(){
      return fromCodePoint(3.14);
    }, RangeError);
    throws(function(){
      return fromCodePoint(3e-2);
    }, RangeError);
    throws(function(){
      return fromCodePoint(-Infinity);
    }, RangeError);
    throws(function(){
      return fromCodePoint(Infinity);
    }, RangeError);
    throws(function(){
      return fromCodePoint(NaN);
    }, RangeError);
    throws(function(){
      return fromCodePoint(void 8);
    }, RangeError);
    throws(function(){
      return fromCodePoint({});
    }, RangeError);
    throws(function(){
      return fromCodePoint(/./);
    }, RangeError);
    tmp = 0x60;
    eq(fromCodePoint({
      valueOf: function(){
        return ++tmp;
      }
    }), 'a');
    eq(tmp, 0x61);
    counter = Math.pow(2, 15) * 3 / 2;
    result = [];
    while (--counter >= 0) {
      result.push(0);
    }
    fromCodePoint.apply(null, result);
    counter = Math.pow(2, 15) * 3 / 2;
    result = [];
    while (--counter >= 0) {
      result.push(0xFFFF + 1);
    }
    fromCodePoint.apply(null, result);
  });
  test('String.raw', function(){
    var raw;
    raw = String.raw;
    ok(isFunction(raw), 'Is function');
    eq(raw({
      raw: ['Hi\\n', '!']
    }, 'Bob'), 'Hi\\nBob!', 'raw is array');
    eq(raw({
      raw: 'test'
    }, 0, 1, 2), 't0e1s2t', 'raw is string');
    eq(raw({
      raw: 'test'
    }, 0), 't0est', 'lacks substituting');
    throws(function(){
      return raw({});
    }, TypeError);
    throws(function(){
      return raw({
        raw: null
      });
    }, TypeError);
  });
  test('String#codePointAt', function(){
    ok(isFunction(String.prototype.codePointAt), 'Is function');
    eq('abc\uD834\uDF06def'.codePointAt(''), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt('_'), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(-Infinity), void 8);
    eq('abc\uD834\uDF06def'.codePointAt(-1), void 8);
    eq('abc\uD834\uDF06def'.codePointAt(-0), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(0), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(3), 0x1D306);
    eq('abc\uD834\uDF06def'.codePointAt(4), 0xDF06);
    eq('abc\uD834\uDF06def'.codePointAt(5), 0x64);
    eq('abc\uD834\uDF06def'.codePointAt(42), void 8);
    eq('abc\uD834\uDF06def'.codePointAt(Infinity), void 8);
    eq('abc\uD834\uDF06def'.codePointAt(Infinity), void 8);
    eq('abc\uD834\uDF06def'.codePointAt(NaN), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(false), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(null), 0x61);
    eq('abc\uD834\uDF06def'.codePointAt(void 8), 0x61);
    eq('\uD834\uDF06def'.codePointAt(''), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt('1'), 0xDF06);
    eq('\uD834\uDF06def'.codePointAt('_'), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt(), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt(-1), void 8);
    eq('\uD834\uDF06def'.codePointAt(-0), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt(0), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt(1), 0xDF06);
    eq('\uD834\uDF06def'.codePointAt(42), void 8);
    eq('\uD834\uDF06def'.codePointAt(false), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt(null), 0x1D306);
    eq('\uD834\uDF06def'.codePointAt(void 8), 0x1D306);
    eq('\uD834abc'.codePointAt(''), 0xD834);
    eq('\uD834abc'.codePointAt('_'), 0xD834);
    eq('\uD834abc'.codePointAt(), 0xD834);
    eq('\uD834abc'.codePointAt(-1), void 8);
    eq('\uD834abc'.codePointAt(-0), 0xD834);
    eq('\uD834abc'.codePointAt(0), 0xD834);
    eq('\uD834abc'.codePointAt(false), 0xD834);
    eq('\uD834abc'.codePointAt(NaN), 0xD834);
    eq('\uD834abc'.codePointAt(null), 0xD834);
    eq('\uD834abc'.codePointAt(void 8), 0xD834);
    eq('\uDF06abc'.codePointAt(''), 0xDF06);
    eq('\uDF06abc'.codePointAt('_'), 0xDF06);
    eq('\uDF06abc'.codePointAt(), 0xDF06);
    eq('\uDF06abc'.codePointAt(-1), void 8);
    eq('\uDF06abc'.codePointAt(-0), 0xDF06);
    eq('\uDF06abc'.codePointAt(0), 0xDF06);
    eq('\uDF06abc'.codePointAt(false), 0xDF06);
    eq('\uDF06abc'.codePointAt(NaN), 0xDF06);
    eq('\uDF06abc'.codePointAt(null), 0xDF06);
    eq('\uDF06abc'.codePointAt(void 8), 0xDF06);
    if (strict) {
      throws(function(){
        return String.prototype.codePointAt.call(null, 0);
      }, TypeError);
      throws(function(){
        return String.prototype.codePointAt.call(void 8, 0);
      }, TypeError);
    }
  });
  test('String#includes', function(){
    ok(isFunction(String.prototype.includes), 'Is function');
    ok(!'abc'.includes());
    ok('aundefinedb'.includes());
    ok('abcd'.includes('b', 1));
    ok(!'abcd'.includes('b', 2));
    if (strict) {
      throws(function(){
        return String.prototype.includes.call(null, '.');
      }, TypeError);
      throws(function(){
        return String.prototype.includes.call(void 8, '.');
      }, TypeError);
    }
    throws(function(){
      return 'foo[a-z]+(bar)?'.includes(/[a-z]+/);
    }, TypeError);
  });
  test('String#endsWith', function(){
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
    if (strict) {
      throws(function(){
        return String.prototype.endsWith.call(null, '.');
      }, TypeError);
      throws(function(){
        return String.prototype.endsWith.call(void 8, '.');
      }, TypeError);
    }
    throws(function(){
      return 'qwe'.endsWith(/./);
    }, TypeError);
  });
  test('String#startsWith', function(){
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
    if (strict) {
      throws(function(){
        return String.prototype.startsWith.call(null, '.');
      }, TypeError);
      throws(function(){
        return String.prototype.startsWith.call(void 8, '.');
      }, TypeError);
    }
    throws(function(){
      return 'qwe'.startsWith(/./);
    }, TypeError);
  });
  test('String#repeat', function(){
    ok(isFunction(String.prototype.repeat), 'Is function');
    eq('qwe'.repeat(3), 'qweqweqwe');
    eq('qwe'.repeat(2.5), 'qweqwe');
    throws(function(){
      return 'qwe'.repeat(-1);
    }, RangeError);
    throws(function(){
      return 'qwe'.repeat(Infinity);
    }, RangeError);
    if (strict) {
      throws(function(){
        return String.prototype.repeat.call(null, 1);
      }, TypeError);
      throws(function(){
        return String.prototype.repeat.call(void 8, 1);
      }, TypeError);
    }
  });
  test('String#@@iterator', function(){
    var iter;
    ok(typeof String.prototype[iterator] === 'function', 'Is function');
    iter = 'qwe'[iterator]();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'String Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
    eq(Array.from('𠮷𠮷𠮷').length, 3);
    iter = '𠮷𠮷𠮷'[iterator]();
    deq(iter.next(), {
      value: '𠮷',
      done: false
    });
    deq(iter.next(), {
      value: '𠮷',
      done: false
    });
    deq(iter.next(), {
      value: '𠮷',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Array.from', function(){
    var from, al, ctx;
    from = Array.from;
    ok(isFunction(from), 'Is function');
    deq(from('123'), ['1', '2', '3']);
    deq(from({
      length: 3,
      0: 1,
      1: 2,
      2: 3
    }), [1, 2, 3]);
    from(al = function(){
      return arguments;
    }(1), function(val, key){
      eq(this, ctx);
      eq(val, 1);
      return eq(key, 0);
    }, ctx = {});
    from([1], function(val, key){
      eq(this, ctx);
      eq(val, 1);
      return eq(key, 0);
    }, ctx = {});
    deq(from({
      length: 3,
      0: 1,
      1: 2,
      2: 3
    }, (function(it){
      return Math.pow(it, 2);
    })), [1, 4, 9]);
    deq(from(new Set([1, 2, 3, 2, 1])), [1, 2, 3], 'Works with iterators');
    throws(function(){
      return from(null);
    }, TypeError);
    throws(function(){
      return from(void 8);
    }, TypeError);
  });
  test('Array.of', function(){
    ok(isFunction(Array.of), 'Is function');
    deq(Array.of(1), [1]);
    deq(Array.of(1, 2, 3), [1, 2, 3]);
  });
  test('Array#copyWithin', function(){
    var a;
    ok(isFunction(Array.prototype.copyWithin), 'Is function');
    eq(a = [1].copyWithin(0), a);
    deq([1, 2, 3, 4, 5].copyWithin(0, 3), [4, 5, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(1, 3), [1, 4, 5, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(1, 2), [1, 3, 4, 5, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(2, 2), [1, 2, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(0, 3, 4), [4, 2, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(1, 3, 4), [1, 4, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(1, 2, 4), [1, 3, 4, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(0, -2), [4, 5, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(0, -2, -1), [4, 2, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(-4, -3, -2), [1, 3, 3, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(-4, -3, -1), [1, 3, 4, 4, 5]);
    deq([1, 2, 3, 4, 5].copyWithin(-4, -3), [1, 3, 4, 5, 5]);
    if (strict) {
      throws(function(){
        return Array.prototype.copyWithin.call(null, 0);
      }, TypeError);
      throws(function(){
        return Array.prototype.copyWithin.call(void 8, 0);
      }, TypeError);
    }
    ok('copyWithin' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#fill', function(){
    var a;
    ok(isFunction(Array.prototype.fill), 'Is function');
    eq(a = Array(5).fill(5), a);
    deq(Array(5).fill(5), [5, 5, 5, 5, 5]);
    deq(Array(5).fill(5, 1), [void 8, 5, 5, 5, 5]);
    deq(Array(5).fill(5, 1, 4), [void 8, 5, 5, 5, void 8]);
    deq(Array(5).fill(5, 6, 1), [void 8, void 8, void 8, void 8, void 8]);
    deq(Array(5).fill(5, -3, 4), [void 8, void 8, 5, 5, void 8]);
    if (strict) {
      throws(function(){
        return Array.prototype.fill.call(null, 0);
      }, TypeError);
      throws(function(){
        return Array.prototype.fill.call(void 8, 0);
      }, TypeError);
    }
    ok('fill' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#find', function(){
    var arr, ctx;
    ok(isFunction(Array.prototype.find), 'Is function');
    (arr = [1]).find(function(val, key, that){
      eq(this, ctx);
      eq(val, 1);
      eq(key, 0);
      return eq(that, arr);
    }, ctx = {});
    eq([1, 3, NaN, 42, {}].find((function(it){
      return it === 42;
    })), 42);
    eq([1, 3, NaN, 42, {}].find((function(it){
      return it === 43;
    })), void 8);
    if (strict) {
      throws(function(){
        return Array.prototype.find.call(null, 0);
      }, TypeError);
      throws(function(){
        return Array.prototype.find.call(void 8, 0);
      }, TypeError);
    }
    ok('find' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#findIndex', function(){
    var arr, ctx;
    ok(isFunction(Array.prototype.findIndex), 'Is function');
    (arr = [1]).findIndex(function(val, key, that){
      eq(this, ctx);
      eq(val, 1);
      eq(key, 0);
      return eq(that, arr);
    }, ctx = {});
    eq([1, 3, NaN, 42, {}].findIndex((function(it){
      return it === 42;
    })), 3);
    if (strict) {
      throws(function(){
        return Array.prototype.findIndex.call(null, 0);
      }, TypeError);
      throws(function(){
        return Array.prototype.findIndex.call(void 8, 0);
      }, TypeError);
    }
    ok('findIndex' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#keys', function(){
    var iter;
    ok(typeof Array.prototype.keys === 'function', 'Is function');
    iter = ['q', 'w', 'e'].keys();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Array Iterator');
    deq(iter.next(), {
      value: 0,
      done: false
    });
    deq(iter.next(), {
      value: 1,
      done: false
    });
    deq(iter.next(), {
      value: 2,
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
    ok('keys' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#values', function(){
    var iter;
    ok(typeof Array.prototype.values === 'function', 'Is function');
    iter = ['q', 'w', 'e'].values();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Array Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
    ok('values' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#entries', function(){
    var iter;
    ok(typeof Array.prototype.entries === 'function', 'Is function');
    iter = ['q', 'w', 'e'].entries();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Array Iterator');
    deq(iter.next(), {
      value: [0, 'q'],
      done: false
    });
    deq(iter.next(), {
      value: [1, 'w'],
      done: false
    });
    deq(iter.next(), {
      value: [2, 'e'],
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
    ok('entries' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  });
  test('Array#@@iterator', function(){
    var iter;
    ok(typeof Array.prototype[iterator] === 'function', 'Is function');
    eq(Array.prototype[iterator], Array.prototype.values);
    iter = ['q', 'w', 'e'][iterator]();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Array Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Array#@@unscopables', function(){
    eq(toString$.call(Array.prototype[Symbol.unscopables]).slice(8, -1), 'Object');
  });
  if (descriptors) {
    test('Function instance "name" property', function(){
      ok('name' in Function.prototype);
      eq((function(){
        function foo(it){
          return it;
        }
        return foo;
      }()).name, 'foo');
      eq(function(){}.name, '');
    });
  }
  test('Object static methods accept primitives', function(){
    var i$, ref$, len$, method, j$, ref1$, len1$, value, result, e;
    for (i$ = 0, len$ = (ref$ = ['freeze', 'seal', 'preventExtensions', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'isExtensible', 'isSealed', 'isFrozen', 'keys', 'getOwnPropertyNames']).length; i$ < len$; ++i$) {
      method = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = [42, 'foo', false]).length; j$ < len1$; ++j$) {
        value = ref1$[j$];
        result = (fn$());
        ok(result, "Object." + method + " accept " + toString$.call(value).slice(8, -1));
      }
    }
    for (i$ = 0, len$ = (ref$ = ['freeze', 'seal', 'preventExtensions']).length; i$ < len$; ++i$) {
      method = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = [42, 'foo', false, null, void 8, {}]).length; j$ < len1$; ++j$) {
        value = ref1$[j$];
        eq(Object[method](value), value, "Object." + method + " returns target on " + toString$.call(value).slice(8, -1));
      }
    }
    for (i$ = 0, len$ = (ref$ = ['isSealed', 'isFrozen']).length; i$ < len$; ++i$) {
      method = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = [42, 'foo', false, null, void 8]).length; j$ < len1$; ++j$) {
        value = ref1$[j$];
        eq(Object[method](value), true, "Object." + method + " returns true on " + toString$.call(value).slice(8, -1));
      }
    }
    for (i$ = 0, len$ = (ref$ = [42, 'foo', false, null, void 8]).length; i$ < len$; ++i$) {
      value = ref$[i$];
      eq(Object.isExtensible(value), false, "Object.isExtensible returns false on " + toString$.call(value).slice(8, -1));
    }
    for (i$ = 0, len$ = (ref$ = ['getOwnPropertyDescriptor', 'getPrototypeOf', 'keys', 'getOwnPropertyNames']).length; i$ < len$; ++i$) {
      method = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = [null, void 8]).length; j$ < len1$; ++j$) {
        value = ref1$[j$];
        throws(fn1$, TypeError, "Object." + method + " throws on " + value);
      }
    }
    eq(Object.getPrototypeOf('foo'), String.prototype);
    function fn$(){
      try {
        Object[method](value);
        return true;
      } catch (e$) {
        e = e$;
        return false;
      }
    }
    function fn1$(){
      return Object[method](value);
    }
  });
  if (descriptors) {
    test('RegExp#flags', function(){
      eq(/./g.flags, 'g', '/./g.flags is "g"');
      eq(/./.flags, '', '/./.flags is ""');
      eq(RegExp('.', 'gim').flags, 'gim', 'RegExp(".", "gim").flags is "gim"');
      eq(RegExp('.').flags, '', 'RegExp(".").flags is ""');
      eq(/./gim.flags, 'gim', '/./gim.flags is "gim"');
      eq(/./gmi.flags, 'gim', '/./gmi.flags is "gim"');
      eq(/./mig.flags, 'gim', '/./mig.flags is "gim"');
      eq(/./mgi.flags, 'gim', '/./mgi.flags is "gim"');
    });
  }
  if (descriptors) {
    test('RegExp allows a regex with flags as the pattern', function(){
      var a, b, i$, len$, index, val;
      a = /a/g;
      b = new RegExp(a);
      ok(a !== b, 'a != b');
      eq(String(b), '/a/g', 'b is /a/g');
      eq(String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags');
      ok(new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof');
      eq(new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor');
      /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec('abcdefghijklmnopq');
      for (i$ = 0, len$ = 'bcdefghij'.length; i$ < len$; ++i$) {
        index = i$;
        val = 'bcdefghij'[i$];
        eq(RegExp["$" + (index + 1)], val, "Updates RegExp globals $" + (index + 1));
      }
    });
  }
}).call(this);

(function(){
  var isFunction, same, getOwnPropertyDescriptor, descriptors, eq, deq, iterator, toStringTag, isIterator, that, toString$ = {}.toString;
  QUnit.module('ES6 Collections');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  same = Object.is;
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  descriptors = /\[native code\]\s*\}\s*$/.test(Object.defineProperty);
  eq = strictEqual;
  deq = deepEqual;
  iterator = Symbol.iterator, toStringTag = Symbol.toStringTag;
  isIterator = function(it){
    return typeof it === 'object' && typeof it.next === 'function';
  };
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
    eq(new Map([1, 2, 3].entries()).size, 3, 'Init from iterator #1');
    eq(new Map(new Map([1, 2, 3].entries())).size, 3, 'Init from iterator #2');
  });
  test('Map#clear', function(){
    var M;
    ok(isFunction(Map.prototype.clear), 'Is function');
    M = new Map().set(1, 2).set(2, 3).set(1, 4);
    M.clear();
    eq(M.size, 0);
  });
  test('Map#delete', function(){
    var a, M;
    ok(isFunction(Map.prototype['delete']), 'Is function');
    a = [];
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(a, {});
    eq(M.size, 5);
    ok(M['delete'](NaN));
    eq(M.size, 4);
    ok(!M['delete'](4));
    eq(M.size, 4);
    M['delete']([]);
    eq(M.size, 4);
    M['delete'](a);
    eq(M.size, 3);
  });
  test('Map#forEach', function(){
    var r, T, count, M, a, map, s;
    ok(isFunction(Map.prototype.forEach), 'Is function');
    r = {};
    count = 0;
    M = new Map().set(NaN, 1).set(2, 1).set(3, 7).set(2, 5).set(1, 4).set(a = {}, 9);
    M.forEach(function(value, key){
      count++;
      r[value] = key;
    });
    eq(count, 5);
    deq(r, {
      1: NaN,
      7: 3,
      5: 2,
      4: 1,
      9: a
    });
    map = new Map([['0', 9], ['1', 9], ['2', 9], ['3', 9]]);
    s = "";
    map.forEach(function(value, key){
      s += key;
      if (key === '2') {
        map['delete']('2');
        map['delete']('3');
        map['delete']('1');
        return map.set('4', 9);
      }
    });
    eq(s, '0124');
    map = new Map([['0', 1]]);
    s = "";
    map.forEach(function(it){
      map['delete']('0');
      if (s !== '') {
        throw '!!!';
      }
      return s += it;
    });
    eq(s, '1');
  });
  test('Map#get', function(){
    var o, M;
    ok(isFunction(Map.prototype.get), 'Is function');
    o = {};
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(o, o);
    eq(M.get(NaN), 1);
    eq(M.get(4), void 8);
    eq(M.get({}), void 8);
    eq(M.get(o), o);
    eq(M.get(2), 5);
  });
  test('Map#has', function(){
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
  test('Map#set', function(){
    var o, M, chain;
    ok(isFunction(Map.prototype.set), 'Is function');
    o = {};
    M = new Map().set(NaN, 1).set(2, 1).set(3, 1).set(2, 5).set(1, 4).set(o, o);
    ok(M.size === 5);
    chain = M.set(7, 2);
    eq(chain, M);
    M.set(7, 2);
    eq(M.size, 6);
    eq(M.get(7), 2);
    eq(M.get(NaN), 1);
    M.set(NaN, 42);
    eq(M.size, 6);
    eq(M.get(NaN), 42);
    M.set({}, 11);
    eq(M.size, 7);
    eq(M.get(o), o);
    M.set(o, 27);
    eq(M.size, 7);
    eq(M.get(o), 27);
    eq(new Map().set(NaN, 2).set(NaN, 3).set(NaN, 4).size, 1);
  });
  test('Map#size', function(){
    var size, sizeDesc;
    size = new Map().set(2, 1).size;
    eq(typeof size, 'number', 'size is number');
    eq(size, 1, 'size is correct');
    if (descriptors) {
      sizeDesc = getOwnPropertyDescriptor(Map.prototype, 'size');
      ok(sizeDesc && sizeDesc.get, 'size is getter');
      ok(sizeDesc && !sizeDesc.set, 'size isnt setter');
      throws(function(){
        return Map.prototype.size;
      }, TypeError);
    }
  });
  test('Map & -0', function(){
    var map;
    map = new Map;
    map.set(-0, 1);
    eq(map.size, 1);
    ok(map.has(0));
    ok(map.has(-0));
    eq(map.get(0), 1);
    eq(map.get(-0), 1);
    map.forEach(function(val, key){
      return ok(!same(key, -0));
    });
    map['delete'](-0);
    eq(map.size, 0);
    map = new Map([[-0, 1]]);
    map.forEach(function(val, key){
      return ok(!same(key, -0));
    });
  });
  test('Map#@@toStringTag', function(){
    eq(Map.prototype[Symbol.toStringTag], 'Map', 'Map::@@toStringTag is `Map`');
  });
  test('Map Iterator', function(){
    var map, keys, iterator;
    map = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);
    keys = [];
    iterator = map.keys();
    keys.push(iterator.next().value);
    ok(map['delete']('a'));
    ok(map['delete']('b'));
    ok(map['delete']('c'));
    map.set('e');
    keys.push(iterator.next().value);
    keys.push(iterator.next().value);
    ok(iterator.next().done);
    map.set('f');
    ok(iterator.next().done);
    deq(keys, ['a', 'd', 'e']);
  });
  test('Map#keys', function(){
    var iter;
    ok(typeof Map.prototype.keys === 'function', 'Is function');
    iter = new Map([['a', 'q'], ['s', 'w'], ['d', 'e']]).keys();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Map Iterator');
    deq(iter.next(), {
      value: 'a',
      done: false
    });
    deq(iter.next(), {
      value: 's',
      done: false
    });
    deq(iter.next(), {
      value: 'd',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Map#values', function(){
    var iter;
    ok(typeof Map.prototype.values === 'function', 'Is function');
    iter = new Map([['a', 'q'], ['s', 'w'], ['d', 'e']]).values();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Map Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Map#entries', function(){
    var iter;
    ok(typeof Map.prototype.entries === 'function', 'Is function');
    iter = new Map([['a', 'q'], ['s', 'w'], ['d', 'e']]).entries();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Map Iterator');
    deq(iter.next(), {
      value: ['a', 'q'],
      done: false
    });
    deq(iter.next(), {
      value: ['s', 'w'],
      done: false
    });
    deq(iter.next(), {
      value: ['d', 'e'],
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Map#@@iterator', function(){
    var iter;
    ok(typeof Map.prototype[iterator] === 'function', 'Is function');
    eq(Map.prototype[iterator], Map.prototype.entries);
    iter = new Map([['a', 'q'], ['s', 'w'], ['d', 'e']])[iterator]();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Map Iterator');
    deq(iter.next(), {
      value: ['a', 'q'],
      done: false
    });
    deq(iter.next(), {
      value: ['s', 'w'],
      done: false
    });
    deq(iter.next(), {
      value: ['d', 'e'],
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
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
    eq(new Set([1, 2, 3, 2, 1].values()).size, 3, 'Init from iterator #1');
    eq(new Set([1, 2, 3, 2, 1]).size, 3, 'Init Set from iterator #2');
    S = new Set([1, 2, 3, 2, 1]);
    eq(S.size, 3);
    r = [];
    S.forEach(function(v){
      return r.push(v);
    });
    deq(r, [1, 2, 3]);
    eq(new Set([NaN, NaN, NaN]).size, 1);
    if (Array.from) {
      deq(Array.from(new Set([3, 4]).add(2).add(1)), [3, 4, 2, 1]);
    }
  });
  test('Set#add', function(){
    var a, S, chain;
    ok(isFunction(Set.prototype.add), 'Is function');
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    eq(S.size, 5);
    chain = S.add(NaN);
    eq(chain, S);
    eq(S.size, 5);
    S.add(2);
    eq(S.size, 5);
    S.add(a);
    eq(S.size, 5);
    S.add([]);
    eq(S.size, 6);
    S.add(4);
    eq(S.size, 7);
  });
  test('Set#clear', function(){
    var S;
    ok(isFunction(Set.prototype.clear), 'Is function');
    S = new Set([1, 2, 3, 2, 1]);
    S.clear();
    eq(S.size, 0);
  });
  test('Set#delete', function(){
    var a, S;
    ok(isFunction(Set.prototype['delete']), 'Is function');
    a = [];
    S = new Set([NaN, 2, 3, 2, 1, a]);
    eq(S.size, 5);
    eq(S['delete'](NaN), true);
    eq(S.size, 4);
    eq(S['delete'](4), false);
    eq(S.size, 4);
    S['delete']([]);
    eq(S.size, 4);
    S['delete'](a);
    eq(S.size, 3);
  });
  test('Set#forEach', function(){
    var r, count, S, set, s;
    ok(isFunction(Set.prototype.forEach), 'Is function');
    r = [];
    count = 0;
    S = new Set([1, 2, 3, 2, 1]);
    S.forEach(function(value){
      count++;
      r.push(value);
    });
    eq(count, 3);
    deq(r, [1, 2, 3]);
    set = new Set(['0', '1', '2', '3']);
    s = "";
    set.forEach(function(it){
      s += it;
      if (it === '2') {
        set['delete']('2');
        set['delete']('3');
        set['delete']('1');
        return set.add('4');
      }
    });
    eq(s, '0124');
    set = new Set(['0']);
    s = "";
    set.forEach(function(it){
      set['delete']('0');
      if (s !== '') {
        throw '!!!';
      }
      return s += it;
    });
    eq(s, '0');
  });
  test('Set#has', function(){
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
  test('Set#size', function(){
    var size, sizeDesc;
    size = new Set([1]).size;
    eq(typeof size, 'number', 'size is number');
    eq(size, 1, 'size is correct');
    if (descriptors) {
      sizeDesc = getOwnPropertyDescriptor(Set.prototype, 'size');
      ok(sizeDesc && sizeDesc.get, 'size is getter');
      ok(sizeDesc && !sizeDesc.set, 'size isnt setter');
      throws(function(){
        return Set.prototype.size;
      }, TypeError);
    }
  });
  test('Set & -0', function(){
    var set;
    set = new Set;
    set.add(-0);
    eq(set.size, 1);
    ok(set.has(0));
    ok(set.has(-0));
    set.forEach(function(it){
      return ok(!same(it, -0));
    });
    set['delete'](-0);
    eq(set.size, 0);
    set = new Set([-0]);
    set.forEach(function(key){
      return ok(!same(key, -0));
    });
  });
  test('Set#@@toStringTag', function(){
    eq(Set.prototype[Symbol.toStringTag], 'Set', 'Set::@@toStringTag is `Set`');
  });
  test('Set Iterator', function(){
    var set, keys, iterator;
    set = new Set(['a', 'b', 'c', 'd']);
    keys = [];
    iterator = set.keys();
    keys.push(iterator.next().value);
    ok(set['delete']('a'));
    ok(set['delete']('b'));
    ok(set['delete']('c'));
    set.add('e');
    keys.push(iterator.next().value);
    keys.push(iterator.next().value);
    ok(iterator.next().done);
    set.add('f');
    ok(iterator.next().done);
    deq(keys, ['a', 'd', 'e']);
  });
  test('Set#keys', function(){
    var iter;
    ok(typeof Set.prototype.keys === 'function', 'Is function');
    eq(Set.prototype.keys, Set.prototype.values);
    iter = new Set(['q', 'w', 'e']).keys();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Set Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Set#values', function(){
    var iter;
    ok(typeof Set.prototype.values === 'function', 'Is function');
    iter = new Set(['q', 'w', 'e']).values();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Set Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Set#entries', function(){
    var iter;
    ok(typeof Set.prototype.entries === 'function', 'Is function');
    iter = new Set(['q', 'w', 'e']).entries();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Set Iterator');
    deq(iter.next(), {
      value: ['q', 'q'],
      done: false
    });
    deq(iter.next(), {
      value: ['w', 'w'],
      done: false
    });
    deq(iter.next(), {
      value: ['e', 'e'],
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('Set#@@iterator', function(){
    var iter;
    ok(typeof Set.prototype[iterator] === 'function', 'Is function');
    eq(Set.prototype[iterator], Set.prototype.values);
    iter = new Set(['q', 'w', 'e'])[iterator]();
    ok(isIterator(iter), 'Return iterator');
    eq(iter[toStringTag], 'Set Iterator');
    deq(iter.next(), {
      value: 'q',
      done: false
    });
    deq(iter.next(), {
      value: 'w',
      done: false
    });
    deq(iter.next(), {
      value: 'e',
      done: false
    });
    deq(iter.next(), {
      value: void 8,
      done: true
    });
  });
  test('WeakMap', function(){
    var a, b;
    ok(isFunction(that.WeakMap), 'Is function');
    ok('delete' in WeakMap.prototype, 'delete in WeakMap.prototype');
    ok('get' in WeakMap.prototype, 'get in WeakMap.prototype');
    ok('has' in WeakMap.prototype, 'has in WeakMap.prototype');
    ok('set' in WeakMap.prototype, 'set in WeakMap.prototype');
    ok(new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap');
    eq(new WeakMap([[a = {}, b = {}]].values()).get(a), b, 'Init WeakMap from iterator #1');
    eq(new WeakMap(new Map([[a = {}, b = {}]])).get(a), b, 'Init WeakMap from iterator #2');
  });
  test('WeakMap#delete', function(){
    var M, a, b;
    ok(isFunction(WeakMap.prototype['delete']), 'Is function');
    M = new WeakMap().set(a = {}, 42).set(b = {}, 21);
    ok(M.has(a) && M.has(b), 'WeakMap has values before .delete()');
    M['delete'](a);
    ok(!M.has(a) && M.has(b), 'WeakMap has`nt value after .delete()');
  });
  test('WeakMap#get', function(){
    var M, a;
    ok(isFunction(WeakMap.prototype.get), 'Is function');
    M = new WeakMap();
    eq(M.get({}), void 8, 'WeakMap .get() before .set() return undefined');
    M.set(a = {}, 42);
    eq(M.get(a), 42, 'WeakMap .get() return value');
    M['delete'](a);
    eq(M.get(a), void 8, 'WeakMap .get() after .delete() return undefined');
  });
  test('WeakMap#has', function(){
    var M, a;
    ok(isFunction(WeakMap.prototype.has), 'Is function');
    M = new WeakMap();
    ok(!M.has({}), 'WeakMap .has() before .set() return false');
    M.set(a = {}, 42);
    ok(M.has(a), 'WeakMap .has() return true');
    M['delete'](a);
    ok(!M.has(a), 'WeakMap .has() after .delete() return false');
  });
  test('WeakMap#set', function(){
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
  test('WeakMap#@@toStringTag', function(){
    eq(WeakMap.prototype[Symbol.toStringTag], 'WeakMap', 'WeakMap::@@toStringTag is `WeakMap`');
  });
  test('WeakSet', function(){
    var a;
    ok(isFunction(that.WeakSet), 'Is function');
    ok('add' in WeakSet.prototype, 'add in WeakSet.prototype');
    ok('delete' in WeakSet.prototype, 'delete in WeakSet.prototype');
    ok('has' in WeakSet.prototype, 'has in WeakSet.prototype');
    ok(new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet');
    ok(new WeakSet([a = {}].values()).has(a), 'Init WeakSet from iterator #1');
    ok(new WeakSet([a = {}]).has(a), 'Init WeakSet from iterator #2');
  });
  test('WeakSet#add', function(){
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
  test('WeakSet#delete', function(){
    var M, a, b;
    ok(isFunction(WeakSet.prototype['delete']), 'Is function');
    M = new WeakSet().add(a = {}).add(b = {});
    ok(M.has(a) && M.has(b), 'WeakSet has values before .delete()');
    M['delete'](a);
    ok(!M.has(a) && M.has(b), 'WeakSet has`nt value after .delete()');
  });
  test('WeakSet#has', function(){
    var M, a;
    ok(isFunction(WeakSet.prototype.has), 'Is function');
    M = new WeakSet();
    ok(!M.has({}), 'WeakSet has`nt value');
    M.add(a = {});
    ok(M.has(a), 'WeakSet has value after .add()');
    M['delete'](a);
    ok(!M.has(a), 'WeakSet has`nt value after .delete()');
  });
  test('WeakSet::@@toStringTag', function(){
    eq(WeakSet.prototype[Symbol.toStringTag], 'WeakSet', 'WeakSet::@@toStringTag is `WeakSet`');
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  QUnit.module('ES6 Promise');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('Promise', function(){
    ok(isFunction(((typeof global != 'undefined' && global !== null) && global || window).Promise), 'Is function');
  });
  test('#then', function(){
    ok(isFunction(Promise.prototype.then), 'Is function');
  });
  test('#catch', function(){
    ok(isFunction(Promise.prototype['catch']), 'Is function');
  });
  test('#@@toStringTag', function(){
    ok(Promise.prototype[Symbol.toStringTag] === 'Promise', 'Promise::@@toStringTag is `Promise`');
  });
  test('.all', function(){
    ok(isFunction(Promise.all), 'Is function');
  });
  test('.race', function(){
    ok(isFunction(Promise.race), 'Is function');
  });
  test('.resolve', function(){
    ok(isFunction(Promise.resolve), 'Is function');
  });
  test('.reject', function(){
    ok(isFunction(Promise.reject), 'Is function');
  });
}).call(this);

(function(){
  var eq, deq, isFunction, MODERN, toString$ = {}.toString;
  QUnit.module('ES6 Reflect');
  eq = strictEqual;
  deq = deepEqual;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  MODERN = /\[native code\]\s*\}\s*$/.test(Object.defineProperty);
  test('Reflect', function(){
    ok(typeof Reflect != 'undefined' && Reflect !== null, 'Reflect is defined');
  });
  test('Reflect.apply', function(){
    var C;
    ok(isFunction(Reflect.apply), 'Reflect.apply is function');
    eq(Reflect.apply(Array.prototype.push, [1, 2], [3, 4, 5]), 5);
    C = function(a, b, c){
      return a + b + c;
    };
    C.apply = 42;
    eq(Reflect.apply(C, null, ['foo', 'bar', 'baz']), 'foobarbaz', 'works with redefined apply');
  });
  test('Reflect.construct', function(){
    var C, inst;
    ok(isFunction(Reflect.construct), 'Reflect.construct is function');
    C = function(a, b, c){
      return this.qux = a + b + c;
    };
    eq(Reflect.construct(C, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'basic');
    C.apply = 42;
    eq(Reflect.construct(C, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'works with redefined apply');
    inst = Reflect.construct(function(){
      return this.x = 42;
    }, [], Array);
    eq(inst.x, 42, 'constructor with newTarget');
    ok(inst instanceof Array, 'prototype with newTarget');
  });
  test('Reflect.defineProperty', function(){
    var O;
    ok(isFunction(Reflect.defineProperty), 'Reflect.defineProperty is function');
    O = {};
    eq(Reflect.defineProperty(O, 'foo', {
      value: 123
    }), true);
    eq(O.foo, 123);
    if (MODERN) {
      O = {};
      Reflect.defineProperty(O, 'foo', {
        value: 123,
        enumerable: true
      });
      deq(Object.getOwnPropertyDescriptor(O, 'foo'), {
        value: 123,
        enumerable: true,
        configurable: false,
        writable: false
      });
      eq(Reflect.defineProperty(O, 'foo', {
        value: 42
      }), false);
    }
  });
  test('Reflect.deleteProperty', function(){
    var O;
    ok(isFunction(Reflect.deleteProperty), 'Reflect.deleteProperty is function');
    O = {
      bar: 456
    };
    eq(Reflect.deleteProperty(O, 'bar'), true);
    ok(!in$('bar', O));
    if (MODERN) {
      eq(Reflect.deleteProperty(Object.defineProperty({}, 'foo', {
        value: 42
      }), 'foo'), false);
    }
  });
  test('Reflect.enumerate', function(){
    var obj, iterator, ref$;
    ok(isFunction(Reflect.enumerate), 'Reflect.enumerate is function');
    obj = {
      foo: 1,
      bar: 2
    };
    iterator = Reflect.enumerate(obj);
    ok(Symbol.iterator in iterator, 'returns iterator');
    deq(Array.from(iterator), ['foo', 'bar'], 'bisic');
    obj = {
      q: 1,
      w: 2,
      e: 3
    };
    iterator = Reflect.enumerate(obj);
    delete obj.w;
    deq(Array.from(iterator), ['q', 'e'], 'ignore holes');
    obj = (ref$ = clone$({
      q: 1,
      w: 2,
      e: 3
    }), ref$.a = 4, ref$.s = 5, ref$.d = 6, ref$);
    deq(Array.from(Reflect.enumerate(obj)).sort(), ['a', 'd', 'e', 'q', 's', 'w'], 'works with prototype');
  });
  test('Reflect.get', function(){
    var target, receiver;
    ok(isFunction(Reflect.get), 'Reflect.get is function');
    eq(Reflect.get({
      qux: 987
    }, 'qux'), 987);
    if (MODERN) {
      target = Object.create(Object.defineProperty({
        z: 3
      }, 'w', {
        get: function(){
          return this;
        }
      }), {
        x: {
          value: 1
        },
        y: {
          get: function(){
            return this;
          }
        }
      });
      receiver = {};
      eq(Reflect.get(target, 'x', receiver), 1, 'get x');
      eq(Reflect.get(target, 'y', receiver), receiver, 'get y');
      eq(Reflect.get(target, 'z', receiver), 3, 'get z');
      eq(Reflect.get(target, 'w', receiver), receiver, 'get w');
      eq(Reflect.get(target, 'u', receiver), void 8, 'get u');
    }
  });
  test('Reflect.getOwnPropertyDescriptor', function(){
    var obj, desc;
    ok(isFunction(Reflect.getOwnPropertyDescriptor), 'Reflect.getOwnPropertyDescriptor is function');
    obj = {
      baz: 789
    };
    desc = Reflect.getOwnPropertyDescriptor(obj, 'baz');
    eq(desc.value, 789);
  });
  test('Reflect.getPrototypeOf', function(){
    ok(isFunction(Reflect.getPrototypeOf), 'Reflect.getPrototypeOf is function');
    eq(Reflect.getPrototypeOf([]), Array.prototype);
  });
  test('Reflect.has', function(){
    var O;
    ok(isFunction(Reflect.has), 'Reflect.has is function');
    O = {
      qux: 987
    };
    eq(Reflect.has(O, 'qux'), true);
    eq(Reflect.has(O, 'qwe'), false);
    eq(Reflect.has(O, 'toString'), true);
  });
  test('Reflect.isExtensible', function(){
    ok(isFunction(Reflect.isExtensible), 'Reflect.isExtensible is function');
    ok(Reflect.isExtensible({}));
    if (MODERN) {
      ok(!Reflect.isExtensible(Object.preventExtensions({})));
    }
  });
  test('Reflect.ownKeys', function(){
    var O1, sym, keys, O2;
    ok(isFunction(Reflect.ownKeys), 'Reflect.ownKeys is function');
    O1 = {
      a: 1
    };
    Object.defineProperty(O1, 'b', {
      value: 2
    });
    sym = Symbol('c');
    O1[sym] = 3;
    keys = Reflect.ownKeys(O1);
    eq(keys.length, 3, 'ownKeys return all own keys');
    eq(O1[keys[0]], 1, 'ownKeys return all own keys: simple');
    eq(O1[keys[1]], 2, 'ownKeys return all own keys: hidden');
    eq(O1[keys[2]], 3, 'ownKeys return all own keys: symbol');
    O2 = clone$(O1);
    keys = Reflect.ownKeys(O2);
    eq(keys.length, 0, 'ownKeys return only own keys');
  });
  test('Reflect.preventExtensions', function(){
    var obj;
    ok(isFunction(Reflect.preventExtensions), 'Reflect.preventExtensions is function');
    obj = {};
    ok(Reflect.preventExtensions(obj), true);
    if (MODERN) {
      ok(!Object.isExtensible(obj));
    }
  });
  test('Reflect.set', function(){
    var obj, target, receiver, out;
    ok(isFunction(Reflect.set), 'Reflect.set is function');
    obj = {};
    ok(Reflect.set(obj, 'quux', 654), true);
    eq(obj.quux, 654);
    target = {};
    receiver = {};
    Reflect.set(target, 'foo', 1, receiver);
    eq(target.foo, void 8, 'target.foo === undefined');
    eq(receiver.foo, 1, 'receiver.foo === 1');
    if (MODERN) {
      Object.defineProperty(receiver, 'bar', {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
      });
      Reflect.set(target, 'bar', 1, receiver);
      eq(receiver.bar, 1, 'receiver.bar === 1');
      eq(Object.getOwnPropertyDescriptor(receiver, 'bar').enumerable, false, 'enumerability not overridden');
      target = Object.create(Object.defineProperty({
        z: 3
      }, 'w', {
        set: function(v){
          return out = this;
        }
      }), {
        x: {
          value: 1,
          writable: true,
          configurable: true
        },
        y: {
          set: function(v){
            out = this;
          }
        },
        c: {
          value: 1,
          writable: false,
          configurable: false
        }
      });
      eq(Reflect.set(target, 'x', 2, target), true, 'set x');
      eq(target.x, 2, 'set x');
      out = null;
      eq(Reflect.set(target, 'y', 2, target), true, 'set y');
      eq(out, target, 'set y');
      eq(Reflect.set(target, 'z', 4, target), true);
      eq(target.z, 4, 'set z');
      out = null;
      eq(Reflect.set(target, 'w', 1, target), true, 'set w');
      eq(out, target, 'set w');
      eq(Reflect.set(target, 'u', 0, target), true, 'set u');
      eq(target.u, 0, 'set u');
      eq(Reflect.set(target, 'c', 2, target), false, 'set c');
      eq(target.c, 1, 'set c');
    }
  });
  if ('__proto__' in Object.prototype) {
    test('Reflect.setPrototypeOf', function(){
      var obj;
      ok(isFunction(Reflect.setPrototypeOf), 'Reflect.setPrototypeOf is function');
      obj = {};
      ok(Reflect.setPrototypeOf(obj, Array.prototype), true);
      ok(obj instanceof Array);
      throws(function(){
        return Reflect.setPrototypeOf({}, 42);
      }, TypeError);
      throws(function(){
        return Reflect.setPrototypeOf(42, {});
      }, TypeError);
    });
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
}).call(this);

(function(){
  var defineProperty, getOwnPropertyDescriptor, create, isFunction, isNative, that, toString$ = {}.toString;
  QUnit.module('ES6 Symbol');
  defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, create = Object.create;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  isNative = function(it){
    return /\[native code\]\s*\}\s*$/.test(it);
  };
  that = (typeof global != 'undefined' && global !== null) && global || window;
  test('Symbol', function(){
    var s1, s2, O, count, i;
    ok(isFunction(that.Symbol), 'Is function');
    s1 = Symbol('foo');
    s2 = Symbol('foo');
    ok(s1 !== s2, 'Symbol("foo") !== Symbol("foo")');
    O = {};
    O[s1] = 42;
    ok(O[s1] === 42, 'Symbol() work as key');
    ok(O[s2] !== 42, 'Various symbols from one description are various keys');
    if (isNative(defineProperty)) {
      count = 0;
      for (i in O) {
        count++;
      }
      ok(count === 0, 'object[Symbol()] is not enumerable');
    }
  });
  test('Well-known Symbols', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['hasInstance', 'isConcatSpreadable', 'iterator', 'match', 'replace', 'search', 'species', 'split', 'toPrimitive', 'toStringTag', 'unscopables']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(x$ in Symbol, "Symbol." + x$ + " available");
    }
  });
  test('#@@toStringTag', function(){
    ok(Symbol.prototype[Symbol.toStringTag] === 'Symbol', 'Symbol::@@toStringTag is `Symbol`');
  });
  test('.pure', function(){
    var pure;
    pure = Symbol.pure;
    ok(isFunction(pure), 'Is function');
    if (isNative(Symbol)) {
      ok(typeof pure() === 'symbol', 'Symbol.pure() return symbol');
    } else {
      ok(typeof pure() === 'string', 'Symbol.pure() return string');
    }
    ok(pure('S') !== pure('S'), 'Symbol.pure(key) != Symbol.pure(key)');
  });
  test('.set', function(){
    var set, O, sym;
    set = Symbol.set;
    ok(isFunction(set), 'Is function');
    O = {};
    sym = Symbol();
    ok(set(O, sym, 42) === O, 'Symbol.set return object');
    ok(O[sym] === 42, 'Symbol.set set value');
    if (!isNative(Symbol) && isNative(defineProperty)) {
      ok(getOwnPropertyDescriptor(O, sym).enumerable === false, 'Symbol.set set enumerable: false value');
    }
  });
}).call(this);

(function(){
  'use strict';
  var strict, isFunction, eq, deq, create, assign, toString$ = {}.toString;
  QUnit.module('ES7');
  strict = typeof function(){
    return this;
  }.call(void 8) === 'undefined';
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  eq = strictEqual;
  deq = deepEqual;
  create = Object.create, assign = Object.assign;
  test('Array#includes', function(){
    var arr, o;
    ok(isFunction(Array.prototype.includes), 'Is function');
    arr = [1, 2, 3, -0, o = {}];
    ok(arr.includes(1));
    ok(arr.includes(-0));
    ok(arr.includes(0));
    ok(arr.includes(o));
    ok(!arr.includes(4));
    ok(!arr.includes(-0.5));
    ok(!arr.includes({}));
    ok(Array(1).includes(void 8));
    ok([NaN].includes(NaN));
    if (strict) {
      throws(function(){
        return Array.prototype.includes.call(null, 0);
      }, TypeError);
      throws(function(){
        return Array.prototype.includes.call(void 8, 0);
      }, TypeError);
    }
  });
  test('String#at', function(){
    var at;
    eq('abc\uD834\uDF06def'.at(-Infinity), '');
    eq('abc\uD834\uDF06def'.at(-1), '');
    eq('abc\uD834\uDF06def'.at(-0), 'a');
    eq('abc\uD834\uDF06def'.at(+0), 'a');
    eq('abc\uD834\uDF06def'.at(1), 'b');
    eq('abc\uD834\uDF06def'.at(3), '\uD834\uDF06');
    eq('abc\uD834\uDF06def'.at(4), '\uDF06');
    eq('abc\uD834\uDF06def'.at(5), 'd');
    eq('abc\uD834\uDF06def'.at(42), '');
    eq('abc\uD834\uDF06def'.at(Infinity), '');
    eq('abc\uD834\uDF06def'.at(null), 'a');
    eq('abc\uD834\uDF06def'.at(void 8), 'a');
    eq('abc\uD834\uDF06def'.at(), 'a');
    eq('abc\uD834\uDF06def'.at(false), 'a');
    eq('abc\uD834\uDF06def'.at(NaN), 'a');
    eq('abc\uD834\uDF06def'.at(''), 'a');
    eq('abc\uD834\uDF06def'.at('_'), 'a');
    eq('abc\uD834\uDF06def'.at('1'), 'b');
    eq('abc\uD834\uDF06def'.at([]), 'a');
    eq('abc\uD834\uDF06def'.at({}), 'a');
    eq('abc\uD834\uDF06def'.at(-0.9), 'a');
    eq('abc\uD834\uDF06def'.at(1.9), 'b');
    eq('abc\uD834\uDF06def'.at(7.9), 'f');
    eq('abc\uD834\uDF06def'.at(Math.pow(2, 32)), '');
    eq('\uD834\uDF06def'.at(-Infinity), '');
    eq('\uD834\uDF06def'.at(-1), '');
    eq('\uD834\uDF06def'.at(-0), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(0), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(1), '\uDF06');
    eq('\uD834\uDF06def'.at(2), 'd');
    eq('\uD834\uDF06def'.at(3), 'e');
    eq('\uD834\uDF06def'.at(4), 'f');
    eq('\uD834\uDF06def'.at(42), '');
    eq('\uD834\uDF06def'.at(Infinity), '');
    eq('\uD834\uDF06def'.at(null), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(void 8), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(false), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(NaN), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at(''), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at('_'), '\uD834\uDF06');
    eq('\uD834\uDF06def'.at('1'), '\uDF06');
    eq('\uD834abc'.at(-Infinity), '');
    eq('\uD834abc'.at(-1), '');
    eq('\uD834abc'.at(-0), '\uD834');
    eq('\uD834abc'.at(0), '\uD834');
    eq('\uD834abc'.at(1), 'a');
    eq('\uD834abc'.at(42), '');
    eq('\uD834abc'.at(Infinity), '');
    eq('\uD834abc'.at(null), '\uD834');
    eq('\uD834abc'.at(void 8), '\uD834');
    eq('\uD834abc'.at(), '\uD834');
    eq('\uD834abc'.at(false), '\uD834');
    eq('\uD834abc'.at(NaN), '\uD834');
    eq('\uD834abc'.at(''), '\uD834');
    eq('\uD834abc'.at('_'), '\uD834');
    eq('\uD834abc'.at('1'), 'a');
    eq('\uDF06abc'.at(-Infinity), '');
    eq('\uDF06abc'.at(-1), '');
    eq('\uDF06abc'.at(-0), '\uDF06');
    eq('\uDF06abc'.at(0), '\uDF06');
    eq('\uDF06abc'.at(1), 'a');
    eq('\uDF06abc'.at(42), '');
    eq('\uDF06abc'.at(Infinity), '');
    eq('\uDF06abc'.at(null), '\uDF06');
    eq('\uDF06abc'.at(void 8), '\uDF06');
    eq('\uDF06abc'.at(), '\uDF06');
    eq('\uDF06abc'.at(false), '\uDF06');
    eq('\uDF06abc'.at(NaN), '\uDF06');
    eq('\uDF06abc'.at(''), '\uDF06');
    eq('\uDF06abc'.at('_'), '\uDF06');
    eq('\uDF06abc'.at('1'), 'a');
    at = String.prototype.at;
    eq(at.call(42, 0), '4');
    eq(at.call(42, 1), '2');
    eq(at.call({
      toString: function(){
        return 'abc';
      }
    }, 2), 'c');
    if (strict) {
      throws(function(){
        return String.prototype.at.call(null, 0);
      }, TypeError);
      throws(function(){
        return String.prototype.at.call(void 8, 0);
      }, TypeError);
    }
  });
  test('Object.values', function(){
    var values;
    values = Object.values;
    ok(isFunction(values), 'Is function');
    deq(values({
      q: 1,
      w: 2,
      e: 3
    }), [1, 2, 3]);
    deq(values(new String('qwe')), ['q', 'w', 'e']);
    deq(values(assign(create({
      q: 1,
      w: 2,
      e: 3
    }), {
      a: 4,
      s: 5,
      d: 6
    })), [4, 5, 6]);
  });
  test('Object.entries', function(){
    var entries;
    entries = Object.entries;
    ok(isFunction(entries), 'Is function');
    deq(entries({
      q: 1,
      w: 2,
      e: 3
    }), [['q', 1], ['w', 2], ['e', 3]]);
    deq(entries(new String('qwe')), [['0', 'q'], ['1', 'w'], ['2', 'e']]);
    deq(entries(assign(create({
      q: 1,
      w: 2,
      e: 3
    }), {
      a: 4,
      s: 5,
      d: 6
    })), [['a', 4], ['s', 5], ['d', 6]]);
  });
  test('RegExp.escape', function(){
    var escape;
    escape = RegExp.escape;
    ok(isFunction(escape), 'Is function');
    eq(escape('qwe asd'), 'qwe asd', "Don't change simple string");
    eq(escape('\\-[]{}()*+?.,^$|'), '\\\\\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\,\\^\\$\\|', 'Escape all RegExp special chars');
  });
}).call(this);

(function(){
  var eq, isFunction, referenceGet, referenceSet, referenceDelete, toString$ = {}.toString;
  QUnit.module('ES7 Abstract References');
  eq = strictEqual;
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  referenceGet = Symbol.referenceGet, referenceSet = Symbol.referenceSet, referenceDelete = Symbol.referenceDelete;
  test('Symbols', function(){
    ok('referenceGet' in Symbol);
    ok('referenceSet' in Symbol);
    ok('referenceDelete' in Symbol);
  });
  test('Function#@@referenceGet', function(){
    var fn, O;
    ok(isFunction(Function.prototype[referenceGet]));
    fn = function(){
      return 42;
    };
    eq(fn[referenceGet](null), fn);
    eq(fn[referenceGet]({}), fn);
    eq(fn[referenceGet](O = {}).call(O), 42);
  });
  test('Map#@@referenceGet', function(){
    var map, O;
    ok(isFunction(Map.prototype[referenceGet]));
    map = new Map([[O = {}, 42]]);
    eq(map[referenceGet](O), 42);
  });
  test('Map#@@referenceSet', function(){
    var map, O;
    ok(isFunction(Map.prototype[referenceSet]));
    map = new Map;
    map[referenceSet](O = {}, 42);
    eq(map.get(O), 42);
  });
  test('Map#@@referenceDelete', function(){
    var map, O;
    ok(isFunction(Map.prototype[referenceDelete]));
    map = new Map([[O = {}, 42]]);
    map[referenceDelete](O);
    eq(map.get(O), void 8);
  });
  test('WeakMap#@@referenceGet', function(){
    var map, O;
    ok(isFunction(WeakMap.prototype[referenceGet]));
    map = new WeakMap([[O = {}, 42]]);
    eq(map[Symbol.referenceGet](O), 42);
  });
  test('WeakMap#@@referenceSet', function(){
    var map, O;
    ok(isFunction(WeakMap.prototype[referenceSet]));
    map = new WeakMap;
    map[referenceSet](O = {}, 42);
    eq(map.get(O), 42);
  });
  test('WeakMap#@@referenceDelete', function(){
    var map, O;
    ok(isFunction(WeakMap.prototype[referenceDelete]));
    map = new WeakMap([[O = {}, 42]]);
    map[referenceDelete](O);
    eq(map.get(O), void 8);
  });
}).call(this);

(function(){
  QUnit.module('Global');
  test('global', function(){
    ok(typeof global != 'undefined' && global !== null, 'global is define');
    ok(global.global === global, 'global.global is global');
    global.__tmp__ = {};
    ok(__tmp__ === global.__tmp__, 'global object properties are global variables');
  });
}).call(this);

(function(){
  var isFunction, G, eq, timeLimitedPromise, toString$ = {}.toString;
  QUnit.module('Immediate');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  G = (typeof global != 'undefined' && global !== null) && global || window;
  eq = strictEqual;
  timeLimitedPromise = function(time, fn){
    return Promise.race([
      new Promise(fn), new Promise(function(res, rej){
        return setTimeout(rej, time);
      })
    ]);
  };
  test('setImmediate / clearImmediate', function(it){
    var def;
    it.expect(6);
    ok(isFunction(G.setImmediate), 'setImmediate is function');
    ok(isFunction(G.clearImmediate), 'clearImmediate is function');
    timeLimitedPromise(1e3, function(res){
      return setImmediate(function(){
        def = 'a';
        return res();
      });
    }).then(function(){
      return ok(true, 'setImmediate works');
    })['catch'](function(){
      return ok(false, 'setImmediate works');
    }).then(it.async());
    eq(def, void 8, 'setImmediate is async');
    timeLimitedPromise(1e3, function(res){
      return setImmediate(function(a, b){
        return res(a + b);
      }, 'a', 'b');
    }).then(function(it){
      return eq(it, 'ab', 'setImmediate works with additional args');
    })['catch'](function(){
      return ok(false, 'setImmediate works with additional args');
    }).then(it.async());
    timeLimitedPromise(50, function(res){
      return clearImmediate(setImmediate(res));
    }).then(function(){
      return ok(false, 'clearImmediate works');
    })['catch'](function(){
      return ok(true, 'clearImmediate works');
    }).then(it.async());
  });
  (function(it){
    if (typeof window != 'undefined' && window !== null) {
      return window.onload = it;
    } else {
      return it();
    }
  })(function(){
    return setTimeout(function(){
      var x, now, inc;
      x = 0;
      now = Date.now();
      return (inc = function(){
        return setImmediate(function(){
          x = x + 1;
          if (Date.now() - now < 5e3) {
            return inc();
          } else {
            return console.log("setImmediate: " + x / 5 + " per second");
          }
        });
      })();
    }, 5e3);
  });
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  QUnit.module('Number');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('#@@iterator', function(){
    var iterator, toStringTag, iter1, iter2, iter3;
    iterator = Symbol.iterator, toStringTag = Symbol.toStringTag;
    ok(isFunction(Number.prototype[iterator]), 'Is function');
    iter1 = 2[iterator]();
    ok(iter1[toStringTag] === 'Number Iterator');
    deepEqual(iter1.next(), {
      done: false,
      value: 0
    });
    deepEqual(iter1.next(), {
      done: false,
      value: 1
    });
    deepEqual(iter1.next(), {
      done: true,
      value: void 8
    });
    iter2 = 1.5[iterator]();
    deepEqual(iter2.next(), {
      done: false,
      value: 0
    });
    deepEqual(iter2.next(), {
      done: true,
      value: void 8
    });
    iter3 = (-1)[iterator]();
    deepEqual(iter3.next(), {
      done: true,
      value: void 8
    });
  });
  test('#random', function(){
    ok(isFunction(Number.prototype.random), 'Is function');
    ok((function(){
      var i$, results$ = [];
      for (i$ = 0; i$ < 100; ++i$) {
        results$.push(10 .random());
      }
      return results$;
    }()).every(function(it){
      return 0 <= it && it <= 10;
    }));
    ok((function(){
      var i$, results$ = [];
      for (i$ = 0; i$ < 100; ++i$) {
        results$.push(10 .random(7));
      }
      return results$;
    }()).every(function(it){
      return 7 <= it && it <= 10;
    }));
    ok((function(){
      var i$, results$ = [];
      for (i$ = 0; i$ < 100; ++i$) {
        results$.push(7 .random(10));
      }
      return results$;
    }()).every(function(it){
      return 7 <= it && it <= 10;
    }));
  });
  test('#{...Math}', function(){
    var i$, x$, ref$, len$;
    for (i$ = 0, len$ = (ref$ = ['round', 'floor', 'ceil', 'abs', 'sin', 'asin', 'cos', 'acos', 'tan', 'atan', 'exp', 'sqrt', 'max', 'min', 'pow', 'atan2', 'acosh', 'asinh', 'atanh', 'cbrt', 'clz32', 'cosh', 'expm1', 'hypot', 'imul', 'log1p', 'log10', 'log2', 'sign', 'sinh', 'tanh', 'trunc']).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      ok(isFunction(Number.prototype[x$]), "Number" + x$ + " is function");
    }
    ok(1 .min() === 1, 'context is argument of Number#{..}');
    ok(3 .max(2) === 3, 'context is argument of Number#{..}');
    ok(3 .min(2) === 2, 'Number#{..} works with first argument');
    ok(1 .max(2, 3, 4, 5, 6, 7) === 7, 'Number#{..} works with various arguments length');
  });
}).call(this);

(function(){
  var isFunction, getPrototypeOf, defineProperty, getOwnPropertyDescriptor, DESCRIPTORS, toString$ = {}.toString;
  QUnit.module('Object');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  getPrototypeOf = Object.getPrototypeOf, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  DESCRIPTORS = /\[native code\]\s*\}\s*$/.test(defineProperty);
  test('.isObject', function(){
    var isObject;
    isObject = Object.isObject;
    ok(isFunction(isObject), 'Is function');
    ok(!isObject(void 8), 'isObject undefined return false');
    ok(!isObject(null), 'isObject null return false');
    ok(!isObject(1), 'isObject number return false');
    ok(!isObject(true), 'isObject bool return false');
    ok(!isObject('string'), 'isObject string return false');
    ok(isObject(new Number(1)), 'isObject new Number return true');
    ok(isObject(new Boolean(false)), 'isObject new Boolean return true');
    ok(isObject(new String(1)), 'isObject new String return true');
    ok(isObject({}), 'isObject object return true');
    ok(isObject([]), 'isObject array return true');
    ok(isObject(/./), 'isObject regexp return true');
    ok(isObject(function(){}), 'isObject function return true');
    ok(isObject(new function(){}), 'isObject constructor instance return true');
  });
  test('.classof', function(){
    var classof, Class, BadClass;
    classof = Object.classof;
    ok(isFunction(classof), 'Is function');
    ok(classof(void 8) === 'Undefined', 'classof undefined is `Undefined`');
    ok(classof(null) === 'Null', 'classof null is `Null`');
    ok(classof(true) === 'Boolean', 'classof bool is `Boolean`');
    ok(classof('string') === 'String', 'classof string is `String`');
    ok(classof(7) === 'Number', 'classof number is `Number`');
    ok(classof(Symbol()) === 'Symbol', 'classof symbol is `Symbol`');
    ok(classof(new Boolean(false)) === 'Boolean', 'classof new Boolean is `Boolean`');
    ok(classof(new String('')) === 'String', 'classof new String is `String`');
    ok(classof(new Number(7)) === 'Number', 'classof new Number is `Number`');
    ok(classof({}) === 'Object', 'classof {} is `Object`');
    ok(classof([]) === 'Array', 'classof array is `Array`');
    ok(classof(function(){}) === 'Function', 'classof function is `Function`');
    ok(classof(/./) === 'RegExp', 'classof regexp is `Undefined`');
    ok(classof(TypeError()) === 'Error', 'classof new TypeError is `RegExp`');
    ok(classof(function(){
      return arguments;
    }()) === 'Arguments', 'classof arguments list is `Arguments`');
    ok(classof(new Set) === 'Set', 'classof undefined is `Map`');
    ok(classof(new Map) === 'Map', 'classof map is `Undefined`');
    ok(classof(new WeakSet) === 'WeakSet', 'classof weakset is `WeakSet`');
    ok(classof(new WeakMap) === 'WeakMap', 'classof weakmap is `WeakMap`');
    ok(classof(new Promise(function(){})) === 'Promise', 'classof promise is `Promise`');
    ok(classof(''[Symbol.iterator]()) === 'String Iterator', 'classof String Iterator is `String Iterator`');
    ok(classof([].entries()) === 'Array Iterator', 'classof Array Iterator is `Array Iterator`');
    ok(classof(new Set().entries()) === 'Set Iterator', 'classof Set Iterator is `Set Iterator`');
    ok(classof(new Map().entries()) === 'Map Iterator', 'classof Map Iterator is `Map Iterator`');
    ok(classof(Math) === 'Math', 'classof Math is `Math`');
    if (typeof JSON != 'undefined' && JSON !== null) {
      ok(classof(JSON) === 'JSON', 'classof JSON is `JSON`');
    }
    Class = (function(){
      Class.displayName = 'Class';
      var prototype = Class.prototype, constructor = Class;
      Class.prototype[Symbol.toStringTag] = 'Class';
      function Class(){}
      return Class;
    }());
    ok(classof(new Class) === 'Class', 'classof user class is [Symbol.toStringTag]');
    BadClass = (function(){
      BadClass.displayName = 'BadClass';
      var prototype = BadClass.prototype, constructor = BadClass;
      BadClass.prototype[Symbol.toStringTag] = 'Array';
      function BadClass(){}
      return BadClass;
    }());
    ok(classof(new BadClass) === '~Array', 'safe [[Class]]');
  });
  test('.make', function(){
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
  test('.define', function(){
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
    if (DESCRIPTORS) {
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
}).call(this);

(function(){
  var isFunction, toString$ = {}.toString;
  QUnit.module('String');
  isFunction = function(it){
    return toString$.call(it).slice(8, -1) === 'Function';
  };
  test('#escapeHTML', function(){
    ok(isFunction(String.prototype.escapeHTML), 'Is function');
    ok('qwe, asd'.escapeHTML() === 'qwe, asd');
    ok('<div>qwe</div>'.escapeHTML() === '&lt;div&gt;qwe&lt;/div&gt;');
    ok("&<>\"'".escapeHTML() === '&amp;&lt;&gt;&quot;&apos;');
  });
  test('#unescapeHTML', function(){
    ok(isFunction(String.prototype.unescapeHTML), 'Is function');
    ok('qwe, asd'.unescapeHTML() === 'qwe, asd');
    ok('&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML() === '<div>qwe</div>');
    ok('&amp;&lt;&gt;&quot;&apos;'.unescapeHTML() === "&<>\"'");
  });
}).call(this);

(function(){
  var G, eq, timeLimitedPromise;
  QUnit.module('Timers');
  G = (typeof global != 'undefined' && global !== null) && global || window;
  eq = strictEqual;
  timeLimitedPromise = function(time, fn){
    return Promise.race([
      new Promise(fn), new Promise(function(res, rej){
        return setTimeout(rej, time);
      })
    ]);
  };
  test('setTimeout / clearTimeout', function(it){
    it.expect(2);
    timeLimitedPromise(1e3, function(res){
      return G.setTimeout(function(a, b){
        return res(a + b);
      }, 10, 'a', 'b');
    }).then(function(it){
      return eq(it, 'ab', 'setTimeout works with additional args');
    })['catch'](function(){
      return ok(false, 'setTimeout works with additional args');
    }).then(it.async());
    timeLimitedPromise(50, function(res){
      return clearTimeout(G.setTimeout(res, 10));
    }).then(function(){
      return ok(false, 'clearImmediate works with wraped setTimeout');
    })['catch'](function(){
      return ok(true, 'clearImmediate works with wraped setTimeout');
    }).then(it.async());
  });
  test('setInterval / clearInterval', function(it){
    var i;
    it.expect(1);
    i = 0;
    timeLimitedPromise(1e4, function(res, rej){
      var interval;
      return interval = G.setInterval(function(a, b){
        if (a + b !== 'ab' || i > 2) {
          rej({
            a: a,
            b: b,
            i: i
          });
        }
        if (i++ === 2) {
          clearInterval(interval);
          return setTimeout(res, 30);
        }
      }, 5, 'a', 'b');
    }).then(function(){
      return ok(true, 'setInterval & clearInterval works with additional args');
    })['catch'](function(arg$){
      var ref$, a, b, i;
      ref$ = arg$ != null
        ? arg$
        : {}, a = ref$.a, b = ref$.b, i = ref$.i;
      return ok(false, "setInterval & clearInterval works with additional args: " + a + ", " + b + ", times: " + i);
    }).then(it.async());
  });
}).call(this);
