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
!function(){
  var STOREID  = symbol('storeid')
    , KEYS     = symbol('keys')
    , VALUES   = symbol('values')
    , WEAKDATA = symbol('weakdata')
    , WEAKID   = symbol('weakid')
    , SIZE     = DESCRIPTORS ? symbol('size') : 'size'
    , uid = 0
    , wid = 0
    , tmp = {}
    , sizeGetter = {size: {get: function(){
        return this[SIZE];
      }}};
  function initCollection(that, iterable, isSet){
    if(iterable != undefined)forOf && forOf(iterable, isSet ? that.add : that.set, that, !isSet);
    return that;
  }
  function createCollectionConstructor(name, isSet){
    function F(iterable){
      assertInstance(this, F, name);
      this.clear();
      initCollection(this, iterable, isSet);
    }
    return F;
  }
  function fixCollection(Base, name, isSet){
    var collection   = new Base([isSet ? tmp : [tmp, 1]])
      , initFromIter = collection.has(tmp)
      , key = isSet ? 'add' : 'set'
      , fn;
    // fix .add & .set for chaining
    if(framework && collection[key](tmp, 1) !== collection){
      fn = collection[key];
      hidden(Base[PROTOTYPE], key, function(){
        fn.apply(this, arguments);
        return this;
      });
    }
    if(initFromIter)return wrapGlobalConstructor(Base);
    // wrap to init collections from iterable
    function F(iterable){
      assertInstance(this, F, name);
      return initCollection(new Base, iterable, isSet);
    }
    F[PROTOTYPE] = Base[PROTOTYPE];
    return F;
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
      assertFunction(callbackfn);
      var values = this[VALUES]
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
    return fastKey(key) in this[VALUES];
  }
  function clearSet(){
    hidden(this, VALUES, create(null));
    hidden(this, SIZE, 0);
  }
  
  // 23.1 Map Objects
  if(!isFunction(Map) || !has(Map[PROTOTYPE], 'forEach')){
    Map = createCollectionConstructor(MAP);
    assign(Map[PROTOTYPE], {
      // 23.1.3.1 Map.prototype.clear()
      clear: function(){
        hidden(this, KEYS, create(null));
        clearSet.call(this);
      },
      // 23.1.3.3 Map.prototype.delete(key)
      'delete': function(key){
        var index    = fastKey(key)
          , values   = this[VALUES]
          , contains = index in values;
        if(contains){
          delete this[KEYS][index];
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: createForEach(KEYS),
      // 23.1.3.6 Map.prototype.get(key)
      get: function(key){
        return this[VALUES][fastKey(key)];
      },
      // 23.1.3.7 Map.prototype.has(key)
      has: collectionHas,
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function(key, value){
        var index  = fastKey(key, 1)
          , values = this[VALUES];
        if(!(index in values)){
          this[KEYS][index] = key;
          this[SIZE]++;
        }
        values[index] = value;
        return this;
      }
    });
    // 23.1.3.10 get Map.prototype.size
    defineProperties(Map[PROTOTYPE], sizeGetter);
  } else Map = fixCollection(Map, MAP);
  
  // 23.2 Set Objects
  if(!isFunction(Set) || !has(Set[PROTOTYPE], 'forEach')){
    Set = createCollectionConstructor(SET, 1);
    assign(Set[PROTOTYPE], {
      // 23.2.3.1 Set.prototype.add(value)
      add: function(value){
        var index  = fastKey(value, 1)
          , values = this[VALUES];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      },
      // 23.2.3.2 Set.prototype.clear()
      clear: clearSet,
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(value){
        var index    = fastKey(value)
          , values   = this[VALUES]
          , contains = index in values;
        if(contains){
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: createForEach(VALUES),
      // 23.2.3.7 Set.prototype.has(value)
      has: collectionHas
    });
    // 23.2.3.9 get Set.prototype.size
    defineProperties(Set[PROTOTYPE], sizeGetter);
  } else Set = fixCollection(Set, SET, 1);
  
  function getWeakData(it){
    return (has(it, WEAKDATA) ? it : defineProperty(it, WEAKDATA, {value: {}}))[WEAKDATA];
  }
  var weakCollectionMethods = {
    // 23.3.3.1 WeakMap.prototype.clear()
    // 23.4.3.2 WeakSet.prototype.clear()
    clear: function(){
      hidden(this, WEAKID, wid++);
    },
    // 23.3.3.3 WeakMap.prototype.delete(key)
    // 23.4.3.4 WeakSet.prototype.delete(value)
    'delete': function(key){
      return this.has(key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.has(key)
    // 23.4.3.5 WeakSet.prototype.has(value)
    has: function(key){
      return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
    }
  };
  
  // 23.3 WeakMap Objects
  if(!isFunction(WeakMap) || !has(WeakMap[PROTOTYPE], 'clear')){
    WeakMap = createCollectionConstructor(WEAKMAP);
    assign(WeakMap[PROTOTYPE], assign({
      // 23.3.3.4 WeakMap.prototype.get(key)
      get: function(key){
        return isObject(key) && has(key, WEAKDATA) ? key[WEAKDATA][this[WEAKID]] : undefined;
      },
      // 23.3.3.6 WeakMap.prototype.set(key, value)
      set: function(key, value){
        assertObject(key);
        getWeakData(key)[this[WEAKID]] = value;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakMap = fixCollection(WeakMap, WEAKMAP);
  
  // 23.4 WeakSet Objects
  if(!isFunction(WeakSet)){
    WeakSet = createCollectionConstructor(WEAKSET, 1);
    assign(WeakSet[PROTOTYPE], assign({
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function(value){
        assertObject(value);
        getWeakData(value)[this[WEAKID]] = true;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakSet = fixCollection(WeakSet, WEAKSET, 1);
  
  $define(GLOBAL, {
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet
  }, 1);
}();