'use strict';
var $def = require('./$.def')
  , $pad  = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n, f){
    return $pad(this, n, f, true);
  }
});

