/**
 * ECMAScript 6 collection polyfill
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/Benvie/harmony-collections
 * https://github.com/eriwen/es6-map-shim
 * https://github.com/EliSnow/Blitz-Collections
 * https://github.com/montagejs/collections
 * https://github.com/Polymer/WeakMap/blob/master/weakmap.js
 */
!function(Map, Set, WeakMap, WeakSet){
  var STOREID      = hidden('storeid')
    , KEYS_STORE   = hidden('keys')
    , VALUES_STORE = hidden('values')
    , WEAKDATA     = hidden('weakdata')
    , WEAKID       = hidden('weakid')
    , SIZE         = DESCRIPTORS ? hidden('size') : 'size'
    , uid          = 0
    , wid          = 0
    , tmp          = {}
    , sizeGetter   = {
        size: {
          get: function(){
            return this[SIZE];
          }
        }
      };
  function createCollectionConstructor(key, isSet){
    function F(iterable){
      assertInstance(this, F, key);
      this.clear();
      isSet && isArray(iterable) && iterable.forEach(this.add, this);
    }
    return F;
  }
  // fix Set & WeakSet constructors for init array
  function fixCollectionConstructor(Base, key){
    function F(iterable){
      assertInstance(this, F, key);
      var that = new Base;
      isArray(iterable) && iterable.forEach(that.add, that);
      return that;
    }
    F[prototype] = Base[prototype];
    return F;
  }
  // fix .add & .set for chaining
  function fixAdd(Collection, key){
    var collection = new Collection;
    if(collection[key](tmp, 1) !== collection){
      var fn = collection[key];
      defineProperty(Collection[prototype], key, descriptor(6, function(){
        fn.apply(this, arguments);
        return this;
      }));
    }
  }
  function fastKey(it, create){
    return isObject(it)
      ? '_' + (has(it, STOREID)
        ? it[STOREID]
        : create ? defineProperty(it, STOREID, {value: uid++})[STOREID] : '')
      : typeof it == 'string' ? '$' + it : it;
  }
  function createForEach(key){
    return function(callbackfn, thisArg /* = undefined */){
      var values = this[VALUES_STORE]
        , keyz   = this[key]
        , names  = keys(keyz)
        , length = names.length
        , i = 0
        , index;
      while(length > i){
        index = names[i++];
        callbackfn.call(thisArg, values[index], keyz[index], this);
      }
    }
  }
  function collectionHas(key){
    return fastKey(key) in this[VALUES_STORE];
  }
  function clearSet(){
    defineProperty(this, VALUES_STORE, descriptor(6, create(null)));
    defineProperty(this, SIZE, descriptor(4, 0));
  }
  /**
   * 23.1 Map Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects
   */
  if(!isNative(Map) || !has(Map[prototype], 'forEach')){
    global.Map = Map = createCollectionConstructor('Map');
    extendBuiltInObject(Map[prototype], {
      /**
       * 23.1.3.1 Map.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.clear
       */
      clear: function(){
        defineProperty(this, KEYS_STORE, descriptor(6, create(null)));
        clearSet.call(this);
      },
      /**
       * 23.1.3.3 Map.prototype.delete ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.delete
       */
      'delete': function(key){
        var index    = fastKey(key)
          , values   = this[VALUES_STORE]
          , contains = index in values;
        if(contains){
          delete this[KEYS_STORE][index];
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      /**
       * 23.1.3.5 Map.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.foreach
       */
      forEach: createForEach(KEYS_STORE),
      /**
       * 23.1.3.6 Map.prototype.get ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.get
       */
      get: function(key){
        return this[VALUES_STORE][fastKey(key)];
      },
      /**
       * 23.1.3.7 Map.prototype.has ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.has
       */
      has: collectionHas,
      /**
       * 23.1.3.9 Map.prototype.set ( key , value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.set
       */
      set: function(key, value){
        var index  = fastKey(key, 1)
          , values = this[VALUES_STORE];
        if(!(index in values)){
          this[KEYS_STORE][index] = key;
          this[SIZE]++;
        }
        values[index] = value;
        return this;
      }
    });
    /**
     * 23.1.3.10 get Map.prototype.size
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-map.prototype.size
     */
    defineProperties(Map[prototype], sizeGetter);
  } else fixAdd(Map, 'set');
  /**
   * 23.2 Set Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set-objects
   */
  if(!isNative(Set) || !has(Set[prototype], 'forEach')){
    global.Set = Set = createCollectionConstructor('Set', 1);
    extendBuiltInObject(Set[prototype], {
      /**
       * 23.2.3.1 Set.prototype.add ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.add
       */
      add: function(value){
        var index  = fastKey(value, 1)
          , values = this[VALUES_STORE];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      },
      /**
       * 23.2.3.2 Set.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.clear
       */
      clear: clearSet,
      /**
       * 23.2.3.4 Set.prototype.delete ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.delete
       */
      'delete': function(value){
        var index    = fastKey(value)
          , values   = this[VALUES_STORE]
          , contains = index in values;
        if(contains){
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      /**
       * 23.2.3.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.foreach
       */
      forEach: createForEach(VALUES_STORE),
      /**
       * 23.2.3.7 Set.prototype.has ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.has
       */
      has: collectionHas
    });
    /**
     * 23.2.3.9 get Set.prototype.size
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-set.prototype.size
     */
    defineProperties(Set[prototype], sizeGetter);
  } else {
    // IE 11 fix
    if(new Set([1]).size != 1)global.Set = fixCollectionConstructor(Set, 'Set');
    fixAdd(Set, 'add');
  }
  function getWeakData(it){
    return (has(it, WEAKDATA) ? it : defineProperty(it, WEAKDATA, {value: {}}))[WEAKDATA];
  }
  var commonWeakCollection = {
    /**
     * 23.3.3.1 WeakMap.prototype.clear ()
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.clear
     * 23.4.3.2 WeakSet.prototype.clear ()
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.clear
     */
    clear: function(){
      defineProperty(this, WEAKID, descriptor(6, wid++));
    },
    /**
     * 23.3.3.3 WeakMap.prototype.delete ( key )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.delete
     * 23.4.3.4 WeakSet.prototype.delete ( value )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.delete
     */
    'delete': function(key){
      return this.has(key) && has(key, WEAKDATA) ? delete key[WEAKDATA][this[WEAKID]] : false;
    },
    /**
     * 23.3.3.5 WeakMap.prototype.has ( key )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.has
     * 23.4.3.5 WeakSet.prototype.has ( value )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.has
     */
    has: function(key){
      return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
    }
  };
  /**
   * 23.3 WeakMap Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap-objects
   */
  if(!isNative(WeakMap) || !has(WeakMap[prototype], 'clear')){
    global.WeakMap = WeakMap = createCollectionConstructor('WeakMap');
    extendBuiltInObject(WeakMap[prototype], assign({
      /**
       * 23.3.3.4 WeakMap.prototype.get ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.get
       */
      get: function(key){
        return isObject(key) && has(key, WEAKDATA) ? key[WEAKDATA][this[WEAKID]] : undefined;
      },
      /**
       * 23.3.3.6 WeakMap.prototype.set ( key , value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.set
       */
      set: function(key, value){
        assertObject(key);
        getWeakData(key)[this[WEAKID]] = value;
        return this;
      }
    }, commonWeakCollection));
  } else fixAdd(WeakMap, 'set');
  /**
   * 23.4 WeakSet Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset-objects
   */
  if(!isNative(WeakSet)){
    global.WeakSet = WeakSet = createCollectionConstructor('WeakSet', 1);
    extendBuiltInObject(WeakSet[prototype], assign({
      /**
       * 23.4.3.1 WeakSet.prototype.add (value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.add
       */
      add: function(value){
        assertObject(value);
        getWeakData(value)[this[WEAKID]] = true;
        return this;
      }
    }, commonWeakCollection));
  } else {
    // v8 fix
    if(!new WeakSet([tmp]).has(tmp))global.WeakSet = fixCollectionConstructor(WeakSet, 'WeakSet');
    fixAdd(WeakSet, 'add');
  }
}(global.Map, global.Set, global.WeakMap, global.WeakSet);