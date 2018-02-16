'use strict';
// https://tc39.github.io/proposal-string-matchall/
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toLength = require('../internals/to-length');
var isRegExp = require('../internals/is-regexp');
var getFlags = require('../internals/regexp-flags');
var hide = require('../internals/hide');
var speciesConstructor = require('../internals/species-constructor');
var at = require('../internals/string-at')(true);
var MATCH_ALL = require('../internals/well-known-symbol')('matchAll');
var IS_PURE = require('../internals/is-pure');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + 'Iterator';
var InternalStateModule = require('../internals/internal-state');
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype = RegExp.prototype;
var regExpBuiltinExec = RegExpPrototype.exec;

var matchAllIterator = function (R, O) {
  var S = String(O);
  var C = speciesConstructor(R, RegExp);
  var flags = 'flags' in RegExpPrototype ? String(R.flags) : getFlags.call(R);
  var matcher = new C(C === RegExp ? R.source : R, flags);
  var global = !!matcher.global;
  var fullUnicode = !!matcher.unicode;
  matcher.lastIndex = toLength(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, global, fullUnicode);
};

var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

var regExpExec = function (R, S) {
  var exec = R.exec;
  var result;
  if (typeof exec == 'function') {
    result = exec.call(R, S);
    if (typeof result != 'object') throw TypeError('Incorrect exec result!');
    return result;
  } return regExpBuiltinExec.call(R, S);
};

// eslint-disable-next-line max-len
var $RegExpStringIterator = createIteratorConstructor(function RegExpStringIterator(regexp, string, global, fullUnicode) {
  setInternalState(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState(this);
  if (state.done) return { value: null, done: true };
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec(R, S);
  if (match === null) return { value: null, done: state.done = true };
  if (state.global) {
    if (String(match[0]) == '') R.lastIndex = advanceStringIndex(S, toLength(R.lastIndex), state.unicode);
    return { value: match, done: false };
  }
  state.done = true;
  return { value: match, done: false };
});

require('../internals/export')({ target: 'String', proto: true }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible(this);
    var R = isRegExp(regexp) ? regexp : new RegExp(regexp, 'g');
    var matcher = R[MATCH_ALL];
    return matcher === undefined ? matchAllIterator(R, O) : matcher.call(R, O);
  }
});

IS_PURE || MATCH_ALL in RegExpPrototype || hide(RegExpPrototype, MATCH_ALL, function (string) {
  return matchAllIterator(this, string);
});
