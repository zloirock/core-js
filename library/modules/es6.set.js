'use strict';
var base = require('./$.col-base');

// 23.2 Set Objects
require('./$.col')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function(value){
    return base.def(this, value = value === 0 ? 0 : value, value);
  }
}, base);