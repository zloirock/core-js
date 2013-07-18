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