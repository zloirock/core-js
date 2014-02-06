extendBuiltInObject(Function, {
  /**
   * Alternatives:
   * http://underscorejs.org/#isFunction
   * http://sugarjs.com/api/Object/isType
   * http://api.prototypejs.org/language/Object/isFunction/
   * http://api.jquery.com/jQuery.isFunction/
   * http://docs.angularjs.org/api/angular.isFunction
   */
  isFunction: isFunction,
  isNative: isNative,
  inherits: unbind(inherits),
  _: _
});
extendBuiltInObject($Function, {
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
   * http://www.wirfs-brock.com/allen/posts/166
   * http://habrahabr.ru/post/114737/
   */
  only: function(numberArguments/*?*/, that){
    numberArguments |= 0;
    var fn     = this
      , isThat = arguments.length > 1;
    return function(/*args...*/){
      return fn.apply(isThat ? that : this, slice.call(arguments, 0, min(numberArguments, arguments.length)))
    }
  },
  /**
   * function -> method
   * Alternatives:
   * http://api.prototypejs.org/language/Function/prototype/methodize/
   */
  methodize: methodize,
  invoke: function(args){
    var instance = create(this[prototype])
      , result   = this.apply(instance, arrayLikeSelf(args || []));
    return isObject(result) ? result : instance
  },
  // deferred call
  /**
   * Alternatives:
   * http://underscorejs.org/#delay
   * http://sugarjs.com/api/Function/delay
   * http://api.prototypejs.org/language/Function/prototype/delay/
   * http://mootools.net/docs/core/Types/Function#Function:delay
   */
  timeout: function(del /*, args...*/){
    return createDeferred(setTimeout, clearTimeout, [part.apply(this, $slice(arguments, 1)), del])
  },
  /**
   * Alternatives:
   * http://sugarjs.com/api/Function/every
   * http://mootools.net/docs/core/Types/Function#Function:periodical
   */
  interval: function(del /*, args...*/){
    return createDeferred(setInterval, clearInterval, [part.apply(this, $slice(arguments, 1)), del])
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#defer
   * http://api.prototypejs.org/language/Function/prototype/defer/
   */
  immediate: function(/*, args...*/){
    return createDeferred(setImmediate, clearImmediate, [part.apply(this, arguments)])
  },
  /**
   * Alternatives:
   * http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor
   */
  inherits: inherits
});
function createDeferred(set, clear, args){
  var deferred = {
    stop: function(){
      id && clear(id);
      return deferred
    },
    run: function(){
      id && clear(id);
      id = apply.call(set, global, args);
      return deferred
    }
  }, id;
  return deferred;
}