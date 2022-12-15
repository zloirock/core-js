var DESCRIPTORS = require('../internals/descriptors');
var uncurryThis = require('../internals/function-uncurry-this');
var SetHelpers = require('../internals/set-helpers');

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
module.exports = DESCRIPTORS ? uncurryThis(Object.getOwnPropertyDescriptor(SetHelpers.proto, 'size').get) : function (set) {
  return set.size;
};
