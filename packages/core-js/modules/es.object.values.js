'use strict';
var $ = require('../internals/export');
var $values = require('../internals/object-to-array').values;
var objectEnumerationBug = require('../internals/object-enumeration-bug');

// `Object.values` method
// https://tc39.es/ecma262/#sec-object.values
$({ target: 'Object', stat: true, forced: objectEnumerationBug('values') }, {
  values: function values(O) {
    return $values(O);
  }
});
