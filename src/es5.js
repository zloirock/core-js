!function(){
  // not enum keys
  var Empty             = Function()
    , LTrimRegExp       = RegExp(LTrim)
    , RTrimRegExp       = RegExp(RTrim)
    // for fix IE 9- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute
    , hidenNames1       = splitComma(toString + ',toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,constructor')
    , hidenNames2       = hidenNames1.concat(['length'])
    , hidenNames1Length = hidenNames1.length
    , nativeSlice       = slice
    , nativeJoin        = $Array.join
    // Create object with null as it's prototype
    , createNullProtoObject = protoInObject()
      ? function(){
          return {__proto__: null}
        }
      : function(){
          // Thrash, waste and sodomy
          var iframe = document.createElement('iframe')
            , i      = hidenNames1Length
            , body   = document.body || document.documentElement
            , iframeDocument;
          iframe.style.display = 'none';
          body.appendChild(iframe);
          iframe.src = 'javascript:';
          iframeDocument = iframe.contentWindow.document || iframe.contentDocument || iframe.document;
          iframeDocument.open();
          iframeDocument.write('<script>document._=Object</script>');
          iframeDocument.close();
          createNullProtoObject = iframeDocument._;
          // body.removeChild(iframe);
          while(i--)delete createNullProtoObject[prototype][hidenNames1[i]];
          return createNullProtoObject()
        }
    , createGetKeys = function(names, length){
        return function(O){
          var i      = 0
            , result = []
            , key;
          for(key in O)has(O, key) && result.push(key);
          // hiden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          while(length > i)has(O, key = names[i++]) && !~result[indexOf](key) && result.push(key);
          return result
        }
      }
    // The engine has a guaranteed way to get a prototype?
    , $PROTO = !!Object.getPrototypeOf || protoInObject();
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  try {
    defineProperty({}, 0, $Object);
    $DESC = true;
  }
  catch(e){
    $DESC = false;
    /**
     * 15.2.3.3 Object.getOwnPropertyDescriptor ( O, P )
     * http://es5.github.io/#x15.2.3.3
     */
    Object.getOwnPropertyDescriptor = function(O, P){
      if(has(O, P))return descriptor(6 + isEnumerable(O, P), O[P])
    };
    /**
     * 15.2.3.6 Object.defineProperty ( O, P, Attributes )
     * http://es5.github.io/#x15.2.3.6
     */
    Object.defineProperty = defineProperty = function(O, P, Attributes){
      O[P] = Attributes.value;
      return O
    };
    /**
     * 15.2.3.7 Object.defineProperties ( O, Properties ) 
     * http://es5.github.io/#x15.2.3.7
     */
    Object.defineProperties = function(O, Properties){
      // IE 9- don't enum bug => Object.keys
      var names = keys(Properties)
        , length = names.length
        , i = 0
        , key;
      while(length > i)O[key = names[i++]] = Properties[key].value;
      return O
    }
  }
  extendBuiltInObject(Object, {
    /**
     * 15.2.3.2 Object.getPrototypeOf ( O ) 
     * http://es5.github.io/#x15.2.3.2
     */
    getPrototypeOf: function(O){
      var constructor
        , proto = O.__proto__ || ((constructor = O.constructor) ? constructor[prototype] : $Object);
      return O != proto && toString in O ? proto : null
    },
    /**
     * 15.2.3.4 Object.getOwnPropertyNames ( O )
     * http://es5.github.io/#x15.2.3.4
     */
    getOwnPropertyNames: createGetKeys(hidenNames2, hidenNames2.length),
    /**
     * 15.2.3.5 Object.create ( O [, Properties] )
     * http://es5.github.io/#x15.2.3.5
     */
    create: function(O, /*?*/Properties){
      if(O === null)return Properties ? defineProperties(createNullProtoObject(), Properties) : createNullProtoObject();
      if(!isObject(O))throw TypeError('Object prototype may only be an Object or null');
      Empty[prototype] = O;
      var result = new Empty();
      if(Properties)defineProperties(result, Properties);
      // add __proto__ for Object.getPrototypeOf shim
      $PROTO || result.constructor[prototype] == O || (result.__proto__ = O);
      return result
    },
    /**
     * 15.2.3.14 Object.keys ( O )
     * http://es5.github.io/#x15.2.3.14
     */
    keys: createGetKeys(hidenNames1, hidenNames1Length)
  });
  // not array-like strings fix
  if(!(0 in Object('q'))){
    arrayLikeSelf = function(it){
      return isString(it) ? it.split('') : Object(it)
    };
    // Array.prototype methods for strings in ES3
    $Array.slice = slice = function(){
      return nativeSlice.apply(arrayLikeSelf(this), arguments)
    };
    $Array.join = function(){
      return nativeJoin.apply(arrayLikeSelf(this), arguments)
    }
  }
  /**
   * 15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]]) 
   * http://es5.github.io/#x15.3.4.5
   */
  extendBuiltInObject($Function, {
    bind:function(scope /*, args...*/){
      var fn   = this
        , args = slice1(arguments);
      function bound(){
        return apply.call(fn, fn[prototype] && this instanceof fn ? this : scope, args.concat(toArray(arguments)))
      }
      bound[prototype] = fn[prototype];
      return bound
    }
  });
  /**
   * 15.4.3.2 Array.isArray ( arg )
   * http://es5.github.io/#x15.4.3.2
   */
  extendBuiltInObject(Array, {isArray: isArray});
  extendBuiltInObject($Array, {
    /**
     * 15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
     * http://es5.github.io/#x15.4.4.14
     */
    indexOf: function(searchElement, fromIndex /* = 0 */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = fromIndex | 0;
      if(0 > i)i = toLength(length + i);
      for(;length > i; i++)if(i in self && self[i] === searchElement)return i;
      return -1
    },
    /**
     * 15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
     * http://es5.github.io/#x15.4.4.15
     */
    lastIndexOf: function(searchElement, fromIndex /* = @[*-1] */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = length - 1;
      if(arguments.length > 1)i = min(i, fromIndex | 0);
      if(0 > i)i = toLength(length + i);
      for(; i >= 0; i--)if(i in self && self[i] === searchElement)return i;
      return -1
    },
    /**
     * 15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.16
     */
    every: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && !callbackfn.call(thisArg, self[i], i, this))return false;
      }
      return true
    },
    /**
     * 15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.17
     */
    some: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && callbackfn.call(thisArg, self[i], i, this))return true;
      }
      return false
    },
    /**
     * 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.18
     */
    forEach: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++)i in self && callbackfn.call(thisArg, self[i], i, this)
    },
    /**
     * 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.19
     */
    map: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , rez    = Array(length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self)rez[i] = callbackfn.call(thisArg, self[i], i, this);
      }
      return rez
    },
    /**
     * 15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.20
     */
    filter: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0
        , rez    = [];
      for(;length > i; i++){
        i in self
        && callbackfn.call(thisArg, self[i], i, this)
        && rez.push(self[i]);
      }
      return rez
    },
    /**
     * 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
     * http://es5.github.io/#x15.4.4.21
     */
    reduce: function(callbackfn, memo /* = @.1 */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      if(2 > arguments.length)while(true){
        if(i in self){
          memo = self[i++];
          break
        }
        if(length <= ++i)throw TypeError(REDUCE_ERROR)
      }
      for(;length > i; i++)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo
    },
    /**
     * 15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
     * http://es5.github.io/#x15.4.4.22
     */
    reduceRight: function(callbackfn, memo /* = @[*-1] */){
      var self = arrayLikeSelf(this)
        , i    = toLength(self.length) - 1;
      if(2 > arguments.length)while(true){
        if(i in self){
          memo = self[i--];
          break
        }
        if(0 > --i)throw TypeError(REDUCE_ERROR)
      }
      for(;i >= 0; i--)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo
    }
  });
  /**
   * 15.5.4.20 String.prototype.trim ( )
   * http://es5.github.io/#x15.5.4.20
   */
  extendBuiltInObject($String, {trim: function(){
    return String(this).replace(LTrimRegExp, '').replace(RTrimRegExp, '')
  }});
  /**
   * 15.9.4.4 Date.now ( )
   * http://es5.github.io/#x15.9.4.4
   */
  extendBuiltInObject(Date, {now: function(){
    return +new Date
  }});
  // IE isArguments fix
  isArguments(Function('return arguments')()) || (isArguments = function(it){
    return !!(it && isFunction(it.callee))
  });
}();