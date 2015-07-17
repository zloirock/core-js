'use strict';
var $def = require('./$.def')
  , $re  = require('./$.replacer')(/[&<>"']/g, {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    });

$def($def.P + $def.F, 'String', {escapeHTML: function escapeHTML(){ return $re(this); }});