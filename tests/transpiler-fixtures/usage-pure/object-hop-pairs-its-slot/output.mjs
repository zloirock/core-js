import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref21, _ref22;
// a sole-key object hop pairs with the slot it names, exactly as an array wrapper pairs with its
// sole element: the level is consumed and the claim below it reads the value standing there. a
// GETTER pairs too where its body is one pure return - the read yields that value and the consumed
// level drops nothing observable. what keeps a level whole is what dropping the literal would take
// with it: a getter body with an effect, an unnameable key that could BE this one at runtime, an
// accessor-free spread that could override it (usage-global resolves through that one - it injects
// where the slot MIGHT be read, and over-injection is its safe side). the getter rows live HERE
// rather than in the runtime suite: its baseline forbids ES5 accessors, so only bytes can hold them
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
    return _globalThis;
  }
};
function keptBySpread(extra) {
  const {
    w: {
      Array: {
        of: kept
      }
    }
  } = {
    w: _globalThis,
    ...extra
  };
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
// a spread standing BEFORE the key is an effect of its own - it reads the source's own enumerable
// keys - so the literal outlives the claim that reads through it, husk and all. the husk keeps its
// own KEY too: a well-known-symbol sentinel reads the realm's `Symbol`, so it takes the ponyfill
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
    Q: {
      of: kept
    }
  } = ns;
  return kept;
}
// a key standing AFTER the match that nothing can name could BE the slot at runtime, so the level
// stays whole on every host - the canonical resolver asks the pairing's own rule
function keptByUnnameableKey(key) {
  const {
    w: {
      Map: keptDecl
    }
  } = {
    w: _globalThis,
    [key]: other
  };
  let keptAssign;
  ({
    w: {
      Map: keptAssign
    }
  } = {
    w: _globalThis,
    [key]: other
  });
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
  0: {
    Promise: keptByWrite
  }
} = holder;
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
// ... and NOT where the reaching write proves nothing: a write under an optional spine may never
// run (`a?.[g = globalThis]`), and a `var` re-declaration inside a block reads its init THERE, where
// a block-scoped shadow may hold something else - both hops stay native, like their flat twins
const maybeNull = null;
let underOptional = other;
maybeNull?.[underOptional = _globalThis];
const {
  w: {
    Map: noClaimUnderOptionalWrite
  }
} = {
  w: underOptional
};
const outerSrc = _globalThis;
var shadowed = outerSrc;
{
  const outerSrc = other;
  var shadowed = outerSrc;
}
const {
  w: {
    Map: noClaimBehindBlockShadow
  }
} = {
  w: shadowed
};
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
  for (const _ref2 of [[{
    w: [1, 2]
  }]]) {
    let [_ref] = _ref2;
    let viaWrappedHead = _atMaybeArray(_ref.w);
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
  for (const _ref3 of list) {
    let headAt = _at(_ref3.w);
    _pushMaybeArray(out).call(out, headAt);
  }
  const thrown = new Error('x');
  thrown.w = [10];
  try {
    throw thrown;
  } catch (_ref4) {
    let caughtAt = _at(_ref4.w);
    _pushMaybeArray(out).call(out, caughtAt);
  }
  return out;
}
const viaKeyedWrapper = _atMaybeArray([1, 2]);
let assignKeyedWrapper;
// an emptied hop beside a REST on an assignment host writes the sentinel it mints, and a write to
// an undeclared name throws in strict code - so the host declares it
assignKeyedWrapper = _atMaybeArray([1, 2]);
function restAssignSentinel() {
  let restAt;
  let restRest;
  var _unused7;
  ({
    w: _unused7,
    ...restRest
  } = {
    w: [1, 2],
    z: 1
  });
  restAt = _atMaybeArray([1, 2]);
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
// a REST beside the hop keeps the level alive the way a spread in the literal does: the ctor and the
// static leaf extract and leave a sentinel keeping the key excluded, the residual runs where it stood
function ctorUnderRest() {
  const restCtor = _Map;
  const {
    w: _unused8,
    ...restDecl
  } = {
    w: _globalThis,
    z: 1
  };
  let restAssign;
  let restAssignRest;
  var _unused9;
  ({
    w: _unused9,
    ...restAssignRest
  } = {
    w: _globalThis,
    z: 2
  });
  restAssign = _Map;
  const restStatic = _Array$of;
  const {
    w: _unused10,
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
  const _ref5 = eff();
  eff2();
  const liftedAt = _at(_ref5);
  return liftedAt;
}
// a CONSTANT LITERAL behind a sentinel memoizes on both legs: the source built one array
function literalBehindSpread(extra) {
  const _ref6 = [1, 2];
  const behindSpreadAt = _atMaybeArray(_ref6);
  const {
    w: {
      at: _unused11
    }
  } = {
    ...extra,
    w: _ref6
  };
  return behindSpreadAt;
}

// an instance leaf under a hop over a slot the level cannot spell twice, while the level stays
// WHOLE (a sibling, a rest): the slot value moves to a ref both readers take - hoisted ahead of the
// declaration where nothing observable stands before the slot, written IN the slot behind an
// observable property (`w: _ref = eff()`, the extraction reading the ref after the destructure);
// a relaxed single read (a member) takes the same shape, so its getter fires once and in order
function slotMemoHoist(eff, holder) {
  var _ref8, _ref11;
  const _ref7 = eff();
  const slotHoist = _at(_ref7);
  const {
    w: {
      at: _unused12
    },
    z
  } = {
    w: _ref7,
    z: 1
  };
  const {
    a,
    w: {
      at: _unused13
    }
  } = {
    a: eff(),
    w: _ref8 = eff()
  };
  const slotInSlot = _at(_ref8);
  const _ref9 = eff();
  const slotRest = _at(_ref9);
  const {
    w: {
      at: _unused14
    },
    ...slotRestRest
  } = {
    w: _ref9,
    z: 2
  };
  const _ref10 = eff();
  const slotNested = _at(_ref10);
  const {
    p: {
      w: {
        at: _unused15
      }
    },
    q
  } = {
    p: {
      w: _ref10
    },
    q: 3
  };
  const {
    b,
    w: {
      at: _unused16
    }
  } = {
    b: eff(),
    w: _ref11 = holder.p
  };
  const slotMember = _at(_ref11);
  return [slotHoist, z, slotInSlot, a, slotRest, slotRestRest, slotNested, q, slotMember, b];
}

// a hop under a wrapper that DIES behind an effectful hole: the hole's effect lifts ahead, and the
// slot value memoizes like the flat twin's element (`eff(); const _ref = getArr(); _at(_ref)`) rather
// than riding the dispatch
function holeThenSlot(eff, getArr) {
  eff();
  const _ref12 = getArr();
  const holeAt = _at(_ref12);
  return holeAt;
}

// ... and beside a SIBLING DECLARATOR the slot memo takes the same two shapes: hoisted ahead of the
// declaration, or written in its slot - never the sibling-append the plain kept-key residual takes;
// two leaves off one slot share the one write (`w: _ref = eff()`, both dispatches reading `_ref`)
function slotMemoSiblingDecl(eff) {
  var _ref14, _ref15;
  const _ref13 = eff();
  const {
      w: {
        at: _unused17
      },
      z
    } = {
      w: _ref13,
      z: 1
    },
    sibHoist = _at(_ref13),
    sibQ = 2;
  const {
      a,
      w: {
        at: _unused18
      }
    } = {
      a: eff(),
      w: _ref14 = eff()
    },
    sibInSlot = _at(_ref14),
    sibQ2 = 3;
  const {
    b,
    w: {
      at: _unused19,
      flat: _unused20
    }
  } = {
    b: eff(),
    w: _ref15 = eff()
  };
  const twinAt = _at(_ref15);
  const twinFlat = _flatMaybeArray(_ref15);
  return [sibHoist, z, sibQ, sibInSlot, a, sibQ2, twinAt, twinFlat, b];
}

// the flat twin's own in-slot family: a SOLE-prop pattern behind an effectful neighbour that keeps
// the level alive (a sibling, a rest) memoizes in its slot too; an effect in a slot the pattern
// DISCARDS ahead of the claim lifts as a statement, and the memo hoists behind it - while a discarded
// slot BEHIND a bound one stays where it is, and the memo is written in its slot
function inSlotFlatFamily(eff, eff2, eff3) {
  var _ref16, _ref17, _ref19;
  const [fa] = [eff(), _ref16 = eff()];
  const flatInSlot = _at(_ref16);
  const [fb, {}, ...flatRest] = [eff(), _ref17 = eff()];
  const flatRestSlot = _at(_ref17);
  eff();
  const _ref18 = eff();
  const liftedThenSlot = _at(_ref18);
  const [, {}, fz] = [, _ref18, 1];
  const [fx] = [1, eff2(), _ref19 = eff3()];
  const boundThenHole = _at(_ref19);
  eff();
  const _ref20 = eff();
  const liftedHopSlot = _at(_ref20);
  const [, {}, fz2] = [, {
    y: _ref20
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
export const {
    ea,
    w: {
      at: _unused21
    }
  } = {
    ea: tick(1),
    w: _ref21 = tick([1, 2])
  },
  exportInSlot = _atMaybeArray(_ref21),
  exportQ = 2;
export const [eb] = [tick(2), _ref22 = tick([3, 4])],
  exportFlatInSlot = _atMaybeArray(_ref22),
  exportQ2 = ticks;
// ... and a hoisted memo behind a LEADING sibling's own init stays behind it under the wrapper as well
export const exportLead = tick(3);
const _ref23 = tick([5, 6]);
export const [{}, ec] = [_ref23, 1],
  exportBehindLead = _atMaybeArray(_ref23);
export const exportLead2 = tick(4);
const _ref24 = tick([7, 8]);
export const {
    w: {
      at: _unused22
    },
    ed
  } = {
    w: _ref24,
    ed: 1
  },
  exportHopBehindLead = _atMaybeArray(_ref24); // ... and a wrapped STATIC beside its sibling declarator joins the same way, exported with its host
// - two of them, one per host; a mixed pair splits by declarator, the static joining its own host
export const [{
    Set: _unused23
  }, ee] = [_globalThis, 2],
  exportWrappedSet = _Set,
  [{
    Map: _unused24
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
    Set: _unused25
  }, eh] = [_globalThis, 5],
  exportWrappedBeside = _Set; // two claimed hosts in ONE declaration take the sibling-declarator canon each: an object hop beside
// an array wrapper (either order), two array wrappers, each memo standing behind the declarators
// written ahead of its host and the join resuming after it; a symbol leaf under a hop beside a
// sibling takes the slot memo like the instance leaf of the same slot
function twoHostsOneDeclaration(eff) {
  var _ref25, _ref29;
  const {
      a,
      w: {
        at: _unused26
      }
    } = {
      a: eff(),
      w: _ref25 = eff()
    },
    hostObjAt = _at(_ref25);
  const _ref26 = eff();
  const [{}, hz] = [_ref26, 1],
    hostArrFlat = _flatMaybeArray(_ref26);
  const _ref27 = eff();
  const [{}, fz] = [_ref27, 1],
    firstFlat = _flatMaybeArray(_ref27),
    mid = 3;
  const _ref28 = eff();
  const [{}, sz] = [_ref28, 2],
    secondAt = _at(_ref28),
    tail = 4;
  const {
    b,
    w: {
      [_Symbol$iterator]: _unused27
    }
  } = {
    b: eff(),
    w: _ref29 = eff()
  };
  const symInSlot = _getIteratorMethod(_ref29);
  const _ref30 = eff();
  const {
      w: {
        [_Symbol$iterator]: _unused28
      },
      c
    } = {
      w: _ref30,
      c: 1
    },
    symHoist = _getIteratorMethod(_ref30),
    symQ = 2;
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

// a consumed leaf's own default keeps its guard at every depth on both legs - the flat twin's
// spelling, dead text at runtime since the pure is always defined: a ctor or a static under a hop,
// under a wrapper element, beside a sibling
function defaultKeepsGuard() {
  const dfMap = _Map === void 0 ? null : _Map;
  const {
    z
  } = {
    w: _globalThis,
    z: 1
  };
  const dfFrom = _Array$from === void 0 ? null : _Array$from;
  const dfOf = _Array$of === void 0 ? null : _Array$of;
  const [{
    of: _unused29
  }, y] = [Array, 2];
  const dfDeep = _Array$from === void 0 ? null : _Array$from;
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}

// a literal holding an OBSERVABLE sibling value keeps a deep nav claim under its hop only where the
// residual dies with the leaf; a SIBLING binding keeps the residual - the literal evaluates there,
// the effect runs where the source ran it, and the claim consumes like the shallow twin's. a symbol
// leaf under the hop keeps its sentinel beside the sibling
function siblingKeepsResidual(hit) {
  const deepBeside = _atMaybeArray(_globalThis.Array.prototype);
  const {
    z: sibZ
  } = {
    w: _globalThis,
    z: (hit(), 1)
  };
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
  const symBeside = _getIteratorMethod(_globalThis);
  const {
    w: {
      [_Symbol$iterator]: _unused30
    },
    y: sibY
  } = {
    w: _globalThis,
    y: (hit(), 3)
  };
  return [deepBeside, sibZ, deepAlone, symBeside, sibY];
}

// a leaf that NAVIGATES on from a memoized slot dispatches on the surface spelled off the ref
// (`_ref.Array.prototype`) - written in its slot behind an observable property, hoisted otherwise,
// two leaves sharing the one write; an ASSIGNMENT host with the same nav reads the surface off the
// realm's pure binding, its residual keeping the sibling and every effect the literal holds
function navBelowMemoSlot(hit) {
  var _ref31, _ref33;
  const {
    w: {
      Array: {
        prototype: {
          at: _unused31
        }
      }
    },
    z: nz
  } = {
    z: (hit(), 1),
    w: _ref31 = (hit(), _globalThis)
  };
  const navInSlot = _atMaybeArray(_ref31.Array.prototype);
  const _ref32 = (hit(), _globalThis);
  const navHoist = _atMaybeArray(_ref32.Array.prototype);
  const {
    w: {
      Array: {
        prototype: {
          at: _unused32
        }
      }
    },
    y: ny
  } = {
    w: _ref32,
    y: 2
  };
  const {
    w: {
      Array: {
        prototype: {
          at: _unused33,
          flat: _unused34
        }
      }
    },
    x: nx
  } = {
    x: (hit(), 3),
    w: _ref33 = (hit(), _globalThis)
  };
  const navTwinAt = _atMaybeArray(_ref33.Array.prototype);
  const navTwinFlat = _flatMaybeArray(_ref33.Array.prototype);
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
      Set: _unused35
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