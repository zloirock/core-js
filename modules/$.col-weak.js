'use strict';
var $         = require('./$')
  , init      = require('./$.col-init')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , has       = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , cid       = 0
  , CID       = safe('cid')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findEntry(store, key){
  return find.call(store.array, function(it){
    return it[0] === key;
  });
}

function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findEntry(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findEntry(this, key);
    },
    set: function(key, value){
      var entry = findEntry(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex.call(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(NAME, isMap, ADDER){
    function C(iterable){
      $.set(assert.inst(this, C, NAME), CID, cid++);
      init(this, isMap, ADDER, iterable);
    }
    return C;
  },
  methods: {
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
  },
  def: function(that, key, value){
    if(isFrozen(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[CID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  CID: CID
};