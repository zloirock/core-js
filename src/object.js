!function(){
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
          deep && merge(target[key], source[key], 1, reverse, desc, stackA, stackB)    // if not deep - skip
        }
        else if(desc){
          targetDescriptor = getOwnPropertyDescriptor(target, key) || $Object;
          if(targetDescriptor.configurable !== false && delete target[key]){
            sourceDescriptor = getOwnPropertyDescriptor(source, key);
            if(deep && !sourceDescriptor.get && !sourceDescriptor.set){
              sourceDescriptor.value =
                merge(clone(sourceDescriptor.value, 1, 1, stackA, stackB),
                  targetDescriptor.value, 1, 1, 1, stackA, stackB);
            }
            defineProperty(target, key, sourceDescriptor)
          }
        }
        else target[key] = deep
          ? merge(clone(source[key], 1, 0, stackA, stackB), target[key], 1, 1, 0, stackA, stackB)
          : source[key]
      }
    }
    return target
  }
  /**
   * http://wiki.ecmascript.org/doku.php?id=strawman:structured_clone
   * https://github.com/dslomov-chromium/ecmascript-structured-clone
   */
  function clone(object, deep /* = false */, desc /* = false */, stackA, stackB){
    if(!isObject(object))return object;
    stackA || (stackA = []);
    stackB || (stackB = []);
    var already = stackA[indexOf](object)
      , F       = object.constructor
      , result;
    if(~already)return stackB[already];
    switch(classof(object)){
      case 'Arguments' :
      case 'Array'     :
        result = Array(object.length);
        break;
      case 'Function'  :
        return object;
      case 'RegExp'    :
        result = RegExp(object.source, getRegExpFlags.call(object));
        break;
      case 'String'    :
        return new F(object);
      case 'Boolean'   :
      case 'Date'      :
      case 'Number'    :
        result = new F(object.valueOf());
        break;
      /*
      case 'Set'       :
        result = new F;
        object.forEach(result.add, result);
        break;
      case 'Map'       :
        result = new F;
        object.forEach(function(val, key){
          result.set(key, val);
        });
        break;
      */
      default:
        result = create(getPrototypeOf(object))
    }
    stackA.push(object);
    stackB.push(result);
    return merge(result, object, deep, 0, desc, stackA, stackB)
  }
  function make(proto, props, simple /* = false */){
    return props ? (simple ? assign : mixin)(create(proto), props) : create(proto)
  }
  // Objects deep compare
  function deepEqual(a, b, StackA, StackB){
    if(same(a, b))return true;
    var type = classof(a)
      , length, keys, val;
    if(
      !isObject(a) || !isObject(b)
      || type != classof(b)
      || getPrototypeOf(a) != getPrototypeOf(b)
    )return false;
    StackA = isArray(StackA) ? StackA.concat([a]) : [a];
    StackB = isArray(StackB) ? StackB.concat([b]) : [b];
    switch(type){
      case'Boolean'   :
      case'String'    :
      case'Number'    : return a.valueOf() == b.valueOf();
      case'RegExp'    : return String(a) == String(b);
      case'Error'     : return a.message == b.message;/*
      case'Array'     :
      case'Arguments' :
        length = toLength(a.length);
        if(length != b.length)return false;
        while(length--){
          if(
            !(~StackA[indexOf](a[length]) && ~StackB[indexOf](b[length]))
            && !deepEqual(a[length], b[length], StackA, StackB)
          )return false;
        }
        return true*/
    }
    keys = getOwnPropertyNames(a);
    length = keys.length;
    if(length != getOwnPropertyNames(b).length)return false;
    while(length--){
      if(
        !(~StackA[indexOf](a[val = keys[length]]) && ~StackB[indexOf](b[val]))
        && !deepEqual(a[val], b[val], StackA, StackB)
      )return false
    }
    return true
  }
  function forOwnKeys(object, fn, that /* = undefined */){
    var O      = arrayLikeSelf(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i)fn.call(that, O[key = props[i++]], key, object);
    return object
  }
  function findIndex(object, fn, that /* = undefined */){
    var O      = arrayLikeSelf(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i){
      if(fn.call(that, O[key = props[i++]], key, object))return key
    }
  }
  extendBuiltInObject(Object, {
    has: has,
    isEnumerable: isEnumerable,
    isPrototype: $unbind($Object.isPrototypeOf),
    classof: classof,
    bind: function(object, key){
      var args = toArray(arguments);
      args.splice(1, 1);
      return $Function.bind.apply(object[key], args)
    },
    // Extended object api from harmony and strawman :
    // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
    getPropertyDescriptor: getPropertyDescriptor,
    // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
    getOwnPropertyDescriptors: getOwnPropertyDescriptors,
    // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
    getPropertyDescriptors: function(object){
      var result = getOwnPropertyDescriptors(object)
        , i, length, names, key;
      while(object = getPrototypeOf(object)){
        names  = getOwnPropertyNames(object);
        i      = 0;
        length = names.length;
        while(length > i){
          if(!has(result, key = names[i++])){
            result[key] = getOwnPropertyDescriptor(object, key);
          }
        }
      }
      return result
    },
    // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
    getPropertyNames: function(object){
      var result = getOwnPropertyNames(object)
        , i, length, names, key;
      while(object = getPrototypeOf(object)){
        i      = 0;
        names  = getOwnPropertyNames(object);
        length = names.length;
        while(length > i)~result[indexOf](key = names[i++]) || result.push(key)
      }
      return result
    },
    // Shugar for Object.create
    make: make,
    // Shugar for Object.make(null[, props, simple])
    plane: function(props, simple /* = false */){
      return make(null, props, simple)
    },
    clone: clone,
    merge: merge,
    // Shugar for Object.merge(target, props, 1, 1)
    defaults: function(target, props){
      return merge(target, props, 1, 1)
    },
    // {a: b} -> [b]
    values: function(object){
      var props  = keys(object)
        , length = props.length
        , result = Array(length)
        , i      = 0;
      while(length > i)result[i] = object[props[i++]];
      return result
    },
    // {a: b} -> {b: a}
    invert: invert,
    // Enumerable
    every: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(!fn.call(that, O[key = props[i++]], key, object))return false;
      }
      return true
    },
    filter: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , result = {}
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))result[key] = O[key];
      }
      return result
    },
    find: function(object, fn, that /* = undefined */){
      var index = findIndex(object, fn, that);
      return index === undefined ? undefined : object[index];
    },
    findIndex: findIndex,
    forEach: forOwnKeys,
    indexOf: function(object, searchElement){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = props[i++]],searchElement))return key
    },
    map: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , result = {}
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        result[key = props[i++]] = fn.call(that, O[key], key, object);
      }
      return result
    },
    reduce: function(object, fn, result /* = undefined */, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , i      = 0
        , length = props.length
        , key;
      if(arguments.length < 3){
        if(!length--)throw TypeError(REDUCE_ERROR);
        result = O[props.shift()];
      }
      while(length > i){
        result = fn.call(that, result, O[key = props[i++]], key, object);
      }
      return result
    },
    some: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))return true;
      }
      return false
    },
    props: function(object, prop){
      object = arrayLikeSelf(object);
      var names  = keys(object)
        , result = {}
        , length = names.length
        , i      = 0
        , key, val;
      while(length > i){
        key = names[i++];
        val = object[key];
        result[key] = val == undefined ? undefined : val[prop]
      }
      return result
    },
    reduceTo: function(object, fn, target){
      target = Object(target);
      forOwnKeys(object, fn, target);
      return target;
    },
    deepEqual: deepEqual,
    isObject: isObject,
    isUndefined: function(it){
      return it === undefined
    },
    isNull     : function(it){
      return it === null
    },
    isNumber   : function(it){
      return toString(it) == '[object Number]'
    },
    isString   : isString,
    isBoolean  : function(it){
      return it === !!it || toString(it) == '[object Boolean]'
    },
    isArray    : isArray,
    isFunction : isFunction,
    isRegExp   : function(it){
      return toString(it) == '[object RegExp]'
    },
    isDate     : function(it){
      return toString(it) == '[object Date]'
    },
    isError    : function(it){
      return toString(it) == '[object Error]'
    }
  });
}();