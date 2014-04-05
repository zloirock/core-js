$define(STATIC, FUNCTION, {
  isFunction: isFunction,
  isNative: isNative,
  _: _
});
$define(PROTO, FUNCTION, {
  construct: function(args){
    assertFunction(this);
    var instance = create(this[PROTOTYPE])
      , result   = this.apply(instance, ES5Object(args));
    return isObject(result) ? result : instance;
  }
});