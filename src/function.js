function inherits(parent){
  assertFunction(this); assertFunction(parent);
  this[PROTOTYPE] = create(parent[PROTOTYPE], getOwnPropertyDescriptors(this[PROTOTYPE]));
  return this;
}
$define(STATIC, FUNCTION, {
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
$define(PROTO, FUNCTION, {
  construct: function(args){
    assertFunction(this);
    var instance = create(this[PROTOTYPE])
      , result   = this.apply(instance, ES5Object(args));
    return isObject(result) ? result : instance;
  },
  inherits: inherits
});