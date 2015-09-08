// 7.2.8 IsRegExp(argument)
var isObject    = require('./$.is-object')
  , cof         = require('./$.cof')
  , MATCH       = require('./$.wks')('match')
  , RegExpProto = RegExp.prototype;
module.exports = function(it){
  return RegExpProto.hasOwnProperty(MATCH)
    ? isObject(it) && it[MATCH] !== undefined
    : cof(it) == 'RegExp'; // if @@match isn't implemented use classof check
};