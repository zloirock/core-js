// `import Def, { default as Alt } from '@core-js/pure/actual/promise'` binds the same
// module default under two names. both have to carry the Promise polyfillHint so
// `class extends Alt` / `class extends Def` both resolve super-statics through it
import Def, { default as Alt } from '@core-js/pure/actual/promise';
class C1 extends Def {
  static any() { return super.try(() => 1); }
}
class C2 extends Alt {
  static any() { return super.try(() => 2); }
}
globalThis.__r = [C1.any(), C2.any()];
