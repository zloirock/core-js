import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref;
// Static claims in a loop initializer compose with independent instance siblings.
// Rest-bearing instance slots stay native; receiver effects run in the initializer.
for (const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  }, {
    at,
    ...rest
  } = arr; cond(); next()) use(from, at, rest);
for (const {
    Array: {
      of: of2
    }
  } = {
    Array: {
      of: _Array$of
    }
  }, flat = _flatMaybeArray(arr), {
    plain
  } = arr; cond(); next()) use(of2, flat, plain);
for (const {
    isArray
  } = _globalThis.Array, inc = _includes(arr); cond(); next()) use(isArray, inc);
for (const {
    Array: {
      fromAsync
    }
  } = {
    Array: {
      fromAsync: _Array$fromAsync
    }
  }, {
    indexOf,
    lastIndexOf
  } = arr; cond(); next()) use(fromAsync, indexOf, lastIndexOf);
// a defaulted instance entry memoizes; the memo `var` lands BEFORE the loop (the
// loop-header escape), not in a block-converted bodyless body
for (const {
    Object: {
      entries
    }
  } = {
    Object: {
      entries: _Object$entries
    }
  }, findLast = (_ref = _findLastMaybeArray(arr)) === void 0 ? dflt : _ref; cond(); next()) use(entries, findLast);
// an SE-bearing receiver keeps its evaluation point through the sink declarator
for (const {
    Object: {
      keys
    }
  } = {
    Object: {
      keys: _Object$keys
    }
  }, {
    findIndex,
    ...r2
  } = getArr(); cond(); next()) use(keys, findIndex, r2);