import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// destructure with string-literal keys: findDestructureKeyForBinding accepts both
// Identifier and StringLiteral keys via staticKeyName. babel emits StringLiteral, oxc emits
// Literal+string. should resolve identically through both parsers
const MyP = _Promise;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
C.run();