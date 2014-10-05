!function(_, BOUND, toLocaleString){
  $define(PROTO + FORCED, FUNCTION, {
    part: part,
    by: function(that){
      var fn     = this
        , _      = path._
        , holder = false
        , length = arguments.length
        , isThat = that === _
        , i      = +!isThat
        , indent = i
        , it, args;
      if(isThat){
        it = fn;
        fn = call;
      } else it = that;
      if(length < 2)return ctx(fn, it, -1);
      args = Array(length - indent);
      while(length > i)if((args[i - indent] = arguments[i++]) === _)holder = true;
      return partial(fn, args, length, holder, _, true, it);
    },
    only: function(numberArguments, that /* = @ */){
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
    }
  });
  
  function tie(key){
    var that = this, bound;
    if(key === undefined)return toLocaleString.call(that);
    if(!has(that, BOUND))hidden(that, BOUND, {});
    bound = that[BOUND];
    return has(bound, key) ? bound[key] : (bound[key] = ctx(that[key], that, -1));
  }
  
  hidden(path._, TO_STRING, function(){
    return _;
  });
  
  hidden(ObjectProto, _, tie);
  DESCRIPTORS || hidden(ArrayProto, _, tie);
}(DESCRIPTORS ? uid('tie') : TO_LOCALE, symbol('bound'), ObjectProto[TO_LOCALE]);