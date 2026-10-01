import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a nested destructure over a `||` / `??` init reaches the proxy on EITHER operand whatever the
// left spells: a member, a call and a nullish test hand the read to the global fallback exactly as
// a bare identifier left does, so the static under the proxy is a polyfill candidate in each
// one static per row, so every row is observable by its own module
const {
  Array: {
    from: viaMember
  }
} = obj.p || {
  Array: {
    from: _Array$from
  }
};
export const a = viaMember([1]);
const {
  Array: {
    of: viaNullish
  }
} = obj.p ?? {
  Array: {
    of: _Array$of
  }
};
export const b = viaNullish(2);
const {
  Array: {
    fromAsync: viaCall
  }
} = mk() || {
  Array: {
    fromAsync: _Array$fromAsync
  }
};
export const c = viaCall([3]);
// control: the identifier left the recogniser always saw
const {
  Map: {
    groupBy: viaIdentifier
  }
} = m || {
  Map: {
    groupBy: _Map$groupBy
  }
};
export const d = viaIdentifier([4], x => x);