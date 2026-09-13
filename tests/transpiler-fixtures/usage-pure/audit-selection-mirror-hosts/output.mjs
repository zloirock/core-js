import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
  let of, rest;
  ({
    Array: {
      of,
      ...rest
    }
  } = cond && _globalThis);
  return [of(1), rest];
})();
export const t4 = (() => {
  let from;
  from = _Array$from;
  return from([4]);
})();
use(t1, t2, t3, t4);