!function(){
  function Dict(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if(isIterable(iterable))$for(iterable, 1).of(function(key, value){
        dict[key] = value;
      });
      else assign(dict, iterable);
    }
    return dict;
  }
  Dict[PROTOTYPE] = null;
  function findKey(object, fn, that /* = undefined */){
    assertFunction(fn);
    var f      = optionalBind(fn, that)
      , O      = ES5Object(object)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , key;
    while(length > i)if(f(O[key = keys[i++]], key, object))return key;
  }
  assign(Dict, objectIterators, {
    /**
     * Object enumumerabe
     * Alternatives:
     * http://underscorejs.org/ _.{...enumerable}
     * http://sugarjs.com/api/Object/enumerable Object.{...enumerable}
     * http://mootools.net/docs/core/Types/Object Object.{...enumerable}
     * http://api.jquery.com/category/utilities/ $.{...enumerable}
     * http://docs.angularjs.org/api/ng/function angular.{...enumerable}
     */
    every: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(!f(O[key = keys[i++]], key, object))return false;
      return true;
    },
    filter: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , result = newGeneric(this, Dict)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        if(f(O[key = keys[i++]], key, object))result[key] = O[key];
      }
      return result;
    },
    find: function(object, fn, that /* = undefined */){
      var index = findKey(object, fn, that);
      return index === undefined ? undefined : ES5Object(object)[index];
    },
    findKey: findKey,
    forEach: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)f(O[key = keys[i++]], key, object);
    },
    keyOf: function(object, searchElement){
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(O[key = keys[i++]] === searchElement)return key;
    },
    map: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , result = newGeneric(this, Dict)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)result[key = keys[i++]] = f(O[key], key, object);
      return result;
    },
    reduce: function(object, fn, init /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , i      = 0
        , length = keys.length
        , memo   = init
        , key;
      if(arguments.length < 3){
        assert(length > i, REDUCE_ERROR);
        memo = O[keys[i++]];
      }
      while(length > i)memo = fn(memo, O[key = keys[i++]], key, object);
      return memo;
    },
    some: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(f(O[key = keys[i++]], key, object))return true;
      return false;
    },
    turn: function(object, mapfn, target /* = new @ */){
      assertFunction(mapfn);
      var memo = target == undefined ? newGeneric(this, Dict) : Object(target)
        , O    = ES5Object(object)
        , keys = getKeys(O)
        , l    = keys.length
        , i    = 0
        , key;
      while(l > i)if(mapfn(memo, O[key = keys[i++]], key, object) === false)break;
      return memo;
    },
    contains: function(object, searchElement){
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = keys[i++]], searchElement))return true;
      return false;
    },
    clone: ctx(call, $clone),
    // Has / get / set own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    },
    set: function(object, key, value){
      return defineProperty(object, key, descriptor(7, value));
    },
    isDict: function(it){
      return getPrototypeOf(it) == Dict[PROTOTYPE];
    }
  });
  $define(GLOBAL, {Dict: Dict});
}();