// Core.js 0.0.1
// http://core.zloirock.ru
// © 2013 Denis Pushkarev
// Available under MIT license
;!function(global,Function,Object,Array,String,Number,RegExp,Date,Error,TypeError,Math,undefined){

// module init
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
// module iz
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

// module resume
var create                   = Object.create,
    defineProperty           = Object.defineProperty,
    defineProperties         = Object.defineProperties,
    getPrototypeOf           = Object.getPrototypeOf,
    keys                     = Object.keys,
    getOwnPropertyNames      = Object.getOwnPropertyNames,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    some                     = $Array.some,
    reduce                   = $Array.reduce,
    filter                   = $Array.filter,
    forEach                  = $Array.forEach,
    map                      = $Array.map;
// module function
// partiall apply
function part(/*args...*/){
  var fn=this,
      i=0,length1=arguments.length,
      args1=Array(length);
  while(length1 > i)args1[i]=arguments[i++];
  return function(/*args...*/){
    var args2=args1.slice(),
        length2=arguments.length,i=0;
    while(length2 > i)args2[length1+i]=arguments[i++];
    return apply.call(fn,this,args2)
  }
}
// unbind method from context
function unbind(){
  return call.bind(this)
}
// add `this` as first argument
// Number.prototype.pow=Math.pow.methodize();
// 16..pow(2); //=>256
function methodize(){
  var fn=this;
  return function(/*args...*/){
    var i=0,length=arguments.length,
        args=Array(length+1);
    args[0]=this;
    while(length > i)args[i+1]=arguments[i++];
    return apply.call(fn,this,args)
  }
}
// module objectDesc
// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyNames(object){
  var i,length,names,key,
      result=getOwnPropertyNames(object);
  while(object=getPrototypeOf(object)){
    i=0,names=getOwnPropertyNames(object),length=names.length;
    while(length > i)~result.indexOf(key=names[i++])||result.push(key)
  }
  return result
}
// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyDescriptor(object,key){
  if(key in object)do{
    if(own(object,key))return getOwnPropertyDescriptor(object,key)
  }while(object=getPrototypeOf(object))
}
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result={},
      names=getOwnPropertyNames(object),
      key,i=0,length=names.length;
  while(length > i)result[key=names[i++]]=getOwnPropertyDescriptor(object,key);
  return result
}
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getPropertyDescriptors(object){
  var i,length,names,key,
      result=getOwnPropertyDescriptors(object);
  while(object=getPrototypeOf(object)){
    names=getOwnPropertyNames(object);
    i=0;length=names.length;
    while(length > i)if(!own(result,key=names[i++]))result[key]=getOwnPropertyDescriptor(object,key);
  }
  return result
}
// module object
function simpleDef(target,source,key/*?*/,deep,stackObj,stackCln){
  target[key]=deep
    ?merge(clone(source[key],1,0,stackObj,stackCln),target[key],1,1,0,stackObj,stackCln)
    :source[key]
}
function descDef(target,source,key/*?*/,deep,stackObj,stackCln){
  var prop,tmp=getOwnPropertyDescriptor(target,key)||$Object;
  if(!(tmp.configurable==false||tmp.get||tmp.set)&&delete target[key]){
    prop=getOwnPropertyDescriptor(source,key);
    if(deep&&!prop.get&&!prop.set)prop.value=
      merge(clone(prop.value,1,1,stackObj,stackCln),tmp.value,1,1,1,stackObj,stackCln);
    defineProperty(target,key,prop)
  }
}
function merge(target,source/*?*/,deep,reverse,desc,stackObj,stackCln){
  if(isObject(target)&&isObject(source)){
    var fn=desc?descDef:simpleDef,
        isComp=isFunction(reverse),
        names=(desc?getOwnPropertyNames:keys)(source),
        i=0,length=names.length,key;
    while(length > i){
      key=names[i++];
      if(own(target,key)&&(isComp?reverse(target[key],source[key]):reverse)){   // if key in target && reverse merge
        if(deep)merge(target[key],source[key],1,reverse,desc,stackObj,stackCln) // if not deep - skip
      }
      else fn(target,source,key,deep,stackObj,stackCln)
    }
  }
  return target
}
function clone(object,deep/*?*/,desc,stackObj,stackCln){
  if(isPrimitive(object))return object;
  stackObj||(stackObj=[]);
  stackCln||(stackCln=[]);
  var already=stackObj.indexOf(object),F=object.constructor,result;
  if(~already)return stackCln[already];
  switch(isClass(object)){
    case'Function':
      return object;
    case'Array':case'Arguments':
      var i=0,length=object.length|0,
          fn=desc?descDef:simpleDef;
      result=Array(length);
      while(length > i)fn(result,object,i++,deep);
      stackObj.push(object);
      stackCln.push(result);
      return result;
    case'String':
      return new F(object);
    case'RegExp':
      result=RegExp(object.source,getRegExpFlags(object));
      break;
    case'Date':case'Boolean':case'Number':
      result=new F(object.valueOf());
      break;
    default:result=create(getPrototypeOf(object))
  }
  stackObj.push(object);
  stackCln.push(result);
  return merge(result,object,deep,0,desc,stackObj,stackCln)
}
function createObjectIterator(keys){
  return function(object,fn/*?*/,that){
    var O=arrayLikeSelf(object),
        props=keys(O),
        key,i=0,length=props.length;
    while(length > i)fn.call(that,O[key=props[i++]],key,object);
    return object
  }
}
var forOwnKeys=createObjectIterator(keys),
    forOwnNames=createObjectIterator(getOwnPropertyNames),
    assign = Object.assign || function(target,source){
      var props=keys(source),
          key,i=0,length=props.length;
      while(length > i)target[key=props[i++]]=source[key];
      return target
    },
    mixin = Object.mixin || function(target,source){
      return defineProperties(target,getOwnPropertyDescriptors(source))
    }
// module array
function slice1(arrayLike){
  return slice.call(arrayLike,1)
}
function indexSame(arrayLike,val){
  for(var i=0,length=arrayLike.length;i<length;i++)if(same(arrayLike[i],val))return i;
  return -1
}
function props(key){
  key+='';
  var that=arrayLikeSelf(this),
      length=that.length,i=0,
      result=Array(length);
  for(;i<length;i++)if(i in that)result[i]=that[i][key];
  return result
}
function unique(/*?*/mapArg){
  var result=[],
      that=createMap(this,mapArg),
      i=0,length=that.length|0,value;
  while(length > i)~indexSame(result,value=that[i++])||result.push(value);
  return result
}
// http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
function fill(value/*?*/,start,count){
  var end,length=this.length|0;
  if((start|=0)<0&&(start=length+start)<0)return this;
  end=count==undefined?length:start+count|0;
  while(start<end)this[start++]=value;
  return this
}
function createMap(that,foo){
  switch(isClass(foo)){
    case'Function':return map.call(that,foo);
    case'String':case'Number':return props.call(that,foo)
  }
  return arrayLikeSelf(that)
}
// module number
function numberFormat(that/*?*/,afterDot,leadZero,separator,thousandsSeparator){
  var del=Math.pow(10,afterDot|0),
      num=toInt(that*del)/del,
      abs=Math.abs(num),
      result=(num<0?'-':'')+repeat.call('0',(leadZero|0)-String(toInt(abs)).length)+abs;
  if(separator!=undefined)result=result.replace('.',separator);
  if(thousandsSeparator!=undefined)result=result.replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1'+thousandsSeparator);
  return result
}
// module string
var trimWS='[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]',
    LTrim=new RegExp('^'+trimWS+trimWS+'*'),
    RTrim=new RegExp(trimWS+trimWS+'*$'),
    repeat=$String.repeat||function(count){
      return fill.call(Array(toInt(count)),this).join('')
    };
// module regexp
function getRegExpFlags(reg){
  return reg.toString().match(/[^\/]*$/)[0]
}
// module es6shim
extendBuiltInObject(Object,{
  // 15.2.3.16 Object.is ( value1, value2 )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.2.3.16
  // http://wiki.ecmascript.org/doku.php?id=harmony:egal
  is:same,
  // 15.2.3.17 Object.assign ( target, source )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.2.3.17
  assign:assign,
  // 15.2.3.18 Object.mixin ( target, source )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.2.3.18
  mixin:mixin,
  // 15.2.3.2(???) Object.setPrototypeOf ( O, proto )
  // work only if browser support __proto__
  setPrototypeOf:protoInObject
    ?function(O,proto){
      if(isPrimitive(O)||!isType(proto,'object','function')){
        throw TypeError('Can\' set '+proto+' as prototype of '+O)
      }
      O.__proto__=proto;
      return O
    }
    :function(){
      throw Error('Can\'t shim setPrototypeOf')
    }
});
extendBuiltInObject(Array,{
  // ES6 15.4.3.4 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.4.3.4
  // http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
  from:function(arrayLike/*?*/,mapfn,thisArg){
    var O=arrayLikeSelf(arrayLike),
        i=0,length=toInt(O.length),
        result=new (isFunction(this)?this:Array)(length);
    // here must be `definePropery`, but it's very slow for simple toArray
    if(mapfn)for(;i<length;i++)i in O&&(result[i]=mapfn.call(thisArg,O[i],i,O));
    else for(;i<length;i++)i in O&&(result[i]=O[i]);
    return result
  },
  // ES6 15.4.3.3 Array.of
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.4.3.3
  // http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
  of:function(/*args...*/){
    var i=0,length=arguments.length,
        result=new (isFunction(this)?this:Array)(length);
    while(i<length)result[i]=arguments[i++];
    return result
  }
});
extendBuiltInObject($Array,{
  // 15.4.3.23 Array.prototype.find ( predicate , thisArg = undefined )
  find:function(predicate/*?*/,thisArg){
    var O=Object(this),
        self=arrayLikeSelf(O),
        val,i=0,length=toInt(self.length);
    for(;i<length;i++)if(i in self&&predicate.call(thisArg,val=self[i],i,O))return val
  },
  // 15.4.3.24 Array.prototype.findIndex ( predicate , thisArg = undefined )
  findIndex:function(predicate/*?*/,thisArg){
    var O=Object(this),
        self=arrayLikeSelf(O),
        i=0,length=toInt(self.length);
    for(;i<length;i++)if(i in self&&predicate.call(thisArg,self[i],i,O))return i;
    return -1
  }
});
/*
extendBuiltInObject(String,{
  fromCodePoint:function(){
    // TODO
    },
  raw:function(){
    // TODO
    }});
*/
extendBuiltInObject($String,{
  // 15.5.4.21	String.prototype.repeat (count)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.21
  // http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
  repeat:repeat,
  // 15.5.4.22	String.prototype.startsWith (searchString [, position ] )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.22
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
  startsWith:function(searchString/*?*/,position){
    searchString=''+searchString;
    position=min(max(position|0,0),this.length);
    return (''+this).slice(position,position+searchString.length)===searchString
  },
  // ES6 15.5.4.23 String.prototype.endsWith (searchString [, endPosition ] )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.23
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
  endsWith:function(searchString/*?*/,endPosition){
    var length=this.length;
    searchString=''+searchString;
    endPosition=min(max(endPosition===undefined?length:endPosition|0,0),length);
    return (''+this).slice(endPosition-searchString.length,endPosition)===searchString
  },
  // ES6 15.5.4.24 String.prototype.contains (searchString, position = 0 )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.24
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
  contains:function(searchString/*?*/,position){
    return !!~(''+this).indexOf(searchString,position)
  },
  // 15.5.4.25 String.prototype.codePointAt (pos)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.25
  codePointAt:function(/*?*/pos){
		var value=''+this,
        size=value.length;
    if((pos|=0)<0||pos>=size)return NaN;
		var first=value.charCodeAt(pos);
		if(first<0xD800||first>0xDBFF||pos+1==size)return first;
		var second=value.charCodeAt(pos+1);
		return(second<0xDC00||first>0xDFFF)?first:((first-0xD800)<<1024)+(second-0xDC00)+0x10000
  }
});
extendBuiltInObject(Number,{
  // 15.7.3.7 Number.EPSILON
  // http://wiki.ecmascript.org/doku.php?id=harmony:number_epsilon
  EPSILON:2.220446049250313e-16,
  // 15.7.3.8 Number.MAX_INTEGER
  // http://wiki.ecmascript.org/doku.php?id=harmony:number_max_integer
  MAX_INTEGER:0x20000000000000,
  // 15.7.3.9 Number.parseInt (string, radix)
  parseInt:parseInt,
  // 15.7.3.10 Number.parseFloat (string)
  parseFloat:parseFloat,
  // 15.7.3.11 Number.isNaN (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
  isNaN:izNaN,
  // 15.7.3.12 Number.isFinite (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
  isFinite:izFinite,
  // 15.7.3.13 Number.isInteger (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
  isInteger:isInt,
  // 15.7.3.14 Number.toInteger (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger
  toInteger:toInt
});
extendBuiltInObject($Number,{
  // 15.7.4.8	Number.prototype.clz ()
  clz:function(){
    var number=this>>>0;
    return number?32-number.toString(2).length:32
  }
});
extendBuiltInObject(Math,{
  // 15.8.2.19 Math.log10 (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.19
  log10:function(x){
    return ln(x)/Math.LN10
  },
  // 15.8.2.20 Math.log2 (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.20
  log2:function(x){
    return ln(x)/Math.LN2
  },
  // 15.8.2.21 Math.log1p (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.21
  log1p:function(x){
    return (x>-1.0e-8&&x<1.0e-8)?(x-x*x/2):ln(1+x)
  },
  // 15.8.2.22 Math.expm1 (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.22
  expm1:function(x){
		return same(x,-0)?-0:x>-1.0e-6&&x<1.0e-6?x+x*x/2:exp(x)-1
  },
  // 15.8.2.23 Math.cosh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.23
  cosh:function(x){
    return same(x,-Infinity)||x===0?x:x(exp(x)+exp(-x))/2
  },
  // 15.8.2.24 Math.sinh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.24
  sinh:function(x){
		return same(x,-Infinity)||x===0?x:(exp(x)-exp(-x))/2
  },
  // 15.8.2.25 Math.tanh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.25
  tanh:function(x){
		return same(x,Infinity)?1:same(x,-Infinity)?-1:x===0?x:(exp(x)-exp(-x))/(exp(x)+exp(-x))
  },
  // 15.8.2.26 Math.acosh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.26
  acosh:function(x){
    return ln(x+sqrt(x*x-1))
  },
  // 15.8.2.27	Math.asinh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.27
  asinh:function(x){
		return !izFinite(x)||x===0?x:ln(x+sqrt(x*x+1))
  },
  // 15.8.2.28 Math.atanh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.28
  atanh:function(x){
    return x===0?x:0.5*ln((1+x)/(1-x))
  },
  // 15.8.2.29 Math.hypot( value1 , value2, value3 = 0 )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.29
  hypot:function(x,y/*?*/,z){
    if(z===undefined)z=0;
    return izFinite(x)?izFinite(y)?izFinite(z)?sqrt(x*x+y*y+z*z):z:y:x
  },
  // 15.8.2.30 Math.trunc(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.30
  trunc:function(x){
    return x===0?x:!izFinite(x)?x:x|0
  },
  // 15.8.2.31 Math.sign(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.31
  sign:function(x){
    return x===0||izNaN(x)?x:x<0?-1:1
  },
  // 15.8.2.32 Math.cbrt(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.32
  cbrt:function(x){
		return x===0?x:x>0?exp(ln(x)/3):-exp(ln(-x)/3)
  },
  // 15.8.2.33 Math.imul(x, y)
  imul:function(x,y){
    var xh=(x>>>0x10)&0xffff,xl=x&0xffff,
        yh=(y>>>0x10)&0xffff,yl=y&0xffff;
		return xl*yl+(((xh*yl+xl*yh)<<0x10)>>>0)|0
  }
});
// module es6collections
if(!isNative(global.Map)||!['set','get','delete','clear','forEach'].every(own.bind(undefined,Map[prototype]))){
  tryDeleteGlobal('Map');
  global.Map=function(){
    if(!(this instanceof Map))return new Map;
    this.clear()
  }
  extendBuiltInObject(Map[prototype],{
    // 15.14.4.2 Map.prototype.clear ()
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.2
    clear:function(){
      defineProperties(this,{_keys:{value:[],writable:true},_values:{value:[],writable:true}});
      this.size=0
    },
    // 15.14.4.3 Map.prototype.delete ( key )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.3
    'delete':function(key){
      var keys=this._keys,
          values=this._values,
          index=indexSame(keys,key);
      if(~index){
        keys.splice(index,1);
        values.splice(index,1);
        this.size=values.length;
        return true
      }
      return false
    },
    // 15.14.4.4 Map.prototype.forEach ( callbackfn , thisArg = undefined )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.4
    forEach:function(callbackfn/*?*/,thisArg){
      var keys=this._keys,
          values=this._values,
          i=0,length=values.length;
      while(length > i)callbackfn.call(thisArg,values[i],keys[i++],this)
    },
    // 15.14.4.5 Map.prototype.get ( key )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.5
    get:function(key){
      return this._values[indexSame(this._keys,key)]
    },
    // 15.14.4.6 Map.prototype.has ( key )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.6
    has:function(key){
      return !!~indexSame(this._keys,key)
    },
    // 15.14.4.9 Map.prototype.set ( key , value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.14.4.9
    set:function(key,value){
      var keys=this._keys,
          values=this._values,
          index=indexSame(keys,key);
      if(!~index){
        keys.push(key);
        values.push(value);
        this.size=values.length
      }
      else values[index]=value;
      return this
    }
  });
  izMap=function(it){return it instanceof Map}
}
extendBuiltInObject(Map,{
  create:function(keys,values){
    var i=0,length=keys.length,
        m=new Map();
    while(length > i)m.set(keys[i],values[i++]);
    return m
  }
});
if(!isNative(global.Set)||!['add','delete','clear','has','forEach'].every(own.bind(undefined,Set[prototype]))){
  tryDeleteGlobal('Set');
  global.Set=function(){
    if(!(this instanceof Set))return new Set;
    this.clear()
  };
  extendBuiltInObject(Set[prototype],{
    // 15.16.4.2 Set.prototype.add (value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.2
    add:function(value){
      var values=this.SetData;
      if(!~indexComp(values,value)){
        values.push(value);
        this.size=values.length
      }
      return this
    },
    // 15.16.4.3 Set.prototype.clear ()
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.3
    clear:function(){
      defineProperty(this,'SetData',{value:[],writable:true});
      this.size=0
    },
    // 15.16.4.4 Set.prototype.delete ( value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.4
    'delete':function(value){
      var values=this.SetData,
          index=indexSame(values,value);
      if(~index){
        values.splice(index,1);
        this.size=values.length;
        return true
      }
      return false
    },
    // 15.16.4.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.6
    forEach:function(callbackfn/*?*/,thisArg){
      var i=0,length=values.length,val,
          values=this.SetData;
      while(length > i)callbackfn.call(thisArg,val=values[i++],val,this)
    },
    // 15.16.4.7 Set.prototype.has ( value )
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.16.4.7
    has:function(value){
      return !!~indexSame(this.SetData,value)
    }
  });
  izSet=function(it){return it instanceof Set}
}
extendBuiltInObject(Set,{
  from:function(arrayLike){
    var i=0,length=arrayLike.length,
        s=new Set();
    while(length > i)s.add(arrayLike[i++]);
    return s
  }
});
// module izExternal
function isUndefined(foo){
  return foo===undefined
}
function isNumber(foo){
  return toString(foo)=='[object Number]'
}
function isBool(foo){
  return foo===!!foo||toString(foo)=='[object Boolean]'
}
function isDate(foo){
  return toString(foo)=='[object Date]'
}
function isError(foo){
  return toString(foo)=='[object Error]'
}
function isNull(foo){
  return foo===null
}
function isArrayLike(foo){
  var type;
  return foo!=undefined&&((type=typeof foo)=='object'||type=='string')&&isUInt32(foo.length)
}
function isPlane(foo){
  return foo!=undefined&&toString(foo)=='[object Object]'&&(getPrototypeOf(foo)===null)
}
function isInt32(foo){
  return same(foo>>0,foo)
}
function isUInt32(foo){
  return same(foo>>>0,foo)
}
function isUInt16(foo){
  return same(foo>>>0,foo)&&65536>foo
}
function isEmpty(foo){
  if(!foo)return true;
  if(isClass(foo,'Array','String')||isArguments(foo))return !foo.length;// isArguments - ie shim
  for(var key in foo)if(own(foo,key))return false;
  return true
}
function isGetter(object,key){
  return (getPropertyDescriptor(object||$Object,key)||$Object).get||false
}
function isSetter(object,key){
  return (getPropertyDescriptor(object||$Object,key)||$Object).set||false
}
function isAccessor(object,key){
  return object=getPropertyDescriptor(object||$Object,key)||$Object,!!(object.get||object.set)
}
// Objects deep compare
function isEqual(a,b,StackA,StackB){
  if(same(a,b))return true;
  var i=0,length,keys,val,type=isClass(a);
  if(typeof a!='object'||type!=isClass(b)||getPrototypeOf(a)!=getPrototypeOf(b))return false;
  StackA=isArray(StackA)?StackA.concat([a]):[a];
  StackB=isArray(StackB)?StackB.concat([b]):[b];
  switch(type){
    case'Boolean':case'String':case'Number':return a.valueOf()==b.valueOf();
    case'RegExp':return a.toString()==b.toString();
    case'Error':return a.message==b.message;
    case'Array':case'Arguments':
      length=a.length;
      if(length!=b.length)return false;
      for(;i<length;i++)if(!(~StackA.indexOf(a[i])&&~StackB.indexOf(b[i]))&&!isEqual(a[i],b[i],StackA,StackB))return false;
      return true
  }
  keys=getOwnPropertyNames(a);
  length=keys.length;
  if(length!=getOwnPropertyNames(b).length)return false;
  while(length > i)if(!(~StackA.indexOf(a[val=keys[i++]])&&~StackB.indexOf(b[val]))&&!isEqual(a[val],b[val],StackA,StackB))return false
  return true
}
global.iz=extendBuiltInObject(iz,{
  TypeOf      : isType,        Type  : isType,
  ClassOf     : isClass,       Class : isClass,
  InstanceOf  : isInstance,    Inst  : isInstance,
  PrototypeOf : isPrototypeOf, Proto : isPrototypeOf,
  Object      : isObject,      Obj   : isObject,
  Primitive   : isPrimitive,   Prim  : isPrimitive,
  Undefined   : isUndefined,   Undef : isUndefined,
  Null        : isNull,
  Number      : isNumber,      Num   : isNumber,
  String      : isString,      Str   : isString,
  Boolean     : isBool,        Bool  : isBool,
  Array       : isArray,       Arr   : isArray,
  Function    : isFunction,    Fn    : isFunction,
  RegExp      : isRegExp,
  Date        : isDate,
  Error       : isError,
  Arguments   : isArguments,   Args  : isArguments,
  Set         : izSet,
  Map         : izMap,
  ArrayLike   : isArrayLike,
  Empty       : isEmpty,
  Native      : isNative,
  Plane       : isPlane,
  Own         : own,
  Enumerable  : isEnum,        Enum  : isEnum,
  NaN         : izNaN,
  Finite      : izFinite,
  Integer     : isInt,         Int   : isInt,
  Int32       : isInt32,
  UInt32      : isUInt32,
  UInt16      : isUInt16,
  Accessor    : isAccessor,
  Getter      : isGetter,
  Setter      : isSetter,
  Same        : same,
  Equal       : isEqual
});

// module functionExternal
function invoke(args){
  var that=create(this.prototype),
      result=this.apply(that,args);
  return isObject(result)?result:that
}
extendBuiltInObject($Function,{
  // method -> function
  unbind:unbind,
  // function -> method
  methodize:methodize,
  // partial apply
  part:part,
  partial:function(args/*?*/,that){
    var fn=this,
        argsPart=toArray(args),
        isThat=arguments.length>1;
    return function(/*args...*/){
      var args=argsPart.slice(),
          length=arguments.length,
          i,current=i=0;
      while(length > i){
        while(args[current]!==undefined)current++;
        args[current++]=arguments[i++]
      }
      return fn.apply(isThat?that:this,args)
    }
  },
  // http://www.wirfs-brock.com/allen/posts/166
  // http://habrahabr.ru/post/114737/
  only:function(numberArguments/*?*/,that){
    numberArguments|=0;
    var fn=this,isThat=arguments.length>1;
    return function(/*args...*/){
      var i=0,length=min(numberArguments,arguments.length),
          args=Array(length);
      while(length > i)args[i]=arguments[i++];
      return fn.apply(isThat?that:this,args)
    }
  },
  invoke:invoke,
  getInstance:function(){
    if(own(this,'getInstance'))return null;
    var instance=invoke.call(this,arguments);
    this.getInstance=function(){return instance};
    return instance
  },
  once:function(){
    var fn=this,wait=true,result;
    return function(/*args...*/){
      if(wait){
        wait=false;
        result=fn.apply(this,arguments)
        }
      return result
    }
  },
  // AOP
  error:function(cb/*<error,arguments>*/){
    var fn=this;
    return function(/*args...*/){
      var args=toArray(arguments);
      try{return fn.apply(this,args)}
      catch(e){return cb.call(this,e,args)}
    }
  },
  before:function(cb/*<arguments>*/){
    var fn=this;
    return function(/*args...*/){
      var args=toArray(arguments);
      cb.call(this,args);
      return fn.apply(this,args)
    }
  },
  after:function(cb/*<result,arguments>*/){
    var fn=this;
    return function(/*args...*/){
      var args=toArray(arguments),
          result=fn.apply(this,args),
          aft=cb.call(this,result,args);
      return aft===undefined?result:aft
    }
  },
  // deferred call
  timeout:function(del/*,args...*/){
    return part.call(
      clearTimeout,
      setTimeout(part.call(this,slice1(arguments)),del)
    )
  },
  interval:function(del/*,args...*/){
    return part.call(
      clearInterval,
      setInterval(part.call(this,slice1(arguments)),del)
    )
  },
  immediate:function(/*args...*/){
    return part.call(
      clearImmediate,
      setImmediate(part.call(this,toArray(arguments)))
    )
  },
  // get / set add helpers for coffee
  define:function(prop/*?*/,desc){
    (desc?defineProperty:defineProperties)(this[prototype],prop,desc);
    return this},
  $define:function(prop/*?*/,desc){
    return (desc?defineProperty:defineProperties)(this,prop,desc)
  }
});
// module objectExternal
function make(proto,props/*?*/,desc){
  return props?(desc?mixin:assign)(create(proto),props):create(proto)
}
extendBuiltInObject(Object,{
  // Alias for Object.getOwnPropertyNames
  names:getOwnPropertyNames,
  // Extended object api from harmony and strawman
  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  getPropertyDescriptor:getPropertyDescriptor,
  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  getOwnPropertyDescriptors:getOwnPropertyDescriptors,
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  getPropertyDescriptors:getPropertyDescriptors,
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  getPropertyNames:getPropertyNames,
  // Shugar for Object.create
  make:make,
  // Shugar for Object.make(null[,params,desc])
  plane:function(props/*?*/,desc){
    return make(null,props,desc)
  },
  clone:clone,
  merge:merge,
  // Shugar for Object.merge(targ,src,1,1)
  defaults:function(target,props){
    return merge(target,props,1,1)
  },
  values:function(object/*?*/,names){
    var props=(names||keys)(object),
        i=0,length=props.length,
        result=Array(length);
    while(length > i)result[i]=object[props[i++]];
    return result
  },
  toPrimitive:function(object){
    if(isPrimitive(object))return object;
    var result=object;
    if(isFunction(object.valueOf))result=object.valueOf();
    if(isObject(result)&&isFunction(object.toString))result=String(object);
    return isPrimitive(result)?result:toString(object)
  },
  lazyProperty:function(object,key,getter/*?*/,writable){
    return defineProperty(object,key,{
      configurable:true,enumerable:true,
      get:function(){
        return defineProperty(this,key,{
          configurable:true,
          enumerable:true,
          writable:true,
          value:getter.call(this)
        })[key]
      },
      set:function(val){
        if(writable)defineProperty(this,key,{
          configurable:true,
          enumerable:true,
          writable:true,
          value:val
        });
        return val
      }
    })
  },
  forOwnKeys:forOwnKeys,
  each:forOwnKeys,
  forKeys:function(object,fn/*?*/,that){
    var key,O=arrayLikeSelf(object);
    for(key in O)fn.call(that,O[key],key,object);
    return object
  },
  forOwnNames:forOwnNames,
  forNames:createObjectIterator(getPropertyNames),
  map:function(object,fn/*?*/,that,withProto,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length,
        result=withProto?create(getPrototypeOf(object)):{};
    while(length > i)result[key=props[i++]]=fn.call(that,O[key],key,object);
    return result
  },
  filter:function(object,fn/*?*/,that,withProto,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length,
        result=withProto?create(getPrototypeOf(object)):{};
    while(length > i)if(fn.call(that,O[key=props[i++]],key,object))result[key]=O[key];
    return result
  },
  every:function(object,fn/*?*/,that,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length;
    while(length > i)if(!fn.call(that,O[key=props[i++]],key,object))return false;
    return true
  },
  some:function(object,fn/*?*/,that,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length;
    while(length > i)if(fn.call(that,O[key=props[i++]],key,object))return true;
    return false
  },
  reduce:function(object,fn/*?*/,result,that,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length;
    while(length > i)result=fn.call(that,result,O[key=props[i++]],key,object);
    return result
  },
  indexOf:function(object,searchElement/*?*/,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length;
    while(length > i)if(O[key=props[i++]]===searchElement)return key
  },
  find:function(object,fn/*?*/,that,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length;
    while(length > i)if(fn.call(that,O[key=props[i++]],key,object))return key
  },
  findIndex:function(object,fn/*?*/,that,names){
    var O=arrayLikeSelf(object),
        props=(names||keys)(O),
        key,i=0,length=props.length;
    while(length > i)if(fn.call(that,O[key=props[i++]],key,object))return key
  },
  bind:function(object/*?*/,names,context){
    if(arguments.length<3)context=object;
    names=(isString(names)?[names]:names)||keys(object);
    var key,i=0,length=names.length|0;
    while(length > i)if(isFunction(object[key=names[i++]]))object[key]=object[key].bind(context);
    return object
  }
});
// Chaining
function $$Object(obj){
  this.result=obj
}
forOwnNames(Object,function(fn,key){
  if(isFunction(fn))$$Object[prototype][key]=function(){
    var args=[this.result];
    push.apply(args,arguments);
    return new $$Object(fn.apply(this,args))
  }
});
extendBuiltInObject(Object,{chain:function(obj){
  return new $$Object(obj)
}});
// module arrayExternal
function arraySum(/*?*/mapArg){
  var result=0,
      that=createMap(this,mapArg),
      i=0,l=that.length|0;
  for(;i<l;i++)if(i in that)result+=+that[i];
  return result
}
extendBuiltInObject($Array,{
  each:function(/*callbackfn,thisArg*/){
    forEach.apply(this,arguments);
    return this
  },//////////////////////////////////////
  hmap:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        i=0,length=self.length|0,
        result=Array(length);
    while(length > i)result[i]=callbackfn.call(thisArg,self[i],i++,this);
    return result
  },//////////////////////////////////////
  update:function(callbackfn/*?*/,thisArg){
    var i=0,length=this.length|0;
    while(length > i)this[i]=callbackfn.call(thisArg,this[i],i++,this);
    return this
  },
  // http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
  fill:fill,
  props:props,//////////////////////////////////////
  has:function(el/*?*/,that){
    return some.call(this,createTestCallback(el),that)
  },//////////////////////////////////////
  none:function(el/*?*/,that){
    return !some.call(this,createTestCallback(el),that)
  },//////////////////////////////////////
  count:function(mapArg/*?*/,that){
    return filter.call(this,createTestCallback(mapArg),that).length
  },
  sum:arraySum,
  avg:function(/*?*/mapArg){
    return this.length?arraySum.call(this,mapArg)/this.length:0
  },
  min:function(/*?*/mapArg){
    var result=Infinity,
        that=createMap(this,mapArg),
        i=0,length=that.length|0;
    for(;i<length;i++)if(i in that && result > that[i])result=that[i];
    return result
  },
  max:function(/*?*/mapArg){
    var result=-Infinity,
        that=createMap(this,mapArg),
        i=0,length=that.length|0;
    for(;i<length;i++)if(i in that && that[i] > result)result=that[i];
    return result
  },
  unique:unique,
  cross:function(arrayLike){
    var result=[],
        that=arrayLikeSelf(this),
        i=0,length=that.length|0,value,
        array=isArray(arrayLike)?arrayLike:toArray(arrayLike);
    while(length > i)!~indexSame(result,value=that[i++])&&~indexSame(array,value)&&result.push(value);
    return result
  },
  last:function(){
    return this[this.length-1]
  }
});
// Array static methods
// http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
extendBuiltInObject(Array,
  'map,reduce,reduceRight,filter,forEach,each,every,some,reverse,sort,indexOf,lastIndexOf,concat,splice,shift,unshift,push,pop,has,none,count,sum,avg,min,max,unique,cross,last,find,findIndex'
    .split(',').reduce(function(result,key){
      if(key in $Array)result[key]=unbind.call($Array[key])
      return result
    },{}));
// ES3 fix
extendBuiltInObject(Array,{slice:unbind.call(slice),join:unbind.call(join)});
// module numberExternal
extendBuiltInObject(Math,{
  div:function(number,divisor){
    var result=number/divisor;
    return(result>0?floor:ceil)(result)
  }
});
extendBuiltInObject($Number,{
  div:function(divisor){
    var result=this/divisor;
    return(result>0?floor:ceil)(result)
  },
  times:function(fn/*?*/,that){
    var i=0,num=this|0,result=Array(num);
    if(isFunction(fn))while(i<num)result[i]=fn.call(that,i++,this);
    return result
  },
  random:function(/*?*/number){
    var m=min(this||0,number||0);
    return random()*(max(this||0,number||0)-m)+m
  },
  rand:function(/*?*/number){
    var m=min(this||0,number||0);
    return floor((random()*(max(this||0,number||0)+1-m))+m)
  },
  odd:function(){
    return !(this%1)&&!!(this%2)
  },
  even:function(){
    return !!(+this+1)&&!(this%2)
  },
  format:methodize.call(numberFormat),
  toChar:methodize.call(String.fromCharCode)
});
extendBuiltInObject(
  $Number,
  'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,pow,sqrt,max,min,pow,atan2'
    .split(',').reduce(function(o,k){
      o[k]=methodize.call(Math[k]);
      return o
    },{})
);
// module stringExternal
extendBuiltInObject($String,{
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimLeft
  trimLeft:function(){
    return replace.call(this,LTrim,'')
  },
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimRight
  trimRight:function(){
    return replace.call(this,RTrim,'')
  },
  assign:function(props/*args...*/){
    props=isObject(props)?props:toArray(arguments);
    return replace.call(this,/\{([^{]+)\}/g,function(part,key){
      return own(props,key)?props[key]:part
    })
  },
  escapeHTML:function(){
    return replace
      .call(this,/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&apos;')
        .replace(/\//g,'&#x2f;')
  },
  unescapeHTML:function(){
    return replace
      .call(this,/&lt;/g,'<')
        .replace(/&gt;/g,'>')
        .replace(/&quot;/g,'"')
        .replace(/&apos;/g,"'")
        .replace(/&#x2f;/g,'/')
        .replace(/&amp;/g,'&')
  },
  escapeURL:function(/*?*/component){
    return (component?encodeURIComponent:encodeURI)(this)
  },
  unescapeURL:function(/*?*/component){
    return (component?decodeURIComponent:decodeURI)(this)
  },
  escapeRegExp:function escapeRegExp(){
    return replace.call(this,/([\\\/'*+?|()\[\]{}.^$])/g,'\\$1')
  },
  reverse:function(){
    return (''+this).split('').reverse().join('')
  },
  empty:function(){
    return !(''+this).trim()
  },
  last:function(){
    return (''+this).charAt(this.length-1)
  }/* ??? */,
  test:function(regExp){
    return isRegExp(regExp)?regExp.test(this):false
  },
  add:function(str/*?*/,pos){
    var that=''+this;
    return pos==undefined?that+str:that.slice(0,pos)+str+that.slice(pos)
  }
});
// module regexpExternal
extendBuiltInObject(RegExp[prototype],{
  fn:function(){
    var that=this;
    return function(foo){
      return that.test(foo)
    }
  },
  getFlag:function(){
    return getRegExpFlags(this)
  },
  setFlag:function(flags){
    return RegExp(this.source,flags)
  },
  addFlag:function(flags){
    return RegExp(
      this.source,
      unique.call((getRegExpFlags(this)+flags)).join('')
    )
  },
  removeFlag:function(flag){
    return this.setFlag(getRegExpFlags(this).replace(flag,''))
  }
});
// module dateExternal
!function(){
  function format(template/*?*/,locale){
    var that=this;
    locale=own(locales,locale)?locale:current||'en';
    return String(template).replace(/\{([^{]+)\}/g,function(part,key){
      switch(key){
        case'ms'   :return that.getMilliseconds();
        case's'    :return that.getSeconds();
        case'ss'   :return numberFormat(that.getSeconds(),0,2);
        case'm'    :return that.getMinutes();
        case'mm'   :return numberFormat(that.getMinutes(),0,2);
        case'h'    :return that.getHours()%12||12
        case'hh'   :return numberFormat(that.getHours()%12||12,0,2);
        case'H'    :return that.getHours();
        case'HH'   :return numberFormat(that.getHours(),0,2);
        case'd'    :return that.getDate();
        case'dd'   :return numberFormat(that.getDate(),0,2);
        case'Week' :return locales[locale].week[that.getDay()];
        case'w'    :return that.getDay();
        case'M'    :return that.getMonth()+1;
        case'MM'   :return numberFormat(that.getMonth()+1,0,2);
        case'Month':return locales[locale].month[that.getMonth()];
        case'month':return locales[locale].ofMonth[that.getMonth()];
        case'yy'   :return numberFormat(that.getFullYear()%100,0,2);
        case'yyyy' :return that.getFullYear()
      }
      return part
    })
  }
  function addLocale(lang,locale){
    locale.week=locale.week.split(',');
    locale.ofMonth=(locale.ofMonth||locale.month).split(',');
    locale.month=locale.month.split(',');
    locales[lang]=locale
  }
  extendBuiltInObject(Date,{
    locale:function(locale){
      if(own(locales,locale))current=locale;
      return current
    },
    addLocale:addLocale,
    format:function(){
      return format.apply(new Date,arguments)
    }
  });
  extendBuiltInObject(Date[prototype],{format:format});
  var key,current='en',
      locales={},
      baseLocales={
        ru:{
          week:'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
          month:'Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь',
          ofMonth:'Января,Февраля,Марта,Апреля,Мая,Июня,Июля,Августа,Сентября,Октября,Ноября,Декабря'
        },
        en:{
          week:'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
          month:'January,February,March,April,May,June,July,August,September,October,November,December'
        }/*,
        de:{
          week:'Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag',
          month:'Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember'
        }*/
      };
  for(key in baseLocales)own(baseLocales,key)&&addLocale(key,baseLocales[key]);
}();
// module events
extendBuiltInObject(Function,{EventEmitter:function(){
    var events={};
    this.on=function(event,fn/*?*/,that){
      (own(events,event)?events[event]:(events[event]=[])).push([fn,that,/*once*/false]);
      return this;
    };
    this.once=function(event,fn/*?*/,that){
      (own(events,event)?events[event]:(events[event]=[])).push([fn,that,/*once*/true]);
      return this;
    };
    this.off=function(/*?*/event,fn){
      if(!event)events={};
      else if(!fn)events[event]=[];
      else for(var listeners=own(events,event)?events[event]:$Array,i=0;i<listeners.length;++i)
        listeners[i][0]===fn&&listeners.splice(i--,1);
      return this
    };
    this.run=function(event,args){
      isObject(args)||(args=$Array);
      var listener,i=0,
          listeners=own(events,event)?events[event]:$Array;
      for(;i<listeners.length;++i){
        (listener=listeners[i])[0].apply(listener[1]||this,args);
        listener[2]&&listeners.splice(i--,1);
      }
      return this
    };
  }
});
// module console
var _console=global.console||{},
    consoleMap='assert,count,debug,dir,dirxml,error,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,table,time,timeEnd,trace,warn'
      .split(',').reduce(function(result,key){
        result[key]=function(){
          _console[key]&&console.enable&&apply.call(_console[key],_console,arguments)
        };
        return result
      },{enable:true});
tryDeleteGlobal('console');
global.console=extendBuiltInObject(consoleMap.log,consoleMap);
// module ls
// Wrapers for piping in LiveScript
extendBuiltInObject(Object,{ls:getOwnPropertyNames(Object).reduce(function(o,key,fn){
  if(isFunction(fn=Object[key]))o[key]=function(){
    var args=toArray(arguments);
    return function(x){return fn.apply(undefined,[x].concat(args))}}
  return o
},{})});
extendBuiltInObject(Array,{ls:getOwnPropertyNames(Array).reduce(function(o,key,fn){
  if(isFunction(fn=Array[key]))o[key]=function(){
    var args=toArray(arguments);
    return function(x){return fn.apply(undefined,[x].concat(args))}}
  return o
},{})});
extendBuiltInObject(String,{ls:getOwnPropertyNames(String[prototype]).reduce(function(o,key,fn){
  if(isFunction(fn=String[prototype][key]))o[key]=function(){
    var args=arguments;
    return function(x){return fn.apply(x,args)}}
  return o
},{})});
extendBuiltInObject(Function,{ls:getOwnPropertyNames(Function[prototype]).reduce(function(o,key,fn){
  if(isFunction(fn=Function[prototype][key]))o[key]=function(){
    var args=arguments;
    return function(x){return fn.apply(x,args)}}
  return o
},{})});
}(typeof window!='undefined'?window:global,Function,Object,Array,String,Number,RegExp,Date,Error,TypeError,Math);