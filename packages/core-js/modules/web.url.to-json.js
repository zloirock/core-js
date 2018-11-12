'use strict';
// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
require('../internals/export')({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return URL.prototype.toString.call(this);
  }
});
