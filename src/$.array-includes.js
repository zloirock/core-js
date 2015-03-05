'use strict';
// false -> indexOf
// true  -> includes
var $     = require('./$')
  , isNaN = $.isNaN;
module.exports = function(IS_CONTAINS){
  return function(el /*, fromIndex = 0 */){
    var O      = $.toObject(this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length);
    if(IS_CONTAINS && el != el)for(;length > index; index++){
      if(isNaN(O[index]))return true;
    } else for(;length > index; index++)if(IS_CONTAINS || index in O){
      if(O[index] === el)return IS_CONTAINS || index;
    } return !IS_CONTAINS && -1;
  }
}