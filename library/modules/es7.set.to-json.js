// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.iter').forOf;
$def($def.P, 'Set', {
  toJSON: function toJSON(){
    var arr = [];
    forOf(this, false, arr.push, arr);
    return arr;
  }
});