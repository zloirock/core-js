import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-of head reading the realm through a defaulted level with a rest relocates into the body: the level
// keeps its default, an empty pattern keeps the destructure's throw, and the claim writes ahead of the rest
// copy.
let from2, r2;
for (const _ref2 of [_globalThis]) {
  var _ref, _unused;
  ({
    Array: _ref = {}
  } = _ref2), {} = _ref, from2 = _Array$from, {
    from: _unused,
    ...r2
  } = _ref;
  ;
}