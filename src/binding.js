!function(){
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  function tie(key){
    var that        = this
      , _           = path._
      , placeholder = false
      , length      = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(that[key], that);
    args = Array(length - 1)
    while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
    return partialApplication(that[key], args, length, placeholder, _, true, that);
  }
  var $tie = {tie: tie};
  $define(PROTO, FUNCTION, assign({
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
      var fn          = this
        , _           = path._
        , placeholder = false
        , length      = arguments.length
        , woctx       = that === _
        , i           = woctx ? 0 : 1
        , indent      = i
        , args;
      if(length < 2)return woctx ? unbind(fn) : ctx(fn, that);
      args = Array(length - indent);
      while(length > i)if((args[i - indent] = arguments[i++]) === _)placeholder = true;
      return partialApplication(woctx ? call : fn, args, length, placeholder, _, true, woctx ? fn : that);
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
  }, $tie));
  $define(PROTO, ARRAY, $tie);
  $define(PROTO, REGEXP, $tie);
  $define(STATIC, OBJECT, {
    tie: unbind(tie)
  });
  Export.useTie = function(){
    $define(PROTO, OBJECT, $tie);
    return C;
  }
}();