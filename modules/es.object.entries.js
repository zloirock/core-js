// 19.1.2.5 Object.entries(O)
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(O) {
    return $entries(O);
  }
});
