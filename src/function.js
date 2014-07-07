$define(STATIC, FUNCTION, {
  isFunction: isFunction,
  isNative: isNative
});
$define(PROTO, FUNCTION, {
  // 7.3.18 Construct (F, argumentsList)
  construct: function(args){
    assertFunction(this);
    var instance = create(this[PROTOTYPE])
      , result   = invoke(this, args, instance);
    return isObject(result) ? result : instance;
  },
  invoke: function(args, that){
    return invoke(this, args, that);
  }
});