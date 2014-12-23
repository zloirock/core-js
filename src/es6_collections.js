// ECMAScript 6 collections shim
!function(){
  var DATA     = safeSymbol('data')
    , UID      = safeSymbol('uid')
    , LAST     = safeSymbol('last')
    , FIRST    = safeSymbol('first')
    , WEAKDATA = safeSymbol('weakData')
    , WEAKID   = safeSymbol('weakId')
    , SIZE     = DESC ? safeSymbol('size') : 'size'
    , uid      = 0
    , wid      = 0;
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      framework && hidden(proto, key, function(a, b){
        var result = method.call(this, same(a, -0) ? 0 : a, b);
        return chain ? this : result;
      });
    }
    if(BUGGY_ITERATORS || !(isNative(C) && (isWeak || (has(proto, FOR_EACH) && has(proto, 'entries'))))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, WEAKID, wid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, DATA, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(!NATIVE_ITERATORS || !C.length){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        if(same(key, -0))buggyZero = true;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
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
    if(!has(it, UID)){
      if(create)hidden(it, UID, ++uid);
      else return '';
    }
    // return object id with 'O' prefix
    return 'O' + it[UID];
  }
  
  function def(that, key, value){
    var index  = fastKey(key, true)
      , values = that[DATA]
      , last   = that[LAST]
      , entry;
    if(index in values)values[index].v = value;
    else {
      entry = values[index] = {k: key, v: value, p: last};
      if(!that[FIRST])that[FIRST] = entry;
      if(last)last.n = entry;
      that[LAST] = entry;
      that[SIZE]++;
    } return that;
  }
  function del(that, keys, index){
    var entry = keys[index]
      , next  = entry.n
      , prev  = entry.p;
    delete keys[index];
    entry.r = true;
    if(prev)prev.n = next;
    if(next)next.p = prev;
    if(that[FIRST] == entry)that[FIRST] = next;
    if(that[LAST] == entry)that[LAST] = prev;
    that[SIZE]--;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      var keys = this[DATA], index;
      for(index in keys)del(this, keys, index);
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var keys     = this[DATA]
        , index    = fastKey(key)
        , contains = index in keys;
      if(contains)del(this, keys, index);
      return contains;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn, that /* = undefined */){
      var f = ctx(callbackfn, that, 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return fastKey(key) in this[DATA];
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = this[DATA][fastKey(key)];
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, same(key, -0) ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      value = same(value, -0) ? 0 : value;
      return def(this, value, value);
    }
  }, collectionMethods);
  
  function getWeakData(it){
    has(it, WEAKDATA) || hidden(it, WEAKDATA, {});
    return it[WEAKDATA];
  }
  function weakCollectionHas(key){
    return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
  }
  var weakCollectionMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      return weakCollectionHas.call(this, key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: weakCollectionHas
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key) && has(key, WEAKDATA))return key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
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
  
  function defineCollectionIterators(C, NAME, DEFAULT){
    // 23.2.5.1 CreateSetIterator Abstract Operation
    // 23.1.5.1 CreateMapIterator Abstract Operation
    defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    // 23.1.5.2.1 %MapIteratorPrototype%.next()
    // 23.2.5.2.1 %SetIteratorPrototype%.next()
    }, function(){
      var iter  = this[ITER]
        , O     = iter.o
        , entry = iter.l;
      while(entry && entry.r)entry = entry.p;
      if(!O || !(iter.l = entry = entry ? entry.n : O[FIRST]))return (iter.o = undefined), iterResult(1);
      switch(iter.k){
        case KEY:   return iterResult(0, entry.k);
        case VALUE: return iterResult(0, entry.v);
      }             return iterResult(0, [entry.k, entry.v]);
    }, DEFAULT);
  }
  // 23.1.3.4 Map.prototype.entries()
  // 23.1.3.8 Map.prototype.keys()
  // 23.1.3.11 Map.prototype.values()
  // 23.1.3.12 Map.prototype[@@iterator]()
  defineCollectionIterators(Map, MAP, KEY+VALUE);
  // 23.2.3.5 Set.prototype.entries()
  // 23.2.3.8 Set.prototype.keys()
  // 23.2.3.10 Set.prototype.values()
  // 23.2.3.11 Set.prototype[@@iterator]()
  defineCollectionIterators(Set, SET, VALUE);
}();