!function(_){
  $define(PROTO, FUNCTION, {
    /**
     * Partial apply.
     * Alternatives:
     * http://sugarjs.com/api/Function/fill
     * http://underscorejs.org/#partial
     * http://mootools.net/docs/core/Types/Function#Function:pass
     */
    part: part,
    by: function(that){
      var fn     = this
        , _      = path._
        , holder = false
        , length = arguments.length
        , woctx  = that === _
        , i      = woctx ? 0 : 1
        , indent = i
        , args;
      if(length < 2)return woctx ? ctx(call, fn) : ctx(fn, that);
      args = Array(length - indent);
      while(length > i)if((args[i - indent] = arguments[i++]) === _)holder = true;
      return partial(woctx ? call : fn, args, length, holder, _, true, woctx ? fn : that);
    },
    /**
     * http://www.wirfs-brock.com/allen/posts/166
     * http://habrahabr.ru/post/114737/
     */
    only: function(numberArguments, that /* = undefined */){
      var fn     = assertFunction(this)
        , n      = toLength(numberArguments)
        , isThat = arguments.length > 1;
      return function(/* ...args */){
        var length = min(n, arguments.length)
          , args   = Array(length)
          , i      = 0;
        while(length > i)args[i] = arguments[i++];
        return invoke(fn, args, isThat ? that : this);
      }
    },
    /**
     * fn(a, b, c, ...) -> a.fn(b, c, ...)
     * Alternatives:
     * http://api.prototypejs.org/language/Function/prototype/methodize/
     */
    methodize: function(){
      var fn = this;
      return function(/* ...args */){
        var args = [this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return invoke(fn, args);
      }
    }
  });
  
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  function tie(key){
    var that   = this
      , _      = path._
      , holder = false
      , length = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(that[key], that);
    args = Array(length - 1)
    while(length > i)if((args[i - 1] = arguments[i++]) === _)holder = true;
    return partial(that[key], args, length, holder, _, true, that);
  }

  $define(STATIC, OBJECT, {tie: core.tie = ctx(call, tie)});
  
  hidden(path._, TO_STRING, function(){
    return _;
  });
  DESCRIPTORS && hidden(ObjectProto, _, tie);
  hidden(FunctionProto, _, tie);
  hidden(ArrayProto, _, tie);
  hidden(RegExp[PROTOTYPE], _, tie);
}(uid('tie'));