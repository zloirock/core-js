!function(){
  function Dict(props){
    return props ? assign(create(null), props) : create(null);
  }
  assign(Dict, objectIterators);
  function findIndex(object, fn, that /* = undefined */){
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
    /**
     * Alternatives:
     * http://underscorejs.org/#every
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-every
     */
    every: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(!fn.call(that, O[key = props[i++]], key, object))return false;
      return true;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#filter
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-filter
     */
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
    /**
     * Alternatives:
     * http://underscorejs.org/#find
     * http://sugarjs.com/api/Object/enumerable
     */
    find: function(object, fn, that /* = undefined */){
      var index = findIndex(object, fn, that);
      return index === undefined ? undefined : ES5Object(object)[index];
    },
    findIndex: findIndex,
    /**
     * Alternatives:
     * http://underscorejs.org/#each
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-each
     * http://api.jquery.com/jQuery.each/
     * http://docs.angularjs.org/api/angular.forEach
     */
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
    /**
     * Alternatives:
     * http://mootools.net/docs/core/Types/Object#Object:Object-keyOf
     */
    indexOf: function(object, searchElement){
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = props[i++]], searchElement))return key;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#map
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-map
     * http://api.jquery.com/jQuery.map/
     */
    map: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = create(null)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)result[key = props[i++]] = fn.call(that, O[key], key, object);
      return result;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#reduce
     * http://sugarjs.com/api/Object/enumerable
     */
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
      while(length > i)result = fn.call(that, result, O[key = props[i++]], key, object);
      return result;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#some
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-some
     */
    some: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(fn.call(that, O[key = props[i++]], key, object))return true;
      return false;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#pluck
     * http://sugarjs.com/api/Array/map
     */
    pluck: function(object, prop){
      object = ES5Object(object);
      var names  = keys(object)
        , result = create(null)
        , length = names.length
        , i      = 0
        , key, val;
      while(length > i){
        key = names[i++];
        val = object[key];
        result[key] = val == undefined ? undefined : val[prop];
      }
      return result;
    },
    reduceTo: function(object, target, callbackfn){
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
    }
  });
  $define(GLOBAL, {Dict: Dict});
}();