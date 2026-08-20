'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var toObject = require('../internals/to-object');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');

var FORCED = fails(function () { getOwnPropertyDescriptorModule.f(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$({ target: 'Object', stat: true, forced: FORCED }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return getOwnPropertyDescriptorModule.f(toObject(it), key);
  },
});
