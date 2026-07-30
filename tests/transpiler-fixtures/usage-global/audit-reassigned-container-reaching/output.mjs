import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a REASSIGNED container binding resolves like the bare binding-alias canon, lifted to every
// walk hop: a DOMINATING reassignment kills the declared init and the enumerable reaching value
// walks the remaining path as the primary; a NON-dominating one keeps the init live and every
// enumerable written value joins the union beside it. each cell's marker method can only come
// from the channel under test - the literal candidates never carry it
let rw1 = {
  k: Object
};
rw1 = {
  k: Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = rw1;

// the member-read spelling follows the same reaching value
let rw2 = {
  s: Object
};
rw2 = {
  s: Array
};
export const viaDominatingMember = rw2.s.from([1]);

// a CONDITIONAL reassignment keeps both candidates: the live init resolves as the primary
// (its own marker) and the written value joins the union
let rw3 = {
  c: Object
};
if (Math.random() > 0.5) rw3 = {
  c: Promise
};
const {
  try: viaConditionalWrite,
  entries: viaLiveInit
} = rw3.c;

// NEGATIVE: a reassignment AFTER the read cannot change what the read saw - only the init's
// candidate injects, the written value's statics do not
let rw4 = {
  a: Object
};
const {
  keys: beforeWrite
} = rw4.a;
rw4 = {
  a: Map
};

// an ArrayPattern wrapper chain follows the reaching value through the same hop canon
let rw5 = [{
  p: Object
}];
rw5 = [{
  p: Promise
}];
const [{
  p: {
    race: viaWrapper
  }
}] = rw5;

// `extends` captures the base at class-definition time - the dominating reassignment IS the base
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() {
    return super.of(1);
  }
}
export const viaExtends = R6.go();

// a reassigned CLASS binding follows the same reaching continuation as a variable hop
class R7 {
  static M = Object;
}
R7 = {
  M: Promise
};
const {
  withResolvers: viaClassReassign
} = R7.M;

// an identity self-assign is a value NO-OP: it neither kills the init nor blocks any walk
let rw8 = {
  m: Object
};
rw8 = rw8;
const {
  m: {
    values: viaSelfAssign
  }
} = rw8;

// an SE-carrying write installs its sequence TAIL - the prefix stays at the write site
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = {
  d: Object
};
rw9 = (eff9(), {
  d: Promise
});
const {
  d: {
    allSettled: viaSeWrite
  }
} = rw9;

// CROSS-writes: `ma = mb` captures mb BEFORE `mb = ma` overwrites it - the write-site anchor
// resolves the captured value instead of bailing on the later write
let ma = {
  x: Object
};
let mb = {
  x: String
};
ma = mb;
mb = ma;
const {
  x: {
    raw: viaCrossWrite
  }
} = ma;

// an identity write BEFORE a real one changes nothing: the real write still dominates and its
// value is the reaching primary - the dead init stays un-injected
let wIR = {
  k: Object
};
wIR = wIR;
wIR = {
  k: Reflect
};
const {
  k: {
    ownKeys: viaIdentityThenReal
  }
} = wIR;

// a PATTERN write whose object-pattern key spells an array index pairs cross-form
// (`({ 0: w } = [v])` reads slot 0 exactly as the language does) - the written value reaches
let wPL = {
  n: Object
};
({
  0: wPL
} = [{
  n: Number
}]);
const {
  n: {
    isInteger: viaPatternObjLhs
  }
} = wPL;

// a BRANCHING write installs one of its ARM values - each arm joins the union (no single
// reaching primary), so the arm-only method still injects
let wBr = {
  b: Object
};
wBr = Math.random() > 0.5 ? {
  b: Number
} : {
  b: Object
};
const {
  b: {
    isSafeInteger: viaBranchingWrite
  }
} = wBr;

// an AMBIGUOUS pattern write (slot value OR default) unions both candidates the same way
let wAd = {
  d: Object
};
({
  0: wAd = {
    d: Number
  }
} = [{
  d: Object
}]);
const {
  d: {
    parseFloat: viaAmbiguousDefault
  }
} = wAd;

// the BARE canon flattens branching writes identically
let bBr = Object;
bBr = Math.random() > 0.5 ? Reflect : Object;
export const bareBranching = typeof bBr.has;

// LOGICAL binding assigns flow their RHS as a POSSIBLE value: `||=` / `??=` install it when
// the current value is falsy / nullish, `&&=` when truthy (the init then stays live too)
let wLg = null;
wLg ||= {
  l: Object
};
const {
  l: {
    hasOwn: viaLogicalBinding
  }
} = wLg;
let wNu;
wNu ??= {
  u: Object
};
const {
  u: {
    getOwnPropertyNames: viaNullishBinding
  }
} = wNu;
let wAn = {
  i: Object
};
wAn &&= {
  i: Number
};
const {
  i: {
    parseInt: viaAndBinding,
    isExtensible: viaAndInit
  }
} = wAn;

// NEGATIVE: a for-in head rebind yields KEYS (strings) - no enumerable container value, so
// only the literal candidate injects
let wFi = {
  f: Object
};
for (wFi in {
  a: 1
}) void 0;
const {
  f: {
    getOwnPropertyDescriptors: viaForInLiteralOnly
  }
} = wFi;

// an INNER shadow's write never poisons the outer binding - the outer container stays clean
let wSh = {
  y: Symbol
};
{
  let wSh = null;
  void wSh;
}
const {
  y: {
    asyncIterator: viaShadowClean
  }
} = wSh;

// a CLOSURE write cannot be ordered against the read - both the init's and the closure's
// candidates stay reachable (over-inject-safe)
let wCl = {
  c: Object
};
export const setIt = () => {
  wCl = {
    c: Number
  };
};
const {
  c: {
    isNaN: viaClosureWrite
  }
} = wCl;

// the BARE binding canon shares every rule above: identity no-op, sequence tail, write-site anchor
let bs1 = Object;
bs1 = bs1;
export const bareSelfAssign = bs1.fromEntries([['a', 1]]);
let bm1 = Object;
let bm2 = Promise;
bm1 = bm2;
bm2 = bm1;
export const bareCrossWrite = typeof bm1.any;
let bq1 = Object;
bq1 = (eff9(), Array);
export const bareSeWrite = typeof bq1.fromAsync;
export { viaDominating, viaConditionalWrite, viaLiveInit, beforeWrite, viaWrapper, viaClassReassign, viaSelfAssign, viaSeWrite, viaCrossWrite, viaIdentityThenReal, viaPatternObjLhs, viaBranchingWrite, viaAmbiguousDefault, viaLogicalBinding, viaNullishBinding, viaAndBinding, viaAndInit, viaForInLiteralOnly, viaShadowClean, viaClosureWrite };