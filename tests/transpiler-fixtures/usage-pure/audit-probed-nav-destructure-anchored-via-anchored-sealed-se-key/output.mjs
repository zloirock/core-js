import _globalThis from "@core-js/pure/actual/global-this";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _self from "@core-js/pure/actual/self";
// A computed static leaf captures the guarded Object value first.
// An absent nav throws before the key effect; a defined nav runs the key effect
// before initializing the pure binding.

let f1 = 0;
export const {
  Object: {
    [(f1++, 'freeze')]: viaAnchoredSealedSeKey
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Object: {
    freeze: _Object$freeze
  }
});
export { f1 };