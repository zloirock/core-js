var $           = require('./_')
  , $export     = require('./_export')
  , $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

$export($export.S, 'Object', {
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || function keys(O){
    return $keys(O, enumBugKeys);
  }
});