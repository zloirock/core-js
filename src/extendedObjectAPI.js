/**
 * Extended object api from harmony and strawman :
 * http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
 * http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
 */
extendBuiltInObject(Object, {
  getPropertyDescriptor: function(object, key){
    if(key in object)do {
      if(has(object, key))return getOwnPropertyDescriptor(object, key)
    } while(object = getPrototypeOf(object))
  },
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  getPropertyDescriptors: function(object){
    var result = getOwnPropertyDescriptors(object)
      , i, length, names, key;
    while(object = getPrototypeOf(object)){
      names  = getOwnPropertyNames(object);
      i      = 0;
      length = names.length;
      while(length > i)if(!has(result, key = names[i++])){
        result[key] = getOwnPropertyDescriptor(object, key);
      }
    }
    return result
  },
  getPropertyNames: function(object){
    var result = getOwnPropertyNames(object)
      , i, length, names, key;
    while(object = getPrototypeOf(object)){
      i      = 0;
      names  = getOwnPropertyNames(object);
      length = names.length;
      while(length > i)~result.indexOf(key = names[i++]) || result.push(key)
    }
    return result
  }
})