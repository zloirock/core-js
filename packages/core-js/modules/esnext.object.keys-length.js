'use strict';
var $ = require('../internals/export');
var toObject = require('../internals/to-object');

var keys = Object.keys;

// `Object.keysLength` method
// https://github.com/tc39/proposal-object-keys-length
$({ target: 'Object', stat: true, forced: true }, {
  keysLength: function keysLength(O) {
    return keys(toObject(O)).length;
  },
});
