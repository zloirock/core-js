// 19.1.2.21 Object.values(O)
var $export = require('./_export');
var $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(O) {
    return $values(O);
  }
});
