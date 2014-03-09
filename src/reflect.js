/**
 * 26.1 The Reflect Object
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-reflect-object
 */
var id = Function('x', 'return x');
$define(GLOBAL, {Reflect: {}});
$define(STATIC, 'Reflect', {
  // 26.1.1 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: defineProperty,
  // 26.1.2 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function(target, propertyKey){
    return delete target[propertyKey];
  },
  // 26.1.3 Reflect.enumerate(target)
  enumerate: function(target){
    var list = []
      , key;
    for(key in target)list.push(key);
    return list;
  },
  // 26.1.4 Reflect.get(target, propertyKey, receiver=target)
  get: function(target, propertyKey, receiver){
    if(arguments.length < 3)return target[propertyKey];
    var desc = getPropertyDescriptor(target, propertyKey);
    return desc && isFunction(desc.get) ? desc.get.call(receiver) : target[propertyKey];
  },
  // 26.1.5 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 26.1.6 Reflect.getPrototypeOf(target)
  getPrototypeOf: getPrototypeOf,
  // 26.1.7 Reflect.has(target, propertyKey)
  has: function(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.8 Reflect.hasOwn(target, propertyKey) Deprecated???
  hasOwn: has,
  // 26.1.9 Reflect.isExtensible(target)
  isExtensible: Object.isExtensible || Function('return !0'),
  // 26.1.10 Reflect.ownKeys(target)
  ownKeys: function(target){
    return getIterator(keys(target));
  },
  // 26.1.11 Reflect.preventExtensions(target)
  preventExtensions: Object.preventExtensions || id,
  // 26.1.12 Reflect.set(target, propertyKey, V, receiver=target)
  set: function(target, propertyKey, V, receiver){
    if(arguments.length < 3)return target[propertyKey] = V;
    var desc = getPropertyDescriptor(target, propertyKey);
    return desc && isFunction(desc.set) ? desc.set.call(receiver, V) : target[propertyKey] = V;
  },
  // 26.1.13 Reflect.setPrototypeOf(target, proto)
  setPrototypeOf: Object.setPrototypeOf || id
});