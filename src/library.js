var $exports = typeof exports != 'undefined' ? exports : (global.C = {});
function $define(type, name, source, forced /* = false */){
  var old    = type == GLOBAL ? global : type == STATIC ? global[name] || {} : (global[name] || {})[prototype] || {}
    , target = type == GLOBAL ? $exports : $exports[name] || ($exports[name] = {})
    , key, prop;
  for(key in source)if(has(source, key)){
    prop = !forced && old && isNative(old[key]) ? old[key] : source[key];
    target[key] = type == PROTO && isFunction(prop) ? unbind(prop) : prop;
  }
}