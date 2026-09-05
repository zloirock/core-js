import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect$has from "@core-js/pure/actual/reflect/has";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// pure resolves a REASSIGNED container binding only on proof: a dominating write it follows when
// that write is the ONLY value the read can observe (unconditional, nothing written after the
// read) - the single-observation half of the reaching canon usage-global unions over. every other
// write shape below (conditional, branching, cross, closure, logical, ambiguous pattern) leaves
// the read verbatim; the union stays a usage-global-only over-inject axis
let rw1 = {
  k: Object
};
rw1 = {
  k: _Map
};
const viaDominating = _Map$groupBy; // the member-read spelling follows the same reaching value
let rw2 = {
  s: Object
};
rw2 = {
  s: Array
};
export const viaDominatingMember = _Array$from([1]);

// a CONDITIONAL reassignment keeps both candidates: the live init resolves as the primary
// (its own marker) and the written value joins the union
let rw3 = {
  c: Object
};
if (Math.random() > 0.5) rw3 = {
  c: _Promise
};
const _ref = rw3.c;
const viaLiveInit = _entries(_ref);
const {
  try: viaConditionalWrite
} = _ref; // NEGATIVE: a reassignment AFTER the read cannot change what the read saw - only the init's
// candidate injects, the written value's statics do not
let rw4 = {
  a: Object
};
const beforeWrite = _Object$keys;
rw4 = {
  a: _Map
};

// an ArrayPattern wrapper chain follows the reaching value through the same hop canon
let rw5 = [{
  p: Object
}];
rw5 = [{
  p: _Promise
}];
const viaWrapper = _Promise$race; // `extends` captures the base at class-definition time - the dominating reassignment IS the base
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() {
    return _Array$of.call(this, 1);
  }
}
export const viaExtends = R6.go();

// a reassigned CLASS binding follows the same reaching continuation as a variable hop
class R7 {
  static M = Object;
}
R7 = {
  M: _Promise
};
const viaClassReassign = _Promise$withResolvers; // an identity self-assign is a value NO-OP - it is NOT a reassignment, so pure RESOLVES the
// container read (the only cell here whose walk stays alive besides the after-read one)
let rw8 = {
  m: Object
};
rw8 = rw8;
const viaSelfAssign = _Object$values; // an SE-carrying write is a real reassignment, and an unconditional one: its value is the single
// observable, so pure follows it - the effect stays where the source wrote it
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = {
  d: Object
};
rw9 = (eff9(), {
  d: _Promise
});
const viaSeWrite = _Promise$allSettled; // cross-writes are real reassignments whose values observe each other - pure bails both
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

// an identity write beside a REAL one: the identity is a no-op, the real write dominates alone
let wIR = {
  k: Object
};
wIR = wIR;
wIR = {
  k: _Reflect
};
const viaIdentityThenReal = _Reflect$ownKeys; // a cross-form pattern write pairs its slot to one value - the single observable, so pure follows it
let wPL = {
  n: Object
};
({
  0: wPL
} = [{
  n: Number
}]);
const viaPatternObjLhs = _Number$isInteger; // a BRANCHING write is a real reassignment - pure bails
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

// an AMBIGUOUS pattern write keeps the pure bail too
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

// bare branching writes bail pure as ever
let bBr = Object;
bBr = Math.random() > 0.5 ? _Reflect : Object;
export const bareBranching = typeof (bBr === _Reflect ? _Reflect$has : bBr.has);

// logical binding assigns are real reassignments - pure bails all spellings
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

// a for-in head rebind bails pure the same way
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

// an inner shadow's write never poisons the outer binding - pure still resolves the clean read
let wSh = {
  y: _Symbol
};
{
  let wSh = null;
  void wSh;
}
const viaShadowClean = _Symbol$asyncIterator; // a closure write is a real reassignment - pure bails
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

// the BARE binding canon: the identity no-op resolves, and a real plain write resolves the same way
// the container walk reads it - when it is the ONE value the read can observe (a dominating
// unconditional write, nothing written after the read), the static binds that value's ponyfill
let bs1 = Object;
bs1 = bs1;
export const bareSelfAssign = _Object$fromEntries([['a', 1]]);
let bm1 = Object;
let bm2 = _Promise;
bm1 = bm2;
bm2 = bm1;
export const bareCrossWrite = typeof _Promise$any;
let bq1 = Object;
bq1 = (eff9(), Array);
export const bareSeWrite = typeof _Array$fromAsync;
export { viaDominating, viaConditionalWrite, viaLiveInit, beforeWrite, viaWrapper, viaClassReassign, viaSelfAssign, viaSeWrite, viaCrossWrite, viaIdentityThenReal, viaPatternObjLhs, viaBranchingWrite, viaAmbiguousDefault, viaLogicalBinding, viaNullishBinding, viaAndBinding, viaAndInit, viaForInLiteralOnly, viaShadowClean, viaClosureWrite };