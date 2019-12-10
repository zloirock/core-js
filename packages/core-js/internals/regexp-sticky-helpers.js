'use strict';

var fails = require('./fails');
var speciesConstructor = require('../internals/species-constructor');

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

exports.UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

exports.BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

exports.createStickyRegExp = function (re, otherFlags) {
  var C = speciesConstructor(re, RegExp);

  if (C !== RegExp) return new C(re, otherFlags + 'y');

  // y is either supported or polyfilled
  if (!exports.UNSUPPORTED_Y || RegExp.sham) {
    return new RegExp(re, otherFlags + 'y');
  }

  // If y hasn't been polyfilled and it isn't supported, assigning
  // to .sticky won't throw.
  // This usually happens in engines where descriptors aren't supported.
  var fakeRe = new RegExp(re, otherFlags);
  fakeRe.sticky = true;
  return fakeRe;
};
