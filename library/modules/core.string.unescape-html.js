'use strict';
var $def = require('./$.def')
  , $re  = require('./$.replacer')(/&(?:amp|lt|gt|quot|apos);/g, {
    '&amp;':  '&',
    '&lt;':   '<',
    '&gt;':   '>',
    '&quot;': '"',
    '&apos;': "'"
  });

$def($def.P + $def.F, 'String', {unescapeHTML:  function unescapeHTML(){ return $re(this); }});