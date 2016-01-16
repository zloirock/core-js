var $          = require('./_')
  , $export    = require('./_export')
  , $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

$export($export.S, 'Object', {
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || function getOwnPropertyNames(O){
    return $keys(O, hiddenKeys);
  }
});