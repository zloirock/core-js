var $        = require('./$')
  , ctx      = require('./$.ctx')
  , $def     = require('./$.def')
  , assign   = require('./$.assign')
  , keyOf    = require('./$.keyof')
  , ITER     = require('./$.uid').safe('iter')
  , assert   = require('./$.assert')
  , $iter    = require('./$.iter')
  , forOf    = require('./$.for-of')
  , step     = $iter.step
  , getKeys  = $.getKeys
  , toObject = $.toObject
  , has      = $.has;

function Dict(iterable){
  var dict = $.create(null);
  if(iterable != undefined){
    if($iter.is(iterable)){
      forOf(iterable, true, function(key, value){
        dict[key] = value;
      });
    } else assign(dict, iterable);
  }
  return dict;
}
Dict.prototype = null;

function DictIterator(iterated, kind){
  $.set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
}
$iter.create(DictIterator, 'Dict', function(){
  var iter = this[ITER]
    , O    = iter.o
    , keys = iter.a
    , kind = iter.k
    , key;
  do {
    if(iter.i >= keys.length){
      iter.o = undefined;
      return step(1);
    }
  } while(!has(O, key = keys[iter.i++]));
  if(kind == 'keys'  )return step(0, key);
  if(kind == 'values')return step(0, O[key]);
  return step(0, [key, O[key]]);
});
function createDictIter(kind){
  return function(it){
    return new DictIterator(it, kind);
  };
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof instead of isFunction
  return typeof A == 'function' ? A : B;
}

// 0 -> Dict.forEach
// 1 -> Dict.map
// 2 -> Dict.filter
// 3 -> Dict.some
// 4 -> Dict.every
// 5 -> Dict.find
// 6 -> Dict.findKey
// 7 -> Dict.mapPairs
function createDictMethod(TYPE){
  var IS_MAP   = TYPE == 1
    , IS_EVERY = TYPE == 4;
  return function(object, callbackfn, that /* = undefined */){
    var f      = ctx(callbackfn, that, 3)
      , O      = toObject(object)
      , result = IS_MAP || TYPE == 7 || TYPE == 2 ? new (generic(this, Dict)) : undefined
      , key, val, res;
    for(key in O)if(has(O, key)){
      val = O[key];
      res = f(val, key, object);
      if(TYPE){
        if(IS_MAP)result[key] = res;            // map
        else if(res)switch(TYPE){
          case 2: result[key] = val; break;     // filter
          case 3: return true;                  // some
          case 5: return val;                   // find
          case 6: return key;                   // findKey
          case 7: result[res[0]] = res[1];      // mapPairs
        } else if(IS_EVERY)return false;        // every
      }
    }
    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
  };
}

// true  -> Dict.turn
// false -> Dict.reduce
function createDictReduce(IS_TURN){
  return function(object, mapfn, init){
    assert.fn(mapfn);
    var O      = toObject(object)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , memo, key, result;
    if(IS_TURN){
      memo = init == undefined ? new (generic(this, Dict)) : Object(init);
    } else if(arguments.length < 3){
      assert(length, 'Reduce of empty object with no initial value');
      memo = O[keys[i++]];
    } else memo = Object(init);
    while(length > i)if(has(O, key = keys[i++])){
      result = mapfn(memo, O[key], key, object);
      if(IS_TURN){
        if(result === false)break;
      } else memo = result;
    }
    return memo;
  };
}
var findKey = createDictMethod(6);

$def($def.G + $def.F, {Dict: Dict});

$def($def.S, 'Dict', {
  keys:     createDictIter('keys'),
  values:   createDictIter('values'),
  entries:  createDictIter('entries'),
  forEach:  createDictMethod(0),
  map:      createDictMethod(1),
  filter:   createDictMethod(2),
  some:     createDictMethod(3),
  every:    createDictMethod(4),
  find:     createDictMethod(5),
  findKey:  findKey,
  mapPairs: createDictMethod(7),
  reduce:   createDictReduce(false),
  turn:     createDictReduce(true),
  keyOf:    keyOf,
  includes: function(object, el){
    return (el == el ? keyOf(object, el) : findKey(object, function(it){
      return it != it;
    })) !== undefined;
  },
  // Has / get / set own property
  has: has,
  get: function(object, key){
    if(has(object, key))return object[key];
  },
  set: $.def,
  isDict: function(it){
    return $.isObject(it) && $.getProto(it) === Dict.prototype;
  }
});