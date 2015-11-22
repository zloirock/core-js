// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P, 'Set', {toJSON: require('./_collection-to-json')('Set')});