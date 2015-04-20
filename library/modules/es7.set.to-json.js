// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
$def($def.P, 'Set', {
  toJSON: function toJSON(){
    var arr = [];
    forOf(this, false, arr.push, arr);
    return arr;
  }
});