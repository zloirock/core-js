function inherits(parent){
  assertFunction(this), assertFunction(parent);
  this[prototype] = create(parent[prototype], getOwnPropertyDescriptors(this[prototype]));
  return this;
}
$define(STATIC, 'Function', {
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
$define(PROTO, 'Function', {
  invoke: function(args){
    assertFunction(this);
    var instance = create(this[prototype])
      , result   = this.apply(instance, ES5Object(args || []));
    return isObject(result) ? result : instance;
  },
  inherits: inherits
});