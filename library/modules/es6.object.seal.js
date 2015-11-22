// 19.1.2.17 Object.seal(O)
var isObject = require('./_is-object');

require('./_object-sap')('seal', function($seal){
  return function seal(it){
    return $seal && isObject(it) ? $seal(it) : it;
  };
});