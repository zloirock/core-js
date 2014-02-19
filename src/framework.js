function extendBuiltInObject(target, source, forced /* = false */){
  if(target)for(var key in source){
    try {
      has(source, key)
      && (forced || !has(target, key) || !isNative(target[key]))
      && delete target[key]
      && defineProperty(target, key, descriptor(6, source[key]));
    } catch(e){}
  }
}