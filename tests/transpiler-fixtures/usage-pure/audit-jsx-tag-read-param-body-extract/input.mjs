// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.

const tagRead = (function ({ from: From, ...rest } = Array, x = <From />) {
  return [From, x, rest];
})();

const memberRootRead = (function ({ of: Of, ...rest } = Array, x = <Of.Sub />) {
  return [Of, x, rest];
})();

const intrinsicTag = (function ({ race, ...rest } = Promise, x = <race />) {
  return [race, x, rest];
})();

const attributeName = (function ({ hasOwn: H, ...rest } = Object, x = <div H={1} />) {
  return [H, x, rest];
})();

const classMethodKey = (function ({ fromEntries, ...rest } = Object, x = class { fromEntries() {} }) {
  return [fromEntries, x, rest];
})();

const classFieldKey = (function ({ groupBy, ...rest } = Object, x = class { groupBy = 1; }) {
  return [groupBy, x, rest];
})();

export { tagRead, memberRootRead, intrinsicTag, attributeName, classMethodKey, classFieldKey };
