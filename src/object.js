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