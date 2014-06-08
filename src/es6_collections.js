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
  var KEYS     = COLLECTION_KEYS = symbol('keys')
    , VALUES   = symbol('values')
    , STOREID  = symbol('storeId')
    , WEAKDATA = symbol('weakData')
    , WEAKID   = symbol('weakId')
    , SIZE     = DESCRIPTORS ? symbol('size') : 'size'
    , uid = 0
    , wid = 0
    , tmp = {}
    , sizeGetter = {size: {get: function(){
        return this[SIZE];
      }}};
  function initCollection(that, iterable, isSet){
    if(iterable != undefined)forOf && forOf.call(that, iterable, isSet ? that.add : that.set, !isSet);
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
    // return it with 'S' prefix if it's string or with 'P' prefix for over primitives
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // if it hasn't object id - add next
    if(!has(it, STOREID)){
      if(create)defineProperty(it, STOREID, {value: ++uid});
      else return '';
    }
    // return object id with 'O' prefix
    return 'O' + it[STOREID];
  }

  function collectionMethods($VALUES){
    return {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function(){
        hidden(this, KEYS, create(null));
        if($VALUES == VALUES)hidden(this, VALUES, create(null));
        hidden(this, SIZE, 0);
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var index    = fastKey(key)
          , keys     = this[KEYS]
          , contains = index in keys;
        if(contains){
          delete keys[index];
          if($VALUES == VALUES)delete this[VALUES][index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function(callbackfn, thisArg /* = undefined */){
        assertFunction(callbackfn);
        var values = this[$VALUES]
          , keys   = this[KEYS]
          , names  = getKeys(keys)
          , length = names.length
          , i = 0
          , index;
        while(length > i){
          index = names[i++];
          callbackfn.call(thisArg, values[index], keys[index], this);
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return fastKey(key) in this[KEYS];
      }
    }
  }
  
  // 23.1 Map Objects
  if(!isFunction(Map) || !has(Map[PROTOTYPE], 'forEach')){
    SHIM_MAP = true;
    Map = createCollectionConstructor(MAP);
    assign(Map[PROTOTYPE], collectionMethods(VALUES), {
      // 23.1.3.6 Map.prototype.get(key)
      get: function(key){
        return this[VALUES][fastKey(key)];
      },
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
    SHIM_SET = true;
    Set = createCollectionConstructor(SET, 1);
    assign(Set[PROTOTYPE], collectionMethods(KEYS), {
      // 23.2.3.1 Set.prototype.add(value)
      add: function(value){
        var index  = fastKey(value, 1)
          , values = this[KEYS];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      }
    });
    // 23.2.3.9 get Set.prototype.size
    defineProperties(Set[PROTOTYPE], sizeGetter);
  } else Set = fixCollection(Set, SET, 1);
  
  function getWeakData(it){
    return (has(it, WEAKDATA) ? it : defineProperty(it, WEAKDATA, {value: {}}))[WEAKDATA];
  }
  function weakCollectionHas(key){
    return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
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
      return weakCollectionHas.call(this, key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.has(key)
    // 23.4.3.5 WeakSet.prototype.has(value)
    has: weakCollectionHas
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
        getWeakData(assertObject(key))[this[WEAKID]] = value;
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
        getWeakData(assertObject(value))[this[WEAKID]] = true;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakSet = fixCollection(WeakSet, WEAKSET, 1);
  
  setToStringTag(Map, MAP);
  setToStringTag(Set, SET);
  setToStringTag(WeakMap, WEAKMAP);
  setToStringTag(WeakSet, WEAKSET);
    
  $define(GLOBAL, {
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet
  }, 1);
}();