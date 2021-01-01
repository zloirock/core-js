var $ = require('../internals/export');
var parseFloat = require('../internals/number-parse-float');

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
$({ target: 'Number', stat: true, forced: Number.parseFloat != parseFloat }, {
  parseFloat: parseFloat
});
