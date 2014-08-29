/**
 * Array static methods
 * Strawman: http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * JavaScript 1.6: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_and_String_generics
 */
$define(STATIC, ARRAY, turn.call(
  // IE... getNames(ArrayProto),
  array(
    // ES3:
    'concat,join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    'indexOf,lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'fill,find,findIndex,keys,values,entries,' +
    // Core:
    'get,set,delete,contains,clone,turn'
  ),
  function(memo, key){
    if(key in ArrayProto)memo[key] = ctx(call, ArrayProto[key]);
  }, {}
));