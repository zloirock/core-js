import Def, { default as Alt } from '@core-js/pure/actual/promise/constructor';
class C1 extends Def {
  static any() { return super.try(() => 1); }
}
class C2 extends Alt {
  static any() { return super.try(() => 2); }
}
globalThis.__r = [C1.any(), C2.any()];
