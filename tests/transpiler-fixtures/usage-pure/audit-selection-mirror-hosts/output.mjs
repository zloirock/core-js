import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// selection receivers the fromFallback dispatch cannot flag (a non-nullish PRIMARY resolves
// without it): the mirror walks EVERY hop prop (a half-registered two-hop plan emits
// nothing), a defaulted leaf mirrors like its undefaulted twin, an `&&`-declined rest
// shape takes the INSERTED sound default, and a static defaulted sole leaf over a
// discardable receiver extracts as the overwrite
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
      of = _Array$of,
      ...rest
    }
  } = cond && _globalThis);
  return [of(1), rest];
})();
export const t4 = (() => {
  let from;
  from = _Array$from === void 0 ? fb : _Array$from;
  return from([4]);
})();
use(t1, t2, t3, t4);