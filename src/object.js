$define(STATIC, OBJECT, {
  /**
   * Alternatives:
   * http://underscorejs.org/#has
   * http://sugarjs.com/api/Object/has
   */
  isEnumerable: unbind(isEnumerable),
  isPrototype: unbind($Object.isPrototypeOf),
  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  getPropertyDescriptor: getPropertyDescriptor,
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  /**
   * Shugar for Object.create
   * Alternatives:
   * http://lodash.com/docs#create
   */
  make: function(proto, props){
    return props == undefined ? create(proto) : create(proto, getOwnPropertyDescriptors(props));
  },
  /**
   * 19.1.3.15 Object.mixin ( target, source )
   * Removed in Draft Rev 22, January 20, 2014
   * http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
   */
  define: function(target, source){
    return defineProperties(target, getOwnPropertyDescriptors(source));
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#isObject
   * http://sugarjs.com/api/Object/isType
   * http://docs.angularjs.org/api/angular.isObject
   */
  isObject: isObject,
  /**
   * Alternatives:
   * http://livescript.net/#operators -> typeof!
   * http://mootools.net/docs/core/Core/Core#Core:typeOf
   * http://api.jquery.com/jQuery.type/
   */
  classof: classof,
  // Simple symbol API
  symbol: symbol,
  hidden: hidden
});