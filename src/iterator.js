!function(){
  var ITERATED = symbol('iterated')
    , KIND     = symbol('kind')
    , INDEX    = symbol('index')
    , KEYS     = symbol('keys')
    , returnThis = Function('return this')
    , stringIterators = {}
    , arrayIterators, mapIterators, setIterators;
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
  StringIterator[prototype].next = function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++;
    return index < iterated.length
      ? createIterResultObject(iterated.charAt(index), 0)
      : createIterResultObject(undefined, 1);
  }
  // 21.1.3.27 String.prototype[@@iterator]()
  stringIterators[ITERATOR] = createIteratorFactory(StringIterator);
  
  function ArrayIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
  }
  ArrayIterator[prototype].next = function(){
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
  arrayIterators = {
    // 22.1.3.4 Array.prototype.entries()
    entries: createIteratorFactory(ArrayIterator, KEY+VALUE),
    // 22.1.3.13 Array.prototype.keys()
    keys: createIteratorFactory(ArrayIterator, KEY),
    // 22.1.3.29 Array.prototype.values()
    values: createIteratorFactory(ArrayIterator, VALUE)
  };
  // 22.1.3.30 Array.prototype[@@iterator]()
  arrayIterators[ITERATOR] = createIteratorFactory(ArrayIterator, VALUE);
  
  function MapIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
    iterated.forEach(function(val, key){
      this.push(key);
    }, this[KEYS] = []);
  }
  MapIterator[prototype].next = function(){
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
  mapIterators = {
    // 23.1.3.4 Map.prototype.entries()
    entries: createIteratorFactory(MapIterator, KEY+VALUE),
    // 23.1.3.8 Map.prototype.keys()
    keys: createIteratorFactory(MapIterator, KEY),
    // 23.1.3.11 Map.prototype.values()
    values: createIteratorFactory(MapIterator, VALUE)
  }
  // 23.1.3.12 Map.prototype[@@iterator]()
  mapIterators[ITERATOR] = createIteratorFactory(MapIterator, KEY+VALUE);
  
  function SetIterator(iterated, kind){
    this[KIND]  = kind;
    this[INDEX] = 0;
    iterated.forEach(function(val){
      this.push(val);
    }, this[KEYS] = []);
  }
  SetIterator[prototype].next = function(){
    var keys  = this[KEYS]
      , index = this[INDEX]++
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(this[KIND] == VALUE)return createIterResultObject(key, 0);
    return createIterResultObject([key, key], 0);
  }
  setIterators = {
    // 23.2.3.5 Set.prototype.entries()
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    // 23.2.3.8 Set.prototype.keys()
    keys: createIteratorFactory(SetIterator, VALUE),
    // 23.2.3.10 Set.prototype.values()
    values: createIteratorFactory(SetIterator, VALUE)
  }
  // 23.2.3.11 Set.prototype[@@iterator]()
  setIterators[ITERATOR] = createIteratorFactory(SetIterator, VALUE);
  
  StringIterator[prototype][ITERATOR] = ArrayIterator[prototype][ITERATOR] = MapIterator[prototype][ITERATOR] = SetIterator[prototype][ITERATOR] = returnThis;
  
  $define(PROTO, 'String', stringIterators);
  $define(PROTO, 'Array', arrayIterators);
  $define(PROTO, 'Map', mapIterators);
  $define(PROTO, 'Set', setIterators);
  
  // v8 fix
  if(framework && isFunction($Array.keys)){
    var proto = getPrototypeOf([].keys());
    if(!(ITERATOR in proto))hidden(proto, ITERATOR, returnThis);
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
  
  _.forOf = forOf = function(it, fn, that){
    var iterator = getIterator(it)
      , step;
    while(!(step = iterator.next()).done)if(fn.call(that, step.value) === _)return;
  }
}();