'use strict';
// https://tc39.github.io/String.prototype.matchAll/
var defined = require('./_defined');
var toLength = require('./_to-length');
var isRegExp = require('./_is-regexp');
var getFlags = require('./_flags');
var $ = require('./_state');
var RegExpProto = RegExp.prototype;

var $RegExpStringIterator = function (regexp, string) {
  $(this, {
    regexp: regexp,
    string: string
  });
};

require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next() {
  var state = $(this);
  var match = state.regexp.exec(state.string);
  return { value: match, done: match === null };
});

require('./_export')({ target: 'String', proto: true }, {
  matchAll: function matchAll(regexp) {
    defined(this);
    if (!isRegExp(regexp)) throw TypeError(regexp + ' is not a regexp!');
    var S = String(this);
    var flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp);
    var rx = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});
