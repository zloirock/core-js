/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(5);
__webpack_require__(6);
__webpack_require__(7);
__webpack_require__(8);
__webpack_require__(9);
__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(14);
__webpack_require__(15);
__webpack_require__(16);
__webpack_require__(17);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = Function('return this')();
global.global = global;
global.DESCRIPTORS = !!function () {
  try {
    return 7 === Object.defineProperty({}, 'a', {
      get: function () {
        return 7;
      }
    }).a;
  } catch (e) { /* empty */ }
}();
global.STRICT = !function () { return this; }();
global.PROTO = !!Object.setPrototypeOf || '__proto__' in Object.prototype;
global.NATIVE = false;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

QUnit.assert.arity = function (fn, length, message) {
  this.pushResult({
    result: fn.length === length,
    actual: fn.length,
    expected: length,
    message: message || 'arity is ' + length
  });
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

function same(a, b) {
  return a === b ? a !== 0 || 1 / a === 1 / b : a != a && b != b;
}

QUnit.assert.arrayEqual = function (a, b, message) {
  var result = true;
  if (a.length !== b.length) {
    result = false;
  } else {
    for (var i = 0, length = a.length; i < length; ++i) {
      if (!same(a[i], b[i])) {
        result = false;
        break;
      }
    }
  }
  this.pushResult({
    result: result,
    actual: [].slice.call(a),
    expected: [].slice.call(b),
    message: message
  });
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var ArrayBuffer = global.core ? core.ArrayBuffer : global.ArrayBuffer;
var DataView = global.core ? core.DataView : global.DataView;
global.arrayToBuffer = function (it) {
  var buffer = new ArrayBuffer(it.length);
  var view = new DataView(buffer);
  for (var i = 0, length = it.length; i < length; ++i) {
    view.setUint8(i, it[i]);
  }
  return buffer;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var DataView = global.core ? core.DataView : global.DataView;
global.bufferToArray = function (it) {
  var results = [];
  var view = new DataView(it);
  for (var i = 0, byteLength = view.byteLength; i < byteLength; ++i) {
    results.push(view.getUint8(i));
  }
  return results;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {global.createIterable = function (elements, methods) {
  var iterable = {
    called: false,
    received: false
  };
  iterable[global.core ? core.Symbol.iterator : global.Symbol && Symbol.iterator] = function () {
    iterable.received = true;
    var index = 0;
    var iterator = {
      next: function () {
        iterable.called = true;
        return {
          value: elements[index++],
          done: index > elements.length
        };
      }
    };
    if (methods) for (var key in methods) iterator[key] = methods[key];
    return iterator;
  };
  return iterable;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

QUnit.assert.epsilon = function (a, b, E, message) {
  this.pushResult({
    result: Math.abs(a - b) <= (E != null ? E : 1e-11),
    actual: a,
    expected: b,
    message: message
  });
};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

var toString = {}.toString;
QUnit.assert.isFunction = function (fn, message) {
  this.pushResult({
    result: typeof fn === 'function' || toString.call(fn).slice(8, -1) === 'Function',
    actual: false,
    expected: true,
    message: message || 'is function'
  });
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {QUnit.assert.isIterable = function (it, message) {
  this.pushResult({
    result: global.core && core.isIterable ? core.isIterable(it) : !!it[global.Symbol && Symbol.iterator],
    actual: false,
    expected: true,
    message: message || 'is iterable'
  });
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 11 */
/***/ (function(module, exports) {

QUnit.assert.isIterator = function (it, message) {
  this.pushResult({
    result: typeof it === 'object' && typeof it.next === 'function',
    actual: false,
    expected: true,
    message: message || 'is iterator'
  });
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {global.LITTLE_ENDIAN = function () {
  try {
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  } catch (e) {
    return true;
  }
}();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

QUnit.assert.looksNative = function (fn, message) {
  this.pushResult({
    result: /native code/.test(Function.prototype.toString.call(fn)),
    actual: false,
    expected: true,
    message: message || 'looks native'
  });
};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

QUnit.assert.name = function (fn, name, message) {
  this.pushResult({
    result: fn.name === name,
    actual: fn.name,
    expected: name,
    message: message || "name is '" + name + "'"
  });
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {global.nativeSubclass = function () {
  try {
    return Function("'use strict';class O extends Object {};return new O instanceof O;")()
      && Function('F', "'use strict';return class extends F {};");
  } catch (e) { /* empty */ }
}();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 16 */
/***/ (function(module, exports) {

var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
QUnit.assert.nonEnumerable = function (O, key, message) {
  if (DESCRIPTORS) this.pushResult({
    result: !propertyIsEnumerable.call(O, key),
    actual: false,
    expected: true,
    message: message || (typeof key === 'symbol' ? 'method' : key) + ' is non-enumerable'
  });
};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

QUnit.assert.same = function (a, b, message) {
  this.pushResult({
    result: a === b ? a !== 0 || 1 / a === 1 / b : a != a && b != b,
    actual: a,
    expected: b,
    message: message
  });
};


/***/ })
/******/ ]);