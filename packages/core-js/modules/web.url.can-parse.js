var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var toString = require('../internals/to-string');

var URL = getBuiltIn('URL');

// `URL.canParse` method
// https://url.spec.whatwg.org/#dom-url-canparse
$({ target: 'URL', stat: true }, {
  canParse: function canParse(url) {
    var length = validateArgumentsLength(arguments.length, 1);
    var urlString = toString(url);
    var base = length < 2 || arguments[1] === undefined ? undefined : toString(arguments[1]);
    try {
      return !!new URL(urlString, base);
    } catch (error) {
      return false;
    }
  }
});
