/**
 * ECMAScript 5 shim
 * http://es5.github.io/
 * Alternatives:
 * https://github.com/es-shims/es5-shim
 * https://github.com/ddrcode/ddr-ecma5
 * http://augmentjs.com/
 * https://github.com/inexorabletash/polyfill/blob/master/es5.js
 */
!function(){
  var Empty       = Function()
    , _classof    = classof
    , whitespace  = '[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]'
    , trimRegExp  = RegExp('^' + whitespace + '+|' + whitespace + '+$', 'g')
    // For fix IE 8- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
    , slyKeys1    = array(TO_STRING + ',toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' + CONSTRUCTOR)
    , slyKeys2    = slyKeys1.concat(PROTOTYPE, 'length')
    , slyKeysLen1 = slyKeys1.length
    , $PROTO      = symbol(PROTOTYPE)
    // Create object with null prototype
    , createDict  = __PROTO__
      ? function(){
          return {__proto__: null};
        }
      : function(){
          // Thrash, waste and sodomy
          var iframe = document[CREATE_ELEMENT]('iframe')
            , i      = slyKeysLen1
            , iframeDocument;
          iframe.style.display = 'none';
          html.appendChild(iframe);
          iframe.src = 'javascript:';
          iframeDocument = iframe.contentWindow.document;
          iframeDocument.open();
          iframeDocument.write('<script>document.F=Object</script>');
          iframeDocument.close();
          createDict = iframeDocument.F;
          while(i--)delete createDict[PROTOTYPE][slyKeys1[i]];
          return createDict();
        }
    , createGetKeys = function(names, length){
        return function(_O){
          var O      = ES5Object(_O)
            , i      = 0
            , result = []
            , key;
          for(key in O)(key !== $PROTO) && has(O, key) && result.push(key);
          // Hidden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          while(length > i)has(O, key = names[i++]) && !~indexOf.call(result, key) && result.push(key);
          return result;
        }
      };
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  try {
    defineProperty({}, 0, $Object);
  } catch(e){
    DESCRIPTORS = false;
    getOwnDescriptor = function(O, P){
      if(has(O, P))return descriptor(6 + isEnumerable.call(O, P), O[P]);
    };
    defineProperty = function(O, P, Attributes){
      if('value' in Attributes)assertObject(O)[P] = Attributes.value;
      return O;
    };
    defineProperties = function(O, Properties){
      assertObject(O);
      var keys   = getKeys(Properties)
        , length = keys.length
        , i = 0
        , P, Attributes;
      while(length > i){
        P          = keys[i++];
        Attributes = Properties[P];
        if('value' in Attributes)O[P] = Attributes.value;
      }
      return O;
    };
  }
  $define(STATIC, OBJECT, {
    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: getOwnDescriptor,
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    defineProperty: defineProperty,
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
    defineProperties: defineProperties
  }, !DESCRIPTORS);
  $define(STATIC, OBJECT, {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O) 
    getPrototypeOf: getPrototypeOf = getPrototypeOf || function(O){
      assertObject(O);
      if(has(O, $PROTO))return O[$PROTO];
      if(__PROTO__ && '__proto__' in O)return O.__proto__;
      if(isFunction(O[CONSTRUCTOR]) && O != O[CONSTRUCTOR][PROTOTYPE])return O[CONSTRUCTOR][PROTOTYPE];
      if(O instanceof Object)return $Object;
      return null;
    },
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: getNames = getNames || createGetKeys(slyKeys2, slyKeys2.length),
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    create: create = create || function(O, /*?*/Properties){
      if(O === null)return Properties ? defineProperties(createDict(), Properties) : createDict();
      Empty[PROTOTYPE] = assertObject(O);
      var result = new Empty();
      Empty[PROTOTYPE] = null;
      if(Properties)defineProperties(result, Properties);
      // add __proto__ for Object.getPrototypeOf shim
      __PROTO__ || result[CONSTRUCTOR][PROTOTYPE] === O || (result[$PROTO] = O);
      return result;
    },
    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
    keys: getKeys = getKeys || createGetKeys(slyKeys1, slyKeysLen1)
  });
  
  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg [, arg1 [, arg2, …]]) 
  $define(PROTO, FUNCTION, {
    bind: function(scope /*, args... */){
      var fn   = this
        , args = slice.call(arguments, 1);
      assertFunction(fn);
      function bound(/* args... */){
        var _args = args.concat(slice.call(arguments))
          , result, that;
        if(this instanceof fn)return isObject(result = invoke(that = create(fn[PROTOTYPE]), _args, scope)) ? result : that;
        return apply.call(fn, scope, _args);
      }
      bound[PROTOTYPE] = undefined;
      return bound;
    }
  });
  
  // Fix for not array-like ES3 string
  function arrayMethodFix(fn){
    return function(){
      return fn.apply(ES5Object(this), arguments);
    }
  }
  if(!(0 in Object('q') && 'q'[0] == 'q')){
    ES5Object = function(it){
      return _classof(it) == STRING ? it.split('') : Object(it);
    }
    slice = arrayMethodFix(slice);
  }
  $define(PROTO, ARRAY, {
    slice: slice,
    join: arrayMethodFix($Array.join)
  }, ES5Object != Object);
  
  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
  $define(STATIC, ARRAY, {
    isArray: function(arg){
      return _classof(arg) == ARRAY
    }
  });
  $define(PROTO, ARRAY, {
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: indexOf = indexOf || function(searchElement, fromIndex /* = 0 */){
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = toInteger(fromIndex);
      if(index < 0)index += length;
      for(;length > index; index++)if(index in O){
        if(O[index] === searchElement)return index;
      }
      return -1;
    },
    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
    lastIndexOf: function(searchElement, fromIndex /* = @[*-1] */){
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = length - 1;
      if(arguments.length > 1)index = min(index, toInteger(fromIndex));
      if(index < 0)index = toLength(length + index);
      for(;index >= 0; index--)if(index in O){
        if(O[index] === searchElement)return index;
      }
      return -1;
    },
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every: function(callbackfn, thisArg /* = undefined */){
      var f      = optionalBind(callbackfn, thisArg)
        , O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = 0;
      for(;length > index; index++)if(index in O){
        if(!f(O[index], index, this))return false;
      }
      return true;
    },
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some: function(callbackfn, thisArg /* = undefined */){
      var f      = optionalBind(callbackfn, thisArg)
        , O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = 0;
      for(;length > index; index++)if(index in O){
        if(f(O[index], index, this))return true;
      }
      return false;
    },
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: forEach = forEach || function(callbackfn, thisArg /* = undefined */){
      var f      = optionalBind(callbackfn, thisArg)
        , O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = 0;
      for(;length > index; index++)index in O && f(O[index], index, this);
    },
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map: function(callbackfn, thisArg /* = undefined */){
      var f      = optionalBind(callbackfn, thisArg)
        , result = Array(toLength(this.length));
      forEach.call(this, function(val, key, that){
        result[key] = f(val, key, that);
      });
      return result;
    },
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter: function(callbackfn, thisArg /* = undefined */){
      var f      = optionalBind(callbackfn, thisArg)
        , result = [];
      forEach.call(this, function(val, key, that){
        f(val, key, that) && result.push(val);
      });
      return result;
    },
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce: function(callbackfn, memo /* = @.0 */){
      assertFunction(callbackfn);
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = 0;
      if(2 > arguments.length)for(;;){
        if(index in O){
          memo = O[index++];
          break;
        }
        assert(length > ++index, REDUCE_ERROR);
      }
      for(;length > index; index++)if(index in O){
        memo = callbackfn(memo, O[index], index, this);
      }
      return memo;
    },
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: function(callbackfn, memo /* = @[*-1] */){
      assertFunction(callbackfn);
      var O     = ES5Object(this)
        , index = toLength(O.length) - 1;
      if(2 > arguments.length)for(;;){
        if(index in O){
          memo = O[index--];
          break;
        }
        assert(0 <= --index, REDUCE_ERROR);
      }
      for(;index >= 0; index--)if(index in O){
        memo = callbackfn(memo, O[index], index, this);
      }
      return memo;
    }
  });
  
  // 21.1.3.25 / 15.5.4.20 String.prototype.trim()
  $define(PROTO, STRING, {trim: function(){
    return String(this).replace(trimRegExp, '');
  }});
  
  // 20.3.3.1 / 15.9.4.4 Date.now()
  $define(STATIC, DATE, {now: function(){
    return +new Date;
  }});
  
  if(isFunction(trimRegExp))isFunction = function(it){
    return _classof(it) == FUNCTION;
  }
  if(_classof(function(){return arguments}()) == OBJECT)classof = function(it){
    var cof = _classof(it);
    return cof == OBJECT && isFunction(it.callee) ? ARGUMENTS : cof;
  }
}();