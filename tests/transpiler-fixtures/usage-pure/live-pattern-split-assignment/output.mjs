import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-of assignment combines a static extraction with a native nested slot and rest.
// Splitting its host must visit only the live pattern and retain all bindings.
let from, at, rest;
for (const _ref2 of [_globalThis]) {
  var _ref, _unused;
  ({
    Array: _ref
  } = _ref2);
  ({} = _ref), from = _Array$from, {
    from: _unused,
    k: {
      at
    },
    ...rest
  } = _ref;
  ;
}