function Wrap(object){
  if(!(this instanceof Wrap))return new Wrap(object);
  this.value = object
}
var $Wrap = Wrap[prototype];
extendBuiltInObject(Object, {Wrap: Wrap});
splitComma(
  // ES5:
  'defineProperty,defineProperties,getPrototypeOf,create,' +
  // ES6:
  'assign,mixin,' +
  // Core.js:
  'getOwnPropertyDescriptors,getPropertyDescriptors,make,plane,' +
  'clone,merge,defaults,invert,filter,forEach,map,props,reduceTo'
).forEach(function(key){
  var fn = Object[key];
    isFunction(fn) && defineProperty($Wrap, key, descriptor(6, function(){
      var value = this.value
        , args  = [value]
        , result;
      push.apply(args, arguments);
      result = fn.apply(this, args)
      return value === result ? this : new Wrap(result)
    }));
});
getOwnPropertyNames(Object).forEach(function(key){
  var fn = Object[key];
  isFunction(fn) && !has($Wrap, key)
    && defineProperty($Wrap, key, descriptor(6, function(){
      var args = [this.value];
      push.apply(args, arguments);
      return fn.apply(this, args)
    }));
});
extendBuiltInObject($Wrap, {
  get: function(key){
    var object = this.value;
    return has(object, key) ? object[key] : undefined
  },
  set: function(key, value){
    this.value[key] = value;
    return this
  },
  'delete': function(key){
    delete this.value[key];
    return this
  }
});