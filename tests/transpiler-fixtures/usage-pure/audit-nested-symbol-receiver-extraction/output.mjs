import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a symbol-key leaf under NESTED plain-key hops extracts through the member chain:
// the sole-binding declarator collapses to `getIteratorMethod(root.hop...)`
const it = _getIteratorMethod(obj.inner);
const deep = _getIteratorMethod(obj.a.b);
export { it, deep };

// a PRISTINE proxy-global root reads through its pure import when it has one (`self`),
// bare when it does not (`window`); a pristine proxy HOP is pure navigation and drops
const viaSelf = _getIteratorMethod(_self.inner);
const viaWindow = _getIteratorMethod(window.inner);
const viaHop = _getIteratorMethod(_globalThis);
export { viaSelf, viaWindow, viaHop };

// a BOUND root is the user's own binding whatever its name - raw reads only
function take(self) {
  const shadowed = _getIteratorMethod(self.inner);
  return shadowed;
}
// a missing-able CTOR root reads through its pure constructor
const viaMap = _getIteratorMethod(_Map.whatever);
export { take, viaMap };

// NEGATIVE: a sibling binding keeps the pattern alive, so the leaf stays a key-swap
const {
  inner: {
    [_Symbol$iterator]: kept
  },
  keep
} = obj;
// NEGATIVE: a computed hop key cannot be walked - the chain is unresolvable
const {
  [k]: {
    [_Symbol$iterator]: viaComputed
  }
} = obj;
export { kept, keep, viaComputed };

// NEGATIVE: a param host has no init to root the chain in
function param({
  inner: {
    [_Symbol$iterator]: fromParam
  }
}) {
  return fromParam;
}
export { param };