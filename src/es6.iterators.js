!function(at, ITER){
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  Iter.std(Array, 'Array', function(iterated, kind){
    $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length){
      iter.o = undefined;
      return Iter.step(1);
    }
    if(kind == 'key')   return Iter.step(0, index);
    if(kind == 'value') return Iter.step(0, O[index]);
                        return Iter.step(0, [index, O[index]]);
  }, 'value');
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iter.Iterators.Arguments = Iter.Iterators.Array;
  
  // 21.1.3.27 String.prototype[@@iterator]()
  Iter.std(String, 'String', function(iterated){
    $.set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return Iter.step(1);
    point = at.call(O, index);
    iter.i += point.length;
    return Iter.step(0, point);
  });
}(createPointAt(true), uid.safe('iter'));