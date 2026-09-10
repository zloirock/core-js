// an AMBIGUOUS `extends` base resolves to nothing in pure, so no `super.<static>` here is rewritten:
// what this file locks is the value walk under it - each written arm is substituted where the pure
// package has an entry for it (`Promise`, `Reflect`, `Map`) and left native where it has none
// (`Array`, `Object`), through every hop spelling the canon walks. the static union is the
// usage-global twin's lock

let branchNs = { Base: Boolean };
if (c) branchNs = { Base: Array };
class OverBranch extends branchNs.Base {
  static go() { return super.from('ab'); }
}

let closureNs = { Base: Boolean };
const set = () => { closureNs = { Base: Promise }; };
set();
const nested = { inner: closureNs };
class OverNested extends nested.inner.Base {
  static go() { return super.allSettled([]); }
}

let switchNs;
switch (c) { case 1: switchNs = { Base: Boolean }; break; default: switchNs = { Base: Reflect }; }
const viaAlias = switchNs;
class OverAlias extends viaAlias.Base {
  static go() { return super.ownKeys({}); }
}

let optionalNs = { Base: Boolean };
if (c) optionalNs = { Base: Map };
class OverOptional extends optionalNs?.Base {
  static go() { return super.groupBy([1], x => x); }
}

class Slot0 { static Base = Boolean; }
class Slot1 { static Base = Object; }
let slotNs = Slot0;
if (c) slotNs = Slot1;
class OverClassStatic extends slotNs.Base {
  static go() { return super.hasOwn({}, 'a'); }
}

export { OverBranch, OverNested, OverAlias, OverOptional, OverClassStatic };
