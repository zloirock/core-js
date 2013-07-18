var prototype     = 'prototype',
    // Aliases global objects prototypes and properties
    $Function     = Function[prototype],
    $Object       = Object[prototype],
    $Array        = Array[prototype],
    $Number       = Number[prototype],
    $String       = String[prototype],
    slice         = $Array.slice,
    pop           = $Array.pop,
    push          = $Array.push,
    unshift       = $Array.unshift,
    join          = $Array.join,
    call          = $Function.call,
    apply         = $Function.apply,
    replace       = $String.replace,
    min           = Math.min,
    max           = Math.max,
    floor         = Math.floor,
    ceil          = Math.ceil,
    random        = Math.random,
    sqrt          = Math.sqrt,
    ln            = Math.log,
    exp           = Math.exp,
    Empty         = Function(),
    protoInObject = (new Empty).__proto__==Empty[prototype],
    // http://es5.github.io/#x9.4
    toInt = Number.toInteger || function(val){
      val=+val;
      return val!=val?0:val!==0&&val!==Infinity&&val!==-Infinity?(val>0?floor:ceil)(val):val
    },
    // How to get the context for calling the methods of the Array.prototype
    // Dummy, polyfill for not array-like strings for old ie in es5shim.js
    arrayLikeSelf = Object,
    toArray = Array.from || function(arrayLike){
      return slice.call(arrayLike)
    },
    // Unbind Object.prototype methods
    own,toString,isPrototypeOf,isEnum;
!function(hasOwnProperty,_toString,_isPrototypeOf,propertyIsEnumerable){
  own = function(object,key){
    return hasOwnProperty.call(object,key)
  };
  toString = function(object){
    return _toString.call(object)
  };
  isPrototypeOf = function(object,proto){
    return _isPrototypeOf.call(object,proto)
  };
  isEnum = function(object,key){
    return propertyIsEnumerable.call(object,key)
  }
}($Object.hasOwnProperty,$Object.toString,$Object.isPrototypeOf,$Object.propertyIsEnumerable);
function extendBuiltInObject(object,source/*?*/,forced){
  for(var key in source)own(source,key)&&(forced||!own(object,key)||!isNative(object[key]))&&delete object[key]&&
    Object.defineProperty(object,key,{value:source[key],writable:true});
  return object
}
function tryDeleteGlobal(key){
  try{delete global[key]}catch(e){}
}
function createTestCallback(foo){
  switch(isClass(foo)){
    case'Function':return foo;
    case'RegExp':return function(val){return foo.test(val)}
  }
  return function(val){return val===foo}
}