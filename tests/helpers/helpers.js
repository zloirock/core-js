import { GLOBAL } from './constants';

var Promise = GLOBAL.core ? core.Promise : GLOBAL.Promise;
var ArrayBuffer = GLOBAL.core ? core.ArrayBuffer : GLOBAL.ArrayBuffer;
var DataView = GLOBAL.core ? core.DataView : GLOBAL.DataView;

export function arrayToBuffer(it) {
  var buffer = new ArrayBuffer(it.length);
  var view = new DataView(buffer);
  for (var i = 0, length = it.length; i < length; ++i) {
    view.setUint8(i, it[i]);
  }
  return buffer;
}

export function bufferToArray(it) {
  var results = [];
  var view = new DataView(it);
  for (var i = 0, byteLength = view.byteLength; i < byteLength; ++i) {
    results.push(view.getUint8(i));
  }
  return results;
}

export function createIterable(elements, methods) {
  var iterable = {
    called: false,
    received: false
  };
  iterable[GLOBAL.core ? core.Symbol.iterator : GLOBAL.Symbol && Symbol.iterator] = function () {
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
}

export function includes(target, element) {
  for (var i = 0, length = target.length; i < length; ++i) if (target[i] === element) return true;
  return false;
}

export function is(a, b) {
  return a === b ? a !== 0 || 1 / a === 1 / b : a != a && b != b;
}

export var nativeSubclass = function () {
  try {
    return Function("'use strict';class O extends Object {};return new O instanceof O;")()
      && Function('F', "'use strict';return class extends F {};");
  } catch (e) { /* empty */ }
}();

export function timeLimitedPromise(time, fn) {
  return Promise.race([
    new Promise(fn), new Promise(function (resolve, reject) {
      setTimeout(reject, time);
    })
  ]);
}
