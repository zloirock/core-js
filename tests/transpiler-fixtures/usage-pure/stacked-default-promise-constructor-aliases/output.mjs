import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
import Def, { default as Alt } from '@core-js/pure/actual/promise/constructor';
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