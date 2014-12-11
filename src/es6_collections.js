// ECMAScript 6 collections shim
!function(){
  var KEYS     = COLLECTION_KEYS = symbol('keys')
    , VALUES   = symbol('values')
    , STOREID  = symbol('storeId')
    , WEAKDATA = symbol('weakData')
    , WEAKID   = symbol('weakId')
    , SIZE     = DESC ? symbol('size') : 'size'
    , uid      = 0
    , wid      = 0;
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER_KEY = isMap ? 'set' : 'add'
      , init      = commonMethods.clear
      , O         = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER_KEY], that);
      return that;
    }
    if(!(isNative(C) && (isWeak || has(C[PROTOTYPE], FOR_EACH)))){
      // create collection constructor
      C = function(iterable){
        assertInstance(this, C, NAME);
        isWeak ? hidden(this, WEAKID, wid++) : init.call(this);
        initFromIterable(this, iterable);
      }
      set(C, SHIM, true);
      assign(C[PROTOTYPE], methods, commonMethods);
      isWeak || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return this[SIZE];
      }});
    } else {
      var Native     = C
        , collection = new C
        , adder      = collection[ADDER_KEY]
        , buggyChaining, buggyZero;
      // wrap to init collections from iterable
      if(!(SYMBOL_ITERATOR in ArrayProto && C.length)){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = Native[PROTOTYPE];
      }
      buggyChaining = collection[ADDER_KEY](isWeak ? {} : -0, 1) !== collection;
      isWeak || collection.forEach(function(val, key){
        if(same(key, -0))buggyZero = true;
      });
      // fix .add & .set for chaining & converting -0 key to +0
      if(framework && (buggyChaining || buggyZero)){
        hidden(C[PROTOTYPE], ADDER_KEY, function(a, b){
          adder.call(this, same(a, -0) ? 0 : a, b);
          return this;
        });
      }
    }
    setToStringTag(C, NAME);
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    return C;
  }
  
  function fastKey(it, create){
    // return it with 'S' prefix if it's string or with 'P' prefix for over primitives
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // if it hasn't object id - add next
    if(!has(it, STOREID)){
      if(create)hidden(it, STOREID, ++uid);
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
        hidden(this, SIZE, 0);
        hidden(this, KEYS, create(null));
        if($VALUES == VALUES)hidden(this, VALUES, create(null));
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
      forEach: function(callbackfn, that /* = undefined */){
        var f      = ctx(callbackfn, that, 3)
          , values = this[$VALUES]
          , keys   = this[KEYS]
          , done   = {}
          , k, index;
        do {
          for(index in keys){
            if(index in done)continue;
            done[index] = true;
            f(values[index], keys[index], this);
          }
        } while(index != undefined && index != (k = getKeys(keys))[k.length - 1]);
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return fastKey(key) in this[KEYS];
      }
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      return this[VALUES][fastKey(key)];
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      var index  = fastKey(key, true)
        , values = this[VALUES];
      if(!(index in values)){
        this[KEYS][index] = same(key, -0) ? 0 : key;
        this[SIZE]++;
      }
      values[index] = value;
      return this;
    }
  }, collectionMethods(VALUES), true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      var index  = fastKey(value, true)
        , values = this[KEYS];
      if(!(index in values)){
        values[index] = same(value, -0) ? 0 : value;
        this[SIZE]++;
      }
      return this;
    }
  }, collectionMethods(KEYS));
  
  function getWeakData(it){
    has(it, WEAKDATA) || hidden(it, WEAKDATA, {});
    return it[WEAKDATA];
  }
  function weakCollectionHas(key){
    return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
  }
  var weakCollectionMethods = {
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
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.4 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key) && has(key, WEAKDATA))return key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.6 WeakMap.prototype.set(key, value)
    set: function(key, value){
      getWeakData(assertObject(key))[this[WEAKID]] = value;
      return this;
    }
  }, weakCollectionMethods, true, true);
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      getWeakData(assertObject(value))[this[WEAKID]] = true;
      return this;
    }
  }, weakCollectionMethods, false, true);
}();