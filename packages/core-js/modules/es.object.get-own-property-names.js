// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
require('./_object-statics-accept-primitives')('getOwnPropertyNames', function () {
  return require('./_object-gopn-ext').f;
});
