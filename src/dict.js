!function(){
  function Dict(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if($for && isIterable(iterable))$for(iterable, true).of(function(key, value){
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
    return function(object, callbackfn, that /* = undefined */){
      var f      = ctx(callbackfn, that, 3)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , result = isMap || isFilter ? new (generic(this, Dict)) : undefined
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
      if(isTurn)memo = init == undefined ? new (generic(this, Dict)) : Object(init);
      else if(arguments.length < 3){
        assert(length, REDUCE_ERROR);
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
  var findKey = createDictMethod(6);
  assign(Dict, {
    forEach: createDictMethod(0),
    map:     createDictMethod(1),
    filter:  createDictMethod(2),
    some:    createDictMethod(3),
    every:   createDictMethod(4),
    find:    createDictMethod(5),
    findKey: findKey,
    reduce:  createDictReduce(false),
    turn:    createDictReduce(true),
    keyOf:   keyOf,
    contains: function(object, el){
      return (el == el ? keyOf(object, el) : findKey(object, sameNaN)) !== undefined;
    },
    // Has / get / set own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    },
    set: createDefiner(0),
    isDict: function(it){
      return getPrototypeOf(it) === Dict[PROTOTYPE];
    }
  });
  $define(STATIC, OBJECT, {
    // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
    values: createObjectToArray(false),
    // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
    entries: createObjectToArray(true)
  });
  $define(GLOBAL + FORCED, {Dict: Dict});
}();