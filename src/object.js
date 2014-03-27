!function(){
  function define(target, source){
    return defineProperties(target, getOwnPropertyDescriptors(source));
  }
  function merge(target, source, deep /* = false */, reverse /* = false */, desc /* = false */, stackA, stackB){
    if(isObject(target) && isObject(source)){
      var isComp = isFunction(reverse)
        , names  = (desc ? getOwnPropertyNames : keys)(source)
        , length = names.length
        , i      = 0
        , key, targetDescriptor, sourceDescriptor;
      while(length > i){
        key = names[i++];
        if(has(target, key) && (isComp ? reverse(target[key], source[key]) : reverse)){// if key in target && reverse merge
          deep && merge(target[key], source[key], 1, reverse, desc, stackA, stackB);   // if not deep - skip
        } else if(desc){
          targetDescriptor = getOwnPropertyDescriptor(target, key) || $Object;
          if(targetDescriptor.configurable !== false && delete target[key]){
            sourceDescriptor = getOwnPropertyDescriptor(source, key);
            if(deep && !sourceDescriptor.get && !sourceDescriptor.set){
              sourceDescriptor.value =
                merge(clone(sourceDescriptor.value, 1, 1, stackA, stackB),
                  targetDescriptor.value, 1, 1, 1, stackA, stackB);
            }
            defineProperty(target, key, sourceDescriptor);
          }
        } else target[key] = deep
          ? merge(clone(source[key], 1, 0, stackA, stackB), target[key], 1, 1, 0, stackA, stackB)
          : source[key];
      }
    }
    return target;
  }
  /**
   * NB:
   * http://wiki.ecmascript.org/doku.php?id=strawman:structured_clone
   * https://github.com/dslomov-chromium/ecmascript-structured-clone
   */
  function clone(object, deep /* = false */, desc /* = false */, stackA, stackB){
    if(!isObject(object))return object;
    var already = $indexOf(stackA, object)
      , F       = object.constructor
      , result;
    if(~already)return stackB[already];
    switch(classof(object)){
      case 'Arguments' :
      case ARRAY       :
        result = Array(object.length);
        break;
      case FUNCTION    :
        return object;
      case REGEXP      :
        result = RegExp(object.source, String(object).match(/[^\/]*$/)[0]);
        break;
      case STRING      :
        return new F(object);
      case 'Boolean'   :
      case 'Date'      :
      case NUMBER      :
        result = new F(object.valueOf());
        break;
      /*
      case SET         :
        result = new F;
        object.forEach(result.add, result);
        break;
      case MAP         :
        result = new F;
        object.forEach(function(val, key){
          result.set(key, val);
        });
        break;
      */
      default:
        result = create(getPrototypeOf(object));
    }
    stackA.push(object);
    stackB.push(result);
    return merge(result, object, deep, 0, desc, stackA, stackB);
  }
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
     * Alternatives:
     * http://livescript.net/#operators -> typeof!
     * http://mootools.net/docs/core/Core/Core#Core:typeOf
     * http://api.jquery.com/jQuery.type/
     */
    classof: classof,
    /**
     * Shugar for Object.create
     * Alternatives:
     * http://lodash.com/docs#create
     */
    make: function(proto, props, desc){
      return props ? (desc ? define : assign)(create(proto), props) : create(proto);
    },
    /**
     * 19.1.3.15 Object.mixin ( target, source )
     * Removed in Draft Rev 22, January 20, 2014
     * http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
     */
    define: define,
    /**
     * Alternatives:
     * http://underscorejs.org/#clone
     * http://lodash.com/docs#cloneDeep
     * http://sugarjs.com/api/Object/clone
     * http://api.prototypejs.org/language/Object/clone/
     * http://mootools.net/docs/core/Types/Object#Object:Object-clone
     * http://docs.angularjs.org/api/angular.copy
     */
    clone: function(object, deep /* = false */, desc /* = false */){
      return clone(object, deep, desc, [], []);
    },
    /**
     * Alternatives:
     * http://lodash.com/docs#merge
     * http://sugarjs.com/api/Object/merge
     * http://mootools.net/docs/core/Types/Object#Object:Object-merge
     * http://api.jquery.com/jQuery.extend/
     */
    merge: function(target, source, deep /* = false */, reverse /* = false */, desc /* = false */){
      return merge(target, source, deep, reverse, desc, [], []);
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#isObject
     * http://sugarjs.com/api/Object/isType
     * http://docs.angularjs.org/api/angular.isObject
     */
    isObject: isObject,
    symbol: symbol,
    hidden: hidden
  });
}();