'use strict';
var anObject    = require('./_an-object')
  , $flags      = require('./_flags')
  , DESCRIPTORS = require('./_descriptors');
require('./es6.regexp.flags');
// 21.2.5.14 RegExp.prototype.toString()
if(require('./_fails')(function(){
  return /./.toString.call({source: 'a', flags: 'b'}) != '/a/b'
}))require('./_redefine')(RegExp.prototype, 'toString', function toString(){
  var R = anObject(this);
  return '/'.concat(R.source, '/',
    'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
}, true);