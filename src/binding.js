!function(){
  $define(PROTO, FUNCTION, {
    /**
     * Partial apply.
     * Alternatives:
     * http://sugarjs.com/api/Function/fill
     * http://underscorejs.org/#partial
     * http://mootools.net/docs/core/Types/Function#Function:pass
     * http://fitzgen.github.io/wu.js/#wu-partial
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
     * fn(a, b, c, ...) -> a.fn(b, c, ...)
     * Alternatives:
     * http://api.prototypejs.org/language/Function/prototype/methodize/
     */
    methodize: function(){
      var fn = this;
      return function(/*...args*/){
        var args = [this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return apply.call(fn, undefined, args);
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

  $define(STATIC, OBJECT, {tie: ctx(call, tie)});
  
  var _ = symbol('tie');
  hidden(path._, 'toString', function(){
    return _;
  });
  DESCRIPTORS && hidden($Object, _, tie);
  hidden($Function, _, tie);
  hidden($Array, _, tie);
  hidden(RegExp[PROTOTYPE], _, tie);
}();