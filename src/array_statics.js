/**
 * Strawman: http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * JavaScript 1.6: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
 */
!function(){
  function setArrayStatics(keys, length){
    $define(STATIC, ARRAY, turn.call(
      array(keys),
      function(memo, key){
        if(key in ArrayProto)memo[key] = ctx(call, ArrayProto[key], length);
      }, {}
    ));
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('get,delete', 2);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,contains,set', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,fill,turn');
}();