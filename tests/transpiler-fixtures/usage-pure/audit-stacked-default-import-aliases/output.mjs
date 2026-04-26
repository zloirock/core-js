import _Promise$try from "@core-js/pure/actual/promise/try";
import _globalThis from "@core-js/pure/actual/global-this";
// `import Def, { default as Alt } from '@core-js/pure/actual/promise'` binds the same
// module default under two names. both must be recognised as Promise so `class extends Def`
// and `class extends Alt` route their static `super.try` through the polyfilled binding
import Def, { default as Alt } from '@core-js/pure/actual/promise';
class C1 extends Def {
  static any() {
    return _Promise$try.call(this, () => 1);
  }
}
class C2 extends Alt {
  static any() {
    return _Promise$try.call(this, () => 2);
  }
}
_globalThis.__r = [C1.any(), C2.any()];