var $export = require('./_export');
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
$export($export.S, 'Object', {getOwnPropertyNames: require('./_object-gopn').f});