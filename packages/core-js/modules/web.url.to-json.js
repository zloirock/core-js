'use strict';
// TODO: Remove this module from `core-js@4`: every engine that passes the `URL` constructor detection
// has the native method, and the polyfill of the constructor defines its own
var $ = require('../internals/export');
var call = require('../internals/function-call');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');

var toString = getBuiltInPrototypeMethod('URL', 'toString');

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return call(toString, this);
  }
});
