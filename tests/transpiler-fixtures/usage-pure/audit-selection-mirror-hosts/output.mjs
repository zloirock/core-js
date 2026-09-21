import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let cond = c1;
const alt = {
  Array: {},
  JSON: {}
};
const eff = () => 1;
const fb = 9;
export const t1 = (() => {
  const {
    Array: {
      of
    },
    JSON: {
      stringify
    }
  } = (eff(), {
    Array: {
      of: _Array$of
    },
    JSON: {
      stringify: _JSON$stringify
    }
  }) || alt;
  return [of(1), stringify(2)];
})();
export const t2 = (() => {
  const {
    Array: {
      from = fb
    }
  } = (eff(), {
    Array: {
      from: _Array$from
    }
  }) || alt;
  return from([3]);
})();
export const t3 = (() => {
  var _ref2, _ref, _ref3, _unused;
  let of, rest;
  _ref = {
    Array: _ref2
  } = cond && _globalThis, _ref3 = _ref2, {} = _ref3, of = _Array$of, {
    of: _unused,
    ...rest
  } = _ref3, _ref3, _ref;
  return [of(1), rest];
})();
export const t4 = (() => {
  let from;
  ({
    Array: {
      from = fb
    }
  } = {
    Array: {
      from: _Array$from
    }
  });
  return from([4]);
})();
use(t1, t2, t3, t4);