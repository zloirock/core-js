'use strict';
var $def = require('./$.def')
  , $pad  = require('./$.string-pad')(false);
$def($def.P, 'String', {
  rpad: function rpad(n, f){
    return $pad(this, n, f);
  }
});
