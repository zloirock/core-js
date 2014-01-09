!function(Map, Set){
  var sizeDesc = {
        'get': function(){
          return this._values.length;
        }
      };
  function setSize(foo){
    foo.size = foo._values.length;
  }
  /**
   * 23.1 Map Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects
   */
  if(!isNative(Map) || !has(Map[prototype], 'forEach')){
    global.Map = Map = function(iterable){
      var that = this;
      if(!(that instanceof Map))return new Map(iterable);
      that.clear();
      isArray(iterable) && iterable.forEach(function(val){
        that.set(val[0], val[1]);
      });
    }
    extendBuiltInObject(Map[prototype], {
      /**
       * 23.1.3.1 Map.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.1
       */
      clear: function(){
        defineProperties(this, {_keys: descriptor(4, []), _values: descriptor(4, [])});
        DESCRIPTORS || setSize(this);
      },
      /**
       * 23.1.3.3 Map.prototype.delete ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.3
       */
      'delete': function(key){
        var keys = this._keys
          , values = this._values
          , index = indexSame(keys, key);
        if(~index){
          keys.splice(index, 1);
          values.splice(index, 1);
          DESCRIPTORS || setSize(this);
          return true
        }
        return false
      },
      /**
       * 23.1.3.5 Map.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.5
       */
      forEach: function(callbackfn, thisArg /* = undefined */){
        var keys = this._keys
          , values = this._values
          , length = values.length
          , i = 0;
        while(length > i)callbackfn.call(thisArg, values[i], keys[i++], this)
      },
      /**
       * 23.1.3.6 Map.prototype.get ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.6
       */
      get: function(key){
        return this._values[indexSame(this._keys, key)]
      },
      /**
       * 23.1.3.7 Map.prototype.has ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.7
       */
      has: function(key){
        return !!~indexSame(this._keys, key)
      },
      /**
       * 23.1.3.9 Map.prototype.set ( key , value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.9
       */
      set: function(key, value){
        var keys = this._keys,
            values = this._values,
            index = indexSame(keys, key);
        if(!~index){
          keys.push(key);
          values.push(value);
          DESCRIPTORS || setSize(this);
        }
        else values[index] = value;
        return this
      }
    });
    DESCRIPTORS && defineProperty(Map[prototype], 'size', sizeDesc);
  }
  // IE 11 fix
  else if(!function(){try{return Map([[1,2]]).size==1}catch(e){}}()){
    global.Map = function(iterable){
      var that = new Map;
      isArray(iterable) && iterable.forEach(function(val){
        that.set(val[0], val[1]);
      });
      return that;
    }
    global.Map[prototype] = Map[prototype];
  }
  /**
   * 23.2 Set Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set-objects
   */
  if(!isNative(Set) || !has(Set[prototype], 'forEach')){
    global.Set = Set = function(iterable){
      if(!(this instanceof Set))return new Set(iterable);
      this.clear();
      isArray(iterable) && iterable.forEach(this.add, this);
    };
    extendBuiltInObject(Set[prototype], {
      /**
       * 23.2.3.1 Set.prototype.add (value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.1
       */
      add: function(value){
        var values = this._values;
        if(!~indexSame(values, value)){
          values.push(value);
          DESCRIPTORS || setSize(this);
        }
        return this
      },
      /**
       * 23.2.3.2 Set.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.2
       */
      clear: function(){
        defineProperty(this, '_values', descriptor(4, []));
        DESCRIPTORS || setSize(this);
      },
      /**
       * 23.2.3.4 Set.prototype.delete ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.4
       */
      'delete': function(value){
        var values = this._values
          , index = indexSame(values, value);
        if(~index){
          values.splice(index, 1);
          DESCRIPTORS || setSize(this);
          return true
        }
        return false
      },
      /**
       * 23.2.3.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.6
       */
      forEach: function(callbackfn, thisArg /* = undefined */){
        var values = this._values
          , length = values.length
          , i = 0
          , val;
        while(length > i)callbackfn.call(thisArg, val = values[i++], val, this)
      },
      /**
       * 23.2.3.7 Set.prototype.has ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.7
       */
      has: function(value){
        return !!~indexSame(this._values, value)
      }
    });
    DESCRIPTORS && defineProperty(Set[prototype], 'size', sizeDesc);
  }
  // IE 11 fix
  else if(!function(){try{return Set([1]).size==1}catch(e){}}()){
    global.Set = function(iterable){
      var that = new Set;
      isArray(iterable) && iterable.forEach(that.add, that);
      return that;
    }
    global.Set[prototype] = Set[prototype];
  }
}(global.Map, global.Set);