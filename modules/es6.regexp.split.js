// @@split logic
require('./$.fix-re-wks')('split', 2, function(SPLIT, $split){
  // 21.1.3.17 String.prototype.split(separator, limit)
  return function split(separator, limit){
    'use strict';
    var str = String(this)
      , fn  = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, str, limit) : $split.call(str, separator, limit);
  };
});