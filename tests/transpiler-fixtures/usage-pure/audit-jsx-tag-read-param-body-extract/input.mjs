// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.

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
