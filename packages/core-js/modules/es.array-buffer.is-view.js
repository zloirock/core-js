'use strict';
var $ = require('../internals/export');
var isObject = require('../internals/is-object');
var hasOwn = require('../internals/has-own-property');
var classof = require('../internals/classof');
var TypedArrayConstructors = require('../internals/typed-array-constructors');

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$({ target: 'ArrayBuffer', stat: true }, {
  isView: function isView(it) {
    if (!isObject(it)) return false;
    var klass = classof(it);
    return klass === 'DataView' || hasOwn(TypedArrayConstructors, klass);
  },
});
