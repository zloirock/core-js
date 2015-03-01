// ECMAScript 5 shim
!function(){
  var indexOf           = ArrayProto.indexOf
    , _classof          = classof
    , _defineProperty   = defineProperty
    , _getOwnDescriptor = getOwnDescriptor
    , IE_PROTO          = safeSymbol('__proto__')
    , IE8_DOM_DEFINE    = false;
  
  if(!DESC){
    try {
      IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
        {get: function(){return 8}}
      ).x == 8;
    } catch(e){}
    defineProperty = function(O, P, A){
      if(IE8_DOM_DEFINE)try {
        return _defineProperty(O, P, A);
      } catch(e){}
      if('get' in A || 'set' in A)throw TypeError('Accessors not supported!');
      if('value' in A)assert.obj(O)[P] = A.value;
      return O;
    };
    getOwnDescriptor = function(O, P){
      if(IE8_DOM_DEFINE)try {
        return _getOwnDescriptor(O, P);
      } catch(e){}
      if(has(O, P))return descriptor(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
    };
    defineProperties = function(O, Properties){
      assert.obj(O);
      var keys   = getKeys(Properties)
        , length = keys.length
        , i = 0
        , P;
      while(length > i)defineProperty(O, P = keys[i++], Properties[P]);
      return O;
    };
  }
  $define(STATIC + FORCED * !DESC, 'Object', {
    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: getOwnDescriptor,
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    defineProperty: defineProperty,
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
    defineProperties: defineProperties
  });
  
    // IE 8- don't enum bug keys
  var keys1 = array('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf')
    // Additional keys for getOwnPropertyNames
    , keys2 = keys1.concat('length', 'prototype')
    , keysLen1 = keys1.length;
  
  // Create object with `null` prototype: use iframe Object with cleared prototype
  function createDict(){
    // Thrash, waste and sodomy: IE GC bug
    var iframe = document.createElement('iframe')
      , i      = keysLen1
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
    while(i--)delete createDict.prototype[keys1[i]];
    return createDict();
  }
  function createGetKeys(names, length, isNames){
    return function(object){
      var O      = toObject(object)
        , i      = 0
        , result = []
        , key;
      for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
      // Don't enum bug & hidden keys
      while(length > i)if(has(O, key = names[i++])){
        ~indexOf.call(result, key) || result.push(key);
      }
      return result;
    }
  }
  function isPrimitive(it){ return !isObject(it) }
  function Empty(){}
  $define(STATIC, 'Object', {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
    getPrototypeOf: getPrototypeOf = getPrototypeOf || function(O){
      O = Object(assert.def(O));
      if(has(O, IE_PROTO))return O[IE_PROTO];
      if(isFunction(O.constructor) && O instanceof O.constructor){
        return O.constructor.prototype;
      } return O instanceof Object ? ObjectProto : null;
    },
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: getNames = getNames || createGetKeys(keys2, keys2.length, true),
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    create: create = create || function(O, /*?*/Properties){
      var result
      if(O !== null){
        Empty.prototype = assert.obj(O);
        result = new Empty();
        Empty.prototype = null;
        // add "__proto__" for Object.getPrototypeOf shim
        result[IE_PROTO] = O;
      } else result = createDict();
      return Properties === undefined ? result : defineProperties(result, Properties);
    },
    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
    keys: getKeys = getKeys || createGetKeys(keys1, keysLen1, false),
    // 19.1.2.17 / 15.2.3.8 Object.seal(O)
    seal: returnIt, // <- cap
    // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
    freeze: returnIt, // <- cap
    // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
    preventExtensions: returnIt, // <- cap
    // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
    isSealed: isPrimitive, // <- cap
    // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
    isFrozen: isFrozen = isFrozen || isPrimitive, // <- cap
    // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
    isExtensible: isObject // <- cap
  });
  
  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
  $define(PROTO, 'Function', {
    bind: function(that /*, args... */){
      var fn       = assert.fn(this)
        , partArgs = ArrayProto.slice.call(arguments, 1);
      function bound(/* args... */){
        var args = partArgs.concat(ArrayProto.slice.call(arguments));
        return invoke(fn, args, this instanceof bound ? this : that);
      }
      bound.prototype = fn.prototype;
      return bound;
    }
  });
  
  // Fix for not array-like ES3 string
  function arrayMethodFix(fn){
    return function(){
      return fn.apply(ES5Object(this), arguments);
    }
  }
  if(!(0 in Object('z') && 'z'[0] == 'z')){
    ES5Object = function(it){
      return cof(it) == 'String' ? it.split('') : Object(it);
    }
  }
  $define(PROTO + FORCED * (ES5Object != Object), 'Array', {
    slice: arrayMethodFix(ArrayProto.slice),
    join: arrayMethodFix(ArrayProto.join)
  });
  
  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
  $define(STATIC, 'Array', {
    isArray: function(arg){
      return cof(arg) == 'Array'
    }
  });
  function createArrayReduce(isRight){
    return function(callbackfn, memo){
      assert.fn(callbackfn);
      var O      = toObject(this)
        , length = toLength(O.length)
        , index  = isRight ? length - 1 : 0
        , i      = isRight ? -1 : 1;
      if(2 > arguments.length)for(;;){
        if(index in O){
          memo = O[index];
          index += i;
          break;
        }
        index += i;
        assert(isRight ? index >= 0 : length > index, assert.REDUCE);
      }
      for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
        memo = callbackfn(memo, O[index], index, this);
      }
      return memo;
    }
  }
  $define(PROTO, 'Array', {
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: forEach = forEach || createArrayMethod(0),
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map: createArrayMethod(1),
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter: createArrayMethod(2),
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some: createArrayMethod(3),
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every: createArrayMethod(4),
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce: createArrayReduce(false),
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: createArrayReduce(true),
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: indexOf = indexOf || createArrayIncludes(false),
    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
    lastIndexOf: function(el, fromIndex /* = @[*-1] */){
      var O      = toObject(this)
        , length = toLength(O.length)
        , index  = length - 1;
      if(arguments.length > 1)index = min(index, toInteger(fromIndex));
      if(index < 0)index = toLength(length + index);
      for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
      return -1;
    }
  });
  
  // 21.1.3.25 / 15.5.4.20 String.prototype.trim()
  $define(PROTO, 'String', {trim: createReplacer(/^\s*([\s\S]*\S)?\s*$/, '$1')});
  
  // 20.3.3.1 / 15.9.4.4 Date.now()
  $define(STATIC, 'Date', {now: function(){
    return +new Date;
  }});
  
  function lz(num){
    return num > 9 ? num : '0' + num;
  }
  // 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
  $define(PROTO, 'Date', {toISOString: function(){
    if(!isFinite(this))throw RangeError('Invalid time value');
    var d = this
      , y = d.getUTCFullYear()
      , m = d.getUTCMilliseconds()
      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  }});
  
  if(_classof(function(){return arguments}()) == 'Object')classof = function(it){
    var cof = _classof(it);
    return cof == 'Object' && isFunction(it.callee) ? 'Arguments' : cof;
  }
}();