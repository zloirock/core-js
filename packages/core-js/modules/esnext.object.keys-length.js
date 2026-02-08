// @types: proposals/object-keys-length
'use strict';
var $ = require('../internals/export');
var getBuiltInStaticMethod = require('../internals/get-built-in-static-method');
var toObject = require('../internals/to-object');

// `Object.keysLength` method
// https://github.com/tc39/proposal-object-keys-length
$({ target: 'Object', stat: true, forced: true }, {
  keysLength: function keysLength(O) {
    return getBuiltInStaticMethod('Object', 'keys')(toObject(O)).length;
  },
});
