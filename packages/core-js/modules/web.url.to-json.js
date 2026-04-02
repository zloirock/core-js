'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toString = URL.prototype.toString;

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return call(toString, this);
  }
});
