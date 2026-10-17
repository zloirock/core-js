import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// The constructor is written before the following native subtree's getter runs.
let ctor = 0,
  value;
Object.defineProperty(_globalThis, 'mixedCtorProbe', {
  configurable: true,
  value: {
    get x() {
      return typeof ctor;
    }
  }
});
({
  Set: ctor,
  mixedCtorProbe: {
    x: value
  }
} = {
  Set: _Set,
  mixedCtorProbe: _globalThis.mixedCtorProbe
});
export const out = [typeof ctor, value];
delete _globalThis.mixedCtorProbe;