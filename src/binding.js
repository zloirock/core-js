!function(){
  function tie(key){
    var that        = this
      , placeholder = false
      , length      = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(that[key], that);
    args = Array(length - 1)
    while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
    return createPartialApplication(that[key], args, length, placeholder, true, that);
  }
  var $tie = {tie: tie};
  $define(PROTO, FUNCTION, {
    tie: tie,
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
        , placeholder = false
        , length      = arguments.length
        , i = 1, args;
      if(length < 2)return ctx(fn, that);
      args = Array(length - 1);
      while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
      return createPartialApplication(fn, args, length, placeholder, true, that);
    },
    /**
     * fn(a, b, c...) -> a.fn(b, c...)
     * Alternatives:
     * http://api.prototypejs.org/language/Function/prototype/methodize/
     */
    methodize: methodize
  });
  $define(PROTO, ARRAY, $tie);
  $define(PROTO, REGEXP, $tie);
  $define(STATIC, OBJECT, {
    /**
     * Alternatives:
     * http://www.2ality.com/2013/06/auto-binding.html
     * http://livescript.net/#property-access -> foo~bar
     * http://lodash.com/docs#bindKey
     */
    tie: unbind(tie)
  });
  _.useTie = function(){
    $define(PROTO, OBJECT, $tie);
    return _;
  }
}();