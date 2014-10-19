// ECMAScript 6 iterators shim
!function($$ITERATOR){
  var FFITERATOR = $$ITERATOR in ArrayProto
    , KEY        = 1
    , VALUE      = 2
    , ITERATED   = symbol('iterated')
    , KIND       = symbol('kind')
    , INDEX      = symbol('index')
    , KEYS       = symbol('keys')
    , ENTRIES    = symbol('entries')
    , getValues  = createObjectToArray(false)
    , Iterators  = {}
    , IteratorPrototype = {};
  
  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  hidden(IteratorPrototype, ITERATOR, returnThis);
  // Add iterator for FF iterator protocol
  FFITERATOR && hidden(IteratorPrototype, $$ITERATOR, returnThis);
  
  function createIterResultObject(done, value){
    return {value: value, done: !!done};
  }
  function createIteratorClass(Base, NAME, DEFAULT, Constructor, next){
    Constructor[PROTOTYPE] = create(IteratorPrototype, {next: descriptor(1, next)});
    // 22.1.5.2.3 %ArrayIteratorPrototype%[@@toStringTag]
    // 23.1.5.2.3 %MapIteratorPrototype%[@@toStringTag]
    // 23.2.5.2.3 %SetIteratorPrototype%[@@toStringTag]
    setToStringTag(Constructor, NAME + ' Iterator');
    function createIteratorFactory(kind){
      return function(){
        return new Constructor(this, kind);
      }
    }
    $define(PROTO, NAME, {
      // 22.1.3.4 Array.prototype.entries()
      // 23.1.3.4 Map.prototype.entries()
      // 23.2.3.5 Set.prototype.entries()
      entries: createIteratorFactory(KEY+VALUE),
      // 22.1.3.13 Array.prototype.keys()
      // 23.1.3.8 Map.prototype.keys()
      // 23.2.3.8 Set.prototype.keys()
      keys:    createIteratorFactory(KEY),
      // 22.1.3.29 Array.prototype.values()
      // 23.1.3.11 Map.prototype.values()
      // 23.2.3.10 Set.prototype.values()
      values:  createIteratorFactory(VALUE)
    });
    // 22.1.3.30 Array.prototype[@@iterator]()
    // 23.1.3.12 Map.prototype[@@iterator]()
    // 23.2.3.11 Set.prototype[@@iterator]()
    Base && defineIterator(Base, NAME, createIteratorFactory(DEFAULT));
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
  createIteratorClass(Array, ARRAY, VALUE, function(iterated, kind){
    set(this, ITERATED, ES5Object(iterated));
    set(this, KIND,     kind);
    set(this, INDEX,    0);
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++
      , kind     = this[KIND]
      , value;
    if(index >= iterated.length)return createIterResultObject(1);
    if(kind == KEY)       value = index;
    else if(kind == VALUE)value = iterated[index];
    else                  value = [index, iterated[index]];
    return createIterResultObject(0, value);
  });
  
  // 21.1.3.27 String.prototype[@@iterator]() - SHAM, TODO
  defineIterator(String, STRING, Iterators[ARRAY]);
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  createIteratorClass(Map, MAP, KEY+VALUE, function(iterated, kind){
    var that = this, keys;
    if(Map[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else Map[PROTOTYPE][FOR_EACH].call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    set(that, ITERATED, iterated);
    set(that, KIND,     kind);
    set(that, INDEX,    0);
    set(that, KEYS,     keys);
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  }, function(){
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
  });
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  createIteratorClass(Set, SET, VALUE, function(iterated, kind){
    var keys;
    if(Set[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else Set[PROTOTYPE][FOR_EACH].call(iterated, function(val){
      this.push(val);
    }, keys = []);
    set(this, KIND, kind);
    set(this, KEYS, keys.reverse());
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  }, function(){
    var keys = this[KEYS]
      , key;
    if(!keys.length)return createIterResultObject(1);
    key = keys.pop();
    return createIterResultObject(0, this[KIND] == KEY+VALUE ? [key, key] : key);
  });
  
  $for = function(iterable, entries){
    if(!(this instanceof $for))return new $for(iterable, entries);
    set(this, ITERATED, iterable);
    set(this, ENTRIES,  entries);
  }
  $for[PROTOTYPE].of = function(fn, that){
    var iterator = getIterator(this[ITERATED])
      , entries  = this[ENTRIES]
      , f        = ctx(fn, that, entries ? 2 : 1)
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
  
  $define(GLOBAL + FORCED, {$for: $for});
}('@@iterator');