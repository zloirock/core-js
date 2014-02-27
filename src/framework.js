function $define(type, name, source, forced /* = false */){
  var target = type == GLOBAL ? global : type == STATIC ? global[name] : global[name][prototype];
  for(var key in source){
    try {
      has(source, key)
      && (forced || !has(target, key) || !isNative(target[key]))
      && delete target[key]
      && hidden(target, key, source[key]);
    } catch(e){}
  }
}