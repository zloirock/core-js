var parallel;
extendBuiltInObject(Function, {
  series: function(queue, then /* ? */){
    var isThen    = isFunction(then)
      , sliceArgs = isThen ? 2 : 1
      , current   = 0
      , args, inArgs;
    function next(i, error){
      if(i == current){ // <= protect from reexecution
        inArgs = current++ in queue;
        if(isThen && (error || !inArgs))then.apply(undefined, slice1(arguments));
        else if(inArgs){
          args = slice.call(arguments, sliceArgs);
          args.push(part.call(next, current));
          queue[current].apply(undefined, args)
        }
      }
    }
    queue.length ? queue[0](part.call(next, 0)) : isThen && then()
  },
  parallel: parallel = function(fns, then){
    var run     = toLength(fns.length)
      , results = Array(run);
    if(run)forEach.call(fns, function(fn, key){
      fn(function(error, result){
        if(run && !(key in results)){ // <= protect from reexecution
          if(error)run = 1;
          results[key] = result;
          --run || then(error, results);
        }
      });
    });
    else then(undefined, results);
  }
});
extendBuiltInObject($Array, {
  asyncMap: function(fn, then){
    parallel(map.call(this, function(val){
      return part.call(fn, val)
    }), then);
  }
});