// 19.1.3.1 Object.assign(target, source)
var $def    = require('./$.def')
  , $assign = require('./$.assign');

$def($def.S + $def.F, 'Object', {assign: $assign});