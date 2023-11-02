'use strict';
var classof = require('../internals/classof-raw');

var getPrototypeOf = Object.getPrototypeOf;

// The original prototype survives full constructor replacement and subclassing.
module.exports = function (O, allowShared) {
  var result, type;
  while (O = getPrototypeOf(O)) {
    type = classof(O);
    if (type === 'ArrayBuffer' || type === 'ArrayBufferPrototype'
      || allowShared && type === 'SharedArrayBuffer') result = O;
  }
  return result;
};
