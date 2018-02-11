// https://github.com/tc39/proposal-promise-finally
'use strict';
var path = require('../internals/path');
var global = require('core-js-internals/global');
var speciesConstructor = require('core-js-internals/species-constructor');
var promiseResolve = require('../internals/promise-resolve');

require('../internals/export')({ target: 'Promise', proto: true, real: true }, { 'finally': function (onFinally) {
  var C = speciesConstructor(this, typeof path.Promise == 'function' ? path.Promise : global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });
