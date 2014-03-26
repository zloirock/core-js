!function(){
  var KEY      = 1
    , VALUE    = 2
    , ITERATED = symbol('iterated')
    , KIND     = symbol('kind')
    , INDEX    = symbol('index')
    , KEYS     = symbol('keys')
    , returnThis = Function('return this');
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorFactory(constructor, kind){
    return function(){
      return new constructor(this, kind);
    }
  }
  
  function StringIterator(iterated){
    this[ITERATED] = iterated;
    this[INDEX]    = 0;
  }
  StringIterator[PROTOTYPE] = {
    next: function(){
      var iterated = this[ITERATED]
        , index    = this[INDEX]++;
      return index < iterated.length
        ? createIterResultObject(iterated.charAt(index), 0)
        : createIterResultObject(undefined, 1);
    }
  };
  
  function ArrayIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
  }
  ArrayIterator[PROTOTYPE] = {
    next: function(){
      var that     = this
        , iterated = that[ITERATED]
        , index    = that[INDEX]++;
      if(index >= iterated.length)return createIterResultObject(undefined, 1);
      switch(that[KIND]){
        case KEY   : return createIterResultObject(index, 0);
        case VALUE : return createIterResultObject(iterated[index], 0);
      }
      return createIterResultObject([index, iterated[index]], 0);
    }
  };
  
  function MapIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
    iterated.forEach(function(val, key){
      this.push(key);
    }, this[KEYS] = []);
  }
  MapIterator[PROTOTYPE] = {
    next: function(){
      var iterated = this[ITERATED]
        , keys     = this[KEYS]
        , index    = this[INDEX]++
        , key;
      if(index >= keys.length)return createIterResultObject(undefined, 1);
      key = keys[index];
      switch(this[KIND]){
        case KEY   : return createIterResultObject(key, 0);
        case VALUE : return createIterResultObject(iterated.get(key), 0);
      }
      return createIterResultObject([key, iterated.get(key)], 0);
    }
  };
  
  function SetIterator(iterated, kind){
    this[KIND]  = kind;
    this[INDEX] = 0;
    iterated.forEach(function(val){
      this.push(val);
    }, this[KEYS] = []);
  }
  SetIterator[PROTOTYPE] = {
    next: function(){
      var keys  = this[KEYS]
        , index = this[INDEX]++
        , key;
      if(index >= keys.length)return createIterResultObject(undefined, 1);
      key = keys[index];
      if(this[KIND] == VALUE)return createIterResultObject(key, 0);
      return createIterResultObject([key, key], 0);
    }
  };
  
  function ObjectIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KEYS]     = keys(iterated);
    this[INDEX]    = 0;
    this[KIND]     = kind;
  }
  ObjectIterator[PROTOTYPE] = {
    next: function(){
      var index  = this[INDEX]++
        , object = this[ITERATED]
        , keys   = this[KEYS]
        , key;
      if(index >= keys.length)return createIterResultObject(undefined, 1);
      key = keys[index];
      switch(this[KIND]){
        case KEY   : return createIterResultObject(key, 0);
        case VALUE : return createIterResultObject(object[key], 0);
      }
      return createIterResultObject([key, object[key]], 0);
    }
  }
  
  StringIterator[PROTOTYPE][ITERATOR] = ArrayIterator[PROTOTYPE][ITERATOR] =
    MapIterator[PROTOTYPE][ITERATOR] = SetIterator[PROTOTYPE][ITERATOR] =
      ObjectIterator[PROTOTYPE][ITERATOR] = returnThis;
  
  function defineIterator(object, value){
    ITERATOR in object || hidden(object, ITERATOR, value);
  }
  
  isIterable = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return true;
    // plug for library
    switch(it && it.constructor){
      case String: case Array: case Map: case Set:
        return true;
    }
    return false;
  }
  getIterator = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return it[ITERATOR]();
    // plug for library
    switch(it && it.constructor){
      case String : return new StringIterator(it);
      case Array  : return new ArrayIterator(it, VALUE);
      case Map    : return new MapIterator(it, KEY+VALUE);
      case Set    : return new SetIterator(it, VALUE);
    }
    throw TypeError(it + ' is not iterable!');
  }
  forOf = function(it, fn, that){
    var iterator = getIterator(it), step;
    while(!(step = iterator.next()).done)if(fn.call(that, step.value) === _)return;
  }
  
  // v8 fix
  framework && isFunction($Array.keys) && defineIterator(getPrototypeOf([].keys()), returnThis);
  
  $define(PROTO, ARRAY, {
    // 22.1.3.4 Array.prototype.entries()
    entries: createIteratorFactory(ArrayIterator, KEY+VALUE),
    // 22.1.3.13 Array.prototype.keys()
    keys: createIteratorFactory(ArrayIterator, KEY),
    // 22.1.3.29 Array.prototype.values()
    values: createIteratorFactory(ArrayIterator, VALUE)
  });
  $define(PROTO, MAP, {
    // 23.1.3.4 Map.prototype.entries()
    entries: createIteratorFactory(MapIterator, KEY+VALUE),
    // 23.1.3.8 Map.prototype.keys()
    keys: createIteratorFactory(MapIterator, KEY),
    // 23.1.3.11 Map.prototype.values()
    values: createIteratorFactory(MapIterator, VALUE)
  });
  $define(PROTO, SET, {
    // 23.2.3.5 Set.prototype.entries()
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    // 23.2.3.8 Set.prototype.keys()
    keys: createIteratorFactory(SetIterator, VALUE),
    // 23.2.3.10 Set.prototype.values()
    values: createIteratorFactory(SetIterator, VALUE)
  });
  
  if(framework){
    // 21.1.3.27 String.prototype[@@iterator]()
    defineIterator(String[PROTOTYPE], createIteratorFactory(StringIterator));
    // 22.1.3.30 Array.prototype[@@iterator]()
    defineIterator($Array, $Array.values);
    // 23.1.3.12 Map.prototype[@@iterator]()
    defineIterator(Map[PROTOTYPE], createIteratorFactory(MapIterator, KEY+VALUE));
    // 23.2.3.11 Set.prototype[@@iterator]()
    defineIterator(Set[PROTOTYPE], createIteratorFactory(SetIterator, VALUE));
  }
  
  function createObjectIteratorFactory(kind){
    return function(it){
      return new ObjectIterator(it, kind);
    }
  }
  objectIterators = {
    keys: createObjectIteratorFactory(KEY),
    values: createObjectIteratorFactory(VALUE),
    entries: createObjectIteratorFactory(KEY+VALUE)
  }
  
  $define(GLOBAL, {forOf: forOf});
}();