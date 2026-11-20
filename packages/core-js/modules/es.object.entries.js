'use strict';
var $ = require('../internals/export');
var $entries = require('../internals/object-to-array').entries;
var objectEnumerationBug = require('../internals/object-enumeration-bug');

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
$({ target: 'Object', stat: true, forced: objectEnumerationBug('entries') }, {
  entries: function entries(O) {
    return $entries(O);
  }
});
