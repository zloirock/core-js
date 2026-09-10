// the union resolves the base where `extends` CAPTURED it - in the class scope, anchored at the
// class node. a method-local shadow of the alias, or of the container the base is read from, names
// another value that the capture never saw, and a write reaching the slot after the capture cannot
// change what was captured. each line keeps its shadow value live so only the union's family moves

let shadowedAlias;
switch (c) { case 1: shadowedAlias = Boolean; break; default: shadowedAlias = Array; }
class OverShadowedAlias extends shadowedAlias {
  static go() { const shadowedAlias = Promise; return [shadowedAlias, super.from('ab')]; }
}

let shadowedNs;
switch (c) { case 1: shadowedNs = { Base: Boolean }; break; default: shadowedNs = { Base: Reflect }; }
class OverShadowedContainer extends shadowedNs.Base {
  static go() { const shadowedNs = { Base: WeakMap }; return [shadowedNs, super.ownKeys({})]; }
}

let writtenAfter = { Base: Boolean };
if (c) writtenAfter = { Base: Map };
class OverWriteAfterCapture extends writtenAfter.Base {
  static go() { writtenAfter = { Base: Set }; return super.groupBy([1], x => x); }
}

export { OverShadowedAlias, OverShadowedContainer, OverWriteAfterCapture };
