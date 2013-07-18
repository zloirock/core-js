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