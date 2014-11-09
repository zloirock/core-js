// ECMAScript 6 iterators shim
!function(){
  var getValues = createObjectToArray(false)
    , buggy = 'keys' in ArrayProto && !('next' in [].keys());
  
  function defineStdIterators(Base, NAME, DEFAULT, Constructor, next){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      }
    }
    createIterator(Constructor, NAME, next);
    $define(PROTO + FORCED * buggy, NAME, {
      // 22.1.3.4 Array.prototype.entries()
      // 23.1.3.4 Map.prototype.entries()
      // 23.2.3.5 Set.prototype.entries()
      entries: createIter(KEY+VALUE),
      // 22.1.3.13 Array.prototype.keys()
      // 23.1.3.8 Map.prototype.keys()
      // 23.2.3.8 Set.prototype.keys()
      keys:    createIter(KEY),
      // 22.1.3.29 Array.prototype.values()
      // 23.1.3.11 Map.prototype.values()
      // 23.2.3.10 Set.prototype.values()
      values:  createIter(VALUE)
    });
    // 22.1.3.30 Array.prototype[@@iterator]()
    // 23.1.3.12 Map.prototype[@@iterator]()
    // 23.2.3.11 Set.prototype[@@iterator]()
    Base && defineIterator(Base, NAME, createIter(DEFAULT));
  }
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  defineStdIterators(Array, ARRAY, VALUE, function(iterated, kind){
    set(this, ITER, {o: ES5Object(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter     = this[ITER]
      , iterated = iter.o
      , index    = iter.i++
      , kind     = iter.k
      , value;
    if(index >= iterated.length)return iterResult(1);
    if(kind == KEY)       value = index;
    else if(kind == VALUE)value = iterated[index];
    else                  value = [index, iterated[index]];
    return iterResult(0, value);
  });
  
  // 21.1.3.27 String.prototype[@@iterator]() - SHAM, TODO
  defineIterator(String, STRING, Iterators[ARRAY]);
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  defineStdIterators(Map, MAP, KEY+VALUE, function(iterated, kind){
    var keys;
    if(Map[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else Map[PROTOTYPE][FOR_EACH].call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    set(this, ITER, {o: iterated, k: kind, a: keys, i: 0});
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  }, function(){
    var iter     = this[ITER]
      , iterated = iter.o
      , keys     = iter.a
      , index    = iter.i++
      , kind     = iter.k
      , key, value;
    if(index >= keys.length)return iterResult(1);
    key = keys[index];
    if(kind == KEY)       value = key;
    else if(kind == VALUE)value = iterated.get(key);
    else                  value = [key, iterated.get(key)];
    return iterResult(0, value);
  });
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  defineStdIterators(Set, SET, VALUE, function(iterated, kind){
    var keys;
    if(Set[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else Set[PROTOTYPE][FOR_EACH].call(iterated, function(val){
      this.push(val);
    }, keys = []);
    set(this, ITER, {k: kind, a: keys.reverse(), l: keys.length});
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  }, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    if(!keys.length)return iterResult(1);
    key = keys.pop();
    return iterResult(0, iter.k == KEY+VALUE ? [key, key] : key);
  });
}();