// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyDescriptor(object, key){
  if(key in object)do{
    if(has(object, key))return getOwnPropertyDescriptor(object, key)
  }while(object = getPrototypeOf(object))
}
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result = {}
    , names  = getOwnPropertyNames(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[key = names[i++]] = getOwnPropertyDescriptor(object, key);
  return result
}
function invert(object){
  var result = {}
    , key;
  for(key in object)has(object, key) && (result[object[key]] = key);
  return result;
}
function isObject(it){
  return it === Object(it)
}
function isString(it){
  return $toString(it) == '[object String]'
}
function isFunction(it){
  return $toString(it) == '[object Function]'
}
function isDate(it){
  return $toString(it) == '[object Date]'
}
// IE fix in es5.js
function isArguments(it){
  return $toString(it) == '[object Arguments]'
}
var assign = Object.assign || function(target, source){
      var props  = keys(source)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)target[key = props[i++]] = source[key];
      return target
    }
  , mixin = Object.mixin || function(target, source){
      return defineProperties(target, getOwnPropertyDescriptors(source))
    }
  /**
   * http://es5.javascript.ru/x9.html#x9.12
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is
   */ 
  , same = Object.is || function(x,y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !==y
    };