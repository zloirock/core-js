'use strict';
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var DESCRIPTORS = require('../internals/descriptors');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');

// an invalid URL that the native constructor does not reject
var accepts = function (input) {
  try {
    return !!new URL(input);
  } catch (error) { /* empty */ }
};

module.exports = !fails(function () {
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  var url = new URL('b?a=1&b=2&c=3', 'https://a');
  var params = url.searchParams;
  var params2 = new URLSearchParams('a=1&a=2&b=3');
  var result = '';
  url.pathname = 'c%20d';
  params.forEach(function (value, key) {
    params['delete']('b');
    result += key + value;
  });
  params2['delete']('a', 2);
  // `undefined` case is a Chromium 117 bug
  // https://issues.chromium.org/issues/40278437
  params2['delete']('b', undefined);
  return (IS_PURE && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
    || (!params.size && (IS_PURE || !DESCRIPTORS))
    || !params.sort
    || url.href !== 'https://a/c%20d?a=1&c=3'
    || params.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !params[ITERATOR]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('https://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('https://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari 14.0-: https://bugs.webkit.org/show_bug.cgi?id=215734
    || new URL('https://x', undefined).host !== 'x'
    // forbidden host code points are accepted in Safari 15.3-, NodeJS 18.5- and Deno 1.25.1-
    || accepts('http://a\u0001b')
    // hosts ending in an invalid number are accepted there, in Chrome 94- and Firefox 118-
    || accepts('http://foo.09')
    // non-special URLs have no host in Chrome 129- and Firefox 132-
    // eslint-disable-next-line unicorn/relative-url-style -- required for testing
    || new URL('i', 'sc://ho/pa').host !== 'ho'
    // and accept forbidden host code points there
    || accepts('sc://a<b')
    // record keys that shadow `Object.prototype` are dropped in NodeJS 16.17 - 18.16 and 19
    || String(new URLSearchParams({ constructor: 1 })) !== 'constructor=1';
});
