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
  
  /*
   * 0 -> forEach
   * 1 -> map
   * 2 -> filter
   * 3 -> some
   * 4 -> every
   * 5 -> find
   * 6 -> findKey
   */
  function createDictMethod(type){
    var isMap    = type == 1
      , isFilter = type == 2
      , isSome   = type == 3
      , isEvery  = type == 4;
    return function(object, callbackfn, thisArg /* = undefined */){
      var f      = optionalBind(callbackfn, thisArg)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , result = isMap || isFilter ? newGeneric(this, Dict) : undefined
        , key, val, res;
      while(length > i){
        key = keys[i++];
        val = O[key];
        res = f(val, key, object);
        if(type){
          if(isMap)result[key] = res;             // map
          else if(res)switch(type){
            case 3: return true;                  // some
            case 5: return val;                   // find
            case 6: return key;                   // findKey
            case 2: result[key] = val;            // filter
          } else if(isEvery)return false;         // every
        }
      }
      return isSome || isEvery ? isEvery : result;
    }
  }
  function createDictReduce(isTurn){
    return function(object, mapfn, init){
      assertFunction(mapfn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , memo, key, result;
      if(isTurn)memo = init == undefined ? newGeneric(this, Dict) : Object(init);
      else if(arguments.length < 3){
        assert(length > i, REDUCE_ERROR);
        memo = O[keys[i++]];
      } else memo = Object(init);
      while(length > i){
        result = mapfn(memo, O[key = keys[i++]], key, object);
        if(isTurn){
          if(result === false)break;
        } else memo = result;
      }
      return memo;
    }
  }
  assign(Dict, objectIterators, {
    forEach: createDictMethod(0),
    map:     createDictMethod(1),
    filter:  createDictMethod(2),
    some:    createDictMethod(3),
    every:   createDictMethod(4),
    find:    createDictMethod(5),
    findKey: createDictMethod(6),
    reduce:  createDictReduce(false),
    turn:    createDictReduce(true),
    keyOf:   keyOf,
    contains: function(object, searchElement){
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0;
      while(length > i){
        if(sameValueZero(O[keys[i++]], searchElement))return true;
      }
      return false;
    },
    clone: function(it){
      return clone(it, [], []);
    },
    // Has / get / set / delete own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    },
    set: createDefiner(0),
    'delete': function(object, key){
      return has(object, key) && delete object[key];
    },
    isDict: function(it){
      return getPrototypeOf(it) == Dict[PROTOTYPE];
    }
  });
  $define(GLOBAL, {Dict: Dict});
}();