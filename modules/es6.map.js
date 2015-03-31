'use strict';
var base = require('./$.col-base');

// 23.1 Map Objects
require('./$.col')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function(key){
    var entry = base.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function(key, value){
    return base.def(this, key === 0 ? 0 : key, value);
  }
}, base, true);