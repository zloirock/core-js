'use strict';
var weak = require('./$.col-weak');

// 23.4 WeakSet Objects
require('./$.col')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);