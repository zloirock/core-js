!function(ITER){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    $.set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  Iter.create(Enumerate, 'Object', function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return Iter.step(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return Iter.step(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assert.obj(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assert.obj(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return $.isObject(proto = $.getProto(target))
      ? reflectGet(proto, propertyKey, receiver)
      : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = $.getDesc(assert.obj(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if($.isObject(proto = $.getProto(target))){
        return reflectSet(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if($.has(ownDesc, 'value')){
      if(ownDesc.writable === false || !$.isObject(receiver))return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      return $.setDesc(receiver, propertyKey, existingDescriptor), true;
    }
    return ownDesc.set === undefined
      ? false
      : (ownDesc.set.call(receiver, V), true);
  }
  var isExtensible = Object.isExtensible || $.it
    , apply = Function.apply;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: $.ctx(Function.call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: function(target, argumentsList /*, newTarget*/){
      var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
        , instance = $.create($.isObject(proto) ? proto : Object.prototype)
        , result   = apply.call(target, instance, argumentsList);
      return $.isObject(result) ? result : instance;
    },
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap($.setDesc),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = $.getDesc(assert.obj(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assert.obj(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return $.getDesc(assert.obj(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return $.getProto(assert.obj(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assert.obj(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: $.ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || $.it),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if($.setProto)reflect.setPrototypeOf = function(target, proto){
    return $.setProto(assert.obj(target), proto), true;
  };
  
  $def(GLOBAL, {Reflect: {}});
  $def(STATIC, 'Reflect', reflect);
}(uid.safe('iter'));