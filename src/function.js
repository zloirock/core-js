function inherits(parent){
  assertFunction(this);
  assertFunction(parent);
  this[prototype] = create(parent[prototype], getOwnPropertyDescriptors(this[prototype]));
  return this;
}
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
  invoke: function(args){
    assertFunction(this);
    var instance = create(this[prototype])
      , result   = this.apply(instance, ES5Object(args || []));
    return isObject(result) ? result : instance;
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
    return createDeferred(setTimeout, clearTimeout, [part.apply(this, $slice(arguments, 1)), del]);
  },
  /**
   * Alternatives:
   * http://sugarjs.com/api/Function/every
   * http://mootools.net/docs/core/Types/Function#Function:periodical
   */
  interval: function(del /*, args...*/){
    return createDeferred(setInterval, clearInterval, [part.apply(this, $slice(arguments, 1)), del]);
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#defer
   * http://api.prototypejs.org/language/Function/prototype/defer/
   */
  immediate: function(/*, args...*/){
    return createDeferred(setImmediate, clearImmediate, [part.apply(this, arguments)]);
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
      return deferred;
    },
    run: function(){
      id && clear(id);
      id = apply.call(set, global, args);
      return deferred;
    }
  }, id;
  return deferred;
}