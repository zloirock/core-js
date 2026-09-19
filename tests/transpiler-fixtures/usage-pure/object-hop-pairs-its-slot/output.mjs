import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
var _ref29;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
const hopCtor = _Map;
const src = {
  P: Array
};
const hopStatic = _Array$from;
const hopThroughGetter = _WeakMap; // ... and a hop VALUE that navigates to the realm names the constructor its key spells, the way the
// flat spelling of the same receiver does - the leaf answers a ctor ON the realm, not a static OF it
const hopThroughNav = _Array$from;
const {
  w: {
    WeakSet: keptByGetterEffect
  }
} = {
  get w() {
    mark();
    return {
      WeakSet: _WeakSet
    };
  }
};
function keptBySpread(extra) {
  const {
      w: {
        Array: _ref
      }
    } = {
      w: _globalThis,
      ...extra
    },
    kept = _ref === Array ? _Array$of : _ref.of;
  return kept;
}
// a binding REASSIGNED between realm names holds one object under several spellings, so a read
// through it answers the same whichever write reached the use - the claim stands
let realmAlias = _globalThis;
realmAlias = _self;
const viaRealmAlias = _Map; // ... and only while the slots stand: a name the file REPLACES holds the user's object, and the
// values are no longer one realm - the leaf below it stays native
_globalThis.window = {
  Map: other
};
let mutatedAlias = _globalThis;
mutatedAlias = window;
const {
  w: {
    Map: viaMutatedAlias
  }
} = {
  w: mutatedAlias
};
// a SEQUENCE the source wrote around the paired value owes its prefix: the dispatch spells the value
// the collapse takes, never the comma run in front of it, so the literal stays and runs it
function seqPrefixKeepsLiteral(bump) {
  const viaPrefix = _getIteratorMethod(_globalThis);
  const {
    w: {
      [_Symbol$iterator]: _unused
    }
  } = {
    w: (bump(), _globalThis)
  };
  return viaPrefix;
}
function symbolBehindSpread(extra) {
  const aheadSymbol = _getIteratorMethod(_globalThis);
  const {
    w: {
      [_Symbol$iterator]: _unused2
    }
  } = {
    ...extra,
    w: _globalThis
  };
  return aheadSymbol;
}
// ... a STATIC claim behind the same spread keeps it too: the extraction takes the pure binding
// and the husk stays, so the read the spread performs still runs where the source wrote it
function staticBehindSpread(extra) {
  const aheadStatic = _Array$from;
  const {
    w: {
      Array: {
        from: _unused3
      }
    }
  } = {
    ...extra,
    w: _globalThis
  };
  return aheadStatic;
}
// ... and so does a CTOR claim over the same level: the alias binds the ponyfill rather than the
// realm's own name, and the husk keeps the read the spread performs
// (the effect-bearing SIBLING spelling of this row lives in the differential instead: the legs print
// one runtime there in two shapes - husk against sequence prefix - which bytes cannot hold)
function ctorBehindSpread(extra) {
  const behindSpread = _Map;
  const {
    w: {
      Map: _unused4
    }
  } = {
    ...extra,
    w: _globalThis
  };
  return behindSpread;
}
function keptByKey(key) {
  const ns = {
    Q: Array,
    [key]: _Map
  };
  const {
      Q: _ref2
    } = ns,
    kept = _ref2 === Array ? _Array$of : _ref2.of;
  return kept;
}
// A later unknown key can override the paired slot. Read the actual slot once and select the
// ponyfill only when that value is the realm; declaration and assignment preserve overrides.
function keptByUnnameableKey(key) {
  var _ref4;
  const {
      w: _ref3
    } = {
      w: _globalThis,
      [key]: other
    },
    keptDecl = _ref3 === _globalThis ? _Map : _ref3.Map;
  let keptAssign;
  ({
    w: _ref4
  } = {
    w: _globalThis,
    [key]: other
  }), keptAssign = _ref4 === _globalThis ? _Map : _ref4.Map;
  return [keptDecl, keptAssign];
}
// ... while a key that FOLDS through its binding names another slot and leaves the pairing alone,
// on the symbol route as on every other - the resolver folds it with the same scope the pairing uses
const boundKey = 'q';
const viaBoundKey = _getIteratorMethod(_globalThis); // a value the level SELECTS between arms is the selecting-receiver channel's, not a pair
const {
  w: {
    WeakRef: keptByBranch
  }
} = {
  w: other ? _globalThis : _globalThis
};
// a NUMERIC key names a slot like any other, and a write to it keeps the level whole all the same
const holder = {
  0: _globalThis
};
holder[0] = other;
const {
    0: _ref5
  } = holder,
  keptByWrite = _ref5 === _globalThis ? _Promise : _ref5.Promise;
// the slot read through the value canon at every depth, on every host: a NESTED comma run, a
// defensive realm default (`?? {}`, `|| {}`, nested), a `?.` off a guaranteed realm name - each
// is the value the flat spelling reads, and the ASSIGNMENT host reads it the same way. the
// assignment host lifts a comma run ahead of the extraction and reads a nav past the literal's
// slot for a receiver-less claim, where a kept literal shipped the claim native
const viaOrDefault = _Map;
function nestedSeqKeepsLiteral(f, g) {
  const viaNestedSeq = _Array$from;
  const {
    w: {
      Array: {
        from: _unused5
      }
    }
  } = {
    w: (f(), g(), _globalThis)
  };
  return viaNestedSeq;
}
function seqDefaultKeepsLiteral(f) {
  const viaSeqDefault = _Map;
  const {
    w: {
      Map: _unused6
    }
  } = {
    w: (f(), _globalThis ?? {})
  };
  return viaSeqDefault;
}
const viaNestedDefault = _Map;
const wrapNestedDefault = _Map;
const viaOptionalNav = _Map;
const viaOptionalNavInstance = _atMaybeArray(_globalThis.Array.prototype);
const viaOptionalNavSymbol = _getIteratorMethod(_globalThis);
function assignForms(f, g) {
  let nestedSeq;
  let seqDefault;
  let hopOrDefault;
  let hopNav;
  let hopOptional;
  f();
  g();
  nestedSeq = _Array$from;
  f();
  seqDefault = _Map;
  hopOrDefault = _Map;
  hopNav = _Array$from;
  // ... and a SLOT carrying the prefix: the literal stays as a statement of its own, running the
  // prefix where the source ran it, and the level consumes
  hopOptional = _Map;
  let hopSeq;
  let hopSeqDefault;
  ({
    w: (f(), g(), _globalThis)
  });
  hopSeq = _Array$from;
  ({
    w: (f(), _globalThis ?? {})
  });
  hopSeqDefault = _Map;
  return [nestedSeq, seqDefault, hopOrDefault, hopNav, hopOptional, hopSeq, hopSeqDefault];
}
// a binding reassigned to a realm name from INSIDE a nested function: the write is reachable and
// every reachable value names the realm, so the hop reads it as the flat form does - a static
// claims, an instance key stays native (the realm object carries no `at`)
let closedAlias = _globalThis;
function closeOver() {
  closedAlias = _self;
}
const viaClosedAlias = _Array$from;
const {
  w: {
    at: noClaimOnClosedAlias
  }
} = {
  w: closedAlias
};
// An optional write may not run, and a block-scoped shadow can change a var initializer's value.
// These uncertain aliases require the actual slot's identity before selecting a constructor;
// a non-realm value keeps its own property result.
const maybeNull = null;
let underOptional = other;
maybeNull?.[underOptional = _globalThis];
const {
    w: _ref6
  } = {
    w: underOptional
  },
  noClaimUnderOptionalWrite = _ref6 === _globalThis ? _Map : _ref6.Map;
const outerSrc = _globalThis;
var shadowed = outerSrc;
{
  const outerSrc = other;
  var shadowed = outerSrc;
}
const {
    w: _ref7
  } = {
    w: shadowed
  },
  noClaimBehindBlockShadow = _ref7 === _globalThis ? _Map : _ref7.Map;
// the hop on the hosts that MIRROR their receiver - a parameter default, a for-of head element, an
// IIFE argument: a literal container in the slot pairs the hop key with its slot value, and the
// mirror lands IN that slot (the container stays as written), for a ctor, a static and an instance
// leaf alike - the flat parameter's synth one level down. an own-pass mirror is never re-mirrored:
// a pattern-valued leaf under a mirrored static receives the ponyfill VALUE
function paramHop({
  w: {
    Map: viaParamCtor
  }
} = {
  w: {
    Map: _Map
  }
}) {
  return viaParamCtor;
}
function paramHopStatic({
  w: {
    Array: {
      from: viaParamStatic
    }
  }
} = {
  w: {
    Array: {
      from: _Array$from
    }
  }
}) {
  return viaParamStatic;
}
function paramHopInstance({
  w: {
    at: viaParamInstance
  }
} = {
  w: {
    at: _atMaybeArray([1, 2])
  }
}) {
  return viaParamInstance;
}
function paramHopWrapped([{
  w: {
    Map: viaParamWrapped
  }
}] = [{
  w: {
    Map: _Map
  }
}]) {
  return viaParamWrapped;
}
function forOfHop() {
  const out = [];
  for (const {
    w: {
      Map: viaHeadCtor
    }
  } of [{
    w: {
      Map: _Map
    }
  }]) _pushMaybeArray(out).call(out, viaHeadCtor);
  return out;
}
const viaIifeCtor = (({
  w: {
    Map: m
  }
}) => m)({
  w: {
    Map: _Map
  }
});
// ... and an ARRAY wrapper on the way is one more hop of the same descent
function paramWrappedInstance([{
  w: {
    at: viaWrappedInstance
  }
}] = [{
  w: {
    at: _atMaybeArray([1, 2])
  }
}]) {
  return viaWrappedInstance;
}
// ... on the IIFE argument too, and a for-of head's wrapped element types its slot through the
// wrapper level exactly as the flat head types the element
const viaIifeWrappedStatic = (([{
  w: {
    Array: {
      from: m
    }
  }
}]) => m)([{
  w: {
    Array: {
      from: _Array$from
    }
  }
}]);
function forOfWrapped() {
  const out = [];
  for (const _ref9 of [[{
    w: [1, 2]
  }]]) {
    let [_ref8] = _ref9;
    let viaWrappedHead = _atMaybeArray(_ref8.w);
    _pushMaybeArray(out).call(out, viaWrappedHead);
  }
  return out;
}
// a BOUND computed hop key folds through the consuming canon on the mirroring hosts too, and an IIFE
// argument's sequence TAIL is what the instance synth types (the prefix stays where the call wrote it)
const hopKey = 'w';
function boundKeyParam({
  [hopKey]: {
    Map: viaBoundKeyParam
  }
} = {
  w: {
    Map: _Map
  }
}) {
  return viaBoundKeyParam;
}
const viaBoundKeyIife = (({
  [hopKey]: {
    at: m
  }
}) => m)({
  w: {
    at: _atMaybeArray([1, 2])
  }
});
const viaSeqArg = (({
  at: m
}) => m)((mark(), {
  at: _atMaybeArray([1, 2])
}));
const viaIifeInstance = (({
  w: {
    at: m
  }
}) => m)({
  w: {
    at: _atMaybeArray([1, 2])
  }
});
function mark() {}
// a BOUND computed hop key names its slot on every host the consume reaches - the declaration (a
// ctor and an instance leaf), the followed alias, the identifier init, the loop head and the catch
// clause - exactly as the literal spelling does; a wrapper standing UNDER the key pairs its slot
// like one standing over it, on the declaration and the assignment host alike
const hopSlot = 'w';
const viaBoundHopCtor = _Map;
const viaBoundHopAt = _atMaybeArray([1, 2]);
const hopAlias = {
  w: [3, 4]
};
const viaBoundHopAlias = _atMaybeArray(hopAlias.w);
function viaBoundHopIdent(box) {
  const viaIdent = _at(box.w);
  return viaIdent;
}
function viaBoundHopHeads(list) {
  const out = [];
  for (const _ref10 of list) {
    let headAt = _at(_ref10.w);
    _pushMaybeArray(out).call(out, headAt);
  }
  const thrown = new Error('x');
  thrown.w = [10];
  try {
    throw thrown;
  } catch (_ref11) {
    let caughtAt = _at(_ref11.w);
    _pushMaybeArray(out).call(out, caughtAt);
  }
  return out;
}
const viaKeyedWrapper = _atMaybeArray([1, 2]);
let assignKeyedWrapper;
assignKeyedWrapper = _atMaybeArray([1, 2]);
function restAssignSentinel() {
  let restAt;
  let restRest;
  ({
    w: {
      at: restAt
    },
    ...restRest
  } = {
    w: [1, 2],
    z: 1
  });
  return [restAt, restRest];
}

// an instance leaf over a slot with a COMMA RUN in front of it rides the prefix inside its dispatch,
// exactly as the flat spelling does (`_at((mark(), arr))`) - on the declaration and under an array
// wrapper alike; a claim INSIDE the prefix is rewritten where it stands
function viaSeqSlot(mark, arr) {
  const viaSeq = _at((mark(), arr));
  const viaSeqWrapped = _at((mark(), arr));
  const viaSeqClaim = _at((_at(arr).call(arr, 0), arr));
  return [viaSeq, viaSeqWrapped, viaSeqClaim];
}
function ctorUnderRest() {
  const {
    w: {
      Map: restCtor
    },
    ...restDecl
  } = {
    w: _globalThis,
    z: 1
  };
  let restAssign;
  let restAssignRest;
  ({
    w: {
      Map: restAssign
    },
    ...restAssignRest
  } = {
    w: _globalThis,
    z: 2
  });
  const {
    w: {
      Array: {
        of: restStatic
      }
    },
    ...restStaticRest
  } = {
    w: _globalThis,
    z: 3
  };
  return [restCtor, restDecl, restAssign, restAssignRest, restStatic, restStaticRest];
}
// a dead wrapper whose init still carries a DISCARDED effect re-emits it as a statement where the
// declaration stood (`eff2();`), never a `[{}]` husk
function liftedHusk(eff, eff2) {
  const _ref12 = eff();
  eff2();
  const liftedAt = _at(_ref12);
  return liftedAt;
}
function literalBehindSpread(extra) {
  const _ref13 = [1, 2];
  const behindSpreadAt = _atMaybeArray(_ref13);
  const {
    w: {
      at: _unused7
    }
  } = {
    ...extra,
    w: _ref13
  };
  return behindSpreadAt;
}
function slotMemoHoist(eff, holder) {
  const _ref14 = {
    w: eff(),
    z: 1
  };
  const slotHoist = _at(_ref14.w);
  const {
    z
  } = _ref14;
  const _ref15 = {
    a: eff(),
    w: eff()
  };
  const {
    a
  } = _ref15;
  const slotInSlot = _at(_ref15.w);
  const {
    w: {
      at: slotRest
    },
    ...slotRestRest
  } = {
    w: eff(),
    z: 2
  };
  const _ref16 = {
    p: {
      w: eff()
    },
    q: 3
  };
  const slotNested = _at(_ref16.p.w);
  const {
    q
  } = _ref16;
  const _ref17 = {
    b: eff(),
    w: holder.p
  };
  const {
    b
  } = _ref17;
  const slotMember = _at(_ref17.w);
  return [slotHoist, z, slotInSlot, a, slotRest, slotRestRest, slotNested, q, slotMember, b];
}

// a hop under a wrapper that DIES behind an effectful hole: the hole's effect lifts ahead, and the
// slot value memoizes like the flat twin's element (`eff(); const _ref = getArr(); _at(_ref)`) rather
// than riding the dispatch
function holeThenSlot(eff, getArr) {
  eff();
  const _ref18 = getArr();
  const holeAt = _at(_ref18);
  return holeAt;
}

// ... and beside a SIBLING DECLARATOR the slot memo takes the same two shapes: hoisted ahead of the
// declaration, or written in its slot - never the sibling-append the plain kept-key residual takes;
// two leaves off one slot share the one write (`w: _ref = eff()`, both dispatches reading `_ref`)
function slotMemoSiblingDecl(eff) {
  const _ref19 = {
    w: eff(),
    z: 1
  };
  const sibHoist = _at(_ref19.w);
  const {
    z
  } = _ref19;
  const sibQ = 2;
  const _ref20 = {
    a: eff(),
    w: eff()
  };
  const {
    a
  } = _ref20;
  const sibInSlot = _at(_ref20.w);
  const sibQ2 = 3;
  const _ref21 = {
    b: eff(),
    w: eff()
  };
  const {
    b
  } = _ref21;
  const _ref22 = _ref21.w;
  const twinAt = _at(_ref22);
  const twinFlat = _flatMaybeArray(_ref22);
  return [sibHoist, z, sibQ, sibInSlot, a, sibQ2, twinAt, twinFlat, b];
}
function inSlotFlatFamily(eff, eff2, eff3) {
  var _ref23, _ref24, _ref26;
  const [fa] = [eff(), _ref23 = eff()];
  const flatInSlot = _at(_ref23);
  const [fb, {}, ...flatRest] = [eff(), _ref24 = eff()];
  const flatRestSlot = _at(_ref24);
  eff();
  const _ref25 = eff();
  const liftedThenSlot = _at(_ref25);
  const [, {}, fz] = [, _ref25, 1];
  const [fx] = [1, eff2(), _ref26 = eff3()];
  const boundThenHole = _at(_ref26);
  eff();
  const _ref27 = eff();
  const liftedHopSlot = _at(_ref27);
  const [, {}, fz2] = [, {
    y: _ref27
  }, 1];
  return [fa, flatInSlot, fb, flatRestSlot, flatRest, liftedThenSlot, fz, fx, boundThenHole, liftedHopSlot, fz2];
}

// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
const _ref28 = {
  ea: tick(1),
  w: tick([1, 2])
};
const {
  ea
} = _ref28;
const exportInSlot = _atMaybeArray(_ref28.w);
const exportQ = 2;
export { ea, exportInSlot, exportQ };
export const [eb] = [tick(2), _ref29 = tick([3, 4])],
  exportFlatInSlot = _atMaybeArray(_ref29),
  exportQ2 = ticks;
// ... and a hoisted memo behind a LEADING sibling's own init stays behind it under the wrapper as well
export const exportLead = tick(3);
const _ref30 = tick([5, 6]);
export const [{}, ec] = [_ref30, 1],
  exportBehindLead = _atMaybeArray(_ref30);
const exportLead2 = tick(4);
const _ref31 = {
  w: tick([7, 8]),
  ed: 1
};
const exportHopBehindLead = _atMaybeArray(_ref31.w);
const {
  ed
} = _ref31;
export { exportLead2, exportHopBehindLead, ed }; // ... and a wrapped STATIC beside its sibling declarator joins the same way, exported with its host
// - two of them, one per host; a mixed pair splits by declarator, the static joining its own host
export const [{
    Set: _unused8
  }, ee] = [_globalThis, 2],
  exportWrappedSet = _Set,
  [{
    Map: _unused9
  }, ef] = [_globalThis, 3],
  exportWrappedMap = _Map;
export const exportHopMap = _Map;
export const {
  eg
} = {
  w: _globalThis,
  eg: 4
};
export const [{
    Set: _unused10
  }, eh] = [_globalThis, 5],
  exportWrappedBeside = _Set; // two claimed hosts in ONE declaration take the sibling-declarator canon each: an object hop beside
// an array wrapper (either order), two array wrappers, each memo standing behind the declarators
// written ahead of its host and the join resuming after it; a symbol leaf under a hop beside a
// sibling takes the slot memo like the instance leaf of the same slot
function twoHostsOneDeclaration(eff) {
  const _ref32 = {
      a: eff(),
      w: eff()
    },
    {
      a
    } = _ref32,
    hostObjAt = _at(_ref32.w);
  const _ref33 = eff();
  const [{}, hz] = [_ref33, 1],
    hostArrFlat = _flatMaybeArray(_ref33);
  const _ref34 = eff();
  const [{}, fz] = [_ref34, 1],
    firstFlat = _flatMaybeArray(_ref34),
    mid = 3;
  const _ref35 = eff();
  const [{}, sz] = [_ref35, 2],
    secondAt = _at(_ref35),
    tail = 4;
  const _ref36 = {
    b: eff(),
    w: eff()
  };
  const {
    b
  } = _ref36;
  const symInSlot = _getIteratorMethod(_ref36.w);
  const _ref37 = {
    w: eff(),
    c: 1
  };
  const symHoist = _getIteratorMethod(_ref37.w);
  const {
    c
  } = _ref37;
  const symQ = 2;
  return [a, hostObjAt, hostArrFlat, hz, firstFlat, fz, mid, secondAt, sz, tail, b, symInSlot, symHoist, c, symQ];
}

// a ctor under a literal hop whose level keeps a SIBLING prop consumes on both legs, like a static
// under the same hop: the leaf leaves with its emptied hop, the sibling keeps the residual
function ctorBesideSibling(eff) {
  const sibMap = _Map;
  const {
    z
  } = {
    w: _globalThis,
    z: 1
  };
  const sibSet = _Set;
  const sibWeakMap = _WeakMap;
  const {
    a
  } = {
    a: eff(),
    w: _globalThis
  };
  const sibMultiMap = _Map;
  const {
    y
  } = {
    w: _self,
    y: 2
  };
  const sibQ = 3;
  return [sibMap, z, sibSet, sibWeakMap, a, sibMultiMap, y, sibQ];
}

// Defined constructor and static ponyfills make these source defaults unreachable at every
// depth: under an object hop, under an array wrapper, and beside a sibling.
function defaultKeepsGuard() {
  const dfMap = _Map;
  const {
    z
  } = {
    w: _globalThis,
    z: 1
  };
  const dfFrom = _Array$from;
  const dfOf = _Array$of;
  const [{
    of: _unused11
  }, y] = [Array, 2];
  const dfDeep = _Array$from;
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}
function siblingKeepsResidual(hit) {
  const _ref38 = {
    w: _globalThis,
    z: (hit(), 1)
  };
  const deepBeside = _atMaybeArray(_ref38.w.Array.prototype);
  const {
    z: sibZ
  } = _ref38;
  const {
    w: {
      Array: {
        prototype: {
          at: deepAlone
        }
      }
    }
  } = {
    w: _globalThis,
    z: (hit(), 2)
  };
  const _ref39 = {
    w: _globalThis,
    y: (hit(), 3)
  };
  const symBeside = _getIteratorMethod(_globalThis);
  const {
    y: sibY
  } = _ref39;
  return [deepBeside, sibZ, deepAlone, symBeside, sibY];
}

// a leaf that NAVIGATES on from a memoized slot dispatches on the surface spelled off the ref
// (`_ref.Array.prototype`) - written in its slot behind an observable property, hoisted otherwise,
// two leaves sharing the one write; an ASSIGNMENT host with the same nav reads the surface off the
// realm's pure binding, its residual keeping the sibling and every effect the literal holds
function navBelowMemoSlot(hit) {
  const _ref40 = {
    z: (hit(), 1),
    w: (hit(), _globalThis)
  };
  const navInSlot = _atMaybeArray(_ref40.w.Array.prototype);
  const {
    z: nz
  } = _ref40;
  const _ref41 = {
    w: (hit(), _globalThis),
    y: 2
  };
  const navHoist = _atMaybeArray(_ref41.w.Array.prototype);
  const {
    y: ny
  } = _ref41;
  const _ref42 = {
    x: (hit(), 3),
    w: (hit(), _globalThis)
  };
  const _ref43 = _ref42.w.Array.prototype;
  const navTwinAt = _atMaybeArray(_ref43);
  const navTwinFlat = _flatMaybeArray(_ref43);
  const {
    x: nx
  } = _ref42;
  let navAssign, na, navAssignAlone, navAssignEffect, ne;
  ({
    a: na
  } = {
    w: _globalThis,
    a: 4
  });
  navAssign = _atMaybeArray(_globalThis.Array.prototype);
  navAssignAlone = _atMaybeArray(_globalThis.Array.prototype);
  ({
    e: ne
  } = {
    e: (hit(), 5),
    w: (hit(), _globalThis)
  });
  navAssignEffect = _atMaybeArray(_globalThis.Array.prototype);
  return [navInSlot, nz, navHoist, ny, navTwinAt, navTwinFlat, nx, navAssign, na, navAssignAlone, navAssignEffect, ne];
}

// a declaration hosting an object hop AND a wrapped static: the hop's declarator splits off, and
// the static still joins the host it was written beside (the split does not undo the join)
function mixedHopAndWrappedStatic() {
  const mixedMap = _Map;
  const {
    z: mz
  } = {
    w: _globalThis,
    z: 1
  };
  const [{
      Set: _unused12
    }, my] = [_globalThis, 2],
    mixedSet = _Set;
  return [mixedMap, mz, mixedSet, my];
}
export default [hopCtor, hopStatic, hopThroughGetter, hopThroughNav, viaRealmAlias, viaMutatedAlias, keptByGetterEffect, keptByBranch, keptBySpread({}), symbolBehindSpread({}), staticBehindSpread({}), ctorBehindSpread({}), seqPrefixKeepsLiteral(() => 1), keptByKey('Q'), keptByUnnameableKey('q'), viaBoundKey, keptByWrite, viaOrDefault, nestedSeqKeepsLiteral(() => 1, () => 2), seqDefaultKeepsLiteral(() => 1), viaNestedDefault, wrapNestedDefault, viaOptionalNav, viaOptionalNavInstance, viaOptionalNavSymbol, assignForms(() => 1, () => 2), viaClosedAlias, noClaimOnClosedAlias, closeOver, noClaimUnderOptionalWrite, noClaimBehindBlockShadow, paramHop(), paramHopStatic(), paramHopInstance(), paramHopWrapped(), forOfHop(), viaIifeCtor, viaIifeInstance, paramWrappedInstance(), viaIifeWrappedStatic, forOfWrapped(), boundKeyParam(), viaBoundKeyIife, viaSeqArg, viaBoundHopCtor, viaBoundHopAt, viaBoundHopAlias, viaBoundHopIdent({
  w: [1, 2]
}), viaBoundHopHeads([{
  w: [9]
}]), viaKeyedWrapper, assignKeyedWrapper, restAssignSentinel(), viaSeqSlot(() => 1, [1, 2]), ctorUnderRest(), liftedHusk(() => [1], () => 2), literalBehindSpread({}), slotMemoHoist(() => [1, 2], {
  p: [3]
}), holeThenSlot(() => 1, () => [4]), slotMemoSiblingDecl(() => [1, 2]), inSlotFlatFamily(() => [1, 2], () => 2, () => [3]), twoHostsOneDeclaration(() => [[1], 2]), ctorBesideSibling(() => 4), defaultKeepsGuard(), siblingKeepsResidual(() => 0), navBelowMemoSlot(() => 0), mixedHopAndWrappedStatic(), exportWrappedSet, ee, exportWrappedMap, ef, exportHopMap, eg, exportWrappedBeside, eh];