/**
 * Extended object api from harmony and strawman :
 * http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
 * http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
 */
$define(STATIC, 'Object', {
  getPropertyDescriptor: getPropertyDescriptor,
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  getPropertyDescriptors: function(object){
    var result = getOwnPropertyDescriptors(object);
    while(object = getPrototypeOf(object)){
      result = assign(getOwnPropertyDescriptors(object), result);
    }
    return result;
  },
  getPropertyNames: function(object){
    var result = getOwnPropertyNames(object);
    while(object = getPrototypeOf(object)){
      getOwnPropertyNames(object).forEach(function(key){
        ~result.indexOf(key) || result.push(key);
      });
    }
    return result;
  }
});