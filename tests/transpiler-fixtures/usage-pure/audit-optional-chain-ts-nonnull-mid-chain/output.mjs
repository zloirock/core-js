import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// TS non-null assertion `!` mid-chain between optional links: `arr?.b!.c.d.includes(2)`.
// `extractCheck` walks the chain looking for the optional link; the descent must re-peel
// transparent wrappers (TS / Paren / Chain) at EACH hop, not just the initial receiver.
// without per-hop peel, the chain-detection short-circuits at the `!` boundary, the
// null-check guard isn't emitted, and the call throws TypeError on null arr where native
// short-circuits the whole chain to undefined
declare const arr: {
  b?: {
    c: {
      d: number[];
    };
  };
};
arr == null ? void 0 : _includesMaybeArray(_ref = arr.b!.c.d).call(_ref, 2);