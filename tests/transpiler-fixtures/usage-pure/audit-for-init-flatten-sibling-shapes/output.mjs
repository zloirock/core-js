import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref;
// a for-init declaration shared with a proxy-global flatten declarator: the sibling
// destructure renders through the SAME full emitter as every block-level shape - memo,
// residual and rest slots are all valid comma-list declarators, so the polyfill survives
// on every shape (a narrow for-init-only renderer once bailed these to verbatim source,
// dropping the injected polyfill and leaving a dead import)
for (const from = _Array$from, at = _at(arr), {
    at: _unused,
    ...rest
  } = arr; cond(); next()) use(from, at, rest);
for (const of2 = _Array$of, flat = _flatMaybeArray(arr), {
    plain
  } = arr; cond(); next()) use(of2, flat, plain);
for (const {
    Array: {
      isArray
    }
  } = _globalThis, inc = _includes(arr); cond(); next()) use(isArray, inc);
for (const fromAsync = _Array$fromAsync, {
    indexOf,
    lastIndexOf
  } = arr; cond(); next()) use(fromAsync, indexOf, lastIndexOf);
// a defaulted instance entry memoizes; the memo `var` lands BEFORE the loop (the
// loop-header escape), not in a block-converted bodyless body
for (const entries = _Object$entries, findLast = (_ref = _findLastMaybeArray(arr)) === void 0 ? dflt : _ref; cond(); next()) use(entries, findLast);
// an SE-bearing receiver keeps its evaluation point through the sink declarator
for (const keys = _Object$keys, _ref2 = getArr(), findIndex = _findIndexMaybeArray(_ref2), {
    findIndex: _unused2,
    ...r2
  } = _ref2; cond(); next()) use(keys, findIndex, r2);