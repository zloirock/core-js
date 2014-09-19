!function(){
  var getSymbols      = Object.getOwnPropertySymbols
    , getPropertyKeys = getSymbols
      ? function(it){
          return getNames(it).concat(getSymbols(it));
        }
      : getNames;
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  // https://gist.github.com/WebReflection/9353781
  function getOwnPropertyDescriptors(object){
    var result = {}
      , keys   = getPropertyKeys(object)
      , length = keys.length
      , i      = 0
      , key;
    while(length > i)result[key = keys[i++]] = getOwnDescriptor(object, key);
    return result;
  }
  $define(STATIC, OBJECT, {
    isPrototype: ctx(call, ObjectProto.isPrototypeOf, 2),
    getOwnPropertyKeys: getPropertyKeys,
    // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
    getPropertyDescriptor: function(object, key){
      var O = object;
      if(key in O)do {
        if(has(O, key))return getOwnDescriptor(O, key);
      } while(O = getPrototypeOf(O));
    },
    // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
    // ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
    getOwnPropertyDescriptors: getOwnPropertyDescriptors,
    /**
     * Shugar for Object.create
     * Alternatives:
     * http://lodash.com/docs#create
     */
    make: function(proto, props){
      return assign(create(proto), props);
    },
    /**
     * 19.1.3.15 Object.mixin ( target, source )
     * Removed in Draft Rev 22, January 20, 2014
     * http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
     */
    define: function(target, source){
      return defineProperties(target, getOwnPropertyDescriptors(source));
    },
    isObject: isObject,
    classof: classof
  });
}();