// destructure with string-literal keys: findDestructureKeyForBinding accepts both
// Identifier and StringLiteral keys via staticKeyName. babel emits StringLiteral, oxc emits
// Literal+string. should resolve identically through both parsers
const { 'Promise': MyP } = globalThis;
class C extends MyP {
  static run() {
    return super.try(() => 1);
  }
}
C.run();
