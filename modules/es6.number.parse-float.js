var $export = require('./_export');
// 20.1.2.12 Number.parseFloat(string)
$export($export.S, 'Number', {parseFloat: require('./_parse-float')});