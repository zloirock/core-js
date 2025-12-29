// no types: because of a conflict with lib.dom.d.ts
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');

// @dependency: web.url-search-params.constructor
var URLSearchParamsPrototype = URLSearchParams.prototype;
var forEach = uncurryThis(URLSearchParamsPrototype.forEach);

// `URLSearchParams.prototype.size` getter
// https://github.com/whatwg/url/pull/734
if (!('size' in URLSearchParamsPrototype)) {
  defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
    get: function size() {
      var count = 0;
      forEach(this, function () { count++; });
      return count;
    },
    configurable: true,
    enumerable: true,
  });
}
