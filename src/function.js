function invoke(args){
  var instance = create(this.prototype)
    , result   = this.apply(instance, args);
  return isObject(result) ? result : instance
}
function inherits(parent){
  this[prototype] = create(parent[prototype], getOwnPropertyDescriptors(this[prototype]));
  return this
}
extendBuiltInObject(Function, {
  isNative: isNative,
  inherits: unbind.call(inherits)
});
extendBuiltInObject($Function, {
  // method -> function
  unbind: unbind,
  // function -> method
  methodize: methodize,
  // partial apply
  part: part,
  partial: function(args/*?*/, that){
    var fn       = this
      , argsPart = toArray(args)
      , isThat   = arguments.length > 1;
    return function(/*args...*/){
      var args   = toArray(argsPart)
        , length = arguments.length
        , i, current = i = 0;
      while(length > i){
        while(args[current] !== undefined)current++;
        args[current++] = arguments[i++]
      }
      return fn.apply(isThat ? that : this, args)
    }
  },
  // http://www.wirfs-brock.com/allen/posts/166
  // http://habrahabr.ru/post/114737/
  only: function(numberArguments/*?*/, that){
    numberArguments |= 0;
    var fn     = this
      , isThat = arguments.length > 1;
    return function(/*args...*/){
      return fn.apply(isThat ? that : this, slice.call(arguments, 0, min(numberArguments, arguments.length)))
    }
  },
  // simple bind context
  ctx: ctx,
  invoke: invoke,
  getInstance: function(){
    var getInstance = 'getInstance', instance;
    if(!has(this, getInstance)){ // <= protect from Function.prototype.getInstance()
      this[getInstance] = function(){
        return instance
      };
      return instance = this.invoke(arguments)
    }
  },
  once: function(){
    var fn   = this
      , wait = 1
      , result;
    return function(/*args...*/){
      if(wait){
        wait   = 0;
        result = fn.apply(this, arguments)
      }
      return result
    }
  },
  // AOP
  error: function(cb /*cb(error, arguments)*/){
    var fn = this;
    return function(/*args...*/){
      var args = toArray(arguments);
      try{return fn.apply(this, args)}
      catch(e){return cb.call(this, e, args)}
    }
  },
  before: function(cb /*cb(arguments)*/){
    var fn = this;
    return function(/*args...*/){
      var args = toArray(arguments);
      cb.call(this, args);
      return fn.apply(this, args)
    }
  },
  after: function(cb /*cb(result, arguments)*/){
    var fn = this;
    return function(/*args...*/){
      var args        = toArray(arguments)
        , result      = fn.apply(this, args)
        , resultAfter = cb.call(this, result, args);
      return resultAfter === undefined ? result : resultAfter
    }
  },
  // deferred call
  timeout: function(del /*, args...*/){
    return part.call(
      clearTimeout,
      setTimeout(part.apply(this, slice1(arguments)), del)
    )
  },
  interval: function(del /*, args...*/){
    return part.call(
      clearInterval,
      setInterval(part.apply(this, slice1(arguments)), del)
    )
  },
  immediate: function(/* args...*/){
    return part.call(
      clearImmediate,
      setImmediate(part.apply(this, arguments))
    )
  },
  inherits: inherits
});