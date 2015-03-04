// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , statics = {};
function setArrayStatics(keys, length){
  $.each.call($.a(keys), function(key){
    if(key in [])statics[key] = $.ctx(Function.call, [][key], length);
  });
}
setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);