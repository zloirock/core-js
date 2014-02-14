extendBuiltInObject($Function, {
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
  /**
   * function -> method
   * Alternatives:
   * http://api.prototypejs.org/language/Function/prototype/methodize/
   */
  methodize: methodize,
  /**
   * http://www.wirfs-brock.com/allen/posts/166
   * http://habrahabr.ru/post/114737/
   */
  only: function(numberArguments/*?*/, that){
    numberArguments |= 0;
    var fn     = this
      , isThat = arguments.length > 1;
    return function(/*args...*/){
      return fn.apply(isThat ? that : this, slice.call(arguments, 0, min(numberArguments, arguments.length)));
    }
  }
});
extendBuiltInObject($Array, {tie: tie});
extendBuiltInObject(RegExp[prototype], {tie: tie});
extendBuiltInObject(Object, {
  /**
   * Alternatives:
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  tie: unbind(tie),
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   */
  useTie: part.call(extendBuiltInObject, $Object, {tie: tie})
});