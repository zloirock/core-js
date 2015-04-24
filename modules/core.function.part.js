'use strict';
var $    = require('./$')
  , $def = require('./$.def');

// Placeholder
$.core._ = $.path._ = $.path._ || {};

$def($def.P + $def.F, 'Function', {
  part: require('./$.partial')
});