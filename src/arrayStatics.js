/**
 * Array static methods
 * http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
 * JavaScript 1.6
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_and_String_generics
 * Alternatives:
 * https://github.com/plusdude/array-generics
 * http://mootools.net/docs/core/Core/Core#Type:generics
 */
extendBuiltInObject(Array, reduceTo.call(
  // IE... getOwnPropertyNames($Array),
  array(
    // ES3:
    // http://www.2ality.com/2012/02/concat-not-generic.html
    'join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    'indexOf,lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'fill,find,findIndex,' +
    // Core.js:
    'at,pluck,reduceTo,merge'
  ),
  function(key){
    if(key in $Array)this[key] = unbind($Array[key]);
  }
));