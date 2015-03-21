'use strict';
var $       = require('./$')
  , ITER    = require('./$.uid').safe('iter')
  , $iter   = require('./$.iter')
  , step    = $iter.step
  , NUMBER  = 'Number';
function NumberIterator(iterated){
  $.set(this, ITER, {l: $.toLength(iterated), i: 0});
}
$iter.create(NumberIterator, NUMBER, function(){
  var iter = this[ITER]
    , i    = iter.i++;
  return i < iter.l ? step(0, i) : step(1);
});
$iter.define(Number, NUMBER, function(){
  return new NumberIterator(this);
});