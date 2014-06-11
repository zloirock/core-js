$define(STATIC, FUNCTION, {
  isFunction: isFunction,
  isNative: isNative
});
$define(PROTO, FUNCTION, {
  // 7.3.18 Construct (F, argumentsList)
  construct: function(args){
    assertFunction(this);
    var list     = Array.isArray(args) ? args : from(args)
      , instance = create(this[PROTOTYPE])
      , result   = this.apply(instance, list);
    return isObject(result) ? result : instance;
  }
});