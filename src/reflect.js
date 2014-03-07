var id = Function('x', 'return x');
$define(GLOBAL, {Reflect: {}});
$define(STATIC, 'Reflect', {
  defineProperty: defineProperty,
  deleteProperty: function(target, propertyKey){
    return delete target[propertyKey];
  },
  enumerate: function(target){
    var list = []
      , key;
    for(key in target)list.push(key);
    return list;
  },
  get: function(target, propertyKey, receiver){
    if(arguments.length < 3)return target[propertyKey];
    var desc = getPropertyDescriptor(target, propertyKey);
    return desc && isFunction(desc.get) ? desc.get.call(receiver) : target[propertyKey];
  },
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  getPrototypeOf: getPrototypeOf,
  has: function(target, propertyKey){
    return propertyKey in target;
  },
  hasOwn: has,
  isExtensible: Object.isExtensible || Function('return !0'),
  ownKeys: function(target){
    return new ArrayIterator(keys(target), VALUE);
  },
  preventExtensions: Object.preventExtensions || id,
  set: function(target, propertyKey, V, receiver){
    if(arguments.length < 3)return target[propertyKey] = V;
    var desc = getPropertyDescriptor(target, propertyKey);
    return desc && isFunction(desc.set) ? desc.set.call(receiver, V) : target[propertyKey] = V;
  },
  setPrototypeOf: Object.setPrototypeOf || id
});