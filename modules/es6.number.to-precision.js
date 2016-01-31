'use strict';
var $export      = require('./_export')
  , $toPrecision = 1..toPrecision;

$export($export.P + $export.F * require('./_fails')(function(){
  return $toPrecision.call(1, undefined) !== '1';
}), 'Number', {
  toPrecision: function toPrecision(precision){
    return precision === undefined ? $toPrecision.call(this) : $toPrecision.call(this, precision); 
  }
});