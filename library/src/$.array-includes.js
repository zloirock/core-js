'use strict';
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_CONTAINS){
  return function(el /*, fromIndex = 0 */){
    var O      = $.toObject(this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length)
      , value;
    if(IS_CONTAINS && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_CONTAINS || index in O){
      if(O[index] === el)return IS_CONTAINS || index;
    } return !IS_CONTAINS && -1;
  }
}