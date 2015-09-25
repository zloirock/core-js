var $         = require('./$')
  , has       = require('./$.has')
  , toIObject = require('./$.to-iobject');
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)has(O, key = keys[i++]) && result.push(isEntries ? [key, O[key]] : O[key]);
    return result;
  };
};