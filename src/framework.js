function $define(type, name, source, forced /* = false */){
  var target = type == GLOBAL ? global : type == STATIC ? global[name] : global[name][prototype]
    , exports = type == GLOBAL ? $exports : $exports[name] || ($exports[name] = {})
    , key, prop;
  for(var key in source)if(has(source, key)){
    prop = !forced && target && isNative(target[key]) ? target[key] : source[key];
    exports[key] = type == PROTO && isFunction(prop) ? unbind(prop) : prop;
    try {
      (forced || !has(target, key) || !isNative(target[key]))
      && delete target[key]
      && hidden(target, key, source[key]);
    } catch(e){}
  }
}