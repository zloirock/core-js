'use strict';
var $ = require('../internals/export');
var isObject = require('../internals/is-object');
var classof = require('../internals/classof');
var getTypedArrayName = require('../internals/get-typed-array-name');

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$({ target: 'ArrayBuffer', stat: true }, {
  isView: function isView(it) {
    return isObject(it) && (!!getTypedArrayName(it) || classof(it) === 'DataView');
  },
});
