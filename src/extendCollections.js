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
    var DONE = {};
    try {
      this.forEach(function(val, key, foo){
        if(fn.call(that, val, key, foo))throw DONE;
      });
    } catch(error){
      if(error === DONE)return true;
      else throw error;
    }
    return false;
  },
  every: function(fn, that){
    assertFunction(fn);
    var DONE = {};
    try {
      this.forEach(function(val, key, foo){
        if(!fn.call(that, val, key, foo))throw DONE;
      });
    } catch(error){
      if(error === DONE)return false;
      else throw error;
    }
    return true;
  },
  find: function(fn, that){
    assertFunction(fn);
    var DONE = {};
    try {
      this.forEach(function(val, key, foo){
        if(fn.call(that, val, key, foo)){
          DONE.value = val;
          throw DONE;
        }
      });
    } catch(error){
      if(error === DONE)return DONE.value;
      else throw error;
    }
  },
  toArray: function(){
    var index  = 0
      , result = Array(this.size);
    this.forEach(function(val){
      result[index++] = val;
    });
    return result;
  },
  reduceTo: function(target, fn){
    if(arguments.length < 2){
      fn = target;
      target = create(null);
    } else target = Object(target);
    this.forEach(fn, target);
    return target;
  }
};
extendBuiltInObject(Map[prototype], assign({
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
  toObject: function(){
    var result = create(null);
    this.forEach(function(val, key){
      result[key] = val;
    });
    return result;
  },
  getKeys: function(){
    var index  = 0
      , result = Array(this.size);
    this.forEach(function(val, key){
      result[index++] = key;
    });
    return result;
  },
  invert: function(){
    var result = new Map;
    this.forEach(result.set, result);
    return result;
  }
}, extendCollections));
extendBuiltInObject(Set[prototype], assign({
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