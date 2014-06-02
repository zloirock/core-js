/**
 * http://esdiscuss.org/topic/additional-set-prototype-methods
 * Alternatives:
 * https://github.com/calvinmetcalf/set.up (Firefox only)
 */
 var mapEntries = ctx(call, Map[PROTOTYPE].entries)
   , setEntries = ctx(call, Set[PROTOTYPE].entries);
function extendCollections(Constructor, entries){
  return {
    reduce: function(fn, init){
      assertFunction(fn);
      var memo = init
        , iter = entries(this)
        , step, entry;
      while(!(step = iter.next()).done){
        entry = step.value;
        memo = fn(memo, entry[1], entry[0], this);
      }
      return memo;
    },
    some: function(fn, that){
      assertFunction(fn);
      var iter = entries(this)
        , step, entry;
      while(!(step = iter.next()).done){
        entry = step.value;
        if(fn.call(that, entry[1], entry[0], this))return true;
      }
      return false;
    },
    every: function(fn, that){
      assertFunction(fn);
      var iter = entries(this)
        , step, entry;
      while(!(step = iter.next()).done){
        entry = step.value;
        if(!fn.call(that, entry[1], entry[0], this))return false;
      }
      return true;
    },
    find: function(fn, that){
      assertFunction(fn);
      var iter = entries(this)
        , step, entry;
      while(!(step = iter.next()).done){
        entry = step.value;
        if(fn.call(that, entry[1], entry[0], this))return entry[1];
      }
    },
    transform: function(mapfn, target /* = new Constructor */){
      assertFunction(mapfn);
      var T = target == undefined ? new Constructor : Object(target);
      var iter = entries(this)
        , step, entry;
      while(!(step = iter.next()).done){
        entry = step.value;
        if(mapfn(T, entry[1], entry[0], this) === false)break;
      }
      return T;
    }
  };
}
$define(PROTO, MAP, assign({
  map: function(fn, that){
    assertFunction(fn);
    var result = new Map;
    this.forEach(function(val, key){
      result.set(key, fn.apply(that, arguments));
    });
    return result;
  },
  filter: function(fn, that){
    assertFunction(fn);
    var result = new Map;
    this.forEach(function(val, key){
      if(fn.apply(that, arguments))result.set(key, val);
    });
    return result;
  }
}, extendCollections(Map, mapEntries)));
$define(PROTO, SET, assign({
  map: function(fn, that){
    assertFunction(fn);
    var result = new Set;
    this.forEach(function(){
      result.add(fn.apply(that, arguments));
    });
    return result;
  },
  filter: function(fn, that){
    assertFunction(fn);
    var result = new Set;
    this.forEach(function(val){
      if(fn.apply(that, arguments))result.add(val);
    });
    return result;
  }
}, extendCollections(Set, setEntries)));