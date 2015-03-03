!function(){
  function define(target, mixin){
    var keys   = $.ownKeys($.toObject(mixin))
      , length = keys.length
      , i = 0, key;
    while(length > i)$.setDesc(target, key = keys[i++], $.getDesc(mixin, key));
    return target;
  };
  $def(STATIC + FORCED, 'Object', {
    isObject: $.isObject,
    classof: cof.classof,
    define: define,
    make: function(proto, mixin){
      return define($.create(proto), mixin);
    }
  });
}();