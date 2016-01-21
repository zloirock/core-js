var $export = require('./_export');
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S, 'Number', {parseInt: require('./_parse-int')});