// an AMBIGUOUS `extends` base keeps its usage-global static union through every hop spelling the
// value canon walks - a container member, a nested container, an alias to the container, an
// optional hop, a class-static slot - and not only through a bare name. the arm the declaration
// starts with owns no static of the read key, so the alternative's family is the whole observable

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
