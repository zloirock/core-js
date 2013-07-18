function iz(foo/*?*/,wtf){
  switch(wtf&&typeof wtf){
    case undefined:return foo!=undefined;                                       // only 1 arg        => foo != null
    case'function':return isInstance.apply(undefined,arguments);                // 2 arg is function => iz.InstanceOf
    case'object':return isPrototypeOf(wtf,foo);                                 // 2 arg is object   => iz.PrototypeOf
    case'string':                                                               // 2 arg is string   =>
      var chr=wtf.charAt(0);                                                    //   1 char in lowercase => iz.TypeOf
      return(chr==chr.toUpperCase()?isClass:isType).apply(undefined,arguments)  //   1 char in uppercase => iz.ClassOf
  }
}
function isType(foo/*,args...*/){
  var i=1,length=arguments.length,
      type=typeof foo;
  while(length > i)if(type==arguments[i++])return true;
  return 2 > length ? type : false
}
function isInstance(foo/*,args...*/){
  var i=1,length=arguments.length;
  while(length > i)if(foo instanceof arguments[i++])return true;
  return false
}
// Object internal [[Class]]
function isClass(foo/*,args...*/){
  var i=1,length=arguments.length,
      type=foo===null?'Null':foo===undefined?'Undefined':toString(foo).slice(8,-1);
  while(length > i)if(type==arguments[i++])return true;
  return 2 > length ? type : false
}
function isPrimitive(foo){
  return foo!==Object(foo)
}
function isFunction(foo){
  return toString(foo)=='[object Function]'
}
function isString(foo){
  return toString(foo)=='[object String]'
}
function isRegExp(foo){
  return toString(foo)=='[object RegExp]'
}
// IE fix in shim
function isArguments(foo){
  return toString(foo)=='[object Arguments]'
}
// Native function?
function isNative(foo){
  return /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/.test(foo)
}
function isMap(foo){
  return toString(foo)=='[object Map]'
}
function isSet(foo){
  return toSet(foo)=='[object Set]'
}
var isObject = Object.isObject || function(foo){
      return foo===Object(foo)
    },
    izNaN = Number.isNaN || function(foo){
      return typeof foo=='number'&&foo!==foo
    },
    izFinite = Number.isFinite || function(foo){
      return typeof foo=='number'&&isFinite(foo)
    },
    isInt = Number.isInteger || function(foo){
      return izFinite(foo)&&foo>-0x20000000000000&&foo<0x20000000000000&&floor(foo)===foo
    },
    isArray = Array.isArray || function(foo){
      return toString(foo)=='[object Array]'
    },
    // http://es5.javascript.ru/x9.html#x9.12
    same = Object.is || function(x,y){
      return x===y?x!==0||1/x===1/y:x!==x&&y!==y
    };