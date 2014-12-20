// ECMAScript 6 iterators shim
!function(){
  var getValues = createObjectToArray(false)
    // Safari define byggy iterators w/o `next`
    , buggy = 'keys' in ArrayProto && !('next' in [].keys())
    , at = createPointAt(true);
  
  function defineStdIterators(Base, NAME, Constructor, next, DEFAULT){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      }
    }
    // 21.1.5.2.2 %StringIteratorPrototype%[@@toStringTag]
    // 22.1.5.2.3 %ArrayIteratorPrototype%[@@toStringTag]
    // 23.1.5.2.3 %MapIteratorPrototype%[@@toStringTag]
    // 23.2.5.2.3 %SetIteratorPrototype%[@@toStringTag]
    createIterator(Constructor, NAME, next);
    DEFAULT && $define(PROTO + FORCED * buggy, NAME, {
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
    // 21.1.3.27 String.prototype[@@iterator]()
    // 22.1.3.30 Array.prototype[@@iterator]()
    // 23.1.3.12 Map.prototype[@@iterator]()
    // 23.2.3.11 Set.prototype[@@iterator]()
    Base && defineIterator(Base, NAME, createIter(DEFAULT));
  }
  
  // 21.1.5.1 CreateStringIterator Abstract Operation
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: ES5Object(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i++
      , kind  = iter.k;
    if(index >= O.length)return iterResult(1);
    if(kind == KEY)      return iterResult(0, index);
    if(kind == VALUE)    return iterResult(0, O[index]);
                         return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  function getCollectionKeys(inst, C){
    var keys;
    if(C[SHIM])keys = getValues(inst[COLLECTION_KEYS]);
    else inst[FOR_EACH](function(val, key){
      this.push(C == Map ? key : val);
    }, keys = []);
    return keys;
  }
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  defineStdIterators(Map, MAP, function(iterated, kind){
    set(this, ITER, {o: iterated, k: kind, a: getCollectionKeys(iterated, Map), i: 0});
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , keys  = iter.a
      , kind  = iter.k
      , key;
    while(true){
      if(iter.i >= keys.length)return iterResult(1);
      if(O.has(key = keys[iter.i++]))break;
    }
    if(kind == KEY)  return iterResult(0, key);
    if(kind == VALUE)return iterResult(0, O.get(key));
                     return iterResult(0, [key, O.get(key)]);
  }, KEY+VALUE);
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  defineStdIterators(Set, SET, function(iterated, kind){
    set(this, ITER, {o: iterated, k: kind, a: getCollectionKeys(iterated, Set).reverse()});
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  }, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    while(true){
      if(!keys.length)return iterResult(1);
      if(iter.o.has(key = keys.pop()))break;
    } return iterResult(0, iter.k == KEY+VALUE ? [key, key] : key);
  }, VALUE);
}();