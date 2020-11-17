/* eslint-disable no-new, radix -- required for testing */
// eslint-disable-next-line no-new-func -- safe
var GLOBAL = Function('return this')();
var WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var NOT_WHITESPACES = '\u200B\u0085\u180E';

var USERAGENT = GLOBAL.navigator && GLOBAL.navigator.userAgent || '';

var process = GLOBAL.process;
var v8 = process && process.versions && process.versions.v8 || '';

var match, V8_VERSION;

if (v8) {
  match = v8.split('.');
  V8_VERSION = +(match[0] + match[1]);
} else if (USERAGENT) {
  match = USERAGENT.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = USERAGENT.match(/Chrome\/(\d+)/);
    if (match) V8_VERSION = +match[1];
  }
}

var IS_NODE = Object.prototype.toString.call(process) == '[object process]';

// eslint-disable-next-line unicorn/no-unsafe-regex -- safe
var WEBKIT_STRING_PAD_BUG = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(USERAGENT);

var DESCRIPTORS_SUPPORT = function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a == 7;
};

var PROMISES_SUPPORT = function () {
  var promise = Promise.resolve(1);
  var empty = function () { /* empty */ };
  var FakePromise = (promise.constructor = {})[Symbol.species] = function (exec) {
    exec(empty, empty);
  };

  return (IS_NODE || typeof PromiseRejectionEvent == 'function')
    && promise.then(empty) instanceof FakePromise
    && V8_VERSION !== 66;
};

var SYMBOLS_SUPPORT = function () {
  return Symbol && (IS_NODE ? V8_VERSION !== 38 : V8_VERSION < 38 || V8_VERSION > 40);
};

var URL_AND_URL_SEARCH_PARAMS_SUPPORT = function () {
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return searchParams.sort
    && url.href === 'http://a/c%20d?a=1&c=3'
    && searchParams.get('c') === '3'
    && String(new URLSearchParams('?a=1')) === 'a=1'
    && searchParams[Symbol.iterator]
    && new URL('https://a@b').username === 'a'
    && new URLSearchParams(new URLSearchParams('a=b')).get('a') === 'b'
    && new URL('http://тест').host === 'xn--e1aybc'
    && new URL('http://a#б').hash === '#%D0%B1'
    && result === 'a1c3'
    && new URL('http://x', undefined).host === 'x';
};

var OBJECT_PROTOTYPE_ACCESSORS_SUPPORT = function () {
  try {
    Object.prototype.__defineSetter__.call(null, Math.random(), function () { /* empty */ });
  } catch (error) {
    return Object.prototype.__defineSetter__;
  }
};

var SAFE_ITERATION_CLOSING_SUPPORT = function () {
  var SAFE_CLOSING = false;
  try {
    var called = 0;
    var iteratorWithReturn = {
      next: function () {
        return { done: !!called++ };
      },
      'return': function () {
        SAFE_CLOSING = true;
      }
    };
    iteratorWithReturn[Symbol.iterator] = function () {
      return this;
    };
    Array.from(iteratorWithReturn, function () { throw Error('close'); });
  } catch (error) {
    return SAFE_CLOSING;
  }
};

var ARRAY_BUFFER_SUPPORT = function () {
  return ArrayBuffer && DataView;
};

var TYPED_ARRAY_CONSTRUCTORS_LIST = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8
};

var ARRAY_BUFFER_VIEWS_SUPPORT = function () {
  for (var constructor in TYPED_ARRAY_CONSTRUCTORS_LIST) if (!GLOBAL[constructor]) return false;
  return ARRAY_BUFFER_SUPPORT();
};

var TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS = function () {
  try {
    return !Int8Array(1);
  } catch (error) { /* empty */ }
  try {
    return !new Int8Array(-1);
  } catch (error) { /* empty */ }
  new Int8Array();
  new Int8Array(null);
  new Int8Array(1.5);

  var called = 0;
  var iterable = {
    next: function () {
      return { done: !!called++, value: 1 };
    }
  };
  iterable[Symbol.iterator] = function () {
    return this;
  };

  return new Int8Array(iterable)[0] == 1
    && new Int8Array(new ArrayBuffer(2), 1, undefined).length == 1;
};

function createIsRegExpLogicTest(name) {
  return function () {
    var regexp = /./;
    try {
      '/./'[name](regexp);
    } catch (error1) {
      try {
        regexp[Symbol.match] = false;
        return '/./'[name](regexp);
      } catch (error2) { /* empty */ }
    } return false;
  };
}

function createStringHTMLMethodTest(METHOD_NAME) {
  return function () {
    var test = ''[METHOD_NAME]('"');
    return test == test.toLowerCase() && test.split('"').length <= 3;
  };
}

function createStringTrimMethodTest(METHOD_NAME) {
  return function () {
    return !WHITESPACES[METHOD_NAME]()
      && NOT_WHITESPACES[METHOD_NAME]() === NOT_WHITESPACES
      && WHITESPACES[METHOD_NAME].name === METHOD_NAME;
  };
}

GLOBAL.tests = {
  'es.symbol': [SYMBOLS_SUPPORT, function () {
    return Object.getOwnPropertySymbols
      && Object.getOwnPropertySymbols('qwe')
      && Symbol['for']
      && Symbol.keyFor
      && JSON.stringify([Symbol()]) == '[null]'
      && JSON.stringify({ a: Symbol() }) == '{}'
      && JSON.stringify(Object(Symbol())) == '{}'
      && Symbol.prototype[Symbol.toPrimitive]
      && Symbol.prototype[Symbol.toStringTag];
  }],
  'es.symbol.description': function () {
    return Symbol('foo').description == 'foo' && Symbol().description === undefined;
  },
  'es.symbol.async-iterator': function () {
    return Symbol.asyncIterator;
  },
  'es.symbol.has-instance': [SYMBOLS_SUPPORT, function () {
    return Symbol.hasInstance;
  }],
  'es.symbol.is-concat-spreadable': [SYMBOLS_SUPPORT, function () {
    return Symbol.isConcatSpreadable;
  }],
  'es.symbol.iterator': [SYMBOLS_SUPPORT, function () {
    return Symbol.iterator;
  }],
  'es.symbol.match': [SYMBOLS_SUPPORT, function () {
    return Symbol.match;
  }],
  'es.symbol.match-all': [SYMBOLS_SUPPORT, function () {
    return Symbol.matchAll;
  }],
  'es.symbol.replace': [SYMBOLS_SUPPORT, function () {
    return Symbol.replace;
  }],
  'es.symbol.search': [SYMBOLS_SUPPORT, function () {
    return Symbol.search;
  }],
  'es.symbol.species': [SYMBOLS_SUPPORT, function () {
    return Symbol.species;
  }],
  'es.symbol.split': [SYMBOLS_SUPPORT, function () {
    return Symbol.split;
  }],
  'es.symbol.to-primitive': [SYMBOLS_SUPPORT, function () {
    return Symbol.toPrimitive;
  }],
  'es.symbol.to-string-tag': [SYMBOLS_SUPPORT, function () {
    return Symbol.toStringTag;
  }],
  'es.symbol.unscopables': [SYMBOLS_SUPPORT, function () {
    return Symbol.unscopables;
  }],
  'es.aggregate-error': function () {
    return typeof AggregateError === 'function';
  },
  'es.array.concat': function () {
    var array1 = [];
    array1[Symbol.isConcatSpreadable] = false;

    var array2 = [];
    var constructor = array2.constructor = {};
    constructor[Symbol.species] = function () {
      return { foo: 1 };
    };

    return array1.concat()[0] === array1 && array2.concat().foo === 1;
  },
  'es.array.copy-within': function () {
    return Array.prototype.copyWithin && Array.prototype[Symbol.unscopables].copyWithin;
  },
  'es.array.every': function () {
    try {
      Array.prototype.every.call(null, function () { /* empty */ });
      return false;
    } catch (error) { /* empty */ }
    return Array.prototype.every;
  },
  'es.array.fill': function () {
    return Array.prototype.fill && Array.prototype[Symbol.unscopables].fill;
  },
  'es.array.filter': function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[Symbol.species] = function () {
      return { foo: 1 };
    };
    return array.filter(Boolean).foo === 1;
  },
  'es.array.find': function () {
    var SKIPS_HOLES = true;
    Array(1).find(function () { return SKIPS_HOLES = false; });
    return !SKIPS_HOLES && Array.prototype[Symbol.unscopables].find;
  },
  'es.array.find-index': function () {
    var SKIPS_HOLES = true;
    Array(1).findIndex(function () { return SKIPS_HOLES = false; });
    return !SKIPS_HOLES && Array.prototype[Symbol.unscopables].findIndex;
  },
  'es.array.flat': function () {
    return Array.prototype.flat;
  },
  'es.array.flat-map': function () {
    return Array.prototype.flatMap;
  },
  'es.array.for-each': function () {
    try {
      Array.prototype.forEach.call(null, function () { /* empty */ });
      return false;
    } catch (error) { /* empty */ }
    return Array.prototype.forEach;
  },
  'es.array.from': SAFE_ITERATION_CLOSING_SUPPORT,
  'es.array.includes': function () {
    return Array.prototype[Symbol.unscopables].includes;
  },
  'es.array.index-of': function () {
    try {
      [].indexOf.call(null);
    } catch (error) {
      return 1 / [1].indexOf(1, -0) > 0;
    }
  },
  'es.array.is-array': function () {
    return Array.isArray;
  },
  'es.array.iterator': [SYMBOLS_SUPPORT, function () {
    return [][Symbol.iterator] === [].values
      && [][Symbol.iterator].name === 'values'
      && [].entries()[Symbol.toStringTag] === 'Array Iterator'
      && [].keys().next()
      && [][Symbol.unscopables].keys
      && [][Symbol.unscopables].values
      && [][Symbol.unscopables].entries;
  }],
  'es.array.join': function () {
    try {
      if (!Object.prototype.propertyIsEnumerable.call(Object('z'), 0)) return false;
    } catch (error) {
      return false;
    }
    try {
      Array.prototype.join.call(null);
      return false;
    } catch (error) { /* empty */ }
    return true;
  },
  'es.array.last-index-of': function () {
    try {
      [].lastIndexOf.call(null);
    } catch (error) {
      return 1 / [1].lastIndexOf(1, -0) > 0;
    }
  },
  'es.array.map': function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[Symbol.species] = function () {
      return { foo: 1 };
    };
    return array.map(function () { return true; }).foo === 1;
  },
  'es.array.of': function () {
    function F() { /* empty */ }
    return Array.of.call(F) instanceof F;
  },
  'es.array.reduce': function () {
    try {
      Array.prototype.reduce.call(null, function () { /* empty */ }, 1);
    } catch (error) {
      return Array.prototype.reduce;
    }
  },
  'es.array.reduce-right': function () {
    try {
      Array.prototype.reduceRight.call(null, function () { /* empty */ }, 1);
    } catch (error) {
      return Array.prototype.reduceRight;
    }
  },
  'es.array.reverse': function () {
    var test = [1, 2];
    return String(test) !== String(test.reverse());
  },
  'es.array.slice': function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[Symbol.species] = function () {
      return { foo: 1 };
    };
    return array.slice().foo === 1;
  },
  'es.array.some': function () {
    try {
      Array.prototype.some.call(null, function () { /* empty */ });
    } catch (error) {
      return Array.prototype.some;
    }
  },
  'es.array.sort': function () {
    try {
      Array.prototype.sort.call(null);
    } catch (error1) {
      try {
        [1, 2, 3].sort(null);
      } catch (error2) {
        [1, 2, 3].sort(undefined);
        return true;
      }
    }
  },
  'es.array.species': [SYMBOLS_SUPPORT, function () {
    return Array[Symbol.species];
  }],
  'es.array.splice': function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[Symbol.species] = function () {
      return { foo: 1 };
    };
    return array.splice().foo === 1;
  },
  'es.array.unscopables.flat': function () {
    return Array.prototype[Symbol.unscopables].flat;
  },
  'es.array.unscopables.flat-map': function () {
    return Array.prototype[Symbol.unscopables].flatMap;
  },
  'es.array-buffer.constructor': [ARRAY_BUFFER_SUPPORT, function () {
    try {
      return !ArrayBuffer(1);
    } catch (error) { /* empty */ }
    try {
      return !new ArrayBuffer(-1);
    } catch (error) { /* empty */ }
    new ArrayBuffer();
    new ArrayBuffer(1.5);
    new ArrayBuffer(NaN);
    return ArrayBuffer.name == 'ArrayBuffer';
  }],
  'es.array-buffer.is-view': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return ArrayBuffer.isView;
  }],
  'es.array-buffer.slice': [ARRAY_BUFFER_SUPPORT, function () {
    return new ArrayBuffer(2).slice(1, undefined).byteLength;
  }],
  'es.data-view': ARRAY_BUFFER_SUPPORT,
  'es.date.now': function () {
    return Date.now;
  },
  'es.date.to-iso-string': function () {
    try {
      new Date(NaN).toISOString();
    } catch (error) {
      return new Date(-5e13 - 1).toISOString() == '0385-07-25T07:06:39.999Z';
    }
  },
  'es.date.to-json': function () {
    return new Date(NaN).toJSON() === null
      && Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) === 1;
  },
  'es.date.to-primitive': [SYMBOLS_SUPPORT, function () {
    return Date.prototype[Symbol.toPrimitive];
  }],
  'es.date.to-string': function () {
    return new Date(NaN).toString() == 'Invalid Date';
  },
  'es.function.bind': function () {
    return Function.prototype.bind;
  },
  'es.function.has-instance': [SYMBOLS_SUPPORT, function () {
    return Symbol.hasInstance in Function.prototype;
  }],
  'es.function.name': function () {
    return 'name' in Function.prototype;
  },
  'es.global-this': function () {
    return globalThis;
  },
  'es.json.stringify': function () {
    return JSON.stringify('\uDF06\uD834') === '"\\udf06\\ud834"'
      && JSON.stringify('\uDEAD') === '"\\udead"';
  },
  'es.json.to-string-tag': [SYMBOLS_SUPPORT, function () {
    return JSON[Symbol.toStringTag];
  }],
  'es.map': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
    var called = 0;
    var iterable = {
      next: function () {
        return { done: !!called++, value: [1, 2] };
      }
    };
    iterable[Symbol.iterator] = function () {
      return this;
    };

    var map = new Map(iterable);
    return map.forEach
      && map[Symbol.iterator]().next()
      && map.get(1) == 2
      && map.set(-0, 3) == map
      && map.has(0)
      && map[Symbol.toStringTag];
  }],
  'es.math.acosh': function () {
    // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
    return Math.floor(Math.acosh(Number.MAX_VALUE)) == 710
      // Tor Browser bug: Math.acosh(Infinity) -> NaN
      && Math.acosh(Infinity) == Infinity;
  },
  'es.math.asinh': function () {
    return 1 / Math.asinh(0) > 0;
  },
  'es.math.atanh': function () {
    return 1 / Math.atanh(-0) < 0;
  },
  'es.math.cbrt': function () {
    return Math.cbrt;
  },
  'es.math.clz32': function () {
    return Math.clz32;
  },
  'es.math.cosh': function () {
    return Math.cosh(710) !== Infinity;
  },
  'es.math.expm1': function () {
    // Old FF bug
    return Math.expm1(10) <= 22025.465794806719 && Math.expm1(10) >= 22025.4657948067165168
      // Tor Browser bug
      && Math.expm1(-2e-17) == -2e-17;
  },
  'es.math.fround': function () {
    return Math.fround;
  },
  'es.math.hypot': function () {
    return Math.hypot && Math.hypot(Infinity, NaN) === Infinity;
  },
  'es.math.imul': function () {
    return Math.imul(0xFFFFFFFF, 5) == -5 && Math.imul.length == 2;
  },
  'es.math.log10': function () {
    return Math.log10;
  },
  'es.math.log1p': function () {
    return Math.log1p;
  },
  'es.math.log2': function () {
    return Math.log2;
  },
  'es.math.sign': function () {
    return Math.sign;
  },
  'es.math.sinh': function () {
    return Math.sinh(-2e-17) == -2e-17;
  },
  'es.math.tanh': function () {
    return Math.tanh;
  },
  'es.math.to-string-tag': function () {
    return Math[Symbol.toStringTag];
  },
  'es.math.trunc': function () {
    return Math.trunc;
  },
  'es.number.constructor': function () {
    return Number(' 0o1') && Number('0b1') && !Number('+0x1');
  },
  'es.number.epsilon': function () {
    return Number.EPSILON;
  },
  'es.number.is-finite': function () {
    return Number.isFinite;
  },
  'es.number.is-integer': function () {
    return Number.isInteger;
  },
  'es.number.is-nan': function () {
    return Number.isNaN;
  },
  'es.number.is-safe-integer': function () {
    return Number.isSafeInteger;
  },
  'es.number.max-safe-integer': function () {
    return Number.MAX_SAFE_INTEGER;
  },
  'es.number.min-safe-integer': function () {
    return Number.MIN_SAFE_INTEGER;
  },
  'es.number.parse-float': function () {
    return Number.parseFloat === parseFloat
      && 1 / Number.parseFloat(WHITESPACES + '-0') === -Infinity;
  },
  'es.number.parse-int': function () {
    return Number.parseInt === parseInt
      && Number.parseInt(WHITESPACES + '08') === 8
      && Number.parseInt(WHITESPACES + '0x16') === 22;
  },
  'es.number.to-fixed': function () {
    try {
      Number.prototype.toFixed.call({});
    } catch (error) {
      return 0.00008.toFixed(3) === '0.000'
        && 0.9.toFixed(0) === '1'
        && 1.255.toFixed(2) === '1.25'
        && 1000000000000000128.0.toFixed(0) === '1000000000000000128';
    }
  },
  'es.number.to-precision': function () {
    try {
      Number.prototype.toPrecision.call({});
    } catch (error) {
      return 1.0.toPrecision(undefined) === '1';
    }
  },
  'es.object.assign': function () {
    if (DESCRIPTORS_SUPPORT && Object.assign({ b: 1 }, Object.assign(Object.defineProperty({}, 'a', {
      enumerable: true,
      get: function () {
        Object.defineProperty(this, 'b', {
          value: 3,
          enumerable: false
        });
      }
    }), { b: 2 })).b !== 1) return false;
    var A = {};
    var B = {};
    var symbol = Symbol();
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) { B[chr] = chr; });
    return Object.assign({}, A)[symbol] == 7 && Object.keys(Object.assign({}, B)).join('') == alphabet;
  },
  'es.object.create': function () {
    return Object.create;
  },
  'es.object.define-getter': OBJECT_PROTOTYPE_ACCESSORS_SUPPORT,
  'es.object.define-properties': [DESCRIPTORS_SUPPORT, function () {
    return Object.defineProperties;
  }],
  'es.object.define-property': DESCRIPTORS_SUPPORT,
  'es.object.define-setter': OBJECT_PROTOTYPE_ACCESSORS_SUPPORT,
  'es.object.entries': function () {
    return Object.entries;
  },
  'es.object.freeze': function () {
    return Object.freeze(true);
  },
  'es.object.from-entries': function () {
    return Object.fromEntries;
  },
  'es.object.get-own-property-descriptor': [DESCRIPTORS_SUPPORT, function () {
    return Object.getOwnPropertyDescriptor('qwe', '0');
  }],
  'es.object.get-own-property-descriptors': function () {
    return Object.getOwnPropertyDescriptors;
  },
  'es.object.get-own-property-names': function () {
    return Object.getOwnPropertyNames('qwe');
  },
  'es.object.get-prototype-of': function () {
    return Object.getPrototypeOf('qwe');
  },
  'es.object.is': function () {
    return Object.is;
  },
  'es.object.is-extensible': function () {
    return !Object.isExtensible('qwe');
  },
  'es.object.is-frozen': function () {
    return Object.isFrozen('qwe');
  },
  'es.object.is-sealed': function () {
    return Object.isSealed('qwe');
  },
  'es.object.keys': function () {
    return Object.keys('qwe');
  },
  'es.object.lookup-getter': OBJECT_PROTOTYPE_ACCESSORS_SUPPORT,
  'es.object.lookup-setter': OBJECT_PROTOTYPE_ACCESSORS_SUPPORT,
  'es.object.prevent-extensions': function () {
    return Object.preventExtensions(true);
  },
  'es.object.seal': function () {
    return Object.seal(true);
  },
  'es.object.set-prototype-of': function () {
    return Object.setPrototypeOf;
  },
  'es.object.to-string': [SYMBOLS_SUPPORT, function () {
    var O = {};
    O[Symbol.toStringTag] = 'foo';
    return String(O) === '[object foo]';
  }],
  'es.object.values': function () {
    return Object.values;
  },
  'es.parse-float': function () {
    return 1 / parseFloat(WHITESPACES + '-0') === -Infinity;
  },
  'es.parse-int': function () {
    return parseInt(WHITESPACES + '08') === 8
      && parseInt(WHITESPACES + '0x16') === 22;
  },
  'es.promise': PROMISES_SUPPORT,
  'es.promise.all-settled': function () {
    return Promise.allSettled;
  },
  'es.promise.any': function () {
    return Promise.any;
  },
  'es.promise.finally': [PROMISES_SUPPORT, function () {
    return Promise.prototype['finally'].call({ then: function () { return this; } }, function () { /* empty */ });
  }],
  'es.reflect.apply': function () {
    try {
      return Reflect.apply(function () {
        return false;
      });
    } catch (error) {
      return Reflect.apply(function () {
        return true;
      }, null, []);
    }
  },
  'es.reflect.construct': function () {
    try {
      return !Reflect.construct(function () { /* empty */ });
    } catch (error) { /* empty */ }
    function F() { /* empty */ }
    return Reflect.construct(function () { /* empty */ }, [], F) instanceof F;
  },
  'es.reflect.define-property': function () {
    return !Reflect.defineProperty(Object.defineProperty({}, 1, { value: 1 }), 1, { value: 2 });
  },
  'es.reflect.delete-property': function () {
    return Reflect.deleteProperty;
  },
  'es.reflect.get': function () {
    return Reflect.get;
  },
  'es.reflect.get-own-property-descriptor': function () {
    return Reflect.getOwnPropertyDescriptor;
  },
  'es.reflect.get-prototype-of': function () {
    return Reflect.getPrototypeOf;
  },
  'es.reflect.has': function () {
    return Reflect.has;
  },
  'es.reflect.is-extensible': function () {
    return Reflect.isExtensible;
  },
  'es.reflect.own-keys': function () {
    return Reflect.ownKeys;
  },
  'es.reflect.prevent-extensions': function () {
    return Reflect.preventExtensions;
  },
  'es.reflect.set': function () {
    var object = Object.defineProperty({}, 'a', { configurable: true });
    return Reflect.set(Object.getPrototypeOf(object), 'a', 1, object) === false;
  },
  'es.reflect.set-prototype-of': function () {
    return Reflect.setPrototypeOf;
  },
  'es.reflect.to-string-tag': function () {
    return Reflect[Symbol.toStringTag];
  },
  'es.regexp.constructor': function () {
    var re1 = /a/g;
    var re2 = /a/g;
    re2[Symbol.match] = false;
    return new RegExp(re1) !== re1
      && RegExp(re1) === re1
      && RegExp(re2) !== re2
      && RegExp(re1, 'i') == '/a/i'
      && new RegExp('a', 'y') // just check that it doesn't throw
      && RegExp[Symbol.species];
  },
  'es.regexp.exec': function () {
    var re1 = /a/;
    var re2 = /b*/g;
    var reSticky = new RegExp('a', 'y');
    var reStickyAnchored = new RegExp('^a', 'y');
    re1.exec('a');
    re2.exec('a');
    return re1.lastIndex === 0 && re2.lastIndex === 0
      // eslint-disable-next-line regexp/no-assertion-capturing-group, regexp/no-empty-group -- required for testing
      && /()??/.exec('')[1] === undefined
      && reSticky.exec('abc')[0] === 'a'
      && reSticky.exec('abc') === null
      && (reSticky.lastIndex = 1, reSticky.exec('bac')[0] === 'a')
      && (reStickyAnchored.lastIndex = 2, reStickyAnchored.exec('cba') === null);
  },
  'es.regexp.flags': function () {
    return /./g.flags === 'g' && new RegExp('a', 'y').flags === 'y';
  },
  'es.regexp.sticky': function () {
    return new RegExp('a', 'y').sticky === true;
  },
  'es.regexp.test': function () {
    var execCalled = false;
    var re = /[ac]/;
    re.exec = function () {
      execCalled = true;
      return /./.exec.apply(this, arguments);
    };
    return re.test('abc') === true && execCalled;
  },
  'es.regexp.to-string': function () {
    return RegExp.prototype.toString.call({ source: 'a', flags: 'b' }) === '/a/b'
      && RegExp.prototype.toString.name === 'toString';
  },
  'es.set': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
    var called = 0;
    var iterable = {
      next: function () {
        return { done: !!called++, value: 1 };
      }
    };
    iterable[Symbol.iterator] = function () {
      return this;
    };

    var set = new Set(iterable);
    return set.forEach
      && set[Symbol.iterator]().next()
      && set.has(1)
      && set.add(-0) == set
      && set.has(0)
      && set[Symbol.toStringTag];
  }],
  'es.string.code-point-at': function () {
    return String.prototype.codePointAt;
  },
  'es.string.ends-with': createIsRegExpLogicTest('endsWith'),
  'es.string.from-code-point': function () {
    return String.fromCodePoint;
  },
  'es.string.includes': createIsRegExpLogicTest('includes'),
  'es.string.iterator': [SYMBOLS_SUPPORT, function () {
    return ''[Symbol.iterator];
  }],
  'es.string.match': function () {
    var O = {};
    O[Symbol.match] = function () { return 7; };

    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    re[Symbol.match]('');

    // eslint-disable-next-line regexp/prefer-regexp-exec -- required for testing
    return ''.match(O) == 7 && execCalled;
  },
  'es.string.match-all': function () {
    try {
      'a'.matchAll(/./);
    } catch (error) {
      return 'a'.matchAll(/./g);
    }
  },
  'es.string.pad-end': function () {
    return String.prototype.padEnd && !WEBKIT_STRING_PAD_BUG;
  },
  'es.string.pad-start': function () {
    return String.prototype.padStart && !WEBKIT_STRING_PAD_BUG;
  },
  'es.string.raw': function () {
    return String.raw;
  },
  'es.string.repeat': function () {
    return String.prototype.repeat;
  },
  'es.string.replace': function () {
    var O = {};
    O[Symbol.replace] = function () { return 7; };

    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    re[Symbol.replace]('');

    var re2 = /./;
    re2.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };

    return ''.replace(O) == 7
      && execCalled
      && ''.replace(re2, '$<a>') === '7'
      // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
      && 'a'.replace(/./, '$0') === '$0'
      && /./[Symbol.replace]('a', '$0') === '$0';
  },
  'es.string.replace-all': function () {
    return String.prototype.replaceAll;
  },
  'es.string.search': function () {
    var O = {};
    O[Symbol.search] = function () { return 7; };

    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    re[Symbol.search]('');

    return ''.search(O) == 7 && execCalled;
  },
  'es.string.split': function () {
    var O = {};
    O[Symbol.split] = function () { return 7; };

    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    re.constructor = {};
    re.constructor[Symbol.species] = function () { return re; };
    re[Symbol.split]('');

    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    var re2 = /(?:)/;
    var originalExec = re2.exec;
    re2.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re2);

    return ''.split(O) == 7 && execCalled && result.length === 2 && result[0] === 'a' && result[1] === 'b';
  },
  'es.string.starts-with': createIsRegExpLogicTest('startsWith'),
  'es.string.trim': createStringTrimMethodTest('trim'),
  'es.string.trim-end': [createStringTrimMethodTest('trimEnd'), function () {
    return String.prototype.trimRight === String.prototype.trimEnd;
  }],
  'es.string.trim-start': [createStringTrimMethodTest('trimStart'), function () {
    return String.prototype.trimLeft === String.prototype.trimStart;
  }],
  'es.string.anchor': createStringHTMLMethodTest('anchor'),
  'es.string.big': createStringHTMLMethodTest('big'),
  'es.string.blink': createStringHTMLMethodTest('blink'),
  'es.string.bold': createStringHTMLMethodTest('bold'),
  'es.string.fixed': createStringHTMLMethodTest('fixed'),
  'es.string.fontcolor': createStringHTMLMethodTest('fontcolor'),
  'es.string.fontsize': createStringHTMLMethodTest('fontsize'),
  'es.string.italics': createStringHTMLMethodTest('italics'),
  'es.string.link': createStringHTMLMethodTest('link'),
  'es.string.small': createStringHTMLMethodTest('small'),
  'es.string.strike': createStringHTMLMethodTest('strike'),
  'es.string.sub': createStringHTMLMethodTest('sub'),
  'es.string.sup': createStringHTMLMethodTest('sup'),
  'es.typed-array.float32-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.float64-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.int8-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.int16-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.int32-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.uint8-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.uint8-clamped-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.uint16-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.uint32-array': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS
  ],
  'es.typed-array.copy-within': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.copyWithin;
  }],
  'es.typed-array.every': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.every;
  }],
  'es.typed-array.fill': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.fill;
  }],
  'es.typed-array.filter': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.filter;
  }],
  'es.typed-array.find': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.find;
  }],
  'es.typed-array.find-index': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.findIndex;
  }],
  'es.typed-array.for-each': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.forEach;
  }],
  'es.typed-array.from': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS,
    function () {
      return Int8Array.from;
    }
  ],
  'es.typed-array.includes': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.includes;
  }],
  'es.typed-array.index-of': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.indexOf;
  }],
  'es.typed-array.iterator': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype[Symbol.iterator].name === 'values'
      && Int8Array.prototype[Symbol.iterator] === Int8Array.prototype.values
      && Int8Array.prototype.keys
      && Int8Array.prototype.entries;
  }],
  'es.typed-array.join': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.join;
  }],
  'es.typed-array.last-index-of': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.lastIndexOf;
  }],
  'es.typed-array.map': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.map;
  }],
  'es.typed-array.of': [
    ARRAY_BUFFER_VIEWS_SUPPORT,
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRES_WRAPPERS,
    function () {
      return Int8Array.of;
    }
  ],
  'es.typed-array.reduce': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.reduce;
  }],
  'es.typed-array.reduce-right': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.reduceRight;
  }],
  'es.typed-array.reverse': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.reverse;
  }],
  'es.typed-array.set': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    new Int8Array(1).set({});
    return true;
  }],
  'es.typed-array.slice': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return new Int8Array(1).slice();
  }],
  'es.typed-array.some': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.some;
  }],
  'es.typed-array.sort': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.sort;
  }],
  'es.typed-array.subarray': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.subarray;
  }],
  'es.typed-array.to-locale-string': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    try {
      Int8Array.prototype.toLocaleString.call([1, 2]);
    } catch (error) {
      return [1, 2].toLocaleString() == new Int8Array([1, 2]).toLocaleString();
    }
  }],
  'es.typed-array.to-string': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.toString == Array.prototype.toString;
  }],
  'es.weak-map': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
    var key = Object.freeze({});
    var called = 0;
    var iterable = {
      next: function () {
        return { done: !!called++, value: [key, 1] };
      }
    };
    iterable[Symbol.iterator] = function () {
      return this;
    };

    var map = new WeakMap(iterable);
    return map.get(key) == 1
      && map.get(null) == undefined
      && map.set({}, 2) == map
      && map[Symbol.toStringTag];
  }],
  'es.weak-set': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
    var key = {};
    var called = 0;
    var iterable = {
      next: function () {
        return { done: !!called++, value: key };
      }
    };
    iterable[Symbol.iterator] = function () {
      return this;
    };

    var set = new WeakSet(iterable);
    return set.has(key)
      && !set.has(null)
      && set.add({}) == set
      && set[Symbol.toStringTag];
  }],
  'esnext.array.at': function () {
    return [].at;
  },
  'esnext.array.filter-out': function () {
    return [].filterOut;
  },
  'esnext.array.find-last': function () {
    return [].findLast;
  },
  'esnext.array.find-last-index': function () {
    return [].findLastIndex;
  },
  'esnext.array.last-index': function () {
    return [1, 2, 3].lastIndex && Array.prototype[Symbol.unscopables].lastIndex;
  },
  'esnext.array.last-item': function () {
    return [1, 2, 3].lastItem && Array.prototype[Symbol.unscopables].lastItem;
  },
  'esnext.array.unique-by': function () {
    return [].uniqueBy;
  },
  'esnext.async-iterator.constructor': function () {
    return typeof AsyncIterator == 'function';
  },
  'esnext.async-iterator.as-indexed-pairs': function () {
    return AsyncIterator.prototype.asIndexedPairs;
  },
  'esnext.async-iterator.drop': function () {
    return AsyncIterator.prototype.drop;
  },
  'esnext.async-iterator.every': function () {
    return AsyncIterator.prototype.every;
  },
  'esnext.async-iterator.filter': function () {
    return AsyncIterator.prototype.filter;
  },
  'esnext.async-iterator.find': function () {
    return AsyncIterator.prototype.find;
  },
  'esnext.async-iterator.flat-map': function () {
    return AsyncIterator.prototype.flatMap;
  },
  'esnext.async-iterator.for-each': function () {
    return AsyncIterator.prototype.forEach;
  },
  'esnext.async-iterator.from': function () {
    return AsyncIterator.from;
  },
  'esnext.async-iterator.map': function () {
    return AsyncIterator.prototype.map;
  },
  'esnext.async-iterator.reduce': function () {
    return AsyncIterator.prototype.reduce;
  },
  'esnext.async-iterator.some': function () {
    return AsyncIterator.prototype.some;
  },
  'esnext.async-iterator.take': function () {
    return AsyncIterator.prototype.take;
  },
  'esnext.async-iterator.to-array': function () {
    return AsyncIterator.prototype.toArray;
  },
  'esnext.bigint.range': function () {
    return BigInt.range;
  },
  'esnext.composite-key': function () {
    return compositeKey;
  },
  'esnext.composite-symbol': function () {
    return compositeSymbol;
  },
  'esnext.iterator.constructor': function () {
    try {
      Iterator({});
    } catch (error) {
      return typeof Iterator == 'function'
        && Iterator.prototype === Object.getPrototypeOf(Object.getPrototypeOf([].values()));
    }
  },
  'esnext.iterator.as-indexed-pairs': function () {
    return Iterator.prototype.asIndexedPairs;
  },
  'esnext.iterator.drop': function () {
    return Iterator.prototype.drop;
  },
  'esnext.iterator.every': function () {
    return Iterator.prototype.every;
  },
  'esnext.iterator.filter': function () {
    return Iterator.prototype.filter;
  },
  'esnext.iterator.find': function () {
    return Iterator.prototype.find;
  },
  'esnext.iterator.flat-map': function () {
    return Iterator.prototype.flatMap;
  },
  'esnext.iterator.for-each': function () {
    return Iterator.prototype.forEach;
  },
  'esnext.iterator.from': function () {
    return Iterator.from;
  },
  'esnext.iterator.map': function () {
    return Iterator.prototype.map;
  },
  'esnext.iterator.reduce': function () {
    return Iterator.prototype.reduce;
  },
  'esnext.iterator.some': function () {
    return Iterator.prototype.some;
  },
  'esnext.iterator.take': function () {
    return Iterator.prototype.take;
  },
  'esnext.iterator.to-array': function () {
    return Iterator.prototype.toArray;
  },
  'esnext.map.delete-all': function () {
    return Map.prototype.deleteAll;
  },
  'esnext.map.emplace': function () {
    return Map.prototype.emplace;
  },
  'esnext.map.every': function () {
    return Map.prototype.every;
  },
  'esnext.map.filter': function () {
    return Map.prototype.filter;
  },
  'esnext.map.find': function () {
    return Map.prototype.find;
  },
  'esnext.map.find-key': function () {
    return Map.prototype.findKey;
  },
  'esnext.map.from': function () {
    return Map.from;
  },
  'esnext.map.group-by': function () {
    return Map.groupBy;
  },
  'esnext.map.includes': function () {
    return Map.prototype.includes;
  },
  'esnext.map.key-by': function () {
    return Map.keyBy;
  },
  'esnext.map.key-of': function () {
    return Map.prototype.keyOf;
  },
  'esnext.map.map-keys': function () {
    return Map.prototype.mapKeys;
  },
  'esnext.map.map-values': function () {
    return Map.prototype.mapValues;
  },
  'esnext.map.merge': function () {
    return Map.prototype.merge;
  },
  'esnext.map.of': function () {
    return Map.of;
  },
  'esnext.map.reduce': function () {
    return Map.prototype.reduce;
  },
  'esnext.map.some': function () {
    return Map.prototype.some;
  },
  'esnext.map.update': function () {
    return Map.prototype.update;
  },
  // TODO: Remove from `core-js@4`
  'esnext.map.upsert': function () {
    return Map.prototype.upsert;
  },
  'esnext.math.clamp': function () {
    return Math.clamp;
  },
  'esnext.math.deg-per-rad': function () {
    return Math.DEG_PER_RAD;
  },
  'esnext.math.degrees': function () {
    return Math.degrees;
  },
  'esnext.math.fscale': function () {
    return Math.fscale;
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.iaddh': function () {
    return Math.iaddh;
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.imulh': function () {
    return Math.imulh;
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.isubh': function () {
    return Math.isubh;
  },
  'esnext.math.rad-per-deg': function () {
    return Math.RAD_PER_DEG;
  },
  'esnext.math.radians': function () {
    return Math.radians;
  },
  'esnext.math.scale': function () {
    return Math.scale;
  },
  'esnext.math.seeded-prng': function () {
    return Math.seededPRNG;
  },
  'esnext.math.signbit': function () {
    return Math.signbit;
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.umulh': function () {
    return Math.umulh;
  },
  'esnext.number.from-string': function () {
    return Number.fromString;
  },
  'esnext.number.range': function () {
    return Number.range;
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-entries': function () {
    return Object.iterateEntries;
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-keys': function () {
    return Object.iterateKeys;
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-values': function () {
    return Object.iterateValues;
  },
  'esnext.observable': function () {
    return Observable;
  },
  'esnext.promise.try': [PROMISES_SUPPORT, function () {
    return Promise['try'];
  }],
  'esnext.reflect.define-metadata': function () {
    return Reflect.defineMetadata;
  },
  'esnext.reflect.delete-metadata': function () {
    return Reflect.deleteMetadata;
  },
  'esnext.reflect.get-metadata': function () {
    return Reflect.getMetadata;
  },
  'esnext.reflect.get-metadata-keys': function () {
    return Reflect.getMetadataKeys;
  },
  'esnext.reflect.get-own-metadata': function () {
    return Reflect.getOwnMetadata;
  },
  'esnext.reflect.get-own-metadata-keys': function () {
    return Reflect.getOwnMetadataKeys;
  },
  'esnext.reflect.has-metadata': function () {
    return Reflect.hasMetadata;
  },
  'esnext.reflect.has-own-metadata': function () {
    return Reflect.hasOwnMetadata;
  },
  'esnext.reflect.metadata': function () {
    return Reflect.metadata;
  },
  'esnext.set.add-all': function () {
    return Set.prototype.addAll;
  },
  'esnext.set.delete-all': function () {
    return Set.prototype.deleteAll;
  },
  'esnext.set.difference': function () {
    return Set.prototype.difference;
  },
  'esnext.set.every': function () {
    return Set.prototype.every;
  },
  'esnext.set.filter': function () {
    return Set.prototype.filter;
  },
  'esnext.set.find': function () {
    return Set.prototype.find;
  },
  'esnext.set.from': function () {
    return Set.from;
  },
  'esnext.set.intersection': function () {
    return Set.prototype.intersection;
  },
  'esnext.set.is-disjoint-from': function () {
    return Set.prototype.isDisjointFrom;
  },
  'esnext.set.is-subset-of': function () {
    return Set.prototype.isSubsetOf;
  },
  'esnext.set.is-superset-of': function () {
    return Set.prototype.isSupersetOf;
  },
  'esnext.set.join': function () {
    return Set.prototype.join;
  },
  'esnext.set.map': function () {
    return Set.prototype.map;
  },
  'esnext.set.of': function () {
    return Set.of;
  },
  'esnext.set.reduce': function () {
    return Set.prototype.reduce;
  },
  'esnext.set.some': function () {
    return Set.prototype.some;
  },
  'esnext.set.symmetric-difference': function () {
    return Set.prototype.symmetricDifference;
  },
  'esnext.set.union': function () {
    return Set.prototype.union;
  },
  'esnext.string.at': function () {
    return '𠮷'.at(0) === '𠮷';
  },
  'esnext.string.code-points': function () {
    return String.prototype.codePoints;
  },
  'esnext.symbol.dispose': function () {
    return Symbol.dispose;
  },
  'esnext.symbol.observable': function () {
    return Symbol.observable;
  },
  'esnext.symbol.pattern-match': function () {
    return Symbol.patternMatch;
  },
  'esnext.typed-array.at': function () {
    return Int8Array.prototype.at;
  },
  'esnext.typed-array.filter-out': function () {
    return Int8Array.prototype.filterOut;
  },
  'esnext.typed-array.find-last': function () {
    return Int8Array.prototype.findLast;
  },
  'esnext.typed-array.find-last-index': function () {
    return Int8Array.prototype.findLastIndex;
  },
  'esnext.weak-map.delete-all': function () {
    return WeakMap.prototype.deleteAll;
  },
  'esnext.weak-map.emplace': function () {
    return WeakMap.prototype.emplace;
  },
  'esnext.weak-map.from': function () {
    return WeakMap.from;
  },
  'esnext.weak-map.of': function () {
    return WeakMap.of;
  },
  // TODO: Remove from `core-js@4`
  'esnext.weak-map.upsert': function () {
    return WeakMap.prototype.upsert;
  },
  'esnext.weak-set.add-all': function () {
    return WeakSet.prototype.addAll;
  },
  'esnext.weak-set.delete-all': function () {
    return WeakSet.prototype.deleteAll;
  },
  'esnext.weak-set.from': function () {
    return WeakSet.from;
  },
  'esnext.weak-set.of': function () {
    return WeakSet.of;
  },
  'web.dom-collections.for-each': function () {
    return (!GLOBAL.NodeList || (NodeList.prototype.forEach && NodeList.prototype.forEach === [].forEach))
      && (!GLOBAL.DOMTokenList || (DOMTokenList.prototype.forEach && DOMTokenList.prototype.forEach === [].forEach));
  },
  'web.dom-collections.iterator': function () {
    var DOMIterables = {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0
    };
    for (var collection in DOMIterables) {
      if (GLOBAL[collection]) {
        if (
          !GLOBAL[collection].prototype[Symbol.iterator] ||
          GLOBAL[collection].prototype[Symbol.iterator] !== [].values
        ) return false;
        if (DOMIterables[collection] && (
          !GLOBAL[collection].prototype.keys ||
          !GLOBAL[collection].prototype.values ||
          !GLOBAL[collection].prototype.entries
        )) return false;
      }
    }
    return true;
  },
  'web.immediate': function () {
    return setImmediate && clearImmediate;
  },
  'web.queue-microtask': function () {
    return Object.getOwnPropertyDescriptor(GLOBAL, 'queueMicrotask').value;
  },
  'web.timers': function () {
    return !/MSIE .\./.test(USERAGENT);
  },
  'web.url': URL_AND_URL_SEARCH_PARAMS_SUPPORT,
  'web.url.to-json': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    return URL.prototype.toJSON;
  }],
  'web.url-search-params': URL_AND_URL_SEARCH_PARAMS_SUPPORT
};
