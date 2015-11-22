// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object');

require('./_object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(it) : it;
  };
});