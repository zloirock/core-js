!function(KEY, VALUE, ITERATED, KIND, INDEX, KEYS, returnThis, Iterators){
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorClass(Constructor, NAME, Base, next, DEFAULT){
    Constructor[PROTOTYPE] = {};
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next( )
    // 23.1.5.2.1 %MapIteratorPrototype%.next ( )
    // 23.2.5.2.1 %SetIteratorPrototype%.next ( )
    hidden(Constructor[PROTOTYPE], 'next', next);
    // 22.1.5.2.2 %ArrayIteratorPrototype% [ @@iterator ] ( )
    // 23.1.5.2.2 %MapIteratorPrototype% [ @@iterator ] ( )
    // 23.2.5.2.2 %SetIteratorPrototype% [ @@iterator ] ( )
    hidden(Constructor[PROTOTYPE], ITERATOR, returnThis);
    // 22.1.5.2.3 %ArrayIteratorPrototype% [ @@toStringTag ]
    // 23.1.5.2.3 %MapIteratorPrototype% [ @@toStringTag ]
    // 23.2.5.2.3 %SetIteratorPrototype% [ @@toStringTag ]
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
      Iterators[NAME] = createIteratorFactory(Constructor, DEFAULT);
      if(framework)defineIterator(Base[PROTOTYPE], Iterators[NAME]);
    }
  }
  function createIteratorFactory(Constructor, kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  function defineIterator(object, value){
    has(object, ITERATOR) || hidden(object, ITERATOR, value);
  }
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function ArrayIterator(iterated, kind){
    this[ITERATED] = ES5Object(iterated);
    this[KIND]     = kind;
    this[INDEX]    = 0;
  }
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next( )
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
  if(framework)defineIterator(String[PROTOTYPE], Iterators[ARRAY]);
  Iterators[ARGUMENTS] = Iterators[STRING] = Iterators[ARRAY];
  // Old v8 fix
  Iterators[ARRAY + ' Iterator'] = returnThis;
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  function MapIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
    iterated.forEach(function(val, key){
      this.push(key);
    }, this[KEYS] = []);
  }
  // 23.1.5.2.1 %MapIteratorPrototype%.next ( )
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
    this[KIND]  = kind;
    this[INDEX] = 0;
    iterated.forEach(function(val){
      this.push(val);
    }, this[KEYS] = []);
  }
  // 23.2.5.2.1 %SetIteratorPrototype%.next ( )
  createIteratorClass(SetIterator, SET, Set, function(){
    var keys  = this[KEYS]
      , index = this[INDEX]++
      , key;
    if(index >= keys.length)   return createIterResultObject(undefined, 1);
    key = keys[index];
    if(this[KIND] != KEY+VALUE)return createIterResultObject(key, 0);
                               return createIterResultObject([key, key], 0);
  }, VALUE);
  
  function ObjectIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KEYS]     = getKeys(iterated);
    this[INDEX]    = 0;
    this[KIND]     = kind;
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
  
  C.isIterable = isIterable = function(it){
    return it != undefined && ITERATOR in it ? true : has(Iterators, classof(it));
  }
  C.getIterator = getIterator = function(it){
    return assertObject((it[ITERATOR] || Iterators[classof(it)]).call(it));
  }
  C.forOf = forOf = function(it, fn, entries){
    var that     = this === Export ? undefined : this
      , iterator = getIterator(it)
      , step;
    while(!(step = iterator.next()).done){
      if((entries ? fn.apply(that, ES5Object(step.value)) : fn.call(that, step.value)) === false)return;
    }
  }
}(1, 2, symbol('iterated'), symbol('kind'), symbol('index'), symbol('keys'), Function('return this'), {});