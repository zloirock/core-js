// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
require('../internals/object-statics-accept-primitives')('getOwnPropertyNames', function () {
  return require('../internals/object-get-own-property-names-external').f;
});
