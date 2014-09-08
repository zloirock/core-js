!function($$ITERATOR){
  var FFITERATOR = $$ITERATOR in ArrayProto
    , KEY        = 1
    , VALUE      = 2
    , ITERATED   = symbol('iterated')
    , KIND       = symbol('kind')
    , INDEX      = symbol('index')
    , KEYS       = symbol('keys')
    , ENTRIES    = symbol('entries')
    , mapForEach = Map[PROTOTYPE][FOR_EACH]
    , setForEach = Set[PROTOTYPE][FOR_EACH]
    , getValues  = createObjectToArray(false)
    , Iterators  = {};
  
  function createIterResultObject(done, value){
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
    // Add iterator for FF iterator protocol
    FFITERATOR && hidden(Constructor[PROTOTYPE], $$ITERATOR, returnThis);
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
      defineIterator(Base, NAME, createIteratorFactory(Constructor, DEFAULT));
    }
  }
  function createIteratorFactory(Constructor, kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  function defineIterator(Constructor, NAME, value){
    var proto         = Constructor[PROTOTYPE]
      , has$$ITERATOR = has(proto, $$ITERATOR);
    var iter = has(proto, ITERATOR)
      ? proto[ITERATOR]
      : has$$ITERATOR
        ? proto[$$ITERATOR]
        : value;
    if(framework){
      // Define iterator
      !has(proto, ITERATOR) && hidden(proto, ITERATOR, iter);
      // FF fix
      if(has$$ITERATOR)hidden(getPrototypeOf(iter.call(new Constructor)), ITERATOR, returnThis);
      // Add iterator for FF iterator protocol
      else FFITERATOR && hidden(proto, $$ITERATOR, iter);
    }
    // Plug for library
    Iterators[NAME] = iter;
    // FF & v8 fix
    Iterators[NAME + ' Iterator'] = returnThis;
  }
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function ArrayIterator(iterated, kind){
    set(this, ITERATED, ES5Object(iterated));
    set(this, KIND,     kind);
    set(this, INDEX,    0);
  }
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  createIteratorClass(ArrayIterator, ARRAY, Array, function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++
      , kind     = this[KIND]
      , value;
    if(index >= iterated.length)return createIterResultObject(1);
    if(kind == KEY)       value = index;
    else if(kind == VALUE)value = iterated[index];
    else                  value = [index, iterated[index]];
    return createIterResultObject(0, value);
  }, VALUE);
  
  // 21.1.3.27 String.prototype[@@iterator]() - SHAM, TODO
  defineIterator(String, STRING, Iterators[ARRAY]);
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  function MapIterator(iterated, kind){
    var that = this, keys;
    if(Map[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else mapForEach.call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    set(that, ITERATED, iterated);
    set(that, KIND,     kind);
    set(that, INDEX,    0);
    set(that, KEYS,     keys);
  }
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  createIteratorClass(MapIterator, MAP, Map, function(){
    var that     = this
      , iterated = that[ITERATED]
      , keys     = that[KEYS]
      , index    = that[INDEX]++
      , kind     = that[KIND]
      , key, value;
    if(index >= keys.length)return createIterResultObject(1);
    key = keys[index];
    if(kind == KEY)       value = key;
    else if(kind == VALUE)value = iterated.get(key);
    else                  value = [key, iterated.get(key)];
    return createIterResultObject(0, value);
  }, KEY+VALUE);
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  function SetIterator(iterated, kind){
    var keys;
    if(Set[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else setForEach.call(iterated, function(val){
      this.push(val);
    }, keys = []);
    set(this, KIND, kind);
    set(this, KEYS, keys.reverse());
  }
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  createIteratorClass(SetIterator, SET, Set, function(){
    var keys = this[KEYS]
      , key;
    if(!keys.length)return createIterResultObject(1);
    key = keys.pop();
    return createIterResultObject(0, this[KIND] == KEY+VALUE ? [key, key] : key);
  }, VALUE);
  
  function ObjectIterator(iterated, kind){
    set(this, ITERATED, iterated);
    set(this, KEYS,     getKeys(iterated));
    set(this, INDEX,    0);
    set(this, KIND,     kind);
  }
  createIteratorClass(ObjectIterator, OBJECT, Object, function(){
    var that   = this
      , index  = that[INDEX]++
      , object = that[ITERATED]
      , keys   = that[KEYS]
      , kind   = that[KIND]
      , key, value;
    if(index >= keys.length)return createIterResultObject(1);
    key = keys[index];
    if(kind == KEY)       value = key;
    else if(kind == VALUE)value = object[key];
    else                  value = [key, object[key]];
    return createIterResultObject(0, value);
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
    set(this, ITERATED, iterable);
    set(this, ENTRIES,  entries);
  }
  $for[PROTOTYPE].of = function(fn, that){
    var iterator = getIterator(this[ITERATED])
      , entries  = this[ENTRIES]
      , f        = createCallback(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done){
      if((entries ? invoke(f, step.value) : f(step.value)) === false)return;
    }
  }
  
  $for.isIterable = isIterable = function(it){
    return (it != undefined && ITERATOR in it) || has(Iterators, classof(it));
  }
  $for.getIterator = getIterator = function(it){
    return assertObject((it[ITERATOR] || Iterators[classof(it)]).call(it));
  }
  
  $define(GLOBAL, {$for: $for});
}('@@iterator');