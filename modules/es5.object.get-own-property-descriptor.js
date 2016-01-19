var $export = require('./_export');
// 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {
  getOwnPropertyDescriptor: require('./_object-gopd').f
});