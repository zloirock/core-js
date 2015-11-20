// https://github.com/ljharb/proposal-global
var $export = require('./$.export');

$export($export.S, 'System', {global: require('./$.global')});