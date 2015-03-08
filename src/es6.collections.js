'use strict';
require('./es6.iterators');
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , safe     = require('./$.uid').safe
  , $iter    = require('./$.iter')
  , assert   = require('./$.assert')
  , assertInstanse = assert.inst
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , step     = $iter.step
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , CID      = safe('cid')
  , O1       = safe('O1')
  , WEAK     = safe('weak')
  , LEAK     = safe('leak')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , cid      = 0
  , tmp      = {};

function getCollection(NAME, methods, commonMethods, isMap, isWeak){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = isMap ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function initFromIterable(that, iterable){
    if(iterable != undefined)$iter.forOf(iterable, isMap, that[ADDER], that);
    return that;
  }
  function fixSVZ(key, chain){
    var method = proto[key];
    if($.FW)proto[key] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return chain ? this : result;
    };
  }
  function checkIter(){
    var done = false;
    var O = {next: function(){
      done = true;
      return step(1);
    }};
    O[SYMBOL_ITERATOR] = $.that;
    try { new C(O) } catch(e){}
    return done;
  }
  if(!$.isFunction(C) || !(isWeak || (!$iter.BUGGY && proto.forEach && proto.entries))){
    // create collection constructor
    C = isWeak
      ? function(iterable){
          set(assertInstanse(this, C, NAME), CID, cid++);
          initFromIterable(this, iterable);
        }
      : function(iterable){
          var that = assertInstanse(this, C, NAME);
          set(that, O1, $.create(null));
          set(that, SIZE, 0);
          set(that, LAST, undefined);
          set(that, FIRST, undefined);
          initFromIterable(that, iterable);
        };
    $.mix($.mix(C.prototype, methods), commonMethods);
    isWeak || !$.DESC || $.setDesc(C.prototype, 'size', {get: function(){
      return assert.def(this[SIZE]);
    }});
  } else {
    var Native = C
      , inst   = new C
      , chain  = inst[ADDER](isWeak ? {} : -0, 1)
      , buggyZero;
    // wrap to init collections from iterable
    if($iter.DANGER_CLOSING || !checkIter()){
      C = function(iterable){
        assertInstanse(this, C, NAME);
        return initFromIterable(new Native, iterable);
      }
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    isWeak || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixSVZ('delete');
      fixSVZ('has');
      isMap && fixSVZ('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
  }
  cof.set(C, NAME);
  require('./$.species')(C);
  
  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  isWeak || $iter.std(C, NAME, function(iterated, kind){
    set(this, ITER, {o: iterated, k: kind});
  }, function(){
    var iter  = this[ITER]
      , kind  = iter.k
      , entry = iter.l;
    // revert to the last existing entry
    while(entry && entry.r)entry = entry.p;
    // get next entry
    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
      // or finish the iteration
      iter.o = undefined;
      return step(1);
    }
    // return step by kind
    if(kind == 'key')   return step(0, entry.k);
    if(kind == 'value') return step(0, entry.v);
                        return step(0, [entry.k, entry.v]);   
  }, isMap ? 'key+value' : 'value', !isMap, true);
  
  return C;
}

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, CID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, CID, ++cid);
  // return object id with prefix
  } return 'O' + it[CID];
}
function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}
function def(that, key, value){
  var entry = getEntry(that, key)
    , prev, index;
  // change existing entry
  if(entry)entry.v = value;
  // create new entry
  else {
    that[LAST] = entry = {
      i: index = fastKey(key, true), // <- index
      k: key,                        // <- key
      v: value,                      // <- value
      p: prev = that[LAST],          // <- previous entry
      n: undefined,                  // <- next entry
      r: false                       // <- removed
    };
    if(!that[FIRST])that[FIRST] = entry;
    if(prev)prev.n = entry;
    that[SIZE]++;
    // add to index
    if(index != 'F')that[O1][index] = entry;
  } return that;
}

var collectionMethods = {
  // 23.1.3.1 Map.prototype.clear()
  // 23.2.3.2 Set.prototype.clear()
  clear: function(){
    for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
      entry.r = true;
      if(entry.p)entry.p = entry.p.n = undefined;
      delete data[entry.i];
    }
    that[FIRST] = that[LAST] = undefined;
    that[SIZE] = 0;
  },
  // 23.1.3.3 Map.prototype.delete(key)
  // 23.2.3.4 Set.prototype.delete(value)
  'delete': function(key){
    var that  = this
      , entry = getEntry(that, key);
    if(entry){
      var next = entry.n
        , prev = entry.p;
      delete that[O1][entry.i];
      entry.r = true;
      if(prev)prev.n = next;
      if(next)next.p = prev;
      if(that[FIRST] == entry)that[FIRST] = next;
      if(that[LAST] == entry)that[LAST] = prev;
      that[SIZE]--;
    } return !!entry;
  },
  // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
  // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
  forEach: function(callbackfn /*, that = undefined */){
    var f = ctx(callbackfn, arguments[1], 3)
      , entry;
    while(entry = entry ? entry.n : this[FIRST]){
      f(entry.v, entry.k, this);
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
    }
  },
  // 23.1.3.7 Map.prototype.has(key)
  // 23.2.3.7 Set.prototype.has(value)
  has: function(key){
    return !!getEntry(this, key);
  }
}

// 23.1 Map Objects
var Map = getCollection('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function(key){
    var entry = getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function(key, value){
    return def(this, key === 0 ? 0 : key, value);
  }
}, collectionMethods, true);

// 23.2 Set Objects
getCollection('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function(value){
    return def(this, value = value === 0 ? 0 : value, value);
  }
}, collectionMethods);

function defWeak(that, key, value){
  if(isFrozen(assert.obj(key)))leakStore(that).set(key, value);
  else {
    has(key, WEAK) || hide(key, WEAK, {});
    key[WEAK][that[CID]] = value;
  } return that;
}
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, new Map)[LEAK];
}

var weakMethods = {
  // 23.3.3.2 WeakMap.prototype.delete(key)
  // 23.4.3.3 WeakSet.prototype.delete(value)
  'delete': function(key){
    if(!isObject(key))return false;
    if(isFrozen(key))return leakStore(this)['delete'](key);
    return has(key, WEAK) && has(key[WEAK], this[CID]) && delete key[WEAK][this[CID]];
  },
  // 23.3.3.4 WeakMap.prototype.has(key)
  // 23.4.3.4 WeakSet.prototype.has(value)
  has: function(key){
    if(!isObject(key))return false;
    if(isFrozen(key))return leakStore(this).has(key);
    return has(key, WEAK) && has(key[WEAK], this[CID]);
  }
};

// 23.3 WeakMap Objects
var WeakMap = getCollection('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[CID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function(key, value){
    return defWeak(this, key, value);
  }
}, weakMethods, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
  $.each.call($.a('delete,has,get,set'), function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}

// 23.4 WeakSet Objects
getCollection('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function(value){
    return defWeak(this, value, true);
  }
}, weakMethods, false, true);