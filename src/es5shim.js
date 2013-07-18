!function(){
  // not enum keys
  var hidenNames='length,toString,toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,constructor'.split(','),
      hidenNamesLength=hidenNames.length;
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  if(!(iz.$DESC=!function(){try{Object.defineProperty({},0,$Object)}catch(e){return 1}}())){
    // 15.2.3.3 Object.getOwnPropertyDescriptor ( O, P )
    // http://es5.github.io/#x15.2.3.3
    Object.getOwnPropertyDescriptor=function(O,P){
      if(own(O,P))return {
        writable:true,
        configurable:true,
        value:O[P],
        enumerable:isEnum(O,P)
      }
    },
    // 15.2.3.6 Object.defineProperty ( O, P, Attributes )
    // http://es5.github.io/#x15.2.3.6
    Object.defineProperty=function(O,P,Attributes){
      O[P]=Attributes.value;
      return O
    },
    // 15.2.3.7 Object.defineProperties ( O, Properties ) 
    // http://es5.github.io/#x15.2.3.7
    Object.defineProperties=function(O,Properties){
      for(var key in Properties)if(own(Properties,key))O[key]=Properties[key].value;
      return O
    }
  }
  // Objects & prototypes
  // The engine has a guaranteed way to get a prototype?
  var PROTO=iz.$PROTO=!!Object.getPrototypeOf||protoInObject,
  // Create object with null as it's prototype
  createNullProtoObject=protoInObject
    ?function(){return {__proto__:null}}
    :function(){
      // Thrash, waste and sodomy
      var iframe=document.createElement('iframe'),iframeDocument,
          i=hidenNamesLength,
          body=document.body||document.documentElement;
      iframe.style.display='none';
      body.appendChild(iframe);
      iframe.src='javascript:';
      iframeDocument=iframe.contentWindow.document||iframe.contentDocument||iframe.document;
      iframeDocument.open();
      iframeDocument.write('<script>document._tmp_=Object</script>');
      iframeDocument.close();
      createNullProtoObject=iframeDocument._tmp_;
      // body.removeChild(iframe);
      while(i--)delete createNullProtoObject[prototype][hidenNames[i]];
      return createNullProtoObject()
    }
  extendBuiltInObject(Object,{
    // 15.2.3.5 Object.create ( O [, Properties] )
    // http://es5.github.io/#x15.2.3.5
    create:function(O/*?*/,Properties){
      if(O===null)return Properties?defineProperties(createNullProtoObject(),Properties):createNullProtoObject();
      if(isPrimitive(O))throw TypeError('Object prototype may only be an Object or null');
      Empty.prototype=O;
      var constructor,result=new Empty();
      if(Properties)defineProperties(result,Properties);
      // add __proto__ for Object.getPrototypeOf shim
      PROTO||(constructor=result.constructor)&&constructor.prototype==O||(result.__proto__=O);
      return result
    },
    // 15.2.3.2 Object.getPrototypeOf ( O ) 
    // http://es5.github.io/#x15.2.3.2
    getPrototypeOf:function(O){
      var constructor,proto=O.__proto__||((constructor=O.constructor)?constructor.prototype:$Object);
      return O!=proto&&'toString' in O?proto:null
    },
    // 15.2.3.14 Object.keys ( O )
    // http://es5.github.io/#x15.2.3.14
    keys:function(O){
      var key,result=[];
      for(key in O)own(O,key)&&result.push(key);
      return result
    },
    // 15.2.3.4 Object.getOwnPropertyNames ( O )
    // http://es5.github.io/#x15.2.3.4
    getOwnPropertyNames:function(O){
      var i=0,key,result=keys(O);
      while(hidenNamesLength > i)own(O,key=hidenNames[i++])&&!~result.indexOf(key)&&result.push(key);
      return result
    }
  });
  // not array-like strings fix
  if(!(0 in Object('q'))){
    var nativeSlice=slice,nativeJoin=join;
    // Array.prototype methods for strings in ES3
    arrayLikeSelf=function(foo){
      return isString(foo)?foo.split(''):Object(foo)
    };
    slice=function(){
      return nativeSlice.apply(arrayLikeSelf(this),arguments)
    };
    join=function(){
      return nativeJoin.apply(arrayLikeSelf(this),arguments)
    }
  }
}();
// 15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]]) 
// http://es5.github.io/#x15.3.4.5
extendBuiltInObject($Function,{
  bind:function(scope/*,args...*/){
    var fn=this,
        args=slice1(arguments),
    bound=function bound(){
      return apply.call(fn,fn.prototype&&this instanceof fn?this:scope,args.concat(toArray(arguments)))
    }
    bound.prototype=this.prototype;
    return bound
  }
});
// 15.4.3.2 Array.isArray ( arg )
// http://es5.github.io/#x15.4.3.2
extendBuiltInObject(Array,{isArray:isArray});
extendBuiltInObject($Array,{
  // 15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
  // http://es5.github.io/#x15.4.4.14
  indexOf:function(searchElement/*?*/,fromIndex){
    var self=arrayLikeSelf(this),
        length=self.length>>>0,
        i=toInt(fromIndex);
    if(i<0)i=max(0,length+i);
    for(;i<length;i++)if(i in self&&self[i]===searchElement)return i;
    return -1
  },
  // 15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
  // http://es5.github.io/#x15.4.4.15
  lastIndexOf:function(searchElement/*?*/,fromIndex){
    var self=arrayLikeSelf(this),
        length=self.length>>>0,
        i=length-1;
    if(arguments.length>1)i=min(i,toInt(fromIndex));
    if(i<0)i+=length;
    for(;i>=0;i--)if(i in self&&self[i]===searchElement)return i;
    return -1
  },
  // 15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )
  // http://es5.github.io/#x15.4.4.16
  every:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        length=self.length,i=0;
    for(;i<length;i++)if(i in self&&!callbackfn.call(thisArg,self[i],i,this))return false;
    return true
  },
  // 15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )
  // http://es5.github.io/#x15.4.4.17
  some:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        length=self.length,i=0;
    for(;i<length;i++)if(i in self&&callbackfn.call(thisArg,self[i],i,this))return true;
    return false
  },
  // 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
  // http://es5.github.io/#x15.4.4.18
  forEach:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        length=self.length,i=0;
    for(;i<length;i++)i in self&&callbackfn.call(thisArg,self[i],i,this)
  },
  // 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
  // http://es5.github.io/#x15.4.4.19
  map:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        length=self.length,i=0,
        rez=Array(length);
    for(;i<length;i++)if(i in self)rez[i]=callbackfn.call(thisArg,self[i],i,this);
    return rez
  },
  // 15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )
  // http://es5.github.io/#x15.4.4.20
  filter:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        length=self.length,i=0,rez=[];
    for(;i<length;i++)i in self&&callbackfn.call(thisArg,self[i],i,this)&&rez.push(self[i]);
    return rez
  },
  // 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
  // http://es5.github.io/#x15.4.4.21
  reduce:function(callbackfn/*?*/,result){
    var self=arrayLikeSelf(this),
        length=self.length>>>0,i=0;
    if(arguments.length<2)while(true){
      if(i in self){
        result=self[i++];
        break
      }
      if(++i>=length)throw TypeError('Reduce of empty array with no initial value')
    }
    for(;i<length;i++)if(i in self)result=callbackfn(result,self[i],i,this);
    return result
  },
  // 15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
  // http://es5.github.io/#x15.4.4.22
  reduceRight:function(callbackfn/*?*/,result){
    var self=arrayLikeSelf(this),
        length=self.length>>>0,i=length-1;
    if(arguments.length<2)while(true){
      if(i in self){
        result=self[i--];
        break
      }
      if(--i<0)throw TypeError('Reduce of empty array with no initial value')
    }
    for(;i>=0;i--)if(i in self)result=callbackfn(result,self[i],i,this);
    return result
  }
});
// 15.5.4.20 String.prototype.trim ( )
// http://es5.github.io/#x15.5.4.20
extendBuiltInObject($String,{trim:function(){
  return String(this).replace(LTrim,'').replace(RTrim,'')
}});
// 15.9.4.4 Date.now ( )
// http://es5.github.io/#x15.9.4.4
extendBuiltInObject(Date,{now:function(){
  return +new Date
}});
// IE iz.Arguments fix
isArguments(Function('return arguments')())||(isArguments=function(obj){
  return !!(obj&&isFunction(obj.callee))
});