/**
 * ECMAScript 5 shim
 * http://es5.github.io/
 */
!function(){
  var Empty       = Function()
    , _classof    = classof
    , whitespace  = '[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]'
    // For fix IE 8- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
    , slyKeys1    = array(TO_STRING + ',toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' + CONSTRUCTOR)
    , slyKeys2    = slyKeys1.concat(PROTOTYPE, 'length')
    , slyKeysLen1 = slyKeys1.length
    , dontEnumBug = !isEnumerable.call({toString: undefined}, TO_STRING)
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
          // createDict = iframe.contentWindow.Object;
          // html.removeChild(iframe);
          iframeDocument = iframe.contentWindow.document;
          iframeDocument.open();
          iframeDocument.write('<script>document.F=Object</script>');
          iframeDocument.close();
          createDict = iframeDocument.F;
          while(i--)delete createDict[PROTOTYPE][slyKeys1[i]];
          return createDict();
        }
    , createGetKeys = function(names, length, isNames){
        return function(object){
          var O      = ES5Object(object)
            , i      = 0
            , result = []
            , key;
          for(key in O)(key !== $PROTO) && has(O, key) && result.push(key);
          // Hidden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          if(dontEnumBug || isNames)while(length > i)if(has(O, key = names[i++])){
            ~indexOf.call(result, key) || result.push(key);
          }
          return result;
        }
      };
  if(!DESCRIPTORS){
    getOwnDescriptor = function(O, P){
      if(has(O, P))return descriptor(!isEnumerable.call(O, P), O[P]);
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
  $define(STATIC + FORCED * !DESCRIPTORS, OBJECT, {
    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: getOwnDescriptor,
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    defineProperty: defineProperty,
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
    defineProperties: defineProperties
  });
  $define(STATIC, OBJECT, {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O) 
    getPrototypeOf: getPrototypeOf = getPrototypeOf || function(O){
      assertObject(O);
      if(has(O, $PROTO))return O[$PROTO];
      if(__PROTO__ && '__proto__' in O)return O.__proto__;
      if(isFunction(O[CONSTRUCTOR]) && O != O[CONSTRUCTOR][PROTOTYPE])return O[CONSTRUCTOR][PROTOTYPE];
      if(O instanceof Object)return ObjectProto;
      return null;
    },
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: getNames = getNames || createGetKeys(slyKeys2, slyKeys2.length, true),
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
    keys: getKeys = getKeys || createGetKeys(slyKeys1, slyKeysLen1, false)
  });
  
  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg [, arg1 [, arg2, …]]) 
  $define(PROTO, FUNCTION, {
    bind: function(that /*, args... */){
      var fn       = assertFunction(this)
        , partArgs = slice.call(arguments, 1);
      function bound(/* args... */){
        var args = partArgs.concat(slice.call(arguments));
        return this instanceof bound
          ? construct.call(fn, args)
          : invoke(fn, args, that);
      }
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
      return cof(it) == STRING ? it.split('') : Object(it);
    }
    slice = arrayMethodFix(slice);
  }
  $define(PROTO + FORCED * (ES5Object != Object), ARRAY, {
    slice: slice,
    join: arrayMethodFix(ArrayProto.join)
  });
  
  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
  $define(STATIC, ARRAY, {
    isArray: function(arg){
      return cof(arg) == ARRAY
    }
  });
  function createArrayReduce(isRight){
    return function(callbackfn, memo /* = @.0 */){
      assertFunction(callbackfn);
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = isRight ? length - 1 : 0
        , inc    = isRight ? -1 : 1;
      if(2 > arguments.length)for(;;){
        if(index in O){
          memo = O[index];
          index += inc;
          break;
        }
        index += inc;
        assert(isRight ? index >= 0 : length > index, REDUCE_ERROR);
      }
      for(;isRight ? index >= 0 : length > index; index += inc)if(index in O){
        memo = callbackfn(memo, O[index], index, this);
      }
      return memo;
    }
  }
  $define(PROTO, ARRAY, {
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: forEach = forEach || createArrayMethod(0),
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map:         createArrayMethod(1),
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter:      createArrayMethod(2),
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some:        createArrayMethod(3),
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every:       createArrayMethod(4),
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce:      createArrayReduce(false),
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: createArrayReduce(true),
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: indexOf = indexOf || function(searchElement, fromIndex /* = 0 */){
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = toInteger(fromIndex);
      if(index < 0)index = max(length + index, 0);
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
    }
  });
  
  // 21.1.3.25 / 15.5.4.20 String.prototype.trim()
  $define(PROTO, STRING, {
    trim: createEscaper(RegExp('^' + whitespace + '+|' + whitespace + '+$', 'g'), '')
  });
  
  // 20.3.3.1 / 15.9.4.4 Date.now()
  $define(STATIC, DATE, {now: function(){
    return +new Date;
  }});
  
  if(isFunction(/./))isFunction = function(it){
    return cof(it) == FUNCTION;
  }
  if(_classof(function(){return arguments}()) == OBJECT)classof = function(it){
    var cof = _classof(it);
    return cof == OBJECT && isFunction(it.callee) ? ARGUMENTS : cof;
  }
}();