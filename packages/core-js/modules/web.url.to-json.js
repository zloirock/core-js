// @types: web/url-to-json
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');

// @dependency: web.url.constructor
var toString = uncurryThis(URL.prototype.toString);

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return toString(this);
  },
});
