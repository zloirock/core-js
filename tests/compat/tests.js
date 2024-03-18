'use strict';
/* eslint-disable prefer-regex-literals, radix -- required for testing */
/* eslint-disable regexp/no-empty-capturing-group, regexp/no-lazy-ends, regexp/no-useless-quantifier -- required for testing */
var GLOBAL = typeof global != 'undefined' ? global : Function('return this')();
var WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var NOT_WHITESPACES = '\u200B\u0085\u180E';

var USERAGENT = GLOBAL.navigator && GLOBAL.navigator.userAgent || '';

var process = GLOBAL.process;
var Bun = GLOBAL.Bun;
var Deno = GLOBAL.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;

var match, V8_VERSION;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  V8_VERSION = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!V8_VERSION && USERAGENT) {
  match = USERAGENT.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = USERAGENT.match(/Chrome\/(\d+)/);
    if (match) V8_VERSION = +match[1];
  }
}

var IS_BROWSER = typeof window == 'object' && typeof Deno != 'object';
var IS_BUN = typeof Bun == 'function' && Bun && typeof Bun.version == 'string';
var IS_DENO = typeof Deno == 'object' && Deno && typeof Deno.version == 'object';

// var IS_NODE = Object.prototype.toString.call(process) == '[object process]';

var WEBKIT_STRING_PAD_BUG = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(USERAGENT);

var DESCRIPTORS_SUPPORT = function () {
  return Object.defineProperty({}, 'a', {
    get: function () { return 7; }
  }).a === 7;
};

var V8_PROTOTYPE_DEFINE_BUG = function () {
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype === 42;
};

var PROMISES_SUPPORT = function () {
  var promise = new Promise(function (resolve) { resolve(1); });
  var empty = function () { /* empty */ };
  var FakePromise = (promise.constructor = {})[Symbol.species] = function (exec) {
    exec(empty, empty);
  };

  return promise.then(empty) instanceof FakePromise
    && V8_VERSION !== 66
    && (!(IS_BROWSER || IS_DENO) || typeof PromiseRejectionEvent == 'function');
};

var PROMISE_STATICS_ITERATION = function () {
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[Symbol.iterator] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    Promise.all(object).then(undefined, function () { /* empty */ });
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var SYMBOLS_SUPPORT = function () {
  return Object.getOwnPropertySymbols && String(Symbol('symbol detection')) && !(V8_VERSION && V8_VERSION < 41);
};

var SYMBOL_REGISTRY = [SYMBOLS_SUPPORT, function () {
  return Symbol['for'] && Symbol.keyFor;
}];

var URL_AND_URL_SEARCH_PARAMS_SUPPORT = function () {
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
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
    Array.from(iteratorWithReturn, function () { throw new Error('close'); });
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

  return new Int8Array(iterable)[0] === 1
    && new Int8Array(new ArrayBuffer(2), 1, undefined).length === 1;
};

function NCG_SUPPORT() {
  var re = RegExp('(?<a>b)');
  return re.exec('b').groups.a === 'b' &&
    'b'.replace(re, '$<a>c') === 'bc';
}

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
    return test === test.toLowerCase() && test.split('"').length <= 3;
  };
}

function createStringTrimMethodTest(METHOD_NAME) {
  return function () {
    return !WHITESPACES[METHOD_NAME]()
      && NOT_WHITESPACES[METHOD_NAME]() === NOT_WHITESPACES
      && WHITESPACES[METHOD_NAME].name === METHOD_NAME;
  };
}

function createSetLike(size) {
  return {
    size: size,
    has: function () {
      return false;
    },
    keys: function () {
      return {
        next: function () {
          return { done: true };
        }
      };
    }
  };
}

function createSetMethodTest(METHOD_NAME) {
  return function () {
    try {
      new Set()[METHOD_NAME](createSetLike(0));
      try {
        // late spec change, early WebKit ~ Safari 17.0 beta implementation does not pass it
        // https://github.com/tc39/proposal-set-methods/pull/88
        new Set()[METHOD_NAME](createSetLike(-1));
        return false;
      } catch (error2) {
        return true;
      }
    } catch (error) {
      return false;
    }
  };
}

function NATIVE_RAW_JSON() {
  var unsafeInt = '9007199254740993';
  var raw = JSON.rawJSON(unsafeInt);
  return JSON.isRawJSON(raw) && JSON.stringify(raw) === unsafeInt;
}

function IMMEDIATE() {
  return setImmediate && clearImmediate && !(IS_BUN && (function () {
    var version = global.Bun.version.split('.');
    return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
  })());
}

function TIMERS() {
  return !(/MSIE .\./.test(USERAGENT) || IS_BUN && (function () {
    var version = global.Bun.version.split('.');
    return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
  })());
}

GLOBAL.tests = {
  // TODO: Remove this module from `core-js@4` since it's split to modules listed below
  'es.symbol': [SYMBOLS_SUPPORT, function () {
    var symbol = Symbol('stringify detection');
    return Object.getOwnPropertySymbols('qwe')
      && Symbol['for']
      && Symbol.keyFor
      && JSON.stringify([symbol]) === '[null]'
      && JSON.stringify({ a: symbol }) === '{}'
      && JSON.stringify(Object(symbol)) === '{}'
      && Symbol.prototype[Symbol.toPrimitive]
      && Symbol.prototype[Symbol.toStringTag];
  }],
  'es.symbol.constructor': SYMBOLS_SUPPORT,
  'es.symbol.description': function () {
    // eslint-disable-next-line symbol-description -- required for testing
    return Symbol('description detection').description === 'description detection' && Symbol().description === undefined;
  },
  'es.symbol.async-iterator': function () {
    return Symbol.asyncIterator;
  },
  'es.symbol.for': SYMBOL_REGISTRY,
  'es.symbol.has-instance': [SYMBOLS_SUPPORT, function () {
    return Symbol.hasInstance;
  }],
  'es.symbol.is-concat-spreadable': [SYMBOLS_SUPPORT, function () {
    return Symbol.isConcatSpreadable;
  }],
  'es.symbol.iterator': [SYMBOLS_SUPPORT, function () {
    return Symbol.iterator;
  }],
  'es.symbol.key-for': SYMBOL_REGISTRY,
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
    return Symbol.toPrimitive && Symbol.prototype[Symbol.toPrimitive];
  }],
  'es.symbol.to-string-tag': [SYMBOLS_SUPPORT, function () {
    return Symbol.toStringTag && Symbol.prototype[Symbol.toStringTag];
  }],
  'es.symbol.unscopables': [SYMBOLS_SUPPORT, function () {
    return Symbol.unscopables;
  }],
  'es.error.cause': function () {
    return Error('e', { cause: 7 }).cause === 7
      && !('cause' in Error.prototype);
  },
  'es.error.to-string': function () {
    if (DESCRIPTORS_SUPPORT) {
      // Chrome 32- incorrectly call accessor
      var object = Object.create(Object.defineProperty({}, 'name', { get: function () {
        return this === object;
      } }));
      if (Error.prototype.toString.call(object) !== 'true') return false;
    }
    // FF10- does not properly handle non-strings
    return Error.prototype.toString.call({ message: 1, name: 2 }) === '2: 1'
      // IE8 does not properly handle defaults
      && Error.prototype.toString.call({}) === 'Error';
  },
  'es.aggregate-error.constructor': function () {
    return typeof AggregateError == 'function';
  },
  'es.aggregate-error.cause': function () {
    return AggregateError([1], 'e', { cause: 7 }).cause === 7
      && !('cause' in AggregateError.prototype);
  },
  'es.array.at': function () {
    return [].at;
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
  'es.array.find-last': function () {
    return [].findLast;
  },
  'es.array.find-last-index': function () {
    return [].findLastIndex;
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
    return Array(1).includes()
      && Array.prototype[Symbol.unscopables].includes;
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
      Array.prototype.join.call(null, '');
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
  'es.array.push': function () {
    if ([].push.call({ length: 0x100000000 }, 1) !== 4294967297) return false;
    try {
      Object.defineProperty([], 'length', { writable: false }).push();
    } catch (error) {
      return error instanceof TypeError;
    }
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

        // stable sort
        var array = [];
        var result = '';
        var code, chr, value, index;

        // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
        for (code = 65; code < 76; code++) {
          chr = String.fromCharCode(code);
          switch (code) {
            case 66: case 69: case 70: case 72: value = 3; break;
            case 68: case 71: value = 4; break;
            default: value = 2;
          }
          for (index = 0; index < 47; index++) {
            array.push({ k: chr + index, v: value });
          }
        }

        array.sort(function (a, b) { return b.v - a.v; });

        for (index = 0; index < array.length; index++) {
          chr = array[index].k.charAt(0);
          if (result.charAt(result.length - 1) !== chr) result += chr;
        }

        return result === 'DGBEFHACIJK';
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
  'es.array.to-reversed': function () {
    return [].toReversed;
  },
  'es.array.to-sorted': function () {
    return [].toSorted;
  },
  'es.array.to-spliced': function () {
    return [].toSpliced;
  },
  'es.array.unscopables.flat': function () {
    return Array.prototype[Symbol.unscopables].flat;
  },
  'es.array.unscopables.flat-map': function () {
    return Array.prototype[Symbol.unscopables].flatMap;
  },
  'es.array.unshift': function () {
    if ([].unshift(0) !== 1) return false;
    try {
      Object.defineProperty([], 'length', { writable: false }).unshift();
    } catch (error) {
      return error instanceof TypeError;
    }
  },
  'es.array.with': function () {
    return []['with'];
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
    return ArrayBuffer.length === 1 && ArrayBuffer.name === 'ArrayBuffer';
  }],
  'es.array-buffer.is-view': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return ArrayBuffer.isView;
  }],
  'es.array-buffer.slice': [ARRAY_BUFFER_SUPPORT, function () {
    return new ArrayBuffer(2).slice(1, undefined).byteLength;
  }],
  'es.array-buffer.detached': function () {
    return 'detached' in ArrayBuffer.prototype;
  },
  'es.array-buffer.transfer': function () {
    return ArrayBuffer.prototype.transfer;
  },
  'es.array-buffer.transfer-to-fixed-length': function () {
    return ArrayBuffer.prototype.transferToFixedLength;
  },
  'es.data-view.constructor': ARRAY_BUFFER_SUPPORT,
  'es.date.get-year': function () {
    return new Date(16e11).getYear() === 120;
  },
  // TODO: Remove from `core-js@4`
  'es.date.now': function () {
    return Date.now;
  },
  'es.date.set-year': function () {
    return Date.prototype.setYear;
  },
  'es.date.to-gmt-string': function () {
    return Date.prototype.toGMTString;
  },
  'es.date.to-iso-string': function () {
    try {
      new Date(NaN).toISOString();
    } catch (error) {
      return new Date(-5e13 - 1).toISOString() === '0385-07-25T07:06:39.999Z';
    }
  },
  'es.date.to-json': function () {
    return new Date(NaN).toJSON() === null
      && Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) === 1;
  },
  'es.date.to-primitive': [SYMBOLS_SUPPORT, function () {
    return Date.prototype[Symbol.toPrimitive];
  }],
  // TODO: Remove from `core-js@4`
  'es.date.to-string': function () {
    return new Date(NaN).toString() === 'Invalid Date';
  },
  'es.escape': function () {
    return escape;
  },
  'es.function.bind': function () {
    var test = (function () { /* empty */ }).bind();
    // eslint-disable-next-line no-prototype-builtins -- safe
    return typeof test == 'function' && !test.hasOwnProperty('prototype');
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
  'es.json.stringify': [SYMBOLS_SUPPORT, function () {
    var symbol = Symbol('stringify detection');
    return JSON.stringify([symbol]) === '[null]'
      && JSON.stringify({ a: symbol }) === '{}'
      && JSON.stringify(Object(symbol)) === '{}'
      && JSON.stringify('\uDF06\uD834') === '"\\udf06\\ud834"'
      && JSON.stringify('\uDEAD') === '"\\udead"';
  }],
  'es.json.to-string-tag': [SYMBOLS_SUPPORT, function () {
    return JSON[Symbol.toStringTag];
  }],
  'es.map.constructor': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
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
      && map.get(1) === 2
      && map.set(-0, 3) === map
      && map.has(0)
      && map[Symbol.toStringTag];
  }],
  'es.map.group-by': function () {
    return Map.groupBy;
  },
  'es.math.acosh': function () {
    // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
    return Math.floor(Math.acosh(Number.MAX_VALUE)) === 710
      // Tor Browser bug: Math.acosh(Infinity) -> NaN
      && Math.acosh(Infinity) === Infinity;
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
    // eslint-disable-next-line no-loss-of-precision -- required for old engines
    return Math.expm1(10) <= 22025.465794806719 && Math.expm1(10) >= 22025.4657948067165168
      // Tor Browser bug
      && Math.expm1(-2e-17) === -2e-17;
  },
  'es.math.fround': function () {
    return Math.fround;
  },
  'es.math.hypot': function () {
    return Math.hypot && Math.hypot(Infinity, NaN) === Infinity;
  },
  'es.math.imul': function () {
    return Math.imul(0xFFFFFFFF, 5) === -5 && Math.imul.length === 2;
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
    return Math.sinh(-2e-17) === -2e-17;
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
    try {
      parseFloat(Object(Symbol.iterator));
    } catch (error) {
      return Number.parseFloat === parseFloat
        && 1 / parseFloat(WHITESPACES + '-0') === -Infinity;
    }
  },
  'es.number.parse-int': function () {
    try {
      parseInt(Object(Symbol.iterator));
    } catch (error) {
      return Number.parseInt === parseInt
        && parseInt(WHITESPACES + '08') === 8
        && parseInt(WHITESPACES + '0x16') === 22;
    }
  },
  'es.number.to-exponential': function () {
    try {
      1.0.toExponential(Infinity);
    } catch (error) {
      try {
        1.0.toExponential(-Infinity);
      } catch (error2) {
        Infinity.toExponential(Infinity);
        NaN.toExponential(Infinity);
        return (-6.9e-11).toExponential(4) === '-6.9000e-11'
          && 1.255.toExponential(2) === '1.25e+0';
        // && 25.0.toExponential(0) === '3e+1';
      }
    }
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
    var symbol = Symbol('assign detection');
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) { B[chr] = chr; });
    return Object.assign({}, A)[symbol] === 7 && Object.keys(Object.assign({}, B)).join('') === alphabet;
  },
  // TODO: Remove from `core-js@4`
  'es.object.create': function () {
    return Object.create;
  },
  'es.object.define-getter': OBJECT_PROTOTYPE_ACCESSORS_SUPPORT,
  'es.object.define-properties': [DESCRIPTORS_SUPPORT, V8_PROTOTYPE_DEFINE_BUG, function () {
    return Object.defineProperties;
  }],
  'es.object.define-property': [DESCRIPTORS_SUPPORT, V8_PROTOTYPE_DEFINE_BUG],
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
  'es.object.get-own-property-symbols': [SYMBOLS_SUPPORT, function () {
    return Object.getOwnPropertySymbols('qwe');
  }],
  'es.object.get-prototype-of': function () {
    return Object.getPrototypeOf('qwe');
  },
  'es.object.group-by': function () {
    return Object.groupBy;
  },
  'es.object.has-own': function () {
    return Object.hasOwn;
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
  'es.object.proto': function () {
    return '__proto__' in Object.prototype;
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
    try {
      parseFloat(Object(Symbol.iterator));
    } catch (error) {
      return 1 / parseFloat(WHITESPACES + '-0') === -Infinity;
    }
  },
  'es.parse-int': function () {
    try {
      parseInt(Object(Symbol.iterator));
    } catch (error) {
      return parseInt(WHITESPACES + '08') === 8
        && parseInt(WHITESPACES + '0x16') === 22;
    }
  },
  // TODO: Remove this module from `core-js@4` since it's split to modules listed below
  'es.promise': PROMISES_SUPPORT,
  'es.promise.constructor': PROMISES_SUPPORT,
  'es.promise.all': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.all;
  }],
  'es.promise.all-settled': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.allSettled;
  }],
  'es.promise.any': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.any;
  }],
  'es.promise.catch': PROMISES_SUPPORT,
  'es.promise.finally': [PROMISES_SUPPORT, function () {
    // eslint-disable-next-line unicorn/no-thenable -- required for testing
    return Promise.prototype['finally'].call({ then: function () { return this; } }, function () { /* empty */ });
  }],
  'es.promise.race': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.race;
  }],
  'es.promise.reject': PROMISES_SUPPORT,
  'es.promise.resolve': PROMISES_SUPPORT,
  'es.promise.with-resolvers': [PROMISES_SUPPORT, function () {
    return Promise.withResolvers;
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
  'es.regexp.constructor': [NCG_SUPPORT, function () {
    var re1 = /a/g;
    var re2 = /a/g;
    re2[Symbol.match] = false;
    // eslint-disable-next-line no-constant-binary-expression -- required for testing
    return new RegExp(re1) !== re1
      && RegExp(re1) === re1
      && RegExp(re2) !== re2
      && String(RegExp(re1, 'i')) === '/a/i'
      && new RegExp('a', 'y') // just check that it doesn't throw
      && RegExp('.', 's').exec('\n')
      && RegExp[Symbol.species];
  }],
  'es.regexp.dot-all': function () {
    return RegExp('.', 's').dotAll;
  },
  'es.regexp.exec': [NCG_SUPPORT, function () {
    var re1 = /a/;
    var re2 = /b*/g;
    var reSticky = new RegExp('a', 'y');
    var reStickyAnchored = new RegExp('^a', 'y');
    re1.exec('a');
    re2.exec('a');
    return re1.lastIndex === 0 && re2.lastIndex === 0
      // eslint-disable-next-line regexp/no-empty-group -- required for testing
      && /()??/.exec('')[1] === undefined
      && reSticky.exec('abc')[0] === 'a'
      && reSticky.exec('abc') === null
      && (reSticky.lastIndex = 1)
      && reSticky.exec('bac')[0] === 'a'
      && (reStickyAnchored.lastIndex = 2)
      && reStickyAnchored.exec('cba') === null
      && RegExp('.', 's').exec('\n');
  }],
  'es.regexp.flags': function () {
    var INDICES_SUPPORT = true;
    try {
      RegExp('.', 'd');
    } catch (error) {
      INDICES_SUPPORT = false;
    }

    var O = {};
    // modern V8 bug
    var calls = '';
    var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

    var addGetter = function (key, chr) {
      Object.defineProperty(O, key, { get: function () {
        calls += chr;
        return true;
      } });
    };

    var pairs = {
      dotAll: 's',
      global: 'g',
      ignoreCase: 'i',
      multiline: 'm',
      sticky: 'y'
    };

    if (INDICES_SUPPORT) pairs.hasIndices = 'd';

    for (var key in pairs) addGetter(key, pairs[key]);

    var result = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(O);

    return result === expected && calls === expected;
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
  'es.set.constructor': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
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
      && set.add(-0) === set
      && set.has(0)
      && set[Symbol.toStringTag];
  }],
  'es.string.at-alternative': function () {
    return '𠮷'.at(-2) === '\uD842';
  },
  'es.string.code-point-at': function () {
    return String.prototype.codePointAt;
  },
  'es.string.ends-with': createIsRegExpLogicTest('endsWith'),
  'es.string.from-code-point': function () {
    return String.fromCodePoint;
  },
  'es.string.includes': createIsRegExpLogicTest('includes'),
  'es.string.is-well-formed': function () {
    return String.prototype.isWellFormed;
  },
  'es.string.iterator': [SYMBOLS_SUPPORT, function () {
    return ''[Symbol.iterator];
  }],
  'es.string.match': function () {
    var O = {};
    O[Symbol.match] = function () { return 7; };

    var execCalled = false;
    var re = /a/;
    re.exec = function () {
      execCalled = true;
      return null;
    };
    re[Symbol.match]('');

    // eslint-disable-next-line regexp/prefer-regexp-exec -- required for testing
    return ''.match(O) === 7 && execCalled;
  },
  'es.string.match-all': function () {
    try {
      // eslint-disable-next-line regexp/no-missing-g-flag -- required for testing
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
    re.exec = function () {
      execCalled = true;
      return null;
    };
    re[Symbol.replace]('');

    var re2 = /./;
    re2.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };

    return ''.replace(O) === 7
      && execCalled
      // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
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
    re.exec = function () {
      execCalled = true;
      return null;
    };
    re[Symbol.search]('');

    return ''.search(O) === 7 && execCalled;
  },
  'es.string.split': function () {
    var O = {};
    O[Symbol.split] = function () { return 7; };

    var execCalled = false;
    var re = /a/;
    re.exec = function () {
      execCalled = true;
      return null;
    };
    re.constructor = {};
    re.constructor[Symbol.species] = function () { return re; };
    re[Symbol.split]('');

    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    var re2 = /(?:)/;
    var originalExec = re2.exec;
    re2.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re2);

    return ''.split(O) === 7 && execCalled && result.length === 2 && result[0] === 'a' && result[1] === 'b';
  },
  'es.string.starts-with': createIsRegExpLogicTest('startsWith'),
  'es.string.substr': function () {
    return 'ab'.substr(-1) === 'b';
  },
  'es.string.to-well-formed': function () {
    // Safari ToString conversion bug
    // https://bugs.webkit.org/show_bug.cgi?id=251757
    return String.prototype.toWellFormed.call(1) === '1';
  },
  'es.string.trim': createStringTrimMethodTest('trim'),
  'es.string.trim-end': [createStringTrimMethodTest('trimEnd'), function () {
    return String.prototype.trimRight === String.prototype.trimEnd;
  }],
  'es.string.trim-left': [createStringTrimMethodTest('trimStart'), function () {
    return String.prototype.trimLeft === String.prototype.trimStart;
  }],
  'es.string.trim-right': [createStringTrimMethodTest('trimEnd'), function () {
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
  'es.typed-array.at': function () {
    return Int8Array.prototype.at;
  },
  'es.typed-array.copy-within': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.copyWithin;
  }],
  'es.typed-array.every': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.every;
  }],
  'es.typed-array.fill': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    var count = 0;
    new Int8Array(2).fill({ valueOf: function () { return count++; } });
    return count === 1;
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
  'es.typed-array.find-last': function () {
    return Int8Array.prototype.findLast;
  },
  'es.typed-array.find-last-index': function () {
    return Int8Array.prototype.findLastIndex;
  },
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
    try {
      Int8Array.prototype[Symbol.iterator].call([1]);
    } catch (error) {
      return Int8Array.prototype[Symbol.iterator].name === 'values'
        && Int8Array.prototype[Symbol.iterator] === Int8Array.prototype.values
        && Int8Array.prototype.keys
        && Int8Array.prototype.entries;
    }
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
    var array = new Uint8ClampedArray(3);
    array.set(1);
    array.set('2', 1);
    Int8Array.prototype.set.call(array, { length: 1, 0: 3 }, 2);
    return array[0] === 0 && array[1] === 2 && array[2] === 3;
  }],
  'es.typed-array.slice': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return new Int8Array(1).slice();
  }],
  'es.typed-array.some': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.some;
  }],
  'es.typed-array.sort': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    try {
      new Uint16Array(1).sort(null);
      new Uint16Array(1).sort({});
      return false;
    } catch (error) { /* empty */ }
    // stable sort
    var array = new Uint16Array(516);
    var expected = Array(516);
    var index, mod;

    for (index = 0; index < 516; index++) {
      mod = index % 4;
      array[index] = 515 - index;
      expected[index] = index - 2 * mod + 3;
    }

    array.sort(function (a, b) {
      return (a / 4 | 0) - (b / 4 | 0);
    });

    for (index = 0; index < 516; index++) {
      if (array[index] !== expected[index]) return;
    } return true;
  }],
  'es.typed-array.subarray': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.subarray;
  }],
  'es.typed-array.to-locale-string': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    try {
      Int8Array.prototype.toLocaleString.call([1, 2]);
    } catch (error) {
      return [1, 2].toLocaleString() === new Int8Array([1, 2]).toLocaleString();
    }
  }],
  'es.typed-array.to-string': [ARRAY_BUFFER_VIEWS_SUPPORT, function () {
    return Int8Array.prototype.toString === Array.prototype.toString;
  }],
  'es.typed-array.to-reversed': function () {
    return Int8Array.prototype.toReversed;
  },
  'es.typed-array.to-sorted': function () {
    return Int8Array.prototype.toSorted;
  },
  'es.typed-array.with': function () {
    try {
      new Int8Array(1)['with'](2, { valueOf: function () { throw 8; } });
    } catch (error) {
      return error === 8;
    }
  },
  'es.unescape': function () {
    return unescape;
  },
  'es.weak-map.constructor': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
    var key = Object.freeze([]);
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
    // MS IE bug
    return map.get(key) === 1
      && map.get(null) === undefined
      && map.set({}, 2) === map
      && map[Symbol.toStringTag]
      // MS Edge bug
      && Object.isFrozen(key);
  }],
  'es.weak-set.constructor': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
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
      && set.add({}) === set
      && set[Symbol.toStringTag];
  }],
  'esnext.suppressed-error.constructor': function () {
    return typeof SuppressedError == 'function'
      && SuppressedError.length === 3
      && SuppressedError(1, 2, 3, { cause: 4 }).cause !== 4;
  },
  'esnext.array.from-async': function () {
    return Array.fromAsync;
  },
  'esnext.array.filter-reject': function () {
    return [].filterReject;
  },
  'esnext.array.is-template-object': function () {
    return Array.isTemplateObject;
  },
  'esnext.array.unique-by': function () {
    return [].uniqueBy;
  },
  'esnext.async-disposable-stack.constructor': function () {
    return typeof AsyncDisposableStack == 'function';
  },
  'esnext.async-iterator.constructor': function () {
    return typeof AsyncIterator == 'function';
  },
  'esnext.async-iterator.async-dispose': function () {
    return AsyncIterator.prototype[Symbol.asyncDispose];
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
  'esnext.composite-key': function () {
    return compositeKey;
  },
  'esnext.composite-symbol': function () {
    return compositeSymbol;
  },
  'esnext.data-view.get-float16': [ARRAY_BUFFER_SUPPORT, function () {
    return DataView.prototype.getFloat16;
  }],
  'esnext.data-view.get-uint8-clamped': [ARRAY_BUFFER_SUPPORT, function () {
    return DataView.prototype.getUint8Clamped;
  }],
  'esnext.data-view.set-float16': [ARRAY_BUFFER_SUPPORT, function () {
    return DataView.prototype.setFloat16;
  }],
  'esnext.data-view.set-uint8-clamped': [ARRAY_BUFFER_SUPPORT, function () {
    return DataView.prototype.setUint8Clamped;
  }],
  'esnext.disposable-stack.constructor': function () {
    return typeof DisposableStack == 'function';
  },
  'esnext.function.demethodize': function () {
    return Function.prototype.demethodize;
  },
  'esnext.function.is-callable': function () {
    return Function.isCallable;
  },
  'esnext.function.is-constructor': function () {
    return Function.isConstructor;
  },
  'esnext.function.metadata': function () {
    return Function.prototype[Symbol.metadata] === null;
  },
  'esnext.iterator.constructor': function () {
    try {
      Iterator({});
    } catch (error) {
      return typeof Iterator == 'function'
        && Iterator.prototype === Object.getPrototypeOf(Object.getPrototypeOf([].values()));
    }
  },
  'esnext.iterator.dispose': function () {
    return [].keys()[Symbol.dispose];
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
  'esnext.iterator.range': function () {
    return Iterator.range;
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
  'esnext.iterator.to-async': function () {
    return Iterator.prototype.toAsync;
  },
  'esnext.json.is-raw-json': NATIVE_RAW_JSON,
  'esnext.json.parse': function () {
    var unsafeInt = '9007199254740993';
    var source;
    JSON.parse(unsafeInt, function (key, value, context) {
      source = context.source;
    });
    return source === unsafeInt;
  },
  'esnext.json.raw-json': NATIVE_RAW_JSON,
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
  'esnext.math.f16round': function () {
    return Math.f16round;
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
  'esnext.math.signbit': function () {
    return Math.signbit;
  },
  'esnext.number.from-string': function () {
    return Number.fromString;
  },
  'esnext.regexp.escape': function () {
    return RegExp.escape;
  },
  'esnext.set.add-all': function () {
    return Set.prototype.addAll;
  },
  'esnext.set.delete-all': function () {
    return Set.prototype.deleteAll;
  },
  'esnext.set.difference.v2': createSetMethodTest('difference'),
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
  'esnext.set.intersection.v2': [createSetMethodTest('intersection'), function () {
    return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) === '3,2';
  }],
  'esnext.set.is-disjoint-from.v2': createSetMethodTest('isDisjointFrom'),
  'esnext.set.is-subset-of.v2': createSetMethodTest('isSubsetOf'),
  'esnext.set.is-superset-of.v2': createSetMethodTest('isSupersetOf'),
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
  'esnext.set.symmetric-difference.v2': createSetMethodTest('symmetricDifference'),
  'esnext.set.union.v2': createSetMethodTest('union'),
  'esnext.string.code-points': function () {
    return String.prototype.codePoints;
  },
  'esnext.string.cooked': function () {
    return String.cooked;
  },
  'esnext.string.dedent': function () {
    return String.dedent;
  },
  'esnext.symbol.async-dispose': function () {
    var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose');
    return descriptor.value && !descriptor.enumerable && !descriptor.configurable && !descriptor.writable;
  },
  'esnext.symbol.dispose': function () {
    var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'dispose');
    return descriptor.value && !descriptor.enumerable && !descriptor.configurable && !descriptor.writable;
  },
  'esnext.symbol.is-registered-symbol': function () {
    return Symbol.isRegisteredSymbol;
  },
  'esnext.symbol.is-well-known-symbol': function () {
    return Symbol.isWellKnownSymbol;
  },
  'esnext.symbol.matcher': function () {
    return Symbol.matcher;
  },
  'esnext.symbol.metadata': function () {
    return Symbol.metadata;
  },
  'esnext.symbol.observable': function () {
    return Symbol.observable;
  },
  'esnext.typed-array.filter-reject': function () {
    return Int8Array.prototype.filterReject;
  },
  'esnext.typed-array.unique-by': function () {
    return Int8Array.prototype.uniqueBy;
  },
  'esnext.uint8-array.from-base64': function () {
    return Uint8Array.fromBase64;
  },
  'esnext.uint8-array.from-hex': function () {
    return Uint8Array.fromHex;
  },
  'esnext.uint8-array.to-base64': function () {
    return Uint8Array.prototype.toBase64;
  },
  'esnext.uint8-array.to-hex': function () {
    return Uint8Array.prototype.toHex;
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
  'web.atob': function () {
    try {
      atob();
    } catch (error1) {
      try {
        atob('a');
      } catch (error2) {
        return atob(' ') === '';
      }
    }
  },
  'web.btoa': function () {
    try {
      btoa();
    } catch (error) {
      return typeof btoa == 'function';
    }
  },
  'web.clear-immediate': function () {
    return setImmediate && clearImmediate;
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
  'web.dom-exception.constructor': function () {
    return new DOMException() instanceof Error
      && new DOMException(1, 'DataCloneError').code === 25
      && String(new DOMException(1, 2)) === '2: 1'
      && DOMException.DATA_CLONE_ERR === 25
      && DOMException.prototype.DATA_CLONE_ERR === 25;
  },
  'web.dom-exception.stack': function () {
    return !('stack' in Error('1')) || 'stack' in new DOMException();
  },
  'web.dom-exception.to-string-tag': function () {
    return typeof DOMException == 'function'
      && DOMException.prototype[Symbol.toStringTag] === 'DOMException';
  },
  // TODO: Remove this module from `core-js@4` since it's split to submodules
  'web.immediate': IMMEDIATE,
  'web.queue-microtask': function () {
    return Object.getOwnPropertyDescriptor(GLOBAL, 'queueMicrotask').value.length === 1;
  },
  'web.self': function () {
    // eslint-disable-next-line no-restricted-globals -- safe
    if (self !== GLOBAL) return false;
    if (!DESCRIPTORS_SUPPORT) return true;
    var descriptor = Object.getOwnPropertyDescriptor(GLOBAL, 'self');
    return descriptor.get && descriptor.enumerable;
  },
  'web.set-immediate': IMMEDIATE,
  'web.set-interval': TIMERS,
  'web.set-timeout': TIMERS,
  'web.structured-clone': function () {
    function checkErrorsCloning(structuredCloneImplementation, $Error) {
      var error = new $Error();
      var test = structuredCloneImplementation({ a: error, b: error });
      return test && test.a === test.b && test.a instanceof $Error && test.a.stack === error.stack;
    }

    function checkNewErrorsCloningSemantic(structuredCloneImplementation) {
      var test = structuredCloneImplementation(new AggregateError([1], 'message', { cause: 3 }));
      return test.name === 'AggregateError' && test.errors[0] === 1 && test.message === 'message' && test.cause === 3;
    }

    return checkErrorsCloning(structuredClone, Error)
      && checkErrorsCloning(structuredClone, DOMException)
      && checkNewErrorsCloningSemantic(structuredClone);
  },
  // TODO: Remove this module from `core-js@4` since it's split to submodules
  'web.timers': TIMERS,
  'web.url.constructor': URL_AND_URL_SEARCH_PARAMS_SUPPORT,
  'web.url.can-parse': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    try {
      URL.canParse();
    } catch (error) {
      return URL.canParse.length === 1;
    }
  }],
  'web.url.to-json': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    return URL.prototype.toJSON;
  }],
  'web.url-search-params.constructor': URL_AND_URL_SEARCH_PARAMS_SUPPORT,
  'web.url-search-params.delete': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    var params = new URLSearchParams('a=1&a=2&b=3');
    params['delete']('a', 1);
    // `undefined` case is a Chromium 117 bug
    // https://bugs.chromium.org/p/v8/issues/detail?id=14222
    params['delete']('b', undefined);
    return params + '' === 'a=2';
  }],
  'web.url-search-params.has': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    var params = new URLSearchParams('a=1');
    // `undefined` case is a Chromium 117 bug
    // https://bugs.chromium.org/p/v8/issues/detail?id=14222
    return params.has('a', 1) && !params.has('a', 2) && params.has('a', undefined);
  }],
  'web.url-search-params.size': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    return 'size' in URLSearchParams.prototype;
  }]
};
