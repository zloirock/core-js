'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var fails = require('../internals/fails');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var toString = require('../internals/to-string');
var USE_NATIVE_URL = require('../internals/url-constructor-detection');

var URL = getBuiltIn('URL');
var nativeParse = getBuiltIn('URL', 'parse');

// Deno 2.9.8 still uses `new this(...)` and throws when `parse` is detached.
// https://github.com/denoland/deno/issues/37104
var FORCED = !USE_NATIVE_URL || fails(function () {
  return nativeParse('https://example.com/').href !== 'https://example.com/';
});

// `URL.parse` method
// https://url.spec.whatwg.org/#dom-url-parse
$({ target: 'URL', stat: true, enumerable: true, forced: FORCED }, {
  parse: function parse(url) {
    var length = validateArgumentsLength(arguments.length, 1);
    var urlString = toString(url);
    var base = length < 2 || arguments[1] === undefined ? undefined : toString(arguments[1]);
    try {
      return new URL(urlString, base);
    } catch (error) {
      return null;
    }
  }
});
