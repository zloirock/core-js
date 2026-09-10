import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// a CONDITIONALLY assigned alias holds the realm only on the paths through its branch: off them the
// name is the hoisted `undefined`, and reading a member off it THROWS. usage-pure rewrites a resolved
// static receiver-less, dropping that access whole, so it resolves on proof - a non-dominating
// declarator proves nothing, in every spelling the receiver walk reaches: a nested pattern, a
// renamed ctor slot read on, an array wrapper, and a literal hop carrying the alias. the controls are
// the same reads off an UNCONDITIONAL alias, which do resolve. usage-global keeps the call site (it
// injects a side-effect import and the native read stands), so its twin of this file injects
export function nestedPattern(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const {
    Array: {
      from
    }
  } = G;
  return from([2]);
}
export function renamedCtorSlot(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const {
    Array: A
  } = G;
  return A.of(3);
}
export function arrayWrapper(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const [{
    Array: {
      from
    }
  }] = [G];
  return from([4]);
}
export function literalHop(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const {
    w: {
      Array: {
        from
      }
    }
  } = {
    w: G
  };
  return from([5]);
}
// ... and the same four off an alias whose assignment DOMINATES every read
export function unconditionalNested() {
  var G = _globalThis;
  const entries = _Object$entries;
  return entries({
    a: 1
  });
}
export function unconditionalHop() {
  var G = _globalThis;
  const values = _Object$values;
  return values({
    b: 2
  });
}