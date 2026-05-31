import _Object$assign from "@core-js/pure/actual/object/assign";
// a mutation whose receiver is a LOCAL binding sharing a global's name (`Object` here is the
// arrow param) must NOT poison the file-wide mutated-static set: the genuine global
// `Object.assign(...)` read elsewhere still gets the polyfill. for contrast, a GENUINE global
// mutation (`Array.from = ...`) correctly bails its read - the `const` polyfill import can't
// observe the monkey-patch. distinct builtins prove the discrimination is per-receiver-scope.
const patch = Object => {
  Object.assign = function () {};
};
patch({});
_Object$assign({}, src);
Array.from = function () {};
Array.from([1]);