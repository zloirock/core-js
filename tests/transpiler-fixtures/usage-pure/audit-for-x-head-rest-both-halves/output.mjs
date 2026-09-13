import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
const seen = [];
for (var {
  from,
  ...staticRest
} of [Array]) _pushMaybeArray(seen).call(seen, typeof from, 'from' in staticRest);
for (var {
  at,
  ...instanceRest
} of [[1, 2]]) _pushMaybeArray(seen).call(seen, typeof at, 'at' in instanceRest);
export { seen };