var $export = require('./_export');
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
$export($export.S, 'Object', {getPrototypeOf: require('./_object-gpo')});