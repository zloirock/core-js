/**
 * http://esdiscuss.org/topic/additional-set-prototype-methods
 * Alternatives:
 * https://github.com/calvinmetcalf/set.up (Firefox only)
 */
var extendCollections = {
  reduce: function(fn, memo){
    assertFunction(fn);
    this.forEach(function(val, key, foo){
      memo = fn(memo, val, key, foo);
    });
    return memo;
  },
  some: function(fn, that){
    assertFunction(fn);
    var iter = this.entries()
      , step, entry;
    while(!(step = iter.next()).done){
      entry = step.value;
      if(fn.call(that, entry[1], entry[0], this))return true;
    }
    return false;
  },
  every: function(fn, that){
    assertFunction(fn);
    var iter = this.entries()
      , step, entry;
    while(!(step = iter.next()).done){
      entry = step.value;
      if(!fn.call(that, entry[1], entry[0], this))return false;
    }
    return true;
  },
  find: function(fn, that){
    assertFunction(fn);
    var iter = this.entries()
      , step, entry;
    while(!(step = iter.next()).done){
      entry = step.value;
      if(fn.call(that, entry[1], entry[0], this))return entry[1];
    }
  },
  transform: function(target, fn){
    if(arguments.length < 2){
      fn = target;
      target = create(null);
    } else target = Object(target);
    this.forEach(part.call(fn, target));
    return target;
  }
};
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
  },
  invert: function(){
    var result = new Map;
    this.forEach(result.set, result);
    return result;
  }
}, extendCollections));
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
}, extendCollections));