// `const { Promise, ...rest } = globalThis` - rest element alongside the aliased
// property. findDestructureKeyForBinding's loop only considers Property / ObjectProperty
// nodes, skipping RestElement correctly. Should still resolve Promise -> super.try polyfill.
const { Promise: MyP, ...rest } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
