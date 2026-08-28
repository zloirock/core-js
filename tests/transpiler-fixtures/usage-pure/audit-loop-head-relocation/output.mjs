import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a LOOP HEAD binds per iteration and has no declaration a claim could extract into, so the head
// takes a minted name and the pattern moves to the body's first statement - the catch param's own
// relocation, one host over. the HEAD keeps the kind the source wrote - that is what makes the
// binding per-iteration - while the relocated declaration takes `let` where that kind was `const`,
// since a claim's own default guard folds its test ref in as an initializer-less declarator, which
// `const` cannot carry. a bodyless body is braced around the pair
const rows = [[1, [2]], [3]];
const bodyless = function () {
  let seen;
  for (const _ref of rows) {
    let flat = _flatMaybeArray(_ref);
    seen = flat;
  }
  return seen;
}();
// ... and the element's TYPE travels too, stashed on the minted name before the rewrite: without it
// the loop variable reads as unknown, and the claim would ship the generic dispatcher
const typed = function () {
  let seen;
  for (let _ref2 of [[1, 2]]) {
    let at = _atMaybeArray(_ref2);
    seen = at;
  }
  return seen;
}();
// ... and a claim carrying its OWN default is what makes the kind matter: the guard's test ref folds
// into the relocated declaration, so a `const` head that kept its kind would emit an initializer-less
// `const` declarator - which does not parse
const defaulted = function () {
  let seen;
  for (const _ref4 of [[1, 2]]) {
    let _ref3,
      at = (_ref3 = _atMaybeArray(_ref4)) === void 0 ? fb : _ref3;
    seen = at;
  }
  return seen;
}();
// NEGATIVE: where the element types and the key names no polyfill, relocating would only cost the
// binding its own type - the pattern stays where the source wrote it
const dataKey = function () {
  let seen;
  for (const {
    name
  } of [{
    name: [1, 2, 3]
  }]) seen = _atMaybeArray(name).call(name, -1);
  return seen;
}();
export { bodyless, typed, defaulted, dataKey };