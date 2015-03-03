// false -> indexOf
// true  -> includes
function createArrayIncludes(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = $.toObject(this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length);
    if(isContains && el != el)for(;length > index; index++){
      if($.isNaN(O[index]))return true;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}