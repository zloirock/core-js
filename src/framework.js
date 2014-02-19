function extendBuiltInObject(target, source, forced /* = false */){
  if(target)for(var key in source){
    try {
      has(source, key)
      && (forced || !has(target, key) || !isNative(target[key]))
      && delete target[key]
      && hidden(target, key, source[key]);
    } catch(e){}
  }
}