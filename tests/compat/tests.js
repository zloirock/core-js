'use strict';
/* eslint-disable prefer-regex-literals, radix, unicorn/prefer-global-this -- required for testing */
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
        },
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
  return Symbol.for && Symbol.keyFor;
}];

var URL_AND_URL_SEARCH_PARAMS_SUPPORT = function () {
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  var url = new URL('b?a=1&b=2&c=3', 'https://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams.delete('b');
    result += key + value;
  });
  return searchParams.sort
    && url.href === 'https://a/c%20d?a=1&c=3'
    && searchParams.get('c') === '3'
    && String(new URLSearchParams('?a=1')) === 'a=1'
    && searchParams[Symbol.iterator]
    && new URL('https://a@b').username === 'a'
    && new URLSearchParams(new URLSearchParams('a=b')).get('a') === 'b'
    && new URL('https://тест').host === 'xn--e1aybc'
    && new URL('https://a#б').hash === '#%D0%B1'
    && result === 'a1c3'
    && new URL('https://x', undefined).host === 'x';
};

// eslint-disable-next-line no-proto -- safe
var PROTOTYPE_SETTING_AVAILABLE = Object.setPrototypeOf || ({}).__proto__;

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
      return: function () {
        SAFE_CLOSING = true;
      },
    };
    iteratorWithReturn[Symbol.iterator] = function () {
      return this;
    };
    Array.from(iteratorWithReturn, function () { throw new Error('close'); });
  } catch (error) {
    return SAFE_CLOSING;
  }
};

var DATA_VIEW_INT8_CONVERSION_BUG = function () {
  var testView = new DataView(new ArrayBuffer(2));
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);

  // iOS Safari 7.x bug
  return !testView.getInt8(0) || !!testView.getInt8(1);
};

var TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS = function () {
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
    },
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
        },
      };
    },
  };
}

function createSetLikeWithInfinitySize(size) {
  return {
    size: size,
    has: function () {
      return true;
    },
    keys: function () {
      throw new Error('e');
    },
  };
}

function createSetMethodTest(METHOD_NAME, callback) {
  return function () {
    try {
      new Set()[METHOD_NAME](createSetLike(0));
      try {
        // late spec change, early WebKit ~ Safari 17.0 beta implementation does not pass it
        // https://github.com/tc39/proposal-set-methods/pull/88
        new Set()[METHOD_NAME](createSetLike(-1));
        return false;
      } catch (error2) {
        if (!callback) return true;
        // early V8 implementation bug
        // https://issues.chromium.org/issues/351332634
        try {
          new Set()[METHOD_NAME](createSetLikeWithInfinitySize(-Infinity));
          return false;
        } catch (error) {
          var set = new Set();
          set.add(1);
          set.add(2);
          return callback(set[METHOD_NAME](createSetLikeWithInfinitySize(Infinity)));
        }
      }
    } catch (error) {
      return false;
    }
  };
}

function createSetMethodTestShouldGetKeysBeforeCloning(METHOD_NAME) {
  return function () {
    var baseSet = new Set();
    var setLike = {
      size: 0,
      has: function () { return true; },
      keys: function () {
        return Object.defineProperty({}, 'next', {
          get: function () {
            baseSet.clear();
            baseSet.add(4);
            return function () {
              return { done: true };
            };
          },
        });
      },
    };
    var result = baseSet[METHOD_NAME](setLike);

    return result.size === 1 && result.values().next().value === 4;
  };
}

function NATIVE_RAW_JSON() {
  var unsafeInt = '9007199254740993';
  var raw = JSON.rawJSON(unsafeInt);
  return JSON.isRawJSON(raw) && JSON.stringify(raw) === unsafeInt;
}

function IMMEDIATE() {
  return setImmediate && clearImmediate && !(IS_BUN && (function () {
    var version = Bun.version.split('.');
    return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
  })());
}

// https://github.com/tc39/ecma262/pull/3467
function checkIteratorClosingOnEarlyError(METHOD_NAME, ExpectedError) {
  return function () {
    var CLOSED = false;
    try {
      Iterator.prototype[METHOD_NAME].call({
        next: function () { return { done: true }; },
        return: function () { CLOSED = true; },
      }, -1);
    } catch (error) {
      // https://bugs.webkit.org/show_bug.cgi?id=291195
      if (!(error instanceof ExpectedError)) return;
    }
    return CLOSED;
  };
}

// https://issues.chromium.org/issues/336839115
function iteratorHelperThrowsErrorOnInvalidIterator(methodName, argument) {
  return function () {
    if (typeof Iterator == 'function' && Iterator.prototype[methodName]) try {
      Iterator.prototype[methodName].call({ next: null }, argument).next();
    } catch (error) {
      return true;
    }
  };
}

GLOBAL.tests = {
  'es.symbol.constructor': SYMBOLS_SUPPORT,
  'es.symbol.description': function () {
    // eslint-disable-next-line symbol-description -- required for testing
    return Symbol('description detection').description === 'description detection' && Symbol().description === undefined;
  },
  'es.symbol.async-dispose': function () {
    var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose');
    return descriptor.value && !descriptor.enumerable && !descriptor.configurable && !descriptor.writable;
  },
  'es.symbol.async-iterator': function () {
    return Symbol.asyncIterator;
  },
  'es.symbol.dispose': function () {
    var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'dispose');
    return descriptor.value && !descriptor.enumerable && !descriptor.configurable && !descriptor.writable;
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
  'es.object.assign': function () {
    if (Object.assign({ b: 1 }, Object.assign(Object.defineProperty({}, 'a', {
      enumerable: true,
      get: function () {
        Object.defineProperty(this, 'b', {
          value: 3,
          enumerable: false,
        });
      },
    }), { b: 2 })).b !== 1) return false;
    var A = {};
    var B = {};
    var symbol = Symbol('assign detection');
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) { B[chr] = chr; });
    return Object.assign({}, A)[symbol] === 7 && Object.keys(Object.assign({}, B)).join('') === alphabet;
  },
  'es.object.define-getter': OBJECT_PROTOTYPE_ACCESSORS_SUPPORT,
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
  'es.object.get-own-property-descriptor': function () {
    return Object.getOwnPropertyDescriptor('qwe', '0');
  },
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
    // https://bugs.webkit.org/show_bug.cgi?id=271524
    return Object.groupBy('ab', function (it) {
      return it;
    }).a.length === 1;
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
  'es.error.cause': function () {
    return new Error('e', { cause: 7 }).cause === 7
      && !('cause' in Error.prototype);
  },
  'es.error.is-error': function () {
    return PROTOTYPE_SETTING_AVAILABLE &&
      (typeof DOMException != 'function' || Error.isError(new DOMException('DOMException'))) &&
      Error.isError(new Error('Error', { cause: function () { /* empty */ } })) &&
      !Error.isError(Object.create(Error.prototype));
  },
  'es.aggregate-error.constructor': function () {
    return typeof AggregateError == 'function';
  },
  'es.aggregate-error.cause': function () {
    return new AggregateError([1], 'e', { cause: 7 }).cause === 7
      && !('cause' in AggregateError.prototype);
  },
  'es.suppressed-error.constructor': function () {
    return typeof SuppressedError == 'function'
      && SuppressedError.length === 3
      && new SuppressedError(1, 2, 3, { cause: 4 }).cause !== 4;
  },
  'es.promise.constructor': PROMISES_SUPPORT,
  'es.promise.catch': PROMISES_SUPPORT,
  'es.promise.finally': [PROMISES_SUPPORT, function () {
    // eslint-disable-next-line unicorn/no-thenable -- required for testing
    return Promise.prototype.finally.call({ then: function () { return this; } }, function () { /* empty */ });
  }],
  'es.promise.reject': PROMISES_SUPPORT,
  'es.promise.resolve': PROMISES_SUPPORT,
  'es.promise.all': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.all;
  }],
  'es.promise.all-settled': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.allSettled;
  }],
  'es.promise.any': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.any;
  }],
  'es.promise.race': [PROMISES_SUPPORT, SAFE_ITERATION_CLOSING_SUPPORT, PROMISE_STATICS_ITERATION, function () {
    return Promise.race;
  }],
  'es.promise.try': [PROMISES_SUPPORT, function () {
    var ACCEPT_ARGUMENTS = false;
    Promise.try(function (argument) {
      ACCEPT_ARGUMENTS = argument === 8;
    }, 8);
    return ACCEPT_ARGUMENTS;
  }],
  'es.promise.with-resolvers': [PROMISES_SUPPORT, function () {
    return Promise.withResolvers;
  }],
  'es.array.from-async': function () {
    // https://bugs.webkit.org/show_bug.cgi?id=271703
    var counter = 0;
    Array.fromAsync.call(function () {
      counter++;
      return [];
    }, { length: 0 });
    return counter === 1;
  },
  'es.async-disposable-stack.constructor': function () {
    // https://github.com/tc39/proposal-explicit-resource-management/issues/256
    // can't be detected synchronously
    if (V8_VERSION && V8_VERSION < 136) return;
    return typeof AsyncDisposableStack == 'function';
  },
  'es.async-iterator.async-dispose': function () {
    return AsyncIterator.prototype[Symbol.asyncDispose];
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

    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
    return array1.concat()[0] === array1 && array2.concat().foo === 1;
  },
  'es.array.copy-within': function () {
    return Array.prototype.copyWithin && Array.prototype[Symbol.unscopables].copyWithin;
  },
  'es.array.entries': [SYMBOLS_SUPPORT, function () {
    var iterator = [].entries();
    return iterator.next()
      && iterator[Symbol.iterator]() === iterator
      && iterator[Symbol.toStringTag] === 'Array Iterator'
      && [][Symbol.unscopables].entries;
  }],
  'es.array.fill': function () {
    return Array.prototype.fill && Array.prototype[Symbol.unscopables].fill;
  },
  'es.array.filter': function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[Symbol.species] = function () {
      return { foo: 1 };
    };
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
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
  'es.array.keys': [SYMBOLS_SUPPORT, function () {
    var iterator = [].keys();
    return iterator.next()
      && iterator[Symbol.iterator]() === iterator
      && iterator[Symbol.toStringTag] === 'Array Iterator'
      && [][Symbol.unscopables].keys;
  }],
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
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
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
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
    return array.slice().foo === 1;
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
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
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
  'es.array.values': [SYMBOLS_SUPPORT, function () {
    var iterator = [].values();
    return iterator.next()
      && iterator[Symbol.iterator]() === iterator
      && iterator[Symbol.toStringTag] === 'Array Iterator'
      && [][Symbol.unscopables].values
      && [].values.name === 'values'
      && [][Symbol.iterator] === [].values;
  }],
  'es.array.with': function () {
    // Incorrect exception thrown when index coercion fails in Firefox
    try {
      [].with({ valueOf: function () { throw 4; } }, null);
    } catch (error) {
      return error === 4;
    }
  },
  'es.array-buffer.constructor': function () {
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
  },
  'es.array-buffer.is-view': function () {
    return ArrayBuffer.isView;
  },
  'es.array-buffer.slice': function () {
    return new ArrayBuffer(2).slice(1, undefined).byteLength;
  },
  'es.array-buffer.detached': function () {
    return 'detached' in ArrayBuffer.prototype;
  },
  'es.array-buffer.species': function () {
    return ArrayBuffer[Symbol.species] === ArrayBuffer;
  },
  'es.array-buffer.to-string-tag': function () {
    return ArrayBuffer.prototype[Symbol.toStringTag] === 'ArrayBuffer';
  },
  'es.array-buffer.transfer': function () {
    return ArrayBuffer.prototype.transfer;
  },
  'es.array-buffer.transfer-to-fixed-length': function () {
    return ArrayBuffer.prototype.transferToFixedLength;
  },
  'es.data-view.constructor': function () {
    return DataView;
  },
  'es.data-view.set-int8': DATA_VIEW_INT8_CONVERSION_BUG,
  'es.data-view.set-uint8': DATA_VIEW_INT8_CONVERSION_BUG,
  'es.data-view.get-float16': function () {
    return DataView.prototype.getFloat16;
  },
  'es.data-view.set-float16': function () {
    return DataView.prototype.setFloat16;
  },
  'es.data-view.to-string-tag': function () {
    return DataView.prototype[Symbol.toStringTag] === 'DataView';
  },
  'es.date.to-json': function () {
    return new Date(NaN).toJSON() === null
      && Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) === 1;
  },
  'es.date.to-primitive': [SYMBOLS_SUPPORT, function () {
    return Date.prototype[Symbol.toPrimitive];
  }],
  'es.disposable-stack.constructor': function () {
    return typeof DisposableStack == 'function';
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
  'es.iterator.constructor': function () {
    try {
      Iterator({});
    } catch (error) {
      return typeof Iterator == 'function'
        && Iterator.prototype === Object.getPrototypeOf(Object.getPrototypeOf([].values()));
    }
  },
  'es.iterator.dispose': function () {
    return [].keys()[Symbol.dispose];
  },
  'es.iterator.drop': [
    iteratorHelperThrowsErrorOnInvalidIterator('drop', 0),
    checkIteratorClosingOnEarlyError('drop', RangeError),
  ],
  'es.iterator.every': checkIteratorClosingOnEarlyError('every', TypeError),
  'es.iterator.filter': [
    iteratorHelperThrowsErrorOnInvalidIterator('filter', function () { /* empty */ }),
    checkIteratorClosingOnEarlyError('filter', TypeError),
  ],
  'es.iterator.find': checkIteratorClosingOnEarlyError('find', TypeError),
  'es.iterator.flat-map': [
    iteratorHelperThrowsErrorOnInvalidIterator('flatMap', function () { /* empty */ }),
    checkIteratorClosingOnEarlyError('flatMap', TypeError),
  ],
  'es.iterator.for-each': checkIteratorClosingOnEarlyError('forEach', TypeError),
  'es.iterator.from': function () {
    Iterator.from({ return: null }).return();
    return true;
  },
  'es.iterator.map': [
    iteratorHelperThrowsErrorOnInvalidIterator('map', function () { /* empty */ }),
    checkIteratorClosingOnEarlyError('map', TypeError),
  ],
  'es.iterator.reduce': [checkIteratorClosingOnEarlyError('reduce', TypeError), function () {
    // fails on undefined initial parameter
    // https://bugs.webkit.org/show_bug.cgi?id=291651
    [].keys().reduce(function () { /* empty */ }, undefined);
    return true;
  }],
  'es.iterator.some': checkIteratorClosingOnEarlyError('some', TypeError),
  'es.iterator.take': checkIteratorClosingOnEarlyError('take', RangeError),
  'es.iterator.to-array': function () {
    return Iterator.prototype.toArray;
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
      },
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
  'es.map.species': function () {
    return Map[Symbol.species] === Map;
  },
  'es.map.group-by': function () {
    // https://bugs.webkit.org/show_bug.cgi?id=271524
    return Map.groupBy('ab', function (it) {
      return it;
    }).get('a').length === 1;
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
  'es.math.f16round': function () {
    return Math.f16round;
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
  'es.number.constructor': function () {
    // eslint-disable-next-line math/no-static-nan-calculations -- feature detection
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
  'es.regexp.escape': function () {
    return RegExp.escape('ab') === '\\x61b';
  },
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
      sticky: 'y',
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
      },
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
  'es.set.species': function () {
    return Set[Symbol.species] === Set;
  },
  'es.set.difference': [createSetMethodTest('difference', function (result) {
    return result.size === 0;
  }), function () {
    // A WebKit bug occurs when `this` is updated while Set.prototype.difference is being executed
    // https://bugs.webkit.org/show_bug.cgi?id=288595
    var setLike = {
      size: 1,
      has: function () { return true; },
      keys: function () {
        var index = 0;
        return {
          next: function () {
            var done = index++ > 1;
            if (baseSet.has(1)) baseSet.clear();
            return { done: done, value: 2 };
          },
        };
      },
    };

    var baseSet = new Set([1, 2, 3, 4]);

    return baseSet.difference(setLike).size === 3;
  }],
  'es.set.intersection': [createSetMethodTest('intersection', function (result) {
    return result.size === 2 && result.has(1) && result.has(2);
  }), function () {
    return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) === '3,2';
  }],
  'es.set.is-disjoint-from': createSetMethodTest('isDisjointFrom', function (result) {
    return !result;
  }),
  'es.set.is-subset-of': createSetMethodTest('isSubsetOf', function (result) {
    return result;
  }),
  'es.set.is-superset-of': createSetMethodTest('isSupersetOf', function (result) {
    return !result;
  }),
  'es.set.symmetric-difference': [
    createSetMethodTest('symmetricDifference'),
    createSetMethodTestShouldGetKeysBeforeCloning('symmetricDifference'),
  ],
  'es.set.union': [
    createSetMethodTest('union'),
    createSetMethodTestShouldGetKeysBeforeCloning('union'),
  ],
  'es.string.at': function () {
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
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.float64-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.int8-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.int16-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.int32-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.uint8-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.uint8-clamped-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.uint16-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.uint32-array': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
  ],
  'es.typed-array.from': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
    function () {
      return Int8Array.from;
    },
  ],
  'es.typed-array.of': [
    TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS,
    function () {
      return Int8Array.of;
    },
  ],
  'es.typed-array.iterator': function () {
    try {
      Int8Array.prototype[Symbol.iterator].call([1]);
    } catch (error) {
      return Int8Array.prototype[Symbol.iterator].name === 'values'
        && Int8Array.prototype[Symbol.iterator] === Int8Array.prototype.values
        && Int8Array.prototype.keys
        && Int8Array.prototype.entries;
    }
  },
  'es.typed-array.at': function () {
    return Int8Array.prototype.at;
  },
  'es.typed-array.copy-within': function () {
    return Int8Array.prototype.copyWithin;
  },
  'es.typed-array.every': function () {
    return Int8Array.prototype.every;
  },
  'es.typed-array.fill': function () {
    var count = 0;
    new Int8Array(2).fill({ valueOf: function () { return count++; } });
    return count === 1;
  },
  'es.typed-array.filter': function () {
    return Int8Array.prototype.filter;
  },
  'es.typed-array.find': function () {
    return Int8Array.prototype.find;
  },
  'es.typed-array.find-index': function () {
    return Int8Array.prototype.findIndex;
  },
  'es.typed-array.find-last': function () {
    return Int8Array.prototype.findLast;
  },
  'es.typed-array.find-last-index': function () {
    return Int8Array.prototype.findLastIndex;
  },
  'es.typed-array.for-each': function () {
    return Int8Array.prototype.forEach;
  },
  'es.typed-array.includes': function () {
    return Int8Array.prototype.includes;
  },
  'es.typed-array.index-of': function () {
    return Int8Array.prototype.indexOf;
  },
  'es.typed-array.join': function () {
    return Int8Array.prototype.join;
  },
  'es.typed-array.last-index-of': function () {
    return Int8Array.prototype.lastIndexOf;
  },
  'es.typed-array.map': function () {
    return Int8Array.prototype.map;
  },
  'es.typed-array.reduce': function () {
    return Int8Array.prototype.reduce;
  },
  'es.typed-array.reduce-right': function () {
    return Int8Array.prototype.reduceRight;
  },
  'es.typed-array.reverse': function () {
    return Int8Array.prototype.reverse;
  },
  'es.typed-array.set': function () {
    var array = new Uint8ClampedArray(3);
    array.set(1);
    array.set('2', 1);
    Int8Array.prototype.set.call(array, { length: 1, 0: 3 }, 2);
    return array[0] === 0 && array[1] === 2 && array[2] === 3;
  },
  'es.typed-array.slice': function () {
    return new Int8Array(1).slice();
  },
  'es.typed-array.some': function () {
    return Int8Array.prototype.some;
  },
  'es.typed-array.sort': function () {
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
  },
  'es.typed-array.species': [TYPED_ARRAY_CONSTRUCTORS_NOT_REQUIRE_WRAPPERS, function () {
    return Int8Array[Symbol.species] === Int8Array;
  }],
  'es.typed-array.subarray': function () {
    return Int8Array.prototype.subarray.call(new Float32Array([1, 2, 3]), 0, 1) instanceof Float32Array;
  },
  'es.typed-array.to-locale-string': function () {
    try {
      Int8Array.prototype.toLocaleString.call([1, 2]);
    } catch (error) {
      return [1, 2].toLocaleString() === Int8Array.prototype.toLocaleString.call(new Float32Array([1, 2]));
    }
  },
  'es.typed-array.to-string': function () {
    return Int8Array.prototype.toString === Array.prototype.toString;
  },
  'es.typed-array.to-string-tag': function () {
    return new Int8Array(1)[Symbol.toStringTag] === 'Int8Array';
  },
  'es.typed-array.to-reversed': function () {
    return Int8Array.prototype.toReversed;
  },
  'es.typed-array.to-sorted': function () {
    return Int8Array.prototype.toSorted;
  },
  'es.typed-array.with': [function () {
    try {
      new Int8Array(1).with(2, { valueOf: function () { throw 8; } });
    } catch (error) {
      return error === 8;
    }
  }, function () {
    // WebKit doesn't handle this correctly. It should truncate a negative fractional index to zero, but instead throws an error
    // Copyright (C) 2025 André Bargull. All rights reserved.
    // This code is governed by the BSD license found in the LICENSE file.
    // https://github.com/tc39/test262/pull/4477/commits/bd47071722d914036280cdd795a6ac6046d1c6f9
    var result = new Int8Array(1).with(-0.5, 1);
    return result[0] === 1;
  }],
  'es.weak-map.constructor': [SAFE_ITERATION_CLOSING_SUPPORT, function () {
    var key = Object.freeze([]);
    var called = 0;
    var iterable = {
      next: function () {
        return { done: !!called++, value: [key, 1] };
      },
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
      },
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
  'esnext.array.filter-reject': function () {
    return [].filterReject;
  },
  'esnext.array.is-template-object': function () {
    return Array.isTemplateObject;
  },
  'esnext.array.unique-by': function () {
    return [].uniqueBy;
  },
  'esnext.async-iterator.constructor': function () {
    return typeof AsyncIterator == 'function';
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
  'esnext.data-view.get-uint8-clamped': function () {
    return DataView.prototype.getUint8Clamped;
  },
  'esnext.data-view.set-uint8-clamped': function () {
    return DataView.prototype.setUint8Clamped;
  },
  'esnext.function.demethodize': function () {
    return Function.prototype.demethodize;
  },
  'esnext.function.metadata': function () {
    return Function.prototype[Symbol.metadata] === null;
  },
  'esnext.iterator.chunks': function () {
    return Iterator.prototype.chunks;
  },
  'esnext.iterator.concat': function () {
    return Iterator.concat;
  },
  'esnext.iterator.range': function () {
    return Iterator.range;
  },
  'esnext.iterator.sliding': function () {
    return Iterator.prototype.sliding;
  },
  'esnext.iterator.to-async': function () {
    return Iterator.prototype.toAsync;
  },
  'esnext.iterator.windows': function () {
    return Iterator.prototype.windows;
  },
  'esnext.iterator.zip': function () {
    return Iterator.zip;
  },
  'esnext.iterator.zip-keyed': function () {
    return Iterator.zipKeyed;
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
  'esnext.map.get-or-insert': function () {
    return Map.prototype.getOrInsert;
  },
  'esnext.map.get-or-insert-computed': function () {
    return Map.prototype.getOrInsertComputed;
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
  'esnext.math.sum-precise': function () {
    return Math.sumPrecise;
  },
  'esnext.number.clamp': function () {
    return Number.prototype.clamp;
  },
  'esnext.set.add-all': function () {
    return Set.prototype.addAll;
  },
  'esnext.set.delete-all': function () {
    return Set.prototype.deleteAll;
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
  'esnext.string.cooked': function () {
    return String.cooked;
  },
  'esnext.string.dedent': function () {
    return String.dedent;
  },
  'esnext.symbol.custom-matcher': function () {
    return Symbol.customMatcher;
  },
  'esnext.symbol.is-registered-symbol': function () {
    return Symbol.isRegisteredSymbol;
  },
  'esnext.symbol.is-well-known-symbol': function () {
    return Symbol.isWellKnownSymbol;
  },
  'esnext.symbol.metadata': function () {
    return Symbol.metadata;
  },
  'esnext.typed-array.filter-reject': function () {
    return Int8Array.prototype.filterReject;
  },
  'esnext.typed-array.unique-by': function () {
    return Int8Array.prototype.uniqueBy;
  },
  'esnext.uint8-array.from-base64': function () {
    try {
      Uint8Array.fromBase64('a');
      return;
    } catch (error) { /* empty */ }
    if (!Uint8Array.fromBase64) return false;
    try {
      Uint8Array.fromBase64('', null);
    } catch (error) {
      return true;
    }
  },
  'esnext.uint8-array.from-hex': function () {
    return Uint8Array.fromHex;
  },
  'esnext.uint8-array.set-from-base64': function () {
    var target = new Uint8Array([255, 255, 255, 255, 255]);
    try {
      target.setFromBase64('', null);
      return false;
    } catch (error) { /* empty */ }
    try {
      target.setFromBase64('a');
      return;
    } catch (error) { /* empty */ }
    try {
      target.setFromBase64('MjYyZg===');
    } catch (error) {
      return target[0] === 50 && target[1] === 54 && target[2] === 50 && target[3] === 255 && target[4] === 255;
    }
  },
  'esnext.uint8-array.set-from-hex': function () {
    return Uint8Array.prototype.setFromHex;
  },
  'esnext.uint8-array.to-base64': function () {
    if (!Uint8Array.prototype.toBase64) return false;
    try {
      var target = new Uint8Array();
      target.toBase64(null);
    } catch (error) {
      return true;
    }
  },
  'esnext.uint8-array.to-hex': function () {
    if (!Uint8Array.prototype.toHex) return false;
    try {
      var target = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
      return target.toHex() === 'ffffffffffffffff';
    } catch (error) {
      return false;
    }
  },
  'esnext.weak-map.delete-all': function () {
    return WeakMap.prototype.deleteAll;
  },
  'esnext.weak-map.get-or-insert': function () {
    return WeakMap.prototype.getOrInsert;
  },
  'esnext.weak-map.get-or-insert-computed': function () {
    return WeakMap.prototype.getOrInsertComputed;
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
  'web.dom-exception.constructor': function () {
    return new DOMException() instanceof Error
      && new DOMException(1, 'DataCloneError').code === 25
      && String(new DOMException(1, 2)) === '2: 1'
      && DOMException.DATA_CLONE_ERR === 25
      && DOMException.prototype.DATA_CLONE_ERR === 25;
  },
  'web.dom-exception.stack': function () {
    return !('stack' in new Error('1')) || 'stack' in new DOMException();
  },
  'web.dom-exception.to-string-tag': function () {
    return typeof DOMException == 'function'
      && DOMException.prototype[Symbol.toStringTag] === 'DOMException';
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
      TouchList: 0,
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
  'web.queue-microtask': function () {
    return Object.getOwnPropertyDescriptor(GLOBAL, 'queueMicrotask').value.length === 1;
  },
  'web.self': function () {
    // eslint-disable-next-line no-restricted-globals -- safe
    if (self !== GLOBAL) return false;
    var descriptor = Object.getOwnPropertyDescriptor(GLOBAL, 'self');
    return descriptor.get && descriptor.enumerable;
  },
  'web.set-immediate': IMMEDIATE,
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
  'web.url.constructor': URL_AND_URL_SEARCH_PARAMS_SUPPORT,
  'web.url.can-parse': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    try {
      URL.canParse();
    } catch (error) {
      return URL.canParse.length === 1;
    }
  }],
  'web.url.parse': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    return URL.parse;
  }],
  'web.url.to-json': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    return URL.prototype.toJSON;
  }],
  'web.url-search-params.constructor': URL_AND_URL_SEARCH_PARAMS_SUPPORT,
  'web.url-search-params.delete': [URL_AND_URL_SEARCH_PARAMS_SUPPORT, function () {
    var params = new URLSearchParams('a=1&a=2&b=3');
    params.delete('a', 1);
    // `undefined` case is a Chromium 117 bug
    // https://bugs.chromium.org/p/v8/issues/detail?id=14222
    params.delete('b', undefined);
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
  }],
};
