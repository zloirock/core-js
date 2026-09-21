import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// every channel writing into ONE host statement emits in the order its props dispatched: the
// cascade renders the statics and the per-prop route the instance overwrites, and two anchors of
// their own put whichever ran second in front. both orders of the same pair are spelled here
let eff = 0;
let staticFirst;
let instanceSecond;
let instanceFirst;
let staticSecond;
let other;
({
  Object: {
    keys: staticFirst
  },
  Array: {
    prototype: {
      at: instanceSecond
    }
  }
} = (eff += 1, {
  Object: {
    keys: _Object$keys
  },
  Array: {
    prototype: {
      at: _atMaybeArray(_globalThis.Array.prototype)
    }
  }
}));
({
  Array: {
    prototype: {
      at: instanceFirst
    }
  },
  Object: {
    keys: staticSecond
  },
  other
} = (eff += 1, {
  Array: {
    prototype: {
      at: _atMaybeArray(_globalThis.Array.prototype)
    }
  },
  Object: {
    keys: _Object$keys
  },
  other: _globalThis.other
}));
export const r = [typeof staticFirst, typeof instanceSecond, typeof instanceFirst, typeof staticSecond, typeof other, eff];