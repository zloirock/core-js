/**
 * http://esdiscuss.org/topic/additional-set-prototype-methods
 * Alternatives:
 * https://github.com/calvinmetcalf/set.up (Firefox only)
 */
function extendCollections(Constructor, entries){
  return {
    reduce: function(fn, memo){
      assertFunction(fn);
      var iter = entries(this)
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
      target = target == undefined ? new Constructor : Object(target);
      var iter = entries(this)
        , step, entry;
      while(!(step = iter.next()).done){
        entry = step.value;
        if(mapfn(target, entry[1], entry[0], this) === false)break;
      }
      return target;
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
}, extendCollections(Map, unbind(Map[PROTOTYPE].entries))));
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
}, extendCollections(Set, unbind(Set[PROTOTYPE].entries))));