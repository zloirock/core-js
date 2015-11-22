// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var forOf   = require('./_for-of')
  , classof = require('./_classof');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    var arr = [];
    forOf(this, false, arr.push, arr);
    return arr;
  };
};