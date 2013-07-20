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
  Set         : isSet,
  Map         : isMap,
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