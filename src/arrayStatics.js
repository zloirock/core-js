/**
 * Array static methods
 * http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
 */
extendBuiltInObject(Array, reduceTo.call(
  // IE...
  // getOwnPropertyNames($Array),
  splitComma(
    // ES3:
    'concat,join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    indexOf + ',lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'find,findIndex,' +
    // Core.js:
    'at,props,reduceTo,indexSame,merge,sum,avg,min,max,unique,cross'
  ),
  function(key){
    if(key in $Array)this[key] = $unbind($Array[key])
  }
));