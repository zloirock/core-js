import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// user namespace with aliased property key: `const NS = { Alt: Promise }; extends NS.Alt`.
// unified resolver walks the ObjectExpression, finds `Alt: Promise` entry, recurses on the
// value Identifier (Promise -> global). `super.try(...)` routes through the Promise polyfill
const NS = {
  Alt: _Promise
};
class C extends NS.Alt {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}