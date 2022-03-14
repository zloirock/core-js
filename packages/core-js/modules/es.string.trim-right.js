var $ = require('../internals/export');
var trimEnd = require('../internals/string-trim-end');

// `String.prototype.trimRight` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
$({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimRight !== trimEnd }, {
  trimRight: trimEnd
});
