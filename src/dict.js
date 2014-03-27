!function(){
  function Dict(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if(isIterable(iterable))forOf(iterable, function(entry){
        dict[entry[0]] = entry[1];
      });
      else assign(dict, iterable);
    }
    return dict;
  }
  assign(Dict, objectIterators);
  /**
   * Object enumumerabe
   * Alternatives:
   * http://underscorejs.org/ _.{enumerable...}
   * http://sugarjs.com/api/Object/enumerable Object.{enumerable...}
   * http://mootools.net/docs/core/Types/Object Object.{enumerable...}
   * http://api.jquery.com/category/utilities/ $.{enumerable...}
   * http://docs.angularjs.org/api/ng/function angular.{enumerable...}
   */
  function findKey(object, fn, that /* = undefined */){
    assertFunction(fn);
    var O      = ES5Object(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i){
      if(fn.call(that, O[key = props[i++]], key, object))return key;
    }
  }
  assign(Dict, {
    every: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(!fn.call(that, O[key = props[i++]], key, object))return false;
      }
      return true;
    },
    filter: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = create(null)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))result[key] = O[key];
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
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)fn.call(that, O[key = props[i++]], key, object);
      return object;
    },
    keyOf: function(object, searchElement){
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = props[i++]], searchElement))return key;
    },
    map: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = create(null)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        result[key = props[i++]] = fn.call(that, O[key], key, object);
      }
      return result;
    },
    reduce: function(object, fn, result /* = undefined */, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , i      = 0
        , length = props.length
        , key;
      if(arguments.length < 3){
        assert(length--, REDUCE_ERROR);
        result = O[props.shift()];
      }
      while(length > i){
        result = fn.call(that, result, O[key = props[i++]], key, object);
      }
      return result;
    },
    some: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))return true;
      }
      return false;
    },
    transform: function(object, target, callbackfn){
      if(arguments.length < 3){
        callbackfn = target;
        target = create(null);
      } else target = Object(target);
      assertFunction(callbackfn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)callbackfn(target, O[key = props[i++]], key, object);
      return target;
    },
    // Has / get own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    }
  });
  $define(GLOBAL, {Dict: Dict});
}();