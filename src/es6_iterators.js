!function(KEY, VALUE, ITERATED, KIND, INDEX, KEYS, ENTRIES, Iterators, returnThis, mapForEach, setForEach){
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorClass(Constructor, NAME, Base, next, DEFAULT){
    Constructor[PROTOTYPE] = {};
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    // 23.1.5.2.1 %MapIteratorPrototype%.next()
    // 23.2.5.2.1 %SetIteratorPrototype%.next()
    hidden(Constructor[PROTOTYPE], 'next', next);
    // 22.1.5.2.2 %ArrayIteratorPrototype%[@@iterator]()
    // 23.1.5.2.2 %MapIteratorPrototype%[@@iterator]()
    // 23.2.5.2.2 %SetIteratorPrototype%[@@iterator]()
    hidden(Constructor[PROTOTYPE], ITERATOR, returnThis);
    // 22.1.5.2.3 %ArrayIteratorPrototype%[@@toStringTag]
    // 23.1.5.2.3 %MapIteratorPrototype%[@@toStringTag]
    // 23.2.5.2.3 %SetIteratorPrototype%[@@toStringTag]
    setToStringTag(Constructor, NAME + ' Iterator');
    if(NAME != OBJECT){
      $define(PROTO, NAME, {
        // 22.1.3.4 Array.prototype.entries()
        // 23.1.3.4 Map.prototype.entries()
        // 23.2.3.5 Set.prototype.entries()
        entries: createIteratorFactory(Constructor, KEY+VALUE),
        // 22.1.3.13 Array.prototype.keys()
        // 23.1.3.8 Map.prototype.keys()
        // 23.2.3.8 Set.prototype.keys()
        keys:    createIteratorFactory(Constructor, KEY),
        // 22.1.3.29 Array.prototype.values()
        // 23.1.3.11 Map.prototype.values()
        // 23.2.3.10 Set.prototype.values()
        values:  createIteratorFactory(Constructor, VALUE)
      });
      // 22.1.3.30 Array.prototype[@@iterator]()
      // 23.1.3.12 Map.prototype[@@iterator]()
      // 23.2.3.11 Set.prototype[@@iterator]()
      defineIterator(Base[PROTOTYPE], NAME, createIteratorFactory(Constructor, DEFAULT));
    }
  }
  function createIteratorFactory(Constructor, kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  function defineIterator(object, NAME, value){
    Iterators[NAME] = value;
    framework && !has(object, ITERATOR) && hidden(object, ITERATOR, value);
  }
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function ArrayIterator(iterated, kind){
    hidden(this, ITERATED, ES5Object(iterated));
    hidden(this, KIND,     kind);
    hidden(this, INDEX,    0);
  }
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  createIteratorClass(ArrayIterator, ARRAY, Array, function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++
      , kind     = this[KIND];
    if(index >= iterated.length)return createIterResultObject(undefined, 1);
    if(kind == KEY)             return createIterResultObject(index, 0);
    if(kind == VALUE)           return createIterResultObject(iterated[index], 0);
                                return createIterResultObject([index, iterated[index]], 0);
  }, VALUE);
  
  // 21.1.3.27 String.prototype[@@iterator]() - SHAM, TODO
  defineIterator(String[PROTOTYPE], STRING, Iterators[ARRAY]);
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  // v8 fix
  Iterators[ARRAY + ' Iterator'] = returnThis;
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  function MapIterator(iterated, kind){
    var that = this, keys;
    if(SHIM_MAP)keys = getValues(iterated[COLLECTION_KEYS]);
    else mapForEach.call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    hidden(that, ITERATED, iterated);
    hidden(that, KIND,     kind);
    hidden(that, INDEX,    0);
    hidden(that, KEYS,     keys);
  }
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  createIteratorClass(MapIterator, MAP, Map, function(){
    var that     = this
      , iterated = that[ITERATED]
      , keys     = that[KEYS]
      , index    = that[INDEX]++
      , kind     = that[KIND]
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(kind == KEY)         return createIterResultObject(key, 0);
    if(kind == VALUE)       return createIterResultObject(iterated.get(key), 0);
                            return createIterResultObject([key, iterated.get(key)], 0);
  }, KEY+VALUE);
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  function SetIterator(iterated, kind){
    var keys;
    if(SHIM_SET)keys = getValues(iterated[COLLECTION_KEYS]);
    else setForEach.call(iterated, function(val){
      this.push(val);
    }, keys = []);
    hidden(this, KIND, kind);
    hidden(this, KEYS, keys.reverse());
  }
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  createIteratorClass(SetIterator, SET, Set, function(){
    var keys = this[KEYS]
      , key;
    if(!keys.length)           return createIterResultObject(undefined, 1);
    key = keys.pop();
    if(this[KIND] != KEY+VALUE)return createIterResultObject(key, 0);
                               return createIterResultObject([key, key], 0);
  }, VALUE);
  
  function ObjectIterator(iterated, kind){
    hidden(this, ITERATED, iterated);
    hidden(this, KEYS,     getKeys(iterated));
    hidden(this, INDEX,    0);
    hidden(this, KIND,     kind);
  }
  createIteratorClass(ObjectIterator, OBJECT, Object, function(){
    var that   = this
      , index  = that[INDEX]++
      , object = that[ITERATED]
      , keys   = that[KEYS]
      , kind   = that[KIND]
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(kind == KEY)         return createIterResultObject(key, 0);
    if(kind == VALUE)       return createIterResultObject(object[key], 0);
                            return createIterResultObject([key, object[key]], 0);
  });
  
  function createObjectIteratorFactory(kind){
    return function(it){
      return new ObjectIterator(it, kind);
    }
  }
  objectIterators = {
    keys:    createObjectIteratorFactory(KEY),
    values:  createObjectIteratorFactory(VALUE),
    entries: createObjectIteratorFactory(KEY+VALUE)
  }
    
  $for = function(iterable, entries){
    if(!(this instanceof $for))return new $for(iterable, entries);
    hidden(this, ITERATED, iterable);
    hidden(this, ENTRIES,  entries);
  }
  $for[PROTOTYPE].of = function(fn, that){
    var iterator = getIterator(this[ITERATED])
      , entries  = this[ENTRIES]
      , step, value;
    while(!(step = iterator.next()).done){
      value = step.value;
      if((entries ? fn.call(that, value[0], value[1]) : fn.call(that, value)) === false)return;
    }
  }
  
  $for.isIterable = isIterable = function(it){
    return (it != undefined && ITERATOR in it) || has(Iterators, classof(it));
  }
  $for.getIterator = getIterator = function(it){
    return assertObject((it[ITERATOR] || Iterators[classof(it)]).call(it));
  }
  
  $define(GLOBAL, {$for: $for});
}(1, 2, symbol('iterated'), symbol('kind'), symbol('index'), symbol('keys'), symbol('entries'), {}, Function('return this'), Map[PROTOTYPE][FOR_EACH], Set[PROTOTYPE][FOR_EACH]);