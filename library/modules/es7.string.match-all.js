'use strict';
// https://tc39.github.io/String.prototype.matchAll/
require('./es6.regexp.flags');
var $export  = require('./_export')
  , defined  = require('./_defined')
  , toLength = require('./_to-length')
  , isRegExp = require('./_is-regexp')
  , FLAGS    = require('./_descriptors') && !require('./_library')
  , getFlags = require('./_flags');

var $RegExpStringIterator = function(regexp, string){
  this._r = regexp;
  this._s = string;
};

require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next(){
  var match = this._r.exec(this._s);
  return {value: match, done: match === null};
});

$export($export.P, 'String', {
  matchAll: function matchAll(regexp){
    defined(this);
    if(!isRegExp(regexp))throw TypeError(regexp + ' is not a regexp!');
    var S     = String(this)
      , flags = FLAGS ? regexp.flags : getFlags(regexp)
      , rx    = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});