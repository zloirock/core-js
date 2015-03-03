!function(ENTRIES, FN, ITER){
  function $for(iterable, entries){
    if(!(this instanceof $for))return new $for(iterable, entries);
    this[ITER]    = Iter.get(iterable);
    this[ENTRIES] = !!entries;
  }
  
  Iter.create($for, 'Wrapper', function(){
    return this[ITER].next();
  });
  var $forProto = $for.prototype;
  Iter.set($forProto, function(){
    return this[ITER]; // unwrap
  });
  
  function createChainIterator(next){
    function Iterator(iter, fn, that){
      this[ITER]    = Iter.get(iter);
      this[ENTRIES] = iter[ENTRIES];
      this[FN]      = $.ctx(fn, that, iter[ENTRIES] ? 2 : 1);
    }
    Iter.create(Iterator, 'Chain', next, $forProto);
    Iter.set(Iterator.prototype, $.that); // override $forProto iterator
    return Iterator;
  }
  
  var MapIter = createChainIterator(function(){
    var step = this[ITER].next();
    return step.done ? step : Iter.step(0, Iter.stepCall(this[FN], step.value, this[ENTRIES]));
  });
  
  var FilterIter = createChainIterator(function(){
    for(;;){
      var step = this[ITER].next();
      if(step.done || Iter.stepCall(this[FN], step.value, this[ENTRIES]))return step;
    }
  });
  
  $.mix($forProto, {
    of: function(fn, that){
      Iter.forOf(this, this[ENTRIES], fn, that);
    },
    array: function(fn, that){
      var result = [];
      Iter.forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
      return result;
    },
    filter: function(fn, that){
      return new FilterIter(this, fn, that);
    },
    map: function(fn, that){
      return new MapIter(this, fn, that);
    }
  });
  
  $for.isIterable  = Iter.is;
  $for.getIterator = Iter.get;
  
  $def(GLOBAL + FORCED, {$for: $for});
}('entries', uid.safe('fn'), uid.safe('iter'));