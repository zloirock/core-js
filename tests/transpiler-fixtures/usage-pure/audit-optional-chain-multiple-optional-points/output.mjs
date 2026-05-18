import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// chain with TWO optional links: `arr?.b?.c.d.includes(2)`. `extractCheck`'s descent
// stops at the FIRST optional link from the outer side (chainStart = `arr?.b`); the
// inner `?.c` is the chain's continuation point. native short-circuits when EITHER
// arr or arr.b is null - both null-check guards must be preserved through deoptionalization
declare const arr: {
  b?: {
    c?: {
      d: number[];
    };
  };
};
null == (_ref = arr?.b) ? void 0 : _includesMaybeArray(_ref2 = _ref.c.d).call(_ref2, 2);